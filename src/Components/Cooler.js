const { makeAutoObservable } = require('mobx')
const { CheckCircuit } = require('../Common')

module.exports = class Cooler {
  constructor(name, coolingInputRate) {
    this.Name = name
    this.isCooling = false // cooling circuit & rate is ok
    this.HasCooling = false // isCooling && hot circuit is ok
    this.CoolingInputRate = coolingInputRate
    this.CoolingProviders = 0
    // this.CoolCircuit = []
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
