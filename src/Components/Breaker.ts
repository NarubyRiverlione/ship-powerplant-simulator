import { makeAutoObservable } from 'mobx'
import { Item } from "./Item"

export default class Breaker implements Item {
  Name: string
  isOpen: boolean
  RatedFor: number
  Load: number
  Providers: number

  constructor(name: string) {
    this.Name = name
    this.isOpen = true
    this.RatedFor = 0
    this.Load = 0
    this.Providers = 0
    makeAutoObservable(this)
  }
  get Content() { return this.Load }
  // Load > RatedFor
  TestLoad() {
    if (this.Load > this.RatedFor) { this.isOpen = true }
  }

  // Load > Providers
  TestTripped() {
    if (this.Load > this.Providers) { this.isOpen = true }
  }

  Thick() {
    this.TestLoad()
    this.TestTripped()
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
}
