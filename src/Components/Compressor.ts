import {
  makeObservable, observable, action, computed
} from 'mobx'
import Appliance from './Appliance'
import Valve from './Valve'
import PowerBus from './PowerBus'

export default class Compressor extends Appliance {

  RatedFor: number
  OutletValve: Valve
  HasReceiver: boolean


  constructor(name: string, bus: PowerBus, rate: number) {
    super(name, bus)

    this.RatedFor = rate
    this.HasReceiver = false
    this.OutletValve = new Valve(name + ' - outlet valve', this)
    makeObservable(this, { HasReceiver: observable, SafetyOpen: computed, Output: observable, Content: computed })
  }

  // open safety with running without a receiver
  get SafetyOpen() { return this.isRunning && !this.HasReceiver }

  Thick() {
    super.Thick()
    this.Output = this.isRunning ? this.RatedFor : 0.0
    this.OutletValve.Source = this
  }
}
