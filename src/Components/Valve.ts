import Item from './Item'
import { action, computed, makeObservable, observable } from 'mobx'


export interface iValve extends Item {
  Name: string
  Source: Item
  Volume: number
  isOpen: boolean
  Open: () => void
  Close: () => void
}

export default class Valve implements iValve {
  Name: string
  Source: Item
  Volume: number
  isOpen: boolean
  cbNowOpen: () => void
  cbNowClosed: () => void

  constructor(name: string, source: Item, volume?: number) {
    this.Name = name
    this.Source = source
    this.Volume = volume ?? Number.MAX_SAFE_INTEGER
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
    if (!this.isOpen) return 0
    return this.Source.Content >= this.Volume ? this.Volume : this.Source.Content
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
