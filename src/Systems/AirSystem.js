const { makeAutoObservable } = require('mobx')
const TankWithValves = require('../Components/TankWithValves')
const Valve = require('../Components/Valve')
const Compressor = require('../Components/Compressor')
const { CstTxt, CstAirSys } = require('../Cst')

const { AirSysTxt } = CstTxt

module.exports = class AirSys {
  constructor(mainBus, emergencyBus) {
    // #region  Compressor 1
    // this.Compressor1 = new Compressor(AirSysTxt.Compressor1,
    //   mainBus, CstAirSys.Compressor1.AddStep)

    // this.Compressor1OutletValve = new Valve()
    // this.Compressor1OutletValve.Source = this.Compressor1

    // this.Receiver1 = new TankWithValves(AirSysTxt.AirReceiver1,
    //   CstAirSys.StartAirReceiver1.TankPressure, 0, this.Compressor1OutletValve)
    // #endregion

    // #region Emergency compressor
    this.EmergencyCompressor = new Compressor(AirSysTxt.EmergencyCompressor,
      emergencyBus, CstAirSys.EmergencyCompressor.AddStep)

    this.EmergencyOutletValve = new Valve()
    this.EmergencyOutletValve.Source = this.EmergencyCompressor
    this.EmergencyOutletValve.cbNowOpen = () => {
      if (this.EmergencyReceiver.IntakeValve.isOpen) {
        this.EmergencyReceiver.Tank.Adding = true
      }
    }

    this.EmergencyReceiver = new TankWithValves(AirSysTxt.EmergencyReceiver,
      CstAirSys.EmergencyReceiver.TankPressure, 0,
      this.EmergencyOutletValve)

    this.EmergencyReceiver.Tank.AddEachStep = CstAirSys.EmergencyCompressor.AddStep
    // #endregion
    makeAutoObservable(this)
  }

  Thick() {
    this.EmergencyCompressor.Thick()
    this.EmergencyReceiver.Thick()
  }
}
