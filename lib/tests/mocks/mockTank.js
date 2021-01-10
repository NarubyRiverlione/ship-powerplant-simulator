"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
class mockTank {
    constructor(Name, Volume, StartContent = 0.0) {
        this.Thick = () => { };
        this.Name = Name;
        this.Inside = StartContent;
        this.Volume = Volume;
        // flags are needed to remember when tank is full/empty that
        // was filling/removing to resume after tank is no longer full/empty
        this.Adding = false;
        this.Removing = false;
        this.AddEachStep = 0.0;
        this.RemoveEachStep = 0.0;
        this.cbFull = () => { };
        this.cbAdded = () => { };
        this.cbRemoved = () => { };
        this.AlarmSystem = null;
        this.LowLevelAlarmCode = 0;
        this.LowLevelAlarm = 0;
        this.EmptyAlarmCode = 0;
    }
    Add() {
        this.Inside += this.AddEachStep;
    }
    Remove() {
        this.Inside -= this.RemoveEachStep;
    }
    CheckAlarmLevels() { }
    get Content() { return this.Inside; }
}
exports.default = mockTank;
