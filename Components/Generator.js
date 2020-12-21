module.exports = class Generator {
  constructor(name, rate) {
    this.Name = name
    this.RatedFor = rate
    this.isRunning = false
    this.Output = 0
    this.HasFuel = false
    this.HasCooling = false
    this.HasLubrication = false
  }

  TestRunning() { return this.HasCooling && this.HasFuel && this.HasLubrication }

  Start() {
    this.isRunning = this.TestRunning()
  }

  Stop() {
    this.isRunning = false
  }

  Thick() {
    this.isRunning = this.isRunning && this.TestRunning()
    this.Output = this.isRunning ? this.RatedFor : 0
  }
}