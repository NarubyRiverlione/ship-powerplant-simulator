/* istanbul ignore file */

import { ValveInterface } from '../../Components/Valve'
import Item from '../../Components/Item'
import MockTank from './MockTank'

export default class MockValve implements ValveInterface {
  isOpen: boolean
  Name: string
  Source: Item
  Volume: number

  constructor(name: string, source: MockValve | MockTank, volume?: number) {
    this.isOpen = true // mock valve is default open !
    this.Volume = volume ?? Number.MAX_SAFE_INTEGER
    this.Source = source
    this.Name = name
  }

  get Content() {
    if (!this.isOpen) return 0
    return this.Source.Content >= this.Volume ? this.Volume : this.Source.Content
  }

  Open() { this.isOpen = true }

  Close() { this.isOpen = false }

  Toggle() { this.isOpen = !this.isOpen }
}
