const { CstBoundaries } = require('../Cst')

module.exports = class PowerBus {
  constructor(name) {
    this.Name = name
    this.Voltage = 0
    this.Providers = 0
    // this.Consumers = 0
  }

  Thick() {
    this.Voltage = this.Providers > 0
      ? CstBoundaries.PowerSys.Voltage
      : 0
  }
}
