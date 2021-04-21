import { makeAutoObservable } from 'mobx'
import Item from "./Item"

export default class Breaker implements Item {
  readonly Name: string
  isOpen: boolean
  readonly RatedFor: number
  Load: number
  Providers: number


  constructor(name: string, rated?: number) {
    this.Name = name
    this.isOpen = true
    this.RatedFor = rated || 0
    this.Load = 0
    this.Providers = 0
    makeAutoObservable(this)
  }

  get Content() { return this.isOpen ? 0 : this.Providers }
  // Load > RatedFor
  TestLoad() {
    if (this.Load > this.RatedFor) { this.isOpen = true }
  }
  // Load > Providers
  TestTripped() {
    if (this.Load > this.Providers) { this.isOpen = true }
  }
  Open() {
    this.isOpen = true
  }
  Close() {
    this.isOpen = false
    this.TestLoad()
  }

  Toggle() {
    if (this.isOpen) this.Close()
    else this.Open()
  }

  Thick() {
    this.TestLoad()
    this.TestTripped()
  }
}
