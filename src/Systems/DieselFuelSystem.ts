import { makeAutoObservable } from 'mobx'
import Tank from '../Components/Tank'
import TankWithValves from '../Components/TankWithValves'
import Valve from '../Components/Valve'

import CstTxt from '../CstTxt'
import AlarmSystem from './AlarmSystem'
import { CstDsFuelSys } from '../Cst'
import { AlarmCode, AlarmLevel } from '../CstAlarms'
import HandPump from '../Components/HandPump'
import MultiInputs from '../Components/MultiToOne'
import PurificationUnit from '../Components/Appliances/PurificationUnit'


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
export default class DieselFuelSystem {
  DsShoreValve: Valve
  DsStorage: TankWithValves
  DsService: TankWithValves
  // DsHandpump: HandPump
  DsBypassValve: Valve
  DsServiceMulti: MultiInputs
  DsPurification: PurificationUnit

  constructor(alarmSys: AlarmSystem) {
    //  Intake valve from shore to diesel storage tank
    const dummyShore = new Tank('Shore as tank', CstDsFuelSys.ShoreVolume, CstDsFuelSys.ShoreVolume)
    this.DsShoreValve = new Valve(FuelSysTxt.DsShoreFillValve, dummyShore)


    //  Diesel storage tank,
    // filled from shore via the intake valve, outlet valve to service intake valve
    this.DsStorage = new TankWithValves(FuelSysTxt.DsStorageTank,
      CstDsFuelSys.DsStorageTank.TankVolume, 0, this.DsShoreValve)
    // fixed fill rate from shore
    this.DsStorage.IntakeValve.Volume = CstDsFuelSys.DsStorageTank.IntakeValveVolume

    // Alarms
    this.DsStorage.Tank.AlarmSystem = alarmSys
    this.DsStorage.Tank.LowLevelAlarmCode = AlarmCode.LowDsStorageTank
    this.DsStorage.Tank.EmptyAlarmCode = AlarmCode.EmptyDsStorageTank
    this.DsStorage.Tank.LowLevelAlarm = AlarmLevel.FuelSys.LowDsStorage

    /*
   this.DsHandpump = new HandPump(FuelSysTxt.DsHandpump, CstDsFuelSys.DsHandpumpVolume,
     this.DsStorage.OutletValve)
   this.DsHandPumpOutletValve = new Valve("handpump outlet valve", this.DsHandpump)
   */

    this.DsBypassValve = new Valve(FuelSysTxt.DsBypassValve, this.DsStorage.OutletValve)
    this.DsBypassValve.Volume = CstDsFuelSys.BypassValveVolume

    this.DsPurification = new PurificationUnit(FuelSysTxt.DsPurification,
      CstDsFuelSys.Purification.Volume, this.DsStorage.OutletValve)

    //#region Combine inputs from Purification and Bypass valve to 1 
    this.DsServiceMulti = new MultiInputs("Multi Ds Service inputs", this.DsStorage.Tank)
    this.DsServiceMulti.Inputs.push(this.DsPurification)
    this.DsServiceMulti.Inputs.push(this.DsBypassValve)
    //#endregion

    // #region Diesel service tank,
    // filled from the storage outlet valve
    this.DsService = new TankWithValves(FuelSysTxt.DsServiceTank,
      CstDsFuelSys.DsServiceTank.TankVolume, 0, this.DsServiceMulti)

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
    this.DsPurification.Thick()

    // service tank needs first to Thick to detect full
    // -> stop from removing from storage
    this.DsService.Thick()

    // remove from Storage what has be added to Service, unless Service is full
    this.DsStorage.Tank.RemoveThisStep = this.DsService.Tank.AddThisStep

    // / CstDsFuelSys.RatioStorageServiceTanks
    this.DsStorage.Thick()
  }
}
