import { makeAutoObservable } from 'mobx'
import { CstPowerSys } from '../Constants/Cst'
import Item from './Item'

export interface PowerBusInterface extends Item {
  Voltage: number
  Providers: number
}

export default class PowerBus implements PowerBusInterface {
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
