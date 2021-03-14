import { makeAutoObservable } from 'mobx'
import Item from './Item'

export interface iCooler extends Item {
  Name: string
  isCooling: boolean
  hasCooling: boolean
  CoolingInputRate: number
  CoolingProviders: number
  CoolingCircuitComplete: boolean
  HotCircuitComplete: boolean
  CheckCoolingRate: boolean
}

export default class Cooler implements iCooler {
  Name: string
  isCooling: boolean
  hasCooling: boolean
  CoolingInputRate: number
  CoolingProviders: number
  CoolingCircuitComplete: boolean
  HotCircuitComplete: boolean

  constructor(name: string, coolingInputRate: number) {
    this.Name = name
    this.isCooling = false // isCooling && hot circuit is ok
    this.hasCooling = false // cooling circuit & rate is ok

    this.CoolingInputRate = coolingInputRate
    this.CoolingProviders = 0

    this.CoolingCircuitComplete = false
    this.HotCircuitComplete = false

    makeAutoObservable(this)
  }

  get Content() { return this.isCooling ? 1 : 0 }

  get CheckCoolingRate() {
    return this.CoolingProviders >= this.CoolingInputRate
  }

  Thick() {
    this.hasCooling = this.CheckCoolingRate && this.CoolingCircuitComplete
    this.isCooling = this.hasCooling && this.HotCircuitComplete
  }
}
