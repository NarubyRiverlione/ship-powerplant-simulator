const {
  makeObservable, observable, action, computed
} = require('mobx')
const Appliance = require('./Appliance')
const Valve = require('./Valve')

module.exports = class Compressor extends Appliance {
  constructor(name, bus, rate) {
    super(name, bus)
    this.Output = 0.0
    this.RatedFor = rate
    this.OutletValve = new Valve(name + ' - outlet valve')
    this.OutletValve.Source = this
    makeObservable(this, { Output: observable, Thick: action, Content: computed })
  }

  get Content() { return this.Output }

  Thick() {
    super.Thick()
    this.Output = this.isRunning ? this.RatedFor : 0.0
    this.OutletValve.Source = this
  }
}
