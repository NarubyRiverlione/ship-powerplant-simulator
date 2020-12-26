const Valve = require('./Valve')
const Tank = require('./Tank')

module.exports = class TankWithValves {
  constructor(tankName, volume, startContent, sourceValve) {
    this.IntakeValve = new Valve(`${tankName} - intake valve`)
    this.IntakeValve.Source = sourceValve

    this.Tank = new Tank(tankName, volume, startContent)

    this.OutletValve = new Valve(`${tankName} - outlet valve`)
    this.OutletValve.Source = this.Tank

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
  }
}
