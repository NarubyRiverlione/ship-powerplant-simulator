const { makeAutoObservable } = require('mobx')

const { CstChanges } = require('./Cst')
const PowerSystem = require('./Systems/PowerSystem')
const FuelSystem = require('./Systems/FuelSystem')

module.exports = class Simulator {
  constructor() {
    this.Reset()
    this.Running = null
    makeAutoObservable(this)
  }

  Reset() {
    this.Running = null // ref setInterval
    this.FuelSys = new FuelSystem()
    this.PowerSys = new PowerSystem(this.FuelSys.DsServiceTank, this.FuelSys.DsServiceOutletValve)
  }

  Thick() {
    this.FuelSys.Thick()
    this.PowerSys.Thick()
  }

  Start() {
    this.Running = setInterval(() => {
      this.Thick()
    }, CstChanges.Interval)
  }

  Stop() {
    if (this.Running) {
      clearInterval(this.Running)
      this.Running = null
    }
  }
}
