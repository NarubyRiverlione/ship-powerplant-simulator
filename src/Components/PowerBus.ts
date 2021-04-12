import { CstPowerSys } from '../Cst'
import { makeAutoObservable } from 'mobx'
import Item from "./Item"

export interface iPowerBus extends Item {
  Voltage: number
  Providers: number
}

export default class PowerBus implements iPowerBus {
  Name: string
  Voltage: number
  Providers: number

  constructor(name: string) {
    this.Name = name
    this.Voltage = 0
    this.Providers = 0
    makeAutoObservable(this)
  }


  get Content() { return this.Voltage }

  Thick() {
    this.Voltage = this.Providers > 0
      ? CstPowerSys.Voltage
      : 0
  }
}
