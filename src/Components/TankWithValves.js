const Valve = require('./Valve')
const Tank = require('./Tank')
const { CstChanges } = require('../Cst')

module.exports = class TankWithValves {
  constructor(tankName, volume, startContent, sourceValve, drainTarget) {
    this.IntakeValve = new Valve(`${tankName} - intake valve`)
    this.IntakeValve.Source = sourceValve

    this.Tank = new Tank(tankName, volume, startContent)

    this.OutletValve = new Valve(`${tankName} - outlet valve`)
    this.OutletValve.Source = this.Tank

    this.DrainValve = new Valve(`${tankName} - drain valve`)
    this.DrainValve.Source = this.Tank
    this.DrainTarget = drainTarget
    //  Inlet valve and Source valve are open
    // --> filling = adding this tank, removing from source
    this.IntakeValve.cbNowOpen = () => {
      if (sourceValve.isOpen) {
        this.Tank.Adding = true
        const { Source } = sourceValve
        Source.Removing = true
      }
    }
    // inlet valve closed
    // --> stop filling ( doesn't mater if source valve is open )
    this.IntakeValve.cbNowClosed = () => {
      this.Tank.Adding = false
      const { Source } = sourceValve
      Source.Removing = false
    }

    // Drain Valve
    this.DrainValve.cbNowOpen = () => {
      this.Tank.RemoveEachStep += CstChanges.DrainStep
      this.Tank.Removing = true
      if (this.DrainTarget) {
        this.DrainTarget.AddEachStep = CstChanges.DrainStep
        this.DrainTarget.Adding = true
      }
    }
    this.DrainValve.cbNowClosed = () => {
      this.Tank.RemoveEachStep -= CstChanges.DrainStep
      // only stop removing is outlet valve is also closed
      this.Tank.Removing = this.OutletValve.isOpen
    }
  }

  Thick() {
    this.Tank.Thick()
  }
}
