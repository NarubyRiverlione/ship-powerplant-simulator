import { makeObservable, computed, observable } from 'mobx'
import Item from './Item'
import { TankInterface } from './Tank'
import Valve from './Valve'

export default class MultiInputs extends Valve {
  Inputs: Array<Item>

  constructor(name: string, sourceTank: TankInterface) {
    super(name, sourceTank)
    this.Inputs = []
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
