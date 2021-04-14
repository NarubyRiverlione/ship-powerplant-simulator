/* istanbul ignore file */

import { iValve } from '../../../src/Components/Valve'
import Item from '../../../src/Components/Item'
import mockTank from './mockTank'

export default class mockValve implements iValve {
  isOpen: boolean
  Name: string
  Source: Item
  Volume: number
  cbNowOpen: () => void
  cbNowClosed: () => void

  constructor(name: string, source: mockValve | mockTank, volume?: number) {
    this.isOpen = true // mock valve is default open !
    this.Volume = volume ?? Number.MAX_SAFE_INTEGER
    this.cbNowOpen = () => { }
    this.cbNowClosed = () => { }
    this.Source = source
    this.Name = name

  }

  get Content() {
    if (!this.isOpen) return 0
    return this.Source.Content >= this.Volume ? this.Volume : this.Source.Content
  }
  Thick() { }
  Open() { this.isOpen = true }
  Close() { this.isOpen = false }
  Toggle() { this.isOpen = !this.isOpen }
}