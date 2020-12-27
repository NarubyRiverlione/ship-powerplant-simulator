const { makeAutoObservable } = require('mobx')

module.exports = class Valve {
  constructor(name) {
    this.isOpen = false
    this.cbNowOpen = null
    this.cbNowClosed = null
    this.Source = null
    // this.Target = null
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

  Content() {
    const input = this.Source ? this.Source.Content() : null
    return this.isOpen ? input : 0
  }

  Toggle() {
    if (this.isOpen) this.Close()
    else this.Open()
  }
}
