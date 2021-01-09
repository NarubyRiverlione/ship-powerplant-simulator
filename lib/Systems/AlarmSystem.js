"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AlarmSystem {
    constructor() {
        this.AlarmList = new Set();
        this.cbAlarmAdded = (addedAlarmCode) => { };
        this.cbAlarmRemoved = (removedAlarmCode) => { };
    }
    AddAlarm(alarmCode) {
        const amountAlarmsBeforeAdd = this.AlarmList.size;
        this.AlarmList.add(alarmCode);
        if (this.AlarmList.size !== amountAlarmsBeforeAdd)
            this.cbAlarmAdded(alarmCode);
    }
    RemoveAlarm(alarmCode) {
        this.AlarmList.delete(alarmCode);
        this.cbAlarmRemoved(alarmCode);
    }
    AlarmExist(alarmCode) {
        return this.AlarmList.has(alarmCode);
    }
}
exports.default = AlarmSystem;
