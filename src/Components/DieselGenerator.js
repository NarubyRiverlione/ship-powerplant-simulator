const {
  makeObservable, action, computed
} = require('mobx')
const Generator = require('./Generator')
const Valve = require('./Valve')
const { CstAirSys } = require('../Cst')

module.exports = class DieselGenerator extends Generator {
  constructor(name, rate, dieselValve, lubValve, airValve) {
    super(name, rate)
    this.FuelIntakeValve = new Valve(name + ' - fuel intake valve')
    this.FuelIntakeValve.Source = dieselValve
    this.FuelProvider = dieselValve.Source

    this.LubIntakeValve = new Valve(name + ' - lubrication intake valve')
    this.LubIntakeValve.Source = lubValve
    this.LubProvider = lubValve.Source

    this.AirIntakeValve = new Valve(name + ' - Air intake valve')
    this.AirIntakeValve.Source = airValve
    this.AirProvider = airValve.Source

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

  get CheckAir() {
    return this.AirIntakeValve.Content() >= CstAirSys.DieselGenerator.MinPressure
  }

  Start() {
    this.CheckFuel()
    this.CheckLubrication()
    if (this.CheckAir) super.Start()
  }

  Thick() {
    this.CheckFuel()
    this.CheckLubrication()
    super.Thick()
  }
}
