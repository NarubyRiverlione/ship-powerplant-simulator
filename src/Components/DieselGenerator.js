const {
  makeObservable, action, computed
} = require('mobx')
const Generator = require('./Generator')
const Valve = require('./Valve')
const { CstAirSys } = require('../Cst')

module.exports = class DieselGenerator extends Generator {
  constructor(name, rate, dieselValve, lubValve, airValve, lubCooler) {
    super(name, rate)
    this.FuelIntakeValve = new Valve(name + ' - fuel intake valve')
    this.FuelIntakeValve.Source = dieselValve
    this.FuelProvider = dieselValve.Source

    this.LubIntakeValve = new Valve(name + ' - lubrication intake valve')
    this.LubIntakeValve.Source = lubValve
    // this.LubProvider = lubValve.Source

    this.AirIntakeValve = new Valve(name + ' - Air intake valve')
    this.AirIntakeValve.Source = airValve
    // this.AirProvider = airValve.Source

    this.LubCooler = lubCooler
    // this.CoolingIntakeValve = new Valve(name + ' - Cooling intake valve')
    // this.CoolingIntakeValve.Source = LubCooler
    // this.CoolingProvider = LubCooler.Source

    makeObservable(this, {
      CheckAir: computed,
      Start: action,
      Stop: action,
      Thick: action
    })
  }

  CheckFuel() {
    this.HasFuel = this.FuelIntakeValve.Content() !== 0
  }

  CheckLubrication() {
    this.HasLubrication = this.LubIntakeValve.Content() !== 0
  }

  CheckCooling() {
    this.HasCooling = this.LubCooler.isCooling
  }

  get CheckAir() {
    return this.AirIntakeValve.Content() >= CstAirSys.DieselGenerator.MinPressure
  }

  Start() {
    this.CheckFuel()
    this.CheckLubrication()
    this.CheckCooling()
    if (this.CheckAir) super.Start()
  }

  Thick() {
    this.CheckFuel()
    this.CheckLubrication()
    this.CheckCooling()
    super.Thick()
  }
}
