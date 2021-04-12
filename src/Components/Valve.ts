import Item from './Item'
import { action, computed, makeObservable, observable } from 'mobx'


export interface iValve extends Item {
  Name: string
  Source: Item
  isOpen: boolean
  cbNowOpen: () => void
  cbNowClosed: () => void
}

export default class Valve implements iValve {
  Name: string
  Source: Item
  isOpen: boolean
  cbNowOpen: () => void
  cbNowClosed: () => void

  constructor(name: string, source: Item) {
    this.Name = name
    this.Source = source
    this.isOpen = false
    this.cbNowOpen = () => { }
    this.cbNowClosed = () => { }

    makeObservable(this, {
      isOpen: observable,
      Source: observable,
      Open: action,
      Close: action,
      Content: computed,
      Toggle: action,
      Thick: action
    })
  }


  get Content() {
    return this.isOpen ? this.Source.Content : 0
  }

  Open() {
    this.isOpen = true
    this.cbNowOpen()
  }
  Close() {
    this.isOpen = false
    this.cbNowClosed()
  }

  Toggle() {
    if (this.isOpen) this.Close()
    else this.Open()
  }

  Thick() { }
}
