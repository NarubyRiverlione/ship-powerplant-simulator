/* istanbul ignore file */

import { iValve } from '../../../src/Components/Valve'
import Item from '../../../src/Components/Item'
import mockTank from './mockTank'

export default class mockValve implements iValve {
  isOpen: boolean
  Name: string
  Source: Item
  cbNowOpen: () => void
  cbNowClosed: () => void

  constructor(name: string, source: mockValve | mockTank) {
    this.isOpen = true // mock valve is default open !
    this.cbNowOpen = () => { }
    this.cbNowClosed = () => { }
    this.Source = source
    this.Name = name

  }

  get Content() { return this.isOpen ? this.Source.Content : 0 }
  Thick() { }
  Open() { }  //this.isOpen = true
  Close() { this.isOpen = false }
  Toggle() { }
}