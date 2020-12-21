const Generator = require('./Generator')
const Valve = require('./Valve')

module.exports = class DieselGenerator extends Generator {
  constructor(name, rate, dieselSource) {
    super(name, rate)
    this.FuelIntakeValve = new Valve(dieselSource)
    // TODO workaround coolant & lubrication not coded yet
    this.HasCooling = true
    this.HasLubrication = true
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
