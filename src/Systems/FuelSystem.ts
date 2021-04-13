import { makeAutoObservable } from 'mobx'
import Tank from '../Components/Tank'
import TankWithValves from '../Components/TankWithValves'
import Valve from '../Components/Valve'

import CstTxt from '../CstTxt'
import AlarmSystem from './AlarmSystem'
import { CstFuelSys, CstChanges } from '../Cst'
import { AlarmCode, AlarmLevel } from '../CstAlarms'
import HandPump from '../Components/HandPump'
import MultiInputs from '../Components/MultiToOne'
import PurificationUnit from '../Components/Appliances/PurificationUnit'
import PowerBus from '../Components/PowerBus'

const { FuelSysTxt } = CstTxt
/*
Shore Valve 
    |
(intake valve) DsStorage 
                |
               (outlet valve) |--> Handpump (todo) --> bypass valve --> |
                              |                                         | => (MultiToOne) ==> --> (intake valve) DsService (outlet valve)                                   
                              |-->-- Purification (WIP)           -->-- |
                                      
*/
export default class FuelSystem {
  DsShoreValve: Valve
  DsStorage: TankWithValves
  DsService: TankWithValves
  // DsHandpump: HandPump
  DsBypassValve: Valve
  DsServiceMulti: MultiInputs
  DsPurification: PurificationUnit

  constructor(alarmSys: AlarmSystem,
    // mainbus = new PowerBus('dummy powerbus'),
    // steamMainValve: Valve
  ) {
    // #region Intake valve from shore to diesel storage tank
    const dummyShore = new Tank('Shore as tank', CstFuelSys.ShoreVolume, CstFuelSys.ShoreVolume)
    this.DsShoreValve = new Valve(FuelSysTxt.DsShoreFillValve, dummyShore)
    // if both shore and storage intake valves are open --> filling
    this.DsShoreValve.cbNowOpen = () => {
      if (this.DsStorage.IntakeValve.isOpen) this.DsStorage.Tank.Adding = true
    }
    this.DsShoreValve.cbNowClosed = () => {
      this.DsStorage.Tank.Adding = false
    }
    // #endregion

    // #region Diesel storage tank,
    // filled from shore via the intake valve, outlet valve to service intake valve
    this.DsStorage = new TankWithValves(FuelSysTxt.DsStorageTank,
      CstFuelSys.DsStorageTank.TankVolume, 0, this.DsShoreValve)
    // fixed fill rate from shore
    this.DsStorage.Tank.AddEachStep = CstFuelSys.DsStorageTank.TankAddStep

    //  Outlet valve and service intake valve are open --> removing
    this.DsStorage.OutletValve.cbNowOpen = () => {
      // only transfer from storage to service tank
      // if this outlet and service inlet valve are both is open
      if (this.DsService.IntakeValve.isOpen) {
        this.DsStorage.Tank.AmountRemovers += 1
        this.DsService.Tank.Adding = true
      }
    }

    // both storage outlet & service intake needs to be open for transfer
    // may be still removin via drain valve
    this.DsStorage.OutletValve.cbNowClosed = () => {
      /* istanbul ignore else */
      if (this.DsService.IntakeValve.isOpen) {
        // was transfering, stop now. May be still removing via drain valve
        this.DsStorage.Tank.AmountRemovers -= 1
        this.DsService.Tank.Adding = false
      }
    }
    // Alarms
    this.DsStorage.Tank.AlarmSystem = alarmSys
    this.DsStorage.Tank.LowLevelAlarmCode = AlarmCode.LowDsStorageTank
    this.DsStorage.Tank.EmptyAlarmCode = AlarmCode.EmptyDsStorageTank
    this.DsStorage.Tank.LowLevelAlarm = AlarmLevel.FuelSys.LowDsStorage

    // #endregion

    /*
    this.DsHandpump = new HandPump(FuelSysTxt.DsHandpump, CstFuelSys.DsHandpumpVolume,
      this.DsStorage.OutletValve)
    this.DsHandPumpOutletValve = new Valve("handpump outlet valve", this.DsHandpump)
    */

    this.DsBypassValve = new Valve(FuelSysTxt.DsBypassValve, this.DsStorage.OutletValve)

    this.DsPurification = new PurificationUnit(FuelSysTxt.DsPurification,
      CstFuelSys.Purification.Volume, this.DsStorage.OutletValve)

    //#region Combine inputs from Purification and Bypass valve to 1 
    this.DsServiceMulti = new MultiInputs("Multi Ds Service inputs", this.DsStorage.Tank)
    this.DsServiceMulti.Inputs.push(this.DsPurification)
    this.DsServiceMulti.Inputs.push(this.DsBypassValve)
    //#endregion

    // #region Diesel service tank,
    // filled from the storage outlet valve
    this.DsService = new TankWithValves(FuelSysTxt.DsServiceTank,
      CstFuelSys.DsServiceTank.TankVolume, 0, this.DsServiceMulti)
    //#endregion

    // #region Alarms
    this.DsService.Tank.AlarmSystem = alarmSys
    this.DsService.Tank.LowLevelAlarmCode = AlarmCode.LowDsServiceTank
    this.DsService.Tank.EmptyAlarmCode = AlarmCode.EmptyDsServiceTank
    this.DsService.Tank.LowLevelAlarm = AlarmLevel.FuelSys.LowDsService
    // #endregion


    makeAutoObservable(this)
  }

  Thick() {
    // reevaluate DsStorage removing each Tick, to may possibilities to catch in callback functions
    this.DsStorage.Tank.RemoveEachStep = 0

    this.DsPurification.Thick()

    if (this.DsPurification.isRunning || this.DsBypassValve.isOpen) {
      // remove from storage tank, DsStorage is Ratio bigger then DsService tank
      if (this.DsStorage.OutletValve.isOpen && this.DsService.IntakeValve.isOpen) {

        this.DsStorage.Tank.RemoveEachStep = CstFuelSys.DsServiceTank.TankAddStep / CstFuelSys.RatioStorageServiceTanks
        // DsSerivice is full, no transfer this thick,
        // don't stop stop tranfer may be next tick DsServic isn't full any more
        if (this.DsService.Tank.Content === CstFuelSys.DsServiceTank.TankVolume) {
          this.DsStorage.Tank.RemoveEachStep = 0
        }
      }

      this.DsService.Tank.AddEachStep = (this.DsStorage.Tank.Content !== 0 && this.DsService.Tank.Adding)
        //  filling service tank if storage isn't empty
        ? CstFuelSys.DsServiceTank.TankAddStep
        // stop filling service tank if storage is empty
        : 0
    }
    if (!this.DsPurification.isRunning && !this.DsBypassValve.isOpen) {
      // stop filling if purification unit stops running or bypass valve is now closed
      this.DsStorage.Tank.RemoveEachStep = 0
      this.DsService.Tank.AddEachStep = 0
    }

    // also draining ?
    if (this.DsStorage.DrainValve.isOpen) {
      this.DsStorage.Tank.RemoveEachStep += CstChanges.DrainStep
    }


    // service tank needs first to Thick to detect full
    // -> stop from removing from storage
    this.DsService.Thick()
    this.DsStorage.Thick()
  }
}
