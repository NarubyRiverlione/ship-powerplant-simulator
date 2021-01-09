"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class mockAlarmSys {
    constructor() {
        this.AlarmList = new Set();
        this.cbAlarmAdded = (addedAlarmCode) => { };
        this.cbAlarmRemoved = (removedAlarmCode) => { };
    }
    AddAlarm(raise) { this.AlarmList.add(raise); }
    RemoveAlarm(kill) { this.AlarmList.delete(kill); }
    AlarmExist(code) { return this.AlarmList.has(code); }
}
exports.default = mockAlarmSys;
