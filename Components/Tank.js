const { makeAutoObservable } = require('mobx')
// const { CstChanges } = require('../Cst')
module.exports = class Tank {
  constructor(Name, Max, StartContent = 0) {
    this.Name = Name
    this.Inside = StartContent
    this.MaxContent = Max

    this.Adding = false
    this.AddEachStep = 0
    this.Removing = false
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
    if (this.AddEachStep + this.Inside < this.MaxContent) {
      this.Inside += this.AddEachStep
    } else {
      // prevent overfill
      this.Inside = this.MaxContent
      if (this.cbFull) this.cbFull()
    }
    if (this.cbAdded) this.cbAdded()
  }

  Remove() {
    if (this.Inside - this.RemoveEachStep > 0) {
      this.Inside -= this.RemoveEachStep
    } else { this.Inside = 0 }
    if (this.cbRemoved) this.cbRemoved()
  }

  Thick() {
    if (this.Adding) this.Add()
    if (this.Removing) this.Remove()
  }

  /*
  StartAdding(cbAdded) {
    this.Adding = setInterval(() => {
      this.Add()
      if (cbAdded) cbAdded()
    }, CstChanges.TankInterval)
  }

  StopAdding() {
    if (this.Adding) {
      clearInterval(this.Adding)
      this.Adding = null
    }
  }

  StartRemoving(cbRemoved) {
    this.Removing = setInterval(() => {
      this.Remove()
      if (cbRemoved) cbRemoved()
    }, CstChanges.TankInterval)
  }

  StopRemoving() {
    if (this.Removing) {
      clearInterval(this.Removing)
      this.Removing = null
    }
  }
}
*/
}
