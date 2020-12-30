const { makeObservable, observable, action } = require('mobx')
const Appliance = require('./Appliance')

module.exports = class ElectricPump extends Appliance {
  constructor(name, bus, rate) {
    super(name, bus)
    this.RatedFor = rate
    this.Output = 0
    this.Providers = 0
    makeObservable(this, { Output: observable, Thick: action, Content: action })
  }

  Content() { return this.Output }

  Thick() {
    super.Thick()
    if (!this.isRunning) {
      this.Output = 0
      return
    }
    this.Output = this.Providers > this.RatedFor ? this.RatedFor : this.Providers
  }
}
