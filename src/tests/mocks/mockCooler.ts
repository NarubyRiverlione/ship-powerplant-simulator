/* istanbul ignore file */

import { CoolerInterface } from '../../Components/Cooler'

export default class MockCooler implements CoolerInterface {
  Name: string

  HotCircuitComplete: boolean

  CoolCircuitComplete: boolean

  constructor(name: string) {
    this.Name = name
    this.HotCircuitComplete = false
    this.CoolCircuitComplete = false
  }

  get IsCooling() { return this.HotCircuitComplete && this.CoolCircuitComplete }

  get Content() { return this.IsCooling ? 1 : 0 }
}
