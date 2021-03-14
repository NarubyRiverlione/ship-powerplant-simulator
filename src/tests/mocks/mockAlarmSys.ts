/* istanbul ignore file */

import { iAlarmSys } from '../../Systems/AlarmSystem'

export default class mockAlarmSys implements iAlarmSys {
  cbAlarmAdded: (addedAlarmCode: number) => void
  cbAlarmRemoved: (addedAlarmCode: number) => void
  AlarmList: Set<number>
  constructor() {
    this.AlarmList = new Set()
    this.cbAlarmAdded = (addedAlarmCode: number) => { }
    this.cbAlarmRemoved = (removedAlarmCode: number) => { }
  }

  AddAlarm(raise: number) { this.AlarmList.add(raise) }
  RemoveAlarm(kill: number) { this.AlarmList.delete(kill) }
  AlarmExist(code: number) { return this.AlarmList.has(code) }
}