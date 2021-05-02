import { makeObservable, action } from 'mobx'
import Tank from '../Components/Tank'
import TankWithValves from '../Components/TankWithValves'
import Valve from '../Components/Valve'
import AlarmSystem from './AlarmSystem'

import { CstLubSys } from '../Constants/Cst'
import { AlarmCode, AlarmLevel } from '../Constants/CstAlarms'
import CstTxt from '../Constants/CstTxt'

const { LubSysTxt } = CstTxt

/*
Shore Valve --> (intake valve) DsStorage (outlet valve)
*/
export default class LubricationSystem {
  ShoreValve: Valve

  Storage: TankWithValves

  constructor(alarmSys: AlarmSystem) {
    makeObservable(this, { Thick: action })
    const dummyShore = new Tank('dummy shore', CstLubSys.ShoreVolume, CstLubSys.ShoreVolume)
    this.ShoreValve = new Valve(LubSysTxt.LubShoreFillValve, dummyShore)

    this.Storage = new TankWithValves(LubSysTxt.LubStorageTank,
      CstLubSys.StorageTank.TankVolume, 0, this.ShoreValve)
    this.Storage.IntakeValve.Volume = CstLubSys.StorageTank.IntakeValveVolume

    // Alarms
    this.Storage.Tank.AlarmSystem = alarmSys
    this.Storage.Tank.LowLevelAlarmCode = AlarmCode.LowLubStorageTank
    this.Storage.Tank.EmptyAlarmCode = AlarmCode.EmptyLubStorageTank
    this.Storage.Tank.LowLevelAlarm = AlarmLevel.LubSys.LowStorage
  }

  Thick() {
    this.Storage.Thick()
  }
}
