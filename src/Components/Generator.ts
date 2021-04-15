import { makeObservable, observable, action } from 'mobx'
import Item from './Item'
import Tank, { iTank } from './Tank'

export default class Generator implements Item {
  Name: string
  RatedFor: number
  isRunning: boolean
  Output: number
  HasFuel: boolean
  HasCooling: boolean
  HasLubrication: boolean
  FuelProvider: iTank
  FuelConsumption: number


  constructor(Name: string, Rate: number, fuelProvider: iTank) {
    this.Name = Name
    this.RatedFor = Rate
    this.isRunning = false
    this.Output = 0

    this.HasFuel = false
    this.HasCooling = false
    this.HasLubrication = false

    this.FuelProvider = fuelProvider
    this.FuelConsumption = 0

    makeObservable(this, {
      isRunning: observable,
      Output: observable,
      HasFuel: observable,
      HasCooling: observable,
      HasLubrication: observable,
      Start: action,
      Stop: action,
      Thick: action,
      Toggle: action
    })
  }
  get Content() { return this.Output }
  TestRunning() {
    // not running, keep stopped
    if (!this.isRunning) return false

    const prerequisites = this.HasCooling && this.HasFuel && this.HasLubrication
    // already running and  prerequisites are still ok --> continue running
    if (prerequisites) return true

    // prerequisites aren't met any more --> Stop
    this.Stop()
    return false
  }

  Start() {
    this.isRunning = true
  }

  Stop() {
    this.isRunning = false
  }

  Toggle() {
    if (this.isRunning) this.Stop()
    else this.Start()
  }

  Thick() {
    this.isRunning = this.TestRunning()
    if (this.isRunning) this.FuelProvider.RemoveThisStep += this.FuelConsumption

    this.Output = this.isRunning ? this.RatedFor : 0
  }
}
