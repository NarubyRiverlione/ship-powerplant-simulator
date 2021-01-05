const {
  makeObservable, action, computed
} = require('mobx')
const Generator = require('./Generator')
const Valve = require('./Valve')
const Tank = require('./Tank')
const {
  CstAirSys, CstPowerSys, CstLubSys
} = require('../Cst')
const CstTxt = require('../CstTxt')
const { DieselGeneratorTxt } = CstTxt

module.exports = class DieselGenerator extends Generator {
  constructor(name, rate, dieselValve, lubValve, airValve, lubCooler) {
    super(name, rate)
    this.FuelIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.FuelIntakeValve}`)
    this.FuelIntakeValve.Source = dieselValve
    this.FuelProvider = dieselValve.Source

    this.LubIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.LubIntakeValve}`)
    this.LubIntakeValve.Source = lubValve
    this.LubProvider = lubValve.Source
    this.LubIntakeValve.cbNowOpen = () => {
      this.LubSlump.Adding = true
      this.LubProvider.RemoveEachStep += CstPowerSys.DsGen1.Slump.TankAddStep / CstLubSys.RatioStorageDsGenSlump
      this.LubProvider.Removing = true
    }
    this.LubIntakeValve.cbNowClosed = () => {
      this.LubSlump.Adding = false
      this.LubProvider.RemoveEachStep = CstPowerSys.DsGen1.Slump.TankAddStep / CstLubSys.RatioStorageDsGenSlump
      this.LubProvider.Removing = false
    }

    this.LubSlump = new Tank(DieselGeneratorTxt.LubSlump, CstPowerSys.DsGen1.Slump.TankVolume)
    this.LubSlump.Source = this.LubIntakeValve
    this.LubSlump.AddEachStep = CstPowerSys.DsGen1.Slump.TankAddStep
    this.LubSlump.RemoveEachStep = CstPowerSys.DsGen1.Slump.TankAddStep

    this.AirIntakeValve = new Valve(`${name} ${DieselGeneratorTxt.AirIntakeValve}`)
    this.AirIntakeValve.Source = airValve

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
    this.Thick()
    if (this.CheckAir) super.Start()
  }

  Thick() {
    this.LubSlump.AddEachStep = this.LubIntakeValve.Source.Content === 0
      // stop filling slump tank if lub source is empty
      ? 0
      // restart filling slump if lub source isn't empty
      : CstPowerSys.DsGen1.Slump.TankAddStep
    this.LubSlump.Thick()
    this.CheckFuel()
    this.CheckLubrication()
    this.CheckCooling()
    super.Thick()
  }
}
