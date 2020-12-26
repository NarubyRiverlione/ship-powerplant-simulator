const { makeObservable, action } = require('mobx')
const TankWithValves = require('../Components/TankWithValves')
const Valve = require('../Components/Valve')
const { CstTxt, CstAirSys } = require('../Cst')

const { AirSysTxt } = CstTxt

module.exports = class AirSys {
  constructor() {
    makeObservable(this, { Thick: action })

    this.Compressor1OutletValve = new Valve()
    this.Receiver1 = new TankWithValves(AirSysTxt.AirReceiver1,
      CstAirSys.AirReceiver1.Volume, 0, this.Compressor1OutletValve)

    this.EmergencyOutletValve = new Valve()
    this.EmergencyReceiver = new TankWithValves(AirSysTxt.EmergencyReceiver,
      CstAirSys.EmergencyCompress.Volume, 0, this.EmergencyOutletValve)
  }

  Thick() {
    this.EmergencyReceiver.Tank.Thick()
  }
}
