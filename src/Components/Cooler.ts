import { computed, makeAutoObservable } from 'mobx'
import Item from './Item'

export interface CoolerInterface extends Item {
  Name: string
  HotCircuitComplete: boolean
  CoolCircuitComplete: boolean
}

export default class Cooler implements CoolerInterface {
  Name: string
  HotCircuitComplete: boolean
  CoolCircuitComplete: boolean

  constructor(name: string) {
    this.Name = name
    this.HotCircuitComplete = false
    this.CoolCircuitComplete = false

    makeAutoObservable(this, {
      IsCooling: computed,
    })
  }

  get IsCooling() { return this.HotCircuitComplete && this.CoolCircuitComplete }

  get Content() { return this.IsCooling ? 1 : 0 }
}
