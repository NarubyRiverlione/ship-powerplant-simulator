import { makeAutoObservable } from 'mobx'
import Item from './Item'
import Tank, { TankInterface } from './Tank'
import Valve from './Valve'
import CstTxt from '../Constants/CstTxt'
import { CstChanges, CstSteamSys, CstDsFuelSys } from '../Constants/Cst'
import CalcPressureViaTemp from '../CalcPressureTemp'
import RandomChange from '../RandomChange'

const { SteamSysTxt } = CstTxt

/*

Fuel intake vale ==>==|                   |--> Safety Release valve
                      | BOILER =>=steam=>=|
Water intake valve =>=|     |             |--> Steam Vent valve
                 water DrainValve         |
                                          |
                                          |==>== Main Steam valve ==>==
*/
export default class SteamBoiler implements Item {
  Name: string

  WaterTank: Tank // virtual tank to hold the water inside the boiler
  WaterIntakeValve: Valve
  WaterDrainValve: Valve

  FuelSourceTank: TankInterface
  FuelIntakeValve: Valve

  SafetyRelease: Valve
  SteamVent: Valve

  HasFlame: boolean
  Temperature: number
  AutoFlame: boolean

  RandomizeChange: boolean

  constructor(name: string, waterSource: Item,
    fuelSource: Item, fuelSourceTank: TankInterface) {
    this.Name = name
    // Water supply
    this.WaterIntakeValve = new Valve(SteamSysTxt.Boiler.WaterIntakeValve, waterSource)
    this.WaterTank = new Tank('virtual tank to hold the water inside the boiler', CstSteamSys.Boiler.WaterVolume, 0)
    this.WaterDrainValve = new Valve(SteamSysTxt.Boiler.WaterDrainValve, this.WaterTank, CstChanges.DrainRatio)

    this.FuelSourceTank = fuelSourceTank
    this.FuelIntakeValve = new Valve(SteamSysTxt.Boiler.FuelIntakeValve, fuelSource)
    this.HasFlame = false

    this.SteamVent = new Valve(SteamSysTxt.Boiler.SteamVent, this)

    this.SafetyRelease = new Valve(SteamSysTxt.Boiler.SafetyRelease, this)

    this.Temperature = CstChanges.StartTemp

    this.AutoFlame = false
    this.RandomizeChange = false

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
  }
  Extinguishing() {
    /* istanbul ignore if  */
    if (!this.HasFlame) {
      console.warn('double Extinguishing')
      return
    }
    // kill flame
    this.HasFlame = false
  }
  CheckTemp() {
    //  no flame but not at start temp = cooling down
    if (!this.HasFlame && this.Temperature > CstChanges.StartTemp) {
      this.Temperature -= RandomChange(this.RandomizeChange,
        CstSteamSys.Boiler.TempCoolingStep, CstSteamSys.Boiler.TempRandom)
      return
    }
    if (this.HasFlame) {
      // flame heats boiler
      this.Temperature += RandomChange(this.RandomizeChange,
        CstSteamSys.Boiler.TempAddStep, CstSteamSys.Boiler.TempRandom)
    }
  }
  AutoFlameToggle() {
    this.AutoFlame = !this.AutoFlame
  }

  Toggle() {
    if (this.HasFlame) { this.Extinguishing() } else { this.Ignite() }
  }

  Thick() {
    this.WaterTank.AddThisStep = this.WaterIntakeValve.Content
    if (this.WaterDrainValve.isOpen) this.WaterTank.RemoveThisStep += CstChanges.DrainRatio

    // Steam vent valve, loose some heat and water
    if (this.SteamVent.isOpen) {
      this.Temperature -= CstSteamSys.Boiler.TempVentLoss
      this.WaterTank.RemoveThisStep += CstSteamSys.Boiler.WaterVentLoss
    }

    this.WaterTank.Thick()

    this.CheckFlame() // auto trip with fuel or not enough water
    this.CheckTemp()

    // #region safety release valve
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
    // #endregion

    // #region Auto flame
    // auto flame can only works inside operation zone (operational temp + / - autoEnableZoner)
    if (this.AutoFlame && !this.TempInsideAutoZone) this.AutoFlame = false

    // auto flame controls kills flame when pressure above operational
    if (this.AutoFlame && this.HasFlame
      // eslint-disable-next-line max-len
      && this.Temperature >= CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.AutoEnableZone / 2) { this.Extinguishing() }

    // auto flame starts flame when pressure below operational
    if (this.AutoFlame && !this.HasFlame
      && this.Temperature <= CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.AutoEnableZone / 2) { this.Ignite() }
    // #endregion

    // burn fuel
    if (this.HasFlame) {
      this.FuelSourceTank.RemoveThisStep += CstDsFuelSys.SteamBoiler.Consumption.Diesel
    }

    // expand / shrink water by heat / cooling down
    if (this.Temperature > CstSteamSys.Boiler.StartExpandTemp && this.Temperature < CstSteamSys.Boiler.EndExpandTemp) {
      const expand = RandomChange(this.RandomizeChange, CstSteamSys.Boiler.ExpandRate, CstSteamSys.Boiler.ExpandRandom)
      this.WaterTank.Inside += expand * (this.HasFlame ? 1 : -1)
    }

    /* istanbul ignore if  */
    if (this.WaterTank.Content < 0) {
      console.warn('Boiler waterlevel negative! (readout < -50)')
      this.WaterTank.Inside = 0
    }
  }
}
