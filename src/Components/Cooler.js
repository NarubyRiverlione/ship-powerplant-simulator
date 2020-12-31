const { makeAutoObservable } = require('mobx')

module.exports = class Cooler {
  constructor(name, coolingInputRate) {
    this.Name = name
    this.isCooling = false // cooling circuit & rate is ok
    this.hasCooling = false // isCooling && hot circuit is ok
    this.CoolingInputRate = coolingInputRate
    this.CoolingProviders = 0

    this.CoolingCircuitComplete = false
    this.HotCircuitComplete = false

    makeAutoObservable(this)
  }

  CheckCoolingRate() {
    return this.CoolingProviders >= this.CoolingInputRate
  }

  Thick() {
    this.hasCooling = this.CheckCoolingRate() && this.CoolingCircuitComplete
    this.isCooling = this.hasCooling && this.HotCircuitComplete
  }
}
