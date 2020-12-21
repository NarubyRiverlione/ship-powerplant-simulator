const { CstTxt, CstChanges } = require('./Cst')
const PowerSystem = require('./Systems/PowerSystem')
const FuelSystem = require('./Systems/FuelSystem')

const { SimulationTxt } = CstTxt
module.exports = class Simulator {
  constructor() {
    this.Reset()
  }

  Reset() {
    this.Running = null // ref setIntervall
    this.PowerSys = new PowerSystem()
    this.FuelSys = new FuelSystem()
    return this.Status()
  }

  Thick() {
    this.FuelSys.Thick()
    this.PowerSys.Thick()
  }

  Start() {
    this.Running = setImmediate(() => {
      this.Thick()
    }, CstChanges.Interval)
    return this.Status()
  }

  Stop() {
    if (this.Running) {
      clearImmediate(this.Running)
      this.Running = null
    }
    return this.Status()
  }

  Status() {
    return {
      status: !!this.Running,
      statusMessage: this.Running ? SimulationTxt.Started : SimulationTxt.Stopped
    }
  }
}
