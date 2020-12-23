const { CstBoundaries } = require('../Cst')
const { makeObservable, observable, action } = require('mobx')

module.exports = class PowerBus {
  constructor(name) {
    this.Name = name
    this.Voltage = 0
    this.Providers = 0
    // this.Consumers = 0
    makeObservable(this, {
      Voltage: observable,
      Providers: observable,
      Thick: action
    })
  }

  Thick() {
    this.Voltage = this.Providers > 0
      ? CstBoundaries.PowerSys.Voltage
      : 0
  }
}
