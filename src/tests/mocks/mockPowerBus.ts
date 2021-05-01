/* istanbul ignore file */

import { PowerBusInterface } from '../../Components/PowerBus'

export default class MockPowerBus implements PowerBusInterface {
  Name: string

  Voltage: number

  Providers: number

  constructor(name: string) {
    this.Name = name
    this.Voltage = 0
    this.Providers = 0
  }

  get Content() { return this.Voltage }

  Thick = () => { }
}
