const { makeObservable, observable, action } = require('mobx')

module.exports = class Generator {
  constructor(name, rate) {
    this.Name = name
    this.RatedFor = rate
    this.isRunning = false
    this.Output = 0
    this.HasFuel = false
    this.HasCooling = false
    this.HasLubrication = false
    this.FuelProvider = null
    this.FuelConsumption = 0
    makeObservable(this, {
      isRunning: observable,
      Output: observable,
      HasFuel: observable,
      HasCooling: observable,
      HasLubrication: observable,
      Start: action,
      Stop: action,
      Thick: action,
      Toggle: action
    })
  }

  TestRunning() {
    // not running, keep stopped
    if (!this.isRunning) return false

    const prerequisites = this.HasCooling && this.HasFuel && this.HasLubrication
    // already running and  prerequisites are still ok --> continue running
    if (prerequisites) return true

    // prerequisites aren't met any more --> Stop
    this.Stop()
    return false
  }

  Start() {
    this.isRunning = true

    if (this.FuelProvider) {
      this.FuelProvider.Removing = true
      this.FuelProvider.RemoveEachStep += this.FuelConsumption
    }
  }

  Stop() {
    this.isRunning = false
    if (this.FuelProvider) {
      this.FuelProvider.Removing = false
      this.FuelProvider.RemoveEachStep -= this.FuelConsumption
    }
  }

  Toggle() {
    if (this.isRunning) this.Stop()
    else this.Start()
  }

  Thick() {
    this.isRunning = this.TestRunning()
    this.Output = this.isRunning ? this.RatedFor : 0
  }
}
