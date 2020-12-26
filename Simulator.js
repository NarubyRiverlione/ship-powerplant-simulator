const { makeAutoObservable } = require('mobx')

const { CstChanges } = require('./Cst')
const PowerSystem = require('./Systems/PowerSystem')
const FuelSystem = require('./Systems/FuelSystem')
const LubricationSystem = require('./Systems/LubricationSystem')

module.exports = class Simulator {
  constructor() {
    this.Reset()
    this.Running = null
    makeAutoObservable(this)
  }

  Reset() {
    this.Running = null // ref setInterval
    this.FuelSys = new FuelSystem()
    this.LubSys = new LubricationSystem()
    this.PowerSys = new PowerSystem(this.FuelSys.DsService.OutletValve, this.LubSys.Storage.OutletValve)
  }

  Thick() {
    this.PowerSys.Thick()
    this.FuelSys.Thick()
    this.LubSys.Thick()
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
