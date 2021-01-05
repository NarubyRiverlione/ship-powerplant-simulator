const { makeObservable, action } = require('mobx')
const TankWithValves = require('../Components/TankWithValves')
const Valve = require('../Components/Valve')
const { CstLubSys } = require('../Cst')
const CstTxt = require('../CstTxt')
const { LubSysTxt } = CstTxt
const { AlarmCode, AlarmLevel } = require('../CstAlarms')

/*
Shore Valve --> (intake valve) DsStorage (outlet valve)
*/
module.exports = class LubSys {
  constructor(alarmSys) {
    makeObservable(this, { Thick: action })
    this.ShoreValve = new Valve(LubSysTxt.LubShoreFillValve)
    this.ShoreValve.Source = { Content: LubSysTxt.ShoreVolume }
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
