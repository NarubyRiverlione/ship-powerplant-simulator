const { makeObservable, observable, action } = require('mobx')

module.exports = class Appliance {
  constructor(name, bus) {
    this.Name = name
    this.isRunning = false
    this.Bus = bus
    makeObservable(this, {
      isRunning: observable,
      Start: action,
      Stop: action,
      Thick: action
    })
  }

  CheckPower() {
    return this.Bus.Voltage !== 0
  }

  Start() {
    if (this.CheckPower()) this.isRunning = true
  }

  Stop() {
    this.isRunning = false
  }

  Thick() {
    this.isRunning = this.isRunning && this.CheckPower()
  }
}
