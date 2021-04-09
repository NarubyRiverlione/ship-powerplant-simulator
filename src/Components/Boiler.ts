import Item from './Item'
import Tank from './Tank'
import Valve from './Valve'
import CstTxt from '../CstTxt'
import { CstChanges, CstSteamSys, CstFuelSys } from '../Cst'
import CalcPressureViaTemp from '../CalcPressureTemp'
import { makeAutoObservable } from 'mobx'
import Cooler from './Cooler'
const { SteamSysTxt } = CstTxt

/*
  |
Main Steam  Valve
  |
BOILER ==<== Fuel Intake Valve ==<==
   |
(WaterTank) ==<== Water Intake Valve ==<==
  |     
Water Drain Valve
  |
*/
export default class Boiler implements Item {
  Name: string
  WaterTank: Tank // virtual tank to hold the water inside the boiler
  WaterIntakeValve: Valve
  WaterDrainValve: Valve
  FuelIntakeValve: Valve
  HasFlame: boolean
  MainSteamValve: Valve
  SafetyRelease: Valve
  SteamVent: Valve
  Temperature: number
  // Pressure: number
  FuelSourceTank: Tank
  AutoFlame: boolean
  Condensor: Cooler

  constructor(name: string, waterSource: Item, fuelSource: Item, fuelSourceTank: Tank, condensor: Cooler) {
    this.Name = name
    //#region Water supply
    this.WaterIntakeValve = new Valve(SteamSysTxt.Boiler.WaterIntakeValve, waterSource)
    this.WaterTank = new Tank('virtual tank to hold the water inside the boiler', CstSteamSys.Boiler.WaterVolume, 0)
    this.WaterIntakeValve.cbNowOpen = () => { this.WaterTank.Adding = true }
    this.WaterIntakeValve.cbNowClosed = () => { this.WaterTank.Adding = false }

    this.WaterDrainValve = new Valve(SteamSysTxt.Boiler.WaterDrainValve, this.WaterTank)
    this.WaterDrainValve.cbNowOpen = () => {
      this.WaterTank.AmountRemovers += 1
      this.WaterTank.RemoveEachStep += CstChanges.DrainStep
    }
    this.WaterDrainValve.cbNowClosed = () => {
      this.WaterTank.AmountRemovers -= 1
      this.WaterTank.RemoveEachStep -= CstChanges.DrainStep
    }
    //#endregion 
    //#region Fuel & Flame
    this.FuelIntakeValve = new Valve(SteamSysTxt.Boiler.FuelIntakeValve, fuelSource)
    this.HasFlame = false
    //#endregion
    //#region Main Steam valve
    this.MainSteamValve = new Valve(SteamSysTxt.Boiler.MainSteamValve, this)
    this.MainSteamValve.cbNowOpen = () => {
      // no cooling = loss of steam == loss of water
      if (!this.Condensor.CoolCircuitComplete) {
        this.WaterTank.AmountRemovers += 1
        this.WaterTank.RemoveEachStep += CstSteamSys.Boiler.MainSteamValveWaterDrain
      }
      // condensor has hot side if there is steam flow (open main steam valve)
      this.Condensor.HotCircuitComplete = true
    }
    this.MainSteamValve.cbNowClosed = () => {
      if (!this.Condensor.CoolCircuitComplete) {
        this.WaterTank.RemoveEachStep -= CstSteamSys.Boiler.MainSteamValveWaterDrain
        this.WaterTank.AmountRemovers -= 1
      }
      // no steam flow (close main steam valve) = condensor has no hot side
      this.Condensor.HotCircuitComplete = false
    }
    //#endregion
    //#region Steam Vent valve
    this.SteamVent = new Valve(SteamSysTxt.Boiler.SteamVent, this)
    // open steam vent, loss some water
    this.SteamVent.cbNowOpen = () => {
      this.WaterTank.AmountRemovers += 1
      this.WaterTank.RemoveEachStep += CstSteamSys.Boiler.WaterVentLoss
    }
    this.SteamVent.cbNowClosed = () => {
      this.WaterTank.AmountRemovers -= 1
      this.WaterTank.RemoveEachStep -= CstSteamSys.Boiler.WaterVentLoss
    }
    //#endregion

    this.SafetyRelease = new Valve(SteamSysTxt.Boiler.SafetyRelease, this)

    this.Temperature = CstSteamSys.Boiler.StartTemp
    // this.Pressure = 0
    this.AutoFlame = false

    this.Condensor = condensor

    this.FuelSourceTank = fuelSourceTank
    makeAutoObservable(this)
  }

