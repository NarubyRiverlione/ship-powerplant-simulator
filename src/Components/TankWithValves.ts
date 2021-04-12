import Valve from './Valve'
import Tank from './Tank'
import { CstChanges } from '../Cst'
import Item from './Item'

export default class TankWithValves implements Item {
  Name: string
  IntakeValve: Valve
  Tank: Tank
  OutletValve: Valve
  DrainValve: Valve
  DrainTarget?: Tank

  constructor(tankName: string, volume: number, startContent: number,
    sourceValve: Valve, drainTarget?: Tank) {
    this.Name = tankName
    this.IntakeValve = new Valve(`${tankName} - intake valve`, sourceValve)

    this.Tank = new Tank(tankName, volume, startContent)

    this.OutletValve = new Valve(`${tankName} - outlet valve`, this.Tank)

    this.DrainValve = new Valve(`${tankName} - drain valve`, this.Tank)
    this.DrainTarget = drainTarget
    //  Inlet valve and Source valve are open
    // --> filling = adding this tank, removing from source
    this.IntakeValve.cbNowOpen = () => {
      if (this.IntakeValve.Source.Content) {
        this.Tank.Adding = true
        const SourceTank = sourceValve.Source as Tank
        SourceTank.AmountRemovers += 1
      }
    }
    // inlet valve closed
    // --> stop filling ( doesn't mater if source valve is open )
    this.IntakeValve.cbNowClosed = () => {
      this.Tank.Adding = false
      const Source = sourceValve.Source as Tank
      if (Source.AmountRemovers > 0) Source.AmountRemovers -= 1
    }

    // Drain Valve
    this.DrainValve.cbNowOpen = () => {
      this.Tank.RemoveEachStep += CstChanges.DrainStep
      this.Tank.AmountRemovers += 1
      if (this.DrainTarget) {
        this.DrainTarget.AddEachStep = CstChanges.DrainStep
        this.DrainTarget.Adding = true
      }
    }
    this.DrainValve.cbNowClosed = () => {
      this.Tank.RemoveEachStep -= CstChanges.DrainStep
      this.Tank.AmountRemovers += 1
    }
  }


  get Content() { return this.Tank.Content }
  Thick() {
    this.Tank.Thick()
  }
}
