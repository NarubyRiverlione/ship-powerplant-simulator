/* istanbul ignore file */

import { iCooler } from '../../Components/Cooler'

export default class mockCooler implements iCooler {

  Name: string
  isCooling: boolean
  hasCooling: boolean
  CoolingInputRate: number
  CoolingProviders: number
  CoolingCircuitComplete: boolean
  HotCircuitComplete: boolean

  constructor(name: string, coolingInputRate: number) {
    this.Name = name
    this.isCooling = true  // mock cooler : cooling circuit & rate is ok
    this.hasCooling = false // isCooling && hot circuit is ok
    this.CoolingInputRate = coolingInputRate
    this.CoolingProviders = 0

    this.CoolingCircuitComplete = false
    this.HotCircuitComplete = false

  }
  Thick() { }
  get Content() { return this.isCooling ? 1 : 0 }

  get CheckCoolingRate() {
    return this.CoolingProviders >= this.CoolingInputRate
  }
}