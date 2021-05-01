import {
  makeObservable, observable, action, computed,
} from 'mobx'
import Item from '../Item'
import PowerBus from '../PowerBus'

export default class Appliance implements Item {
  readonly Name: string
  Bus: PowerBus
  isRunning: boolean
  readonly RatedFor: number
  Output: number

  constructor(name: string, bus: PowerBus, rate: number) {
    this.Name = name
    this.Bus = bus
    this.RatedFor = rate
    this.isRunning = false
    this.Output = 0.0

    // this is a super class, makeAutoObservable doesn't work here
    makeObservable(this, {
      isRunning: observable,
      Output: observable,
      CheckPower: computed,
      Start: action,
      Stop: action,
      Thick: action,
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
    // cannot run without power
    this.isRunning = this.isRunning && this.CheckPower
    this.Output = this.isRunning ? this.RatedFor : 0.0
  }

  Toggle() {
    if (this.isRunning) this.Stop()
    else this.Start()
  }
}
