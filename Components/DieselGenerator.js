const { makeObservable, observable, action } = require('mobx')
const Generator = require('./Generator')
const Valve = require('./Valve')

module.exports = class DieselGenerator extends Generator {
  constructor(name, rate, dieselValve, lubValve) {
    super(name, rate)
    this.FuelIntakeValve = new Valve(name + ' - fuel intake valve')
    this.FuelIntakeValve.Source = dieselValve
    this.FuelProvider = dieselValve.Source

    this.LubIntakeValve = new Valve(name + ' - lubrication intake valve')
    this.LubIntakeValve.Source = lubValve
    this.LubProvider = lubValve.Source

    makeObservable(this, {
      // FuelIntakeValve: observable,
      // LubIntakeValve: observable,
      CheckFuel: action,
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

  Start() {
    this.CheckFuel()
    this.CheckLubrication()
    super.Start()
  }

  Thick() {
    this.CheckFuel()
    this.CheckLubrication()
    super.Thick()
  }
}
