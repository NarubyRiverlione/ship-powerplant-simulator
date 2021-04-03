import { makeAutoObservable } from 'mobx'
import TankWithValves from '../Components/TankWithValves'
import Valve from '../Components/Valve'
import PowerBus from '../Components/PowerBus'
import Compressor from '../Components/Compressor'

import { CstAirSys } from '../Cst'
import CstTxt from '../CstTxt'
import Cooler from '../Components/Cooler'
const { AirSysTxt } = CstTxt
/*
Start air compressor 1 - outlet valve  --- FW air compress cooler --- (intake valve) Start air receiver 1 (outlet valve)
                                                                                        | (drain)

Emergency compressor - outlet valve  ------ (intake valve) Emergence receiver (outlet valve)
       | safety                                                    | (drain)
*/

export default class AirSystem {
  StartAirCompressor: Compressor
  StartAirCooler: Cooler
  StartAirReceiver: TankWithValves
  EmergencyCompressor: Compressor
  EmergencyReceiver: TankWithValves

  constructor(
    _startAirCooler: Cooler,
    mainBus = new PowerBus('dummy mainBus'),
    emergencyBus = new PowerBus('dummy emergency power bus')) {

    // #region  Compressor 1
    this.StartAirCompressor = new Compressor(AirSysTxt.Compressor1,
      mainBus, CstAirSys.StartAirCompressor1.AddStep)

    this.StartAirCompressor.OutletValve.cbNowOpen = () => {
      if (this.StartAirReceiver.IntakeValve.isOpen) {
        this.StartAirReceiver.Tank.Adding = true
      }
    }
    this.StartAirCompressor.OutletValve.cbNowClosed = () => {
      this.StartAirReceiver.Tank.Adding = false
    }

    this.StartAirCooler = _startAirCooler

    this.StartAirReceiver = new TankWithValves(AirSysTxt.StartAirReceiver1,
      CstAirSys.StartAirReceiver1.TankPressure, 0,
      this.StartAirCompressor.OutletValve)

    this.StartAirReceiver.Tank.AddEachStep = CstAirSys.StartAirCompressor1.AddStep
    // #endregion

    // #region Emergency compressor
    this.EmergencyCompressor = new Compressor(AirSysTxt.EmergencyCompressor,
      emergencyBus, CstAirSys.EmergencyCompressor.AddStep)

    this.EmergencyCompressor.OutletValve.cbNowOpen = () => {
      if (this.EmergencyReceiver.IntakeValve.isOpen) {
        this.EmergencyReceiver.Tank.Adding = true
      }
    }
    this.EmergencyCompressor.OutletValve.cbNowClosed = () => {
      this.EmergencyReceiver.Tank.Adding = false
    }

    this.EmergencyReceiver = new TankWithValves(AirSysTxt.EmergencyReceiver,
      CstAirSys.EmergencyReceiver.TankPressure, 0,
      this.EmergencyCompressor.OutletValve)

    // #endregion
    this.EmergencyReceiver.Tank.AddEachStep = CstAirSys.EmergencyCompressor.AddStep

    makeAutoObservable(this)
  }

  Thick() {
    // start air compressor running with valves closed = has no receiver -> open safety
    this.StartAirCompressor.HasReceiver = this.StartAirCompressor.OutletValve.isOpen && this.StartAirReceiver.IntakeValve.isOpen
    // start air compress cannot run without cooling
    if (!this.StartAirCooler.isCooling && this.StartAirCompressor.isRunning) this.StartAirCompressor.Stop()

    this.StartAirCompressor.Thick()
    this.StartAirReceiver.Thick()
    this.StartAirCompressor.OutletValve.Source = this.StartAirCompressor

    // emergency compressor running with valves closed = has no receiver -> open safety
    // todo also look at emergencyReceiver is full
    this.EmergencyCompressor.HasReceiver = this.EmergencyCompressor.OutletValve.isOpen && this.EmergencyReceiver.IntakeValve.isOpen

    this.EmergencyCompressor.Thick()
    this.EmergencyReceiver.Thick()
    // this.EmergencyCompressor.OutletValve.Source = this.EmergencyCompressor


  }
}
