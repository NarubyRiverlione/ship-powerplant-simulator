import Item from './Item'
import Tank from "./Tank"
import { action, computed, makeObservable, observable } from 'mobx'


export interface iValve extends Item {
  isOpen: boolean
  Name: string
  Source: Item
  cbNowOpen: () => void
  cbNowClosed: () => void
}

export default class Valve implements iValve {
  isOpen: boolean
  Name: string
  Source: Item
  cbNowOpen: () => void
  cbNowClosed: () => void

  constructor(name: string, source: Item) {
    this.isOpen = false
    this.cbNowOpen = () => { }
    this.cbNowClosed = () => { }
    this.Source = source
    this.Name = name
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

  Open() {
    this.isOpen = true
    this.cbNowOpen()
  }

  Close() {
    this.isOpen = false
    this.cbNowClosed()
  }

  get Content() {
    return this.isOpen ? this.Source.Content : 0
  }
  Thick() {

  }
  Toggle() {
    if (this.isOpen) this.Close()
    else this.Open()
  }
}
