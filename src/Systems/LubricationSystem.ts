import { makeObservable, action } from 'mobx'
import Tank from '../Components/Tank'
import TankWithValves from '../Components/TankWithValves'
import Valve from '../Components/Valve'
import AlarmSys from './AlarmSys'

import { CstLubSys } from '../Cst'
import { AlarmCode, AlarmLevel } from '../CstAlarms'
import CstTxt from '../CstTxt'
const { LubSysTxt } = CstTxt

/*
Shore Valve --> (intake valve) DsStorage (outlet valve)
*/
export default class LubSys {
  ShoreValve: Valve
  Storage: TankWithValves


  constructor(alarmSys: AlarmSys) {
    makeObservable(this, { Thick: action })
    const dummyShore = new Tank('dummy shore', CstLubSys.ShoreVolume, CstLubSys.ShoreVolume)
    this.ShoreValve = new Valve(LubSysTxt.LubShoreFillValve, dummyShore)
    // if both shore and storage intake valves are open --> filling
    this.ShoreValve.cbNowOpen = () => {
      if (this.Storage.IntakeValve.isOpen) this.Storage.Tank.Adding = true
    }
    this.ShoreValve.cbNowClosed = () => {
      this.Storage.Tank.Adding = false
    }

    this.Storage = new TankWithValves(LubSysTxt.LubStorageTank,
      CstLubSys.StorageTank.TankVolume, 0, this.ShoreValve)

    this.Storage.Tank.AddEachStep = CstLubSys.StorageTank.TankAddStep

    // Alarms
    this.Storage.Tank.AlarmSystem = alarmSys
    this.Storage.Tank.LowLevelAlarmCode = AlarmCode.LowLubStorageTank
    this.Storage.Tank.EmptyAlarmCode = AlarmCode.EmptyLubStorageTank
    this.Storage.Tank.LowLevelAlarm = AlarmLevel.LubSys.LowStorage
  }

  Thick() {
    this.Storage.Tank.Thick()
  }
}
