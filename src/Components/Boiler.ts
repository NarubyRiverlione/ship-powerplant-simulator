import Item from './Item'
import Tank from './Tank'
import Valve from './Valve'
import CstTxt from '../CstTxt'
import { CstChanges, CstSteamSys } from '../Cst'
import CalcPressureViaTemp from '../../src/CalcPressureTemp'
import { makeAutoObservable } from 'mobx'
const { SteamSysTxt } = CstTxt

export default class Boiler implements Item {
  Name: string
  WaterTank: Tank // virtual tank to hold the water inside the boiler
  WaterIntakeValve: Valve
  WaterDrainValve: Valve

  FuelIntakeValve: Valve
  hasFlame: boolean

  Temperature: number
  Pressure: number

  constructor(name: string, waterSource: Item, fuelSource: Item) {
    this.Name = name
    //#region  Water content
    this.WaterIntakeValve = new Valve(SteamSysTxt.Boiler.WaterIntakeValve, waterSource)
    this.WaterTank = new Tank('virtual tank to hold the water inside the boiler', CstSteamSys.Boiler.WaterVolume, 0)
    this.WaterIntakeValve.cbNowOpen = () => { this.WaterTank.Adding = true }
    this.WaterIntakeValve.cbNowClosed = () => { this.WaterTank.Adding = false }

    this.WaterDrainValve = new Valve(SteamSysTxt.Boiler.WaterDrainValve, this.WaterTank)
    this.WaterDrainValve.cbNowOpen = () => { this.WaterTank.Removing = true }
    this.WaterDrainValve.cbNowClosed = () => { this.WaterTank.Removing = false }
    //#region 

    //#region Fuel & Flame
    this.FuelIntakeValve = new Valve(SteamSysTxt.Boiler.FuelIntakeValve, fuelSource)
    this.hasFlame = false
    //#endregion


    this.Temperature = CstSteamSys.Boiler.StartTemp
    this.Pressure = 0
    makeAutoObservable(this)
  }
  get WaterLevel(): number { return this.WaterTank.Content }
  get hasFuel(): boolean { return this.FuelIntakeValve.Content !== 0 }
  get Content() { return this.Pressure }
  get hasEnoughWaterForFlame() { return this.WaterLevel >= CstSteamSys.Boiler.MinWaterLvlForFlame }


  CheckFlame() {
    // keep flame is there is still fuel && water
    // no water = auto trip
    this.hasFlame = this.hasFuel && this.hasFlame
      && this.hasEnoughWaterForFlame
  }

  Ignite() {
    // ignite if there is fuel and enough water
    this.hasFlame = this.hasFuel && this.hasEnoughWaterForFlame
  }
  Exting() {
    this.hasFlame = false
  }
  CheckTemp() {
    // TODO, no flame but not at start temp = cooling down
    if (!this.hasFlame) return

    // flame heats boiler until at operation temp (flame has no indefinitely energy)
    this.Temperature += CstSteamSys.Boiler.TempAddStep
    if (this.Temperature > CstSteamSys.Boiler.OperatingTemp) this.Temperature = CstSteamSys.Boiler.OperatingTemp
  }
  CheckPressure() {
    this.Pressure = CalcPressureViaTemp(this.Temperature)
  }
  Thick() {
    this.WaterTank.AddEachStep = this.WaterIntakeValve.Content
    this.WaterTank.RemoveEachStep = CstChanges.DrainStep
    this.WaterTank.Thick()
    this.CheckFlame() // auto trip with fuel or not enough water
    this.CheckTemp()
    this.CheckPressure()
  }
}