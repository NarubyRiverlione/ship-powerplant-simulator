import {
  makeObservable, observable, action, computed
} from 'mobx'
import Appliance from './Appliance'
import Valve from './Valve'
import PowerBus from './PowerBus'

export default class Compressor extends Appliance {
  Output: number
  RatedFor: number
  OutletValve: Valve

  constructor(name: string, bus: PowerBus, rate: number) {
    super(name, bus)
    this.Output = 0.0
    this.RatedFor = rate
    this.OutletValve = new Valve(name + ' - outlet valve', this)
    makeObservable(this, { Output: observable, Thick: action, Content: computed })
  }

  get Content() { return this.Output }

  Thick() {
    super.Thick()
    this.Output = this.isRunning ? this.RatedFor : 0.0
    this.OutletValve.Source = this
  }
}
