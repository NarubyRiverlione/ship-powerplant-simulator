import { makeObservable, observable, action, computed } from 'mobx'
import Item from "./Item"
import PowerBus from './PowerBus'

export default class Appliance implements Item {
  Name: string
  isRunning: boolean
  Bus: PowerBus

  constructor(name: string, bus: PowerBus) {
    this.Name = name
    this.isRunning = false
    this.Bus = bus
    makeObservable(this, {
      isRunning: observable,
      CheckPower: computed,
      Start: action,
      Stop: action,
      Thick: action
    })
  }
  get Content() { return 0 }

  get CheckPower() {
    return this.Bus.Voltage !== 0
  }

  Start() {
    if (this.CheckPower) this.isRunning = true
  }

  Stop() {
    this.isRunning = false
  }

  Thick() {
    this.isRunning = this.isRunning && this.CheckPower
  }

  Toggle() {
    if (this.isRunning) this.Stop()
    else this.Start()
  }
}
