import Item from './Item'
import Tank from './Tank'
import { iValve } from './Valve'

export default class MultiInputs implements iValve {
  Name: string
  Inputs: Array<Item>
  isOpen: boolean
  Source: Item  // virtual tank to add all inputs
  cbNowOpen: () => void
  cbNowClosed: () => void

  constructor(name: string) {
    this.Name = name
    this.Inputs = new Array()
    this.isOpen = true
    this.Source = new Tank("virtual tank to add inputs", 100)
    this.cbNowOpen = () => { }
    this.cbNowClosed = () => { }
  }

  get AddInputs() { return this.Inputs.reduce((prev, item) => prev + item.Content, 0) }
  get Content() {
    return this.AddInputs
  }

  Thick() {
    // this.Source.Content = this.AddInputs
  }
  Open() { }
  Close() { }
  Toggle() { }
}