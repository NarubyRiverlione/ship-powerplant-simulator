import Valve, { ValveInterface } from './Valve'
import Tank from './Tank'
import { CstChanges } from '../Cst'
import Item from './Item'

export default class TankWithValves implements Item {
  readonly Name: string
  IntakeValve: Valve
  OutletValve: Valve
  DrainValve: Valve
  Tank: Tank

  constructor(tankName: string, volume: number, startContent: number, sourceValve: ValveInterface) {
    this.Name = tankName
    this.IntakeValve = new Valve(`${tankName} - intake valve`, sourceValve)
    this.Tank = new Tank(tankName, volume, startContent)
    this.OutletValve = new Valve(`${tankName} - outlet valve`, this.Tank)
    this.DrainValve = new Valve(`${tankName} - drain valve`, this.Tank,
      // how many step it takes to drain a tank (drain valve volume = tankvolume / drainratio)
      this.Tank.Volume / CstChanges.DrainRatio)
  }

  get Content() { return this.Tank.Content }

  Thick() {
    this.Tank.AddThisStep = this.IntakeValve.Content
    this.Tank.RemoveThisStep += this.DrainValve.Content
    this.Tank.Thick()
  }
}
