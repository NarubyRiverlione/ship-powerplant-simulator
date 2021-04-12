import { action, makeObservable } from 'mobx'
import Item from './Item'
import Tank from './Tank'
import Valve from './Valve'

export default class HandPump extends Tank {
  IsCranked: boolean
  SourceValve: Valve


  constructor(name: string, volume: number, sourceValve: Valve) {
    super(name, volume)
    this.IsCranked = false
    this.SourceValve = sourceValve

    makeObservable(this, {
      Crank: action
    })
  }

  Crank() {
    this.IsCranked = true
  }

  Thick() {
    if (this.IsCranked) {
      // add max volume of handpump
      this.AddEachStep = this.SourceValve.Content >= this.Volume ? this.Volume : this.SourceValve.Content
      this.Adding = true
      super.Thick()
      this.Adding = false
      // remove from source tank via source valve
      const sourceTank = this.SourceValve.Source as Tank
      sourceTank.Inside -= this.AddEachStep

      this.IsCranked = false
    }
    else {
      // clear content
      this.Inside = 0
      return
    }
  }
}

