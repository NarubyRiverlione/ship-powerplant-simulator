module.exports = class Valve {
  constructor(source = null) {
    this.IsOpen = true
    this.cbNowOpen = null
    this.cbNowClosed = null
    this.Source = source
    this.Target = null
    this.Name = ''
  }

  Open() {
    this.IsOpen = true
    if (this.cbNowOpen) this.cbNowOpen()
  }

  Close() {
    this.IsOpen = false
    if (this.cbNowClosed) this.cbNowClosed()
  }

  Content() {
    const input = this.Source ? this.Source.Content() : 0
    return this.IsOpen ? 0 : input
  }

  Status() {
    return {
      status: this.IsOpen,
      statusMessage: this.IsOpen
        ? `${this.Name} is open`
        : `${this.Name} is closed`
    }
  }
}
