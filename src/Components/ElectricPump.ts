import {
  makeObservable, observable, computed
} from 'mobx'
import Appliance from './Appliance'
import PowerBus from './PowerBus'

export default class ElectricPump extends Appliance {
  RatedFor: number
  Providers: number

  constructor(name: string, bus: PowerBus, rate: number) {
    super(name, bus)
    this.RatedFor = rate

    this.Providers = 0
    makeObservable(this, { Output: observable, Content: computed })
  }


  Thick() {
    // pump cannot run dry without providers
    if (this.Providers === 0) super.Stop()
    super.Thick()
    if (!this.isRunning) {
      this.Output = 0
      return
    }
    this.Output = this.Providers > this.RatedFor ? this.RatedFor : this.Providers
  }
}