  get WaterLevel(): number { return this.WaterTank.Content }
  get HasFuel(): boolean { return this.FuelIntakeValve.Content !== 0 }
  get Content() { return this.Pressure }
  get HasEnoughWaterForFlame() { return this.WaterLevel >= CstSteamSys.Boiler.MinWaterLvlForFlame }
  get TempInsideAutoZone() {
    return this.Temperature > CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.AutoEnableZone
      && this.Temperature < CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.AutoEnableZone
  }
  get Pressure() {
    return CalcPressureViaTemp(this.Temperature)
  }
  CheckFlame() {
    // only keep flame is there is still fuel && water
    if (this.HasFlame && (!this.HasFuel || !this.HasEnoughWaterForFlame)) this.Extinguishing()
  }

  Ignite() {
    // ignite if there is fuel and enough water
    this.HasFlame = this.HasFuel && this.HasEnoughWaterForFlame
    if (this.HasFlame) {
      // ignition succesfull = start burning fuel

      this.FuelSourceTank.AmountRemovers += 1
      this.FuelSourceTank.RemoveEachStep += CstFuelSys.SteamBoiler.Consumption
    }
  }
  Extinguishing() {
    // kill flame & stop burning fuel
    this.HasFlame = false

    this.FuelSourceTank.AmountRemovers -= 1
    this.FuelSourceTank.RemoveEachStep -= CstFuelSys.SteamBoiler.Consumption
  }

  CheckTemp() {
    //  no flame but not at start temp = cooling down
    if (!this.HasFlame && this.Temperature > CstSteamSys.Boiler.StartTemp) {
      this.Temperature -= CstSteamSys.Boiler.TempCoolingStep
      return
    }
    if (this.HasFlame) {
      // flame heats boiler 
      this.Temperature += CstSteamSys.Boiler.TempAddStep
    }
  }

  Thick() {
    this.WaterTank.AddEachStep = this.WaterIntakeValve.Content
    this.WaterTank.Thick()
    this.CheckFlame() // auto trip with fuel or not enough water
    this.CheckTemp()
    // this.CheckPressure()

    // open safety release valve and kill flame is pressure is to high
    if (this.Pressure >= CstSteamSys.Boiler.SafetyPressure && !this.SafetyRelease.isOpen) {
      this.SafetyRelease.Open()
      this.Extinguishing()
      // open safety valve = loss of water in boiler
      this.WaterTank.Inside -= CstSteamSys.Boiler.WaterLossBySafetyRelease
      // open safety valve = loss of temperature (to drop the pressure)
      this.Temperature -= CstSteamSys.Boiler.TempLossBySafetyRelease
    }
    // close safety release is pressure is back below 
    if (this.Pressure < CstSteamSys.Boiler.SafetyPressure && this.SafetyRelease.isOpen) {
      this.SafetyRelease.Close()
    }

    // Steam vent valve, loose some heat and water
    if (this.SteamVent.isOpen) {
      this.Temperature -= CstSteamSys.Boiler.TempVentLoss
    }

    // auto flame can only works inside operation zone (operational temp + / - autoEnableZoner)
    if (this.AutoFlame && !this.TempInsideAutoZone) this.AutoFlame = false


    // auto flame controls kills flame when pressure above operational
    if (this.AutoFlame
      && this.Temperature >= CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.AutoEnableZone / 2)
      this.Extinguishing()

    // auto flame starts flame when pressure below operational
    if (this.AutoFlame
      && this.Temperature <= CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.AutoEnableZone / 2)
      this.Ignite()


  }
}
