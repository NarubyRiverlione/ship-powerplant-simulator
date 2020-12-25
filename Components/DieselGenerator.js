const { makeObservable, observable, action } = require('mobx')
const Generator = require('./Generator')
const Valve = require('./Valve')

module.exports = class DieselGenerator extends Generator {
  constructor(name, rate, dieselSource, dieselValve) {
    super(name, rate)
    this.FuelIntakeValve = new Valve(name + ' - fuel intake valve')
    this.FuelIntakeValve.Source = dieselValve
    this.FuelProvider = dieselSource
    this.HasCooling = false
    this.HasLubrication = false

    makeObservable(this, {
      FuelIntakeValve: observable,
      CheckFuel: action,
      Start: action,
      Stop: action,
      Thick: action
    })
  }

  CheckFuel() {
    this.HasFuel = this.FuelIntakeValve.Content() !== 0
  }

  Start() {
    this.CheckFuel()
    super.Start()
  }

  Thick() {
    this.CheckFuel()
    super.Thick()
  }
}
