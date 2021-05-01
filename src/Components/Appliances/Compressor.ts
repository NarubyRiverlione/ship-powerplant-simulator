import {
  makeObservable, observable, computed,
} from 'mobx'
import Appliance from './Appliance'
import Valve from '../Valve'
import PowerBus from '../PowerBus'

export default class Compressor extends Appliance {
  OutletValve: Valve
  HasReceiver: boolean

  constructor(name: string, bus: PowerBus, rate: number) {
    super(name, bus, rate)

    this.HasReceiver = false
    this.OutletValve = new Valve(`${name} - outlet valve`, this)
    makeObservable(this, {
      HasReceiver: observable, SafetyOpen: computed,
    })
  }

  // open safety with running without a receiver
  get SafetyOpen() { return this.isRunning && !this.HasReceiver }

  Thick() {
    super.Thick()

    this.OutletValve.Source = this
  }
}
