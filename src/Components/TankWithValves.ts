import Valve, { iValve } from './Valve'
import Tank from './Tank'
import { CstChanges } from '../Cst'
import Item from './Item'

export default class TankWithValves implements Item {
  Name: string
  IntakeValve: Valve
  OutletValve: Valve
  DrainValve: Valve
  Tank: Tank


  constructor(tankName: string, volume: number, startContent: number, sourceValve: iValve) {
    this.Name = tankName
    this.IntakeValve = new Valve(`${tankName} - intake valve`, sourceValve)
    this.Tank = new Tank(tankName, volume, startContent)
    this.OutletValve = new Valve(`${tankName} - outlet valve`, this.Tank)
    this.DrainValve = new Valve(`${tankName} - drain valve`, this.Tank, CstChanges.DrainStep)
  }


  get Content() { return this.Tank.Content }

  Thick() {
    this.Tank.AddEachStep = this.IntakeValve.Content
    this.Tank.RemoveEachStep += this.DrainValve.Content
    this.Tank.Thick()
  }
}
