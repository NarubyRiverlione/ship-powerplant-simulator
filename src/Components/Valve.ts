import Item from './Item'
import Tank from "./Tank"
import { makeAutoObservable } from 'mobx'
import Compressor from "./Compressor"


export interface iValve extends Item {
  isOpen: boolean
  Name: string
  Source: Item
  cbNowOpen?: () => void
  cbNowClosed?: () => void
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
    makeAutoObservable(this)
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
