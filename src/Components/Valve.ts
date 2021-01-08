import { ControlItem } from "./Item"
import Tank from "./Tank"
import { makeAutoObservable } from 'mobx'
import Compressor from "./Compressor"

export default class Valve implements ControlItem {
  isOpen: boolean
  Name: string
  Source: Valve | Tank | Compressor
  cbNowOpen?: () => void
  cbNowClosed?: () => void

  constructor(name: string, source: Valve | Tank | Compressor) {
    this.isOpen = false
    this.cbNowOpen = () => { }
    this.cbNowClosed = () => { }
    this.Source = source
    this.Name = name
    makeAutoObservable(this)
  }

  Open() {
    this.isOpen = true
    if (this.cbNowOpen) this.cbNowOpen()
  }

  Close() {
    this.isOpen = false
    if (this.cbNowClosed) this.cbNowClosed()
  }

  get Content(): number {
    return this.isOpen ? this.Source.Content : 0
  }
  Thick() {

  }
  Toggle() {
    if (this.isOpen) this.Close()
    else this.Open()
  }
}
