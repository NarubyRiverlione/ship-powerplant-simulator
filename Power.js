const { CstBoundaries } = require('./Cst')
const Generator = require('./Generator')

module.exports = class Power {
  constructor() {
    this.ShorePower = false
    this.DSgen1 = new Generator()
  }

  ConnectShore() {
    this.ShorePower = true
    return this.Status()
  }

  DisconnectShore() {
    this.ShorePower = false
    return this.Status()
  }

  MainBus() {
    return this.ShorePower || this.DSgen1.Running
      ? CstBoundaries.Power.Max
      : 0
  }

  Status() {
    return {
      MainBus: this.MainBus(),
      ShorePower: this.ShorePower,
      DSgen1: this.DSgen1.Running
    }
  }
}
