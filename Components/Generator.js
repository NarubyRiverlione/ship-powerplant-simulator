module.exports = class Generator {
  constructor() {
    this.Running = false
    this.HasFuel = false
    this.HasCooling = false
  }

  Start() {
    if (!this.HasFuel) {
      this.Running = false
      return { Running: false, Message: 'No fuel, cannot start' }
    }
    this.Running = true
    return { Running: this.Running, Message: 'Succesfull start' }
  }

  Stop() {
    this.Running = false
    return { Running: false, Message: 'Generator stopped' }
  }

  Status() {
    return {
      Running: this.Running,
      HasFuel: this.HasFuel
    }
  }
}
