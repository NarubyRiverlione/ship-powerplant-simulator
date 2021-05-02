import {
  makeObservable, computed,
} from 'mobx'
import Generator from './Generator'
import Valve, { ValveInterface } from './Valve'
import Cooler from './Cooler'
import Tank, { TankInterface } from './Tank'

import {
  CstAirSys, CstPowerSys, CstLubSys,
} from '../Constants/Cst'
import CstTxt from '../Constants/CstTxt'

const { DieselGeneratorTxt } = CstTxt

export default class DieselGenerator extends Generator {
  FuelIntakeValve: ValveInterface
  LubIntakeValve: ValveInterface
  LubSlump: Tank
  LubProvider: TankInterface
  AirIntakeValve: ValveInterface
  AirProvider: TankInterface
  LubCooler: Cooler

  constructor(name: string, rate: number,
    dieselValve: ValveInterface,
    lubValve: ValveInterface,
    airValve: ValveInterface,
    lubCooler: Cooler) {
    super(name, rate, dieselValve.Source as Tank)
    this.FuelIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.FuelIntakeValve}`, dieselValve)

    this.LubIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.LubIntakeValve}`, lubValve,
      CstPowerSys.DsGen.Slump.IntakeValveVolume)
    this.LubProvider = lubValve.Source as Tank

    this.LubSlump = new Tank(DieselGeneratorTxt.LubSlump, CstPowerSys.DsGen.Slump.TankVolume)

    this.AirIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.AirIntakeValve}`, airValve)
    this.AirProvider = airValve.Source as Tank

    this.LubCooler = lubCooler

    makeObservable(this, {
      CheckAir: computed,
    })
  }

  CheckFuel() {
    this.HasFuel = this.FuelIntakeValve.Content !== 0
  }

  CheckLubrication() {
    this.HasLubrication = this.LubSlump.Content >= CstPowerSys.DsGen.Slump.MinForLubrication
  }

  CheckCooling() {
    // lub cooler only works
    // with enough lubrication (hot side Ok)
    // and fresh water cooling (cool side Ok)
    this.LubCooler.HotCircuitComplete = this.HasLubrication

    // generator has cooling of lub cooler is cooling
    this.HasCooling = this.LubCooler.IsCooling
  }

  get CheckAir() {
    return this.AirIntakeValve.Content - CstAirSys.DieselGenerator.StarAirConsumption >= 0
  }

  Start() {
    // only start when enough start air via open Air intake valve
    if (this.CheckAir) {
      //  remove air from emergency receiver
      this.AirProvider.Inside -= CstAirSys.DieselGenerator.StarAirConsumption
      super.Start()
    }
  }

  Thick() {
    this.LubProvider.RemoveThisStep = 0
    this.LubSlump.AddThisStep = 0
    if (this.LubIntakeValve.Content !== 0) {
      // only  fill slump tank if lub source is not empty
      this.LubProvider.RemoveThisStep += this.LubIntakeValve.Content / CstLubSys.RatioStorageDsGenSlump
      this.LubSlump.AddThisStep = this.LubIntakeValve.Content
    }

    this.LubSlump.Thick()
    this.CheckFuel()
    this.CheckLubrication()
    this.CheckCooling()
    super.Thick()
  }
}
