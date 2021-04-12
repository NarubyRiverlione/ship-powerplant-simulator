import { makeObservable, observable, action, computed } from 'mobx'
import Item from "./Item"
import PowerBus from './PowerBus'

export default class Appliance implements Item {
  Name: string
  Bus: PowerBus
  isRunning: boolean
  Output: number

  constructor(name: string, bus: PowerBus) {
    this.Name = name
    this.Bus = bus
    this.isRunning = false
    this.Output = 0.0

    // this is a super class, makeAutoObservable doesn't work here
    makeObservable(this, {
      isRunning: observable,
      CheckPower: computed,
      Start: action,
      Stop: action,
      Thick: action
    })
  }

  get Content() { return this.Output }
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
