
export interface iAlarmSys {
  cbAlarmAdded: (addedAlarmCode: number) => void
  cbAlarmRemoved: (addedAlarmCode: number) => void
  AlarmList: Set<number>
  AddAlarm: (code: number) => void
  RemoveAlarm: (code: number) => void
  AlarmExist: (code: number) => boolean
}

export default class AlarmSystem implements iAlarmSys {
  cbAlarmAdded: (addedAlarmCode: number) => void
  cbAlarmRemoved: (addedAlarmCode: number) => void
  AlarmList: Set<number>

  constructor() {
    this.AlarmList = new Set()
    this.cbAlarmAdded = (addedAlarmCode: number) => { }
    this.cbAlarmRemoved = (removedAlarmCode: number) => { }
  }

  AddAlarm(alarmCode: number) {
    const amountAlarmsBeforeAdd = this.AlarmList.size
    this.AlarmList.add(alarmCode)
    if (this.AlarmList.size !== amountAlarmsBeforeAdd) this.cbAlarmAdded(alarmCode)
  }

  RemoveAlarm(alarmCode: number) {
    this.AlarmList.delete(alarmCode)
    this.cbAlarmRemoved(alarmCode)
  }

  AlarmExist(alarmCode: number) {
    return this.AlarmList.has(alarmCode)
  }
}
