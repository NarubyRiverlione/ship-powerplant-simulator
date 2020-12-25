const { makeAutoObservable } = require('mobx')
// const { CstChanges } = require('../Cst')
module.exports = class Tank {
  constructor(Name, Max, StartContent = 0) {
    this.Name = Name
    this.Inside = StartContent
    this.MaxContent = Max

    // flags are needed to remember when tank is full/empty that
    // was filling/removing to resume after tank is no longer full/empty
    this.Adding = false
    this.Removing = false

    this.AddEachStep = 0
    this.RemoveEachStep = 0

    this.cbFull = null
    this.cbAdded = null
    this.cbRemoved = null
    makeAutoObservable(this)
  }

  Content() {
    return this.Inside
  }

  Add() {
    if (this.Inside === this.MaxContent) {
      // already full, prevent calling cbFull multiple times
      return
    }
    if (this.AddEachStep + this.Inside < this.MaxContent) {
      this.Inside += this.AddEachStep
      if (this.cbAdded) this.cbAdded(this.AddEachStep)
    } else {
      // prevent overfill
      this.Inside = this.MaxContent
      if (this.cbFull) this.cbFull()
    }
  }

  Remove() {
    if (this.Inside - this.RemoveEachStep > 0) {
      this.Inside -= this.RemoveEachStep
      if (this.cbRemoved) this.cbRemoved(this.RemoveEachStep)
    } else { this.Inside = 0 }
  }

  Thick() {
    if (this.Adding) this.Add()
    if (this.Removing) this.Remove()
    if (this.RemoveEachStep < 0) {
      console.warn(`Tank:${this.name} had a negative RemoveEachStep `)
      this.RemoveEachStep = 0
      debugger
    }
    if (this.AddEachStep < 0) {
      console.warn(`Tank:${this.name} had a negative AddEachStep `)
      this.AddEachStep = 0
      debugger
    }
    if (this.Inside === undefined || !Number.isInteger(this.Inside)) {
      console.warn(`Tank ${this.name} contents is not a number`)
      debugger
    }
  }
}
