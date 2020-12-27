const { makeAutoObservable } = require('mobx')

module.exports = class Tank {
  constructor(Name, Volume, StartContent = 0.0) {
    this.Name = Name
    this.Inside = StartContent
    this.Volume = Volume

    // flags are needed to remember when tank is full/empty that
    // was filling/removing to resume after tank is no longer full/empty
    this.Adding = false
    this.Removing = false

    this.AddEachStep = 0.0
    this.RemoveEachStep = 0.0

    this.cbFull = null
    this.cbAdded = null
    this.cbRemoved = null
    makeAutoObservable(this)
  }

  Content() {
    return this.Inside
  }

  Add() {
    if (this.Inside === this.Volume) {
      // already full, prevent calling cbFull multiple times
      return
    }
    if (this.AddEachStep + this.Inside < this.Volume) {
      this.Inside += this.AddEachStep
      if (this.cbAdded) this.cbAdded(this.AddEachStep)
    } else {
      // prevent overfill
      this.Inside = this.Volume
      if (this.cbFull) this.cbFull()
    }
  }

  Remove() {
    if (this.Inside - this.RemoveEachStep > 0) {
      this.Inside -= this.RemoveEachStep
      if (this.cbRemoved) this.cbRemoved(this.RemoveEachStep)
    } else { this.Inside = 0.0 }
  }

  Thick() {
    if (this.Adding) this.Add()
    if (this.Removing) this.Remove()
    /* istanbul ignore if  */
    if (this.RemoveEachStep < 0) {
      console.warn(`Tank:${this.Name} had a negative RemoveEachStep `)
      this.RemoveEachStep = 0
    }
    /* istanbul ignore if  */
    if (this.AddEachStep < 0) {
      console.warn(`Tank:${this.Name} had a negative AddEachStep `)
      this.AddEachStep = 0
    }
    /* istanbul ignore if  */
    if (this.Inside === undefined || Number.isNaN(this.Inside)) {
      console.warn(`Tank ${this.Name} contents is not a number: ${this.Inside}`)
    }
  }
}
