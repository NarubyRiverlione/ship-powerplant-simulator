import { makeObservable } from 'mobx'
import Appliance from './Appliance'
import PowerBus from '../PowerBus'

export default class ElectricPump extends Appliance {
  Providers: number

  constructor(name: string, bus: PowerBus, rate: number) {
    super(name, bus, rate)
    this.Providers = 0
    makeObservable(this, {})
  }

  Thick() {
    // pump cannot run dry without providers
    if (this.Providers === 0) super.Stop()

    super.Thick()
    // TODO drop RatedFor ?
    this.Output = this.isRunning
      ? this.Providers > this.RatedFor ? this.RatedFor : this.Providers
      : 0
  }
}
