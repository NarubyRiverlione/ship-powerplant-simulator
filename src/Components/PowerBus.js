const { CstPowerSys } = require('../Cst')
const { makeAutoObservable } = require('mobx')

module.exports = class PowerBus {
  constructor(name) {
    this.Name = name
    this.Voltage = 0
    this.Providers = 0
    makeAutoObservable(this)
  }

  Thick() {
    this.Voltage = this.Providers > 0
      ? CstPowerSys.Voltage
      : 0
  }
}
