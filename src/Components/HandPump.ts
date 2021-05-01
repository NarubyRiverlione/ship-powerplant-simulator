import { action, makeObservable } from 'mobx'
import Tank from './Tank'
import { ValveInterface } from './Valve'

export default class HandPump extends Tank {
  isCranked: boolean
  SourceValve: ValveInterface

  constructor(name: string, volume: number, sourceValve: ValveInterface) {
    super(name, volume)
    this.isCranked = false
    this.SourceValve = sourceValve

    makeObservable(this, {
      Crank: action,
    })
  }

  Crank() {
    this.isCranked = true
  }

  Thick() {
    if (this.isCranked) {
      // add max volume of handpump
      this.AddThisStep = this.SourceValve.Content >= this.Volume ? this.Volume : this.SourceValve.Content
      // this.Adding = true
      super.Thick()
      // this.Adding = false
      // remove from source tank via source valve
      const sourceTank = this.SourceValve.Source as Tank
      sourceTank.Inside -= this.AddThisStep

      this.isCranked = false
    } else {
      // clear content
      this.Inside = 0
    }
  }
}
