import {
  makeObservable, action, computed
} from 'mobx'
import Generator from './Generator'
import Valve from './Valve'
import Cooler from './Cooler'
import Tank from './Tank'
import {
  CstAirSys, CstPowerSys, CstLubSys
} from '../Cst'
import CstTxt from '../CstTxt'
const { DieselGeneratorTxt } = CstTxt

export default class DieselGenerator extends Generator {
  FuelIntakeValve: Valve
  FuelProvider: Tank
  LubIntakeValve: Valve
  LubSlump: Tank
  LubProvider: Tank
  AirIntakeValve: Valve
  LubCooler: Cooler

  constructor(name: string, rate: number,
    dieselValve: Valve, lubValve: Valve, airValve: Valve, lubCooler: Cooler) {
    super(name, rate, dieselValve.Source as Tank)
    this.FuelIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.FuelIntakeValve}`, dieselValve)
    this.FuelProvider = dieselValve.Source as Tank

    this.LubIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.LubIntakeValve}`, lubValve)
    this.LubProvider = lubValve.Source as Tank
    this.LubIntakeValve.cbNowOpen = () => {
      const lub = this.LubIntakeValve.Source as Valve
      if (lub.isOpen) {
        this.LubSlump.Adding = true
        this.LubProvider.AmountRemovers += 1
      }
    }
    this.LubIntakeValve.cbNowClosed = () => {
      this.LubSlump.Adding = false
      this.LubProvider.RemoveEachStep = CstPowerSys.DsGen1.Slump.TankAddStep / CstLubSys.RatioStorageDsGenSlump
      this.LubProvider.AmountRemovers -= 1
    }

    this.LubSlump = new Tank(DieselGeneratorTxt.LubSlump, CstPowerSys.DsGen1.Slump.TankVolume)
    // this.LubSlump.Source = this.LubIntakeValve.Source as Tank
    this.LubSlump.AddEachStep = CstPowerSys.DsGen1.Slump.TankAddStep
    this.LubSlump.RemoveEachStep = CstPowerSys.DsGen1.Slump.TankAddStep

    this.AirIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.AirIntakeValve}`, airValve)

    this.LubCooler = lubCooler

    makeObservable(this, {
      CheckAir: computed,
      Start: action,
      Stop: action,
      Thick: action
    })
  }

  CheckFuel() {
    this.HasFuel = this.FuelIntakeValve.Content !== 0
  }

  CheckLubrication() {
    this.HasLubrication = this.LubSlump.Content >= CstPowerSys.DsGen1.Slump.MinForLubrication
  }

  CheckCooling() {
    this.HasCooling = this.LubCooler.isCooling
  }

  get CheckAir() {
    return this.AirIntakeValve.Content >= CstAirSys.DieselGenerator.MinPressure
  }

  Start() {
    if (this.CheckAir) super.Start()
  }

  Thick() {
    this.LubProvider.RemoveEachStep = 0
    this.LubSlump.AddEachStep = 0
    if (this.LubSlump.Adding && this.LubIntakeValve.Source.Content !== 0) {
      // only  fill slump tank if lub source is not empty
      this.LubProvider.RemoveEachStep += CstPowerSys.DsGen1.Slump.TankAddStep / CstLubSys.RatioStorageDsGenSlump
      this.LubSlump.AddEachStep = CstPowerSys.DsGen1.Slump.TankAddStep
    }

    this.LubSlump.Thick()
    this.CheckFuel()
    this.CheckLubrication()
    this.CheckCooling()
    super.Thick()
  }
}
