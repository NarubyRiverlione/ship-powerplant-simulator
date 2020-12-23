const { makeAutoObservable } = require('mobx')
module.exports = class Valve {
  constructor(source = null) {
    this.isOpen = true
    this.cbNowOpen = null
    this.cbNowClosed = null
    this.Source = source
    this.Target = null
    this.Name = ''
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
    const input = this.Source ? this.Source.Content() : 0
    return this.isOpen ? 0 : input
  }

  Status() {
    return {
      status: this.isOpen,
      statusMessage: this.isOpen
        ? `${this.Name} is open`
        : `${this.Name} is closed`
    }
  }
}
