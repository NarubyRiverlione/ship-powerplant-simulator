import Item from './Item'
import Tank, { iTank } from './Tank'
import Valve from './Valve'
import CstTxt from '../CstTxt'
import { CstChanges, CstSteamSys, CstFuelSys } from '../Cst'
import CalcPressureViaTemp from '../CalcPressureTemp'
import { makeAutoObservable } from 'mobx'
const { SteamSysTxt } = CstTxt

/*
  
Fuel intake vale ==>==|                   |--> Safety Release valve 
                      | BOILER =>=steam=>=|
Water intake valve =>=|     |             |--> Steam Vent valve
                 water DrainValve         |
                                          |
                                          |==>== Main Steam valve ==>==
                                          |
                                          |==<== Steam Condensor ==<==
  |
*/
export default class SteamBoiler implements Item {
  Name: string
  WaterTank: Tank // virtual tank to hold the water inside the boiler
  WaterIntakeValve: Valve
  WaterDrainValve: Valve
  FuelIntakeValve: Valve
  HasFlame: boolean
  SafetyRelease: Valve
  SteamVent: Valve
  Temperature: number
  FuelSourceTank: iTank
  AutoFlame: boolean


  constructor(name: string, waterSource: Item,
    fuelSource: Item, fuelSourceTank: iTank) {
    this.Name = name
    //#region Water supply
    this.WaterIntakeValve = new Valve(SteamSysTxt.Boiler.WaterIntakeValve, waterSource)
    this.WaterTank = new Tank('virtual tank to hold the water inside the boiler', CstSteamSys.Boiler.WaterVolume, 0)

    this.WaterDrainValve = new Valve(SteamSysTxt.Boiler.WaterDrainValve, this.WaterTank)
    this.WaterDrainValve.cbNowOpen = () => {
      this.WaterTank.RemoveEachStep += CstChanges.DrainStep
    }
    this.WaterDrainValve.cbNowClosed = () => {
      this.WaterTank.RemoveEachStep -= CstChanges.DrainStep
    }
    //#endregion 
    //#region Fuel & Flame
    this.FuelIntakeValve = new Valve(SteamSysTxt.Boiler.FuelIntakeValve, fuelSource)
    this.HasFlame = false
    //#endregion
    //#region Steam Vent valve
    this.SteamVent = new Valve(SteamSysTxt.Boiler.SteamVent, this)
    // open steam vent, loss some water
    this.SteamVent.cbNowOpen = () => {
      this.WaterTank.RemoveEachStep += CstSteamSys.Boiler.WaterVentLoss
    }
    this.SteamVent.cbNowClosed = () => {
      this.WaterTank.RemoveEachStep -= CstSteamSys.Boiler.WaterVentLoss
    }
    //#endregion

    this.SafetyRelease = new Valve(SteamSysTxt.Boiler.SafetyRelease, this)

    this.Temperature = CstSteamSys.Boiler.StartTemp

    this.AutoFlame = false

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
    /* istanbul ignore if  */
    if (this.HasFlame) {
      console.error('double ignition')
      return
    }
    // ignite if there is fuel and enough water
    this.HasFlame = this.HasFuel && this.HasEnoughWaterForFlame
    if (this.HasFlame) {
      // ignition succesfull = start burning fuel
      this.FuelSourceTank.RemoveEachStep += CstFuelSys.SteamBoiler.Consumption
    }
  }
  Extinguishing() {
    /* istanbul ignore if  */
    if (!this.HasFlame) {
      console.warn('double Extinguishing')
      return
    }
    // kill flame & stop burning fuel
    this.HasFlame = false
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
  AutoFlameToggle() {
    this.AutoFlame = !this.AutoFlame
  }

  Toggle() {
    if (this.HasFlame) { this.Extinguishing() } else { this.Ignite() }
  }

  Thick() {
    this.WaterTank.AddEachStep = this.WaterIntakeValve.Content
    this.WaterTank.Thick()
    this.CheckFlame() // auto trip with fuel or not enough water
    this.CheckTemp()

    //#region safety release valve
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
    //#endregion

    // Steam vent valve, loose some heat and water
    if (this.SteamVent.isOpen) {
      this.Temperature -= CstSteamSys.Boiler.TempVentLoss
    }
    //#region Auto flame
    // auto flame can only works inside operation zone (operational temp + / - autoEnableZoner)
    if (this.AutoFlame && !this.TempInsideAutoZone) this.AutoFlame = false

    // auto flame controls kills flame when pressure above operational
    if (this.AutoFlame && this.HasFlame
      && this.Temperature >= CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.AutoEnableZone / 2)
      this.Extinguishing()

    // auto flame starts flame when pressure below operational
    if (this.AutoFlame && !this.HasFlame
      && this.Temperature <= CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.AutoEnableZone / 2)
      this.Ignite()
    //#endregion

    /* istanbul ignore if  */
    if (this.WaterTank.Content < 0) {
      console.warn('Boiler waterlevel negative! (readout < -50)')
      this.WaterTank.Inside = 0
    }

  }
}
