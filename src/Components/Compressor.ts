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
  SafetyOpen: boolean
  HasReceiver: boolean

  constructor(name: string, bus: PowerBus, rate: number) {
    super(name, bus)
    this.Output = 0.0
    this.RatedFor = rate
    this.SafetyOpen = false
    this.HasReceiver = false
    this.OutletValve = new Valve(name + ' - outlet valve', this)
    makeObservable(this, { Output: observable, Content: computed })
  }

  get Content() { return this.Output }

  Thick() {
    super.Thick()
    // open safety with running without a receiver
    this.SafetyOpen = this.isRunning && !this.HasReceiver

    // only output when running with closed safety
    this.Output = !this.SafetyOpen && this.isRunning ? this.RatedFor : 0.0
    this.OutletValve.Source = this
  }
}
