/* istanbul ignore file */

import { iCooler } from '../../Components/Cooler'

export default class mockCooler implements iCooler {

  Name: string
  HotCircuitComplete: boolean
  CoolCircuitComplete: boolean

  constructor(name: string) {
    this.Name = name
    this.HotCircuitComplete = false
    this.CoolCircuitComplete = false

  }
  get IsCooling() { return this.HotCircuitComplete && this.CoolCircuitComplete }
  Thick() { }
  get Content() { return this.IsCooling ? 1 : 0 }
}