import Valve, { ValveInterface } from './Valve'
import Tank from './Tank'
import { CstChanges } from '../Constants/Cst'
import Item from './Item'
import RandomChange from '../RandomChange'

export default class TankWithValves implements Item {
  readonly Name: string
  IntakeValve: Valve
  OutletValve: Valve
  DrainValve: Valve
  Tank: Tank
  RandomizeChange: boolean

  constructor(tankName: string, volume: number, startContent: number, sourceValve: ValveInterface, randomize = false) {
    this.RandomizeChange = randomize
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
    this.Tank.AddThisStep = RandomChange(this.RandomizeChange, this.IntakeValve.Content, this.IntakeValve.Content / 2)
    this.Tank.RemoveThisStep += RandomChange(this.RandomizeChange, this.DrainValve.Content, this.DrainValve.Content / 2)
    this.Tank.Thick()
  }
}
