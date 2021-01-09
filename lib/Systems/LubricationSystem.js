"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const Tank_1 = __importDefault(require("../Components/Tank"));
const TankWithValves_1 = __importDefault(require("../Components/TankWithValves"));
const Valve_1 = __importDefault(require("../Components/Valve"));
const Cst_1 = require("../Cst");
const CstAlarms_1 = require("../CstAlarms");
const CstTxt_1 = __importDefault(require("../CstTxt"));
const { LubSysTxt } = CstTxt_1.default;
/*
Shore Valve --> (intake valve) DsStorage (outlet valve)
*/
class LubSys {
    constructor(alarmSys) {
        mobx_1.makeObservable(this, { Thick: mobx_1.action });
        const dummyShore = new Tank_1.default('dummy shore', Cst_1.CstLubSys.ShoreVolume, Cst_1.CstLubSys.ShoreVolume);
        this.ShoreValve = new Valve_1.default(LubSysTxt.LubShoreFillValve, dummyShore);
        // if both shore and storage intake valves are open --> filling
        this.ShoreValve.cbNowOpen = () => {
            if (this.Storage.IntakeValve.isOpen)
                this.Storage.Tank.Adding = true;
        };
        this.ShoreValve.cbNowClosed = () => {
            this.Storage.Tank.Adding = false;
        };
        this.Storage = new TankWithValves_1.default(LubSysTxt.LubStorageTank, Cst_1.CstLubSys.StorageTank.TankVolume, 0, this.ShoreValve);
        this.Storage.Tank.AddEachStep = Cst_1.CstLubSys.StorageTank.TankAddStep;
        // Alarms
        this.Storage.Tank.AlarmSystem = alarmSys;
        this.Storage.Tank.LowLevelAlarmCode = CstAlarms_1.AlarmCode.LowLubStorageTank;
        this.Storage.Tank.EmptyAlarmCode = CstAlarms_1.AlarmCode.EmptyLubStorageTank;
        this.Storage.Tank.LowLevelAlarm = CstAlarms_1.AlarmLevel.LubSys.LowStorage;
    }
    Thick() {
        this.Storage.Tank.Thick();
    }
}
exports.default = LubSys;
