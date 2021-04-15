import { makeObservable, computed, observable } from 'mobx'
import Item from './Item'
import { iTank } from './Tank'
import Valve from './Valve'

export default class MultiInputs extends Valve {
  Inputs: Array<Item>

  constructor(name: string, sourceTank: iTank) {
    super(name, sourceTank)
    this.Inputs = new Array()
    this.Open()

    makeObservable(this, {
      Inputs: observable,
      AddInputs: computed,
    })
  }

  get AddInputs() {
    return this.Inputs.reduce((prev, item) => prev + item.Content, 0)
  }
  get Content() {
    return this.AddInputs
  }
}