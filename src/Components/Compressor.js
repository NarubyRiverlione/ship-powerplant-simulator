const { makeObservable, observable, action } = require('mobx')
const Appliance = require('./Appliance')

module.exports = class Compressor extends Appliance {
  constructor(name, bus, rate) {
    super(name, bus)
    this.Output = 0.0
    this.RatedFor = rate
    makeObservable(this, { Output: observable, Thick: action, Content: action })
  }

  Content() { return this.Output }

  Thick() {
    super.Thick()
    this.Output = this.isRunning ? this.RatedFor : 0.0
  }
}
