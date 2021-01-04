const { makeAutoObservable } = require('mobx')
const TankWithValves = require('../Components/TankWithValves')
const Valve = require('../Components/Valve')
const Compressor = require('../Components/Compressor')
const { CstAirSys } = require('../Cst')
const CstTxt = require('../CstTxt')
const { AirSysTxt } = CstTxt
/*
Start air compressor 1 - outlet valve  ------ (intake valve) Start air receiver 1 (outlet valve)
                                                              (drain)

Emergency compressor - outlet valve  ------ (intake valve) Emergence receiver (outlet valve)
                                                              (drain)
*/

module.exports = class AirSys {
  constructor(mainBus, emergencyBus) {
    // #region  Compressor 1
    this.StartAirCompressor1 = new Compressor(AirSysTxt.Compressor1,
      mainBus, CstAirSys.StartAirCompressor1.AddStep)

    this.StartCompressor1OutletValve = new Valve()
    this.StartCompressor1OutletValve.Source = this.StartAirCompressor1
    this.StartCompressor1OutletValve.cbNowOpen = () => {
      if (this.StartAirReceiver1.IntakeValve.isOpen) {
        this.StartAirReceiver1.Tank.Adding = true
      }
    }
    this.StartCompressor1OutletValve.cbNowClosed = () => {
      this.StartAirReceiver1.Tank.Adding = false
    }

    this.StartAirReceiver1 = new TankWithValves(AirSysTxt.StartAirReceiver1,
      CstAirSys.StartAirReceiver1.TankPressure, 0,
      this.StartCompressor1OutletValve)

    this.StartAirReceiver1.Tank.AddEachStep = CstAirSys.StartAirCompressor1.AddStep
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
    this.EmergencyOutletValve.cbNowClosed = () => {
      this.EmergencyReceiver.Tank.Adding = false
    }

    this.EmergencyReceiver = new TankWithValves(AirSysTxt.EmergencyReceiver,
      CstAirSys.EmergencyReceiver.TankPressure, 0,
      this.EmergencyOutletValve)

    // #endregion
    this.EmergencyReceiver.Tank.AddEachStep = CstAirSys.EmergencyCompressor.AddStep

    makeAutoObservable(this)
  }

  Thick() {
    this.StartAirCompressor1.Thick()
    this.StartAirReceiver1.Thick()

    this.EmergencyCompressor.Thick()
    this.EmergencyReceiver.Thick()
  }
}
