"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const Tank_1 = __importDefault(require("../Components/Tank"));
const TankWithValves_1 = __importDefault(require("../Components/TankWithValves"));
const Valve_1 = __importDefault(require("../Components/Valve"));
const CstTxt_1 = __importDefault(require("../CstTxt"));
const Cst_1 = require("../Cst");
const CstAlarms_1 = require("../CstAlarms");
const { FuelSysTxt } = CstTxt_1.default;
/*
Shore Valve --> (intake valve) DsStorage (outlet valve) --> (intake valve) DsService (outlet valve)
                                (drain)                                     (drain)
*/
class FuelSystem {
    constructor(alarmSys) {
        // #region Intake valve from shore to diesel storage tank
        const dummyShore = new Tank_1.default('Shore as tank', Cst_1.CstFuelSys.ShoreVolume, Cst_1.CstFuelSys.ShoreVolume);
        this.DsShoreValve = new Valve_1.default(FuelSysTxt.DsShoreFillValve, dummyShore);
        // if both shore and storage intake valves are open --> filling
        this.DsShoreValve.cbNowOpen = () => {
            if (this.DsStorage.IntakeValve.isOpen)
                this.DsStorage.Tank.Adding = true;
        };
        this.DsShoreValve.cbNowClosed = () => {
            this.DsStorage.Tank.Adding = false;
        };
        // #endregion
        // #region Diesel storage tank,
        // filled from shore via the intake valve, outlet valve to service intake valve
        this.DsStorage = new TankWithValves_1.default(FuelSysTxt.DsStorageTank, Cst_1.CstFuelSys.DsStorageTank.TankVolume, 0, this.DsShoreValve);
        // fixed fill rate from shore
        this.DsStorage.Tank.AddEachStep = Cst_1.CstFuelSys.DsStorageTank.TankAddStep;
        //  Outlet valve and service intake valve are open --> removing
        this.DsStorage.OutletValve.cbNowOpen = () => {
            // only transfer from storage to service tank
            // if this outlet and service inlet valve are both is open
            if (this.DsService.IntakeValve.isOpen) {
                this.DsStorage.Tank.Removing = true;
                this.DsService.Tank.Adding = true;
            }
        };
        // both storage outlet & service intake needs to be open for transfer
        // may be still removin via drain valve
        this.DsStorage.OutletValve.cbNowClosed = () => {
            this.DsStorage.Tank.Removing = this.DsStorage.DrainValve.isOpen;
            this.DsService.Tank.Adding = false;
            // if (this.DsService.IntakeValve.isOpen) {
            //   // was transfering, stop now. May be still removing via drain valve
            //   this.DsStorage.Tank.RemoveEachStep -= CstFuelSys.DsServiceTank.TankAddStep / CstFuelSys.RatioStorageServiceTanks
            // }
        };
        // Alarms
        this.DsStorage.Tank.AlarmSystem = alarmSys;
        this.DsStorage.Tank.LowLevelAlarmCode = CstAlarms_1.AlarmCode.LowDsStorageTank;
        this.DsStorage.Tank.EmptyAlarmCode = CstAlarms_1.AlarmCode.EmptyDsStorageTank;
        this.DsStorage.Tank.LowLevelAlarm = CstAlarms_1.AlarmLevel.FuelSys.LowDsStorage;
        // #endregion
        // #region Diesel service tank,
        // filled from the storage outlet valve
        this.DsService = new TankWithValves_1.default(FuelSysTxt.DsServiceTank, Cst_1.CstFuelSys.DsServiceTank.TankVolume, 0, this.DsStorage.OutletValve);
        // //  drain valve can also be open and continue removing
        // this.DsService.Tank.cbFull = () => {
        //   this.DsStorage.Tank.RemoveEachStep -= CstFuelSys.DsServiceTank.TankAddStep / CstFuelSys.RatioStorageServiceTanks
        // }
        // outlet valve closes,stop removing from service tank
        // may be continue removing via drain valve
        this.DsService.OutletValve.cbNowClosed = () => {
            this.DsService.Tank.Removing = this.DsStorage.DrainValve.isOpen;
            // this.DsService.Tank.RemoveEachStep -= CstFuelSys.RatioStorageServiceTanks
        };
        // Alarms
        this.DsService.Tank.AlarmSystem = alarmSys;
        this.DsService.Tank.LowLevelAlarmCode = CstAlarms_1.AlarmCode.LowDsServiceTank;
        this.DsService.Tank.EmptyAlarmCode = CstAlarms_1.AlarmCode.EmptyDsServiceTank;
        this.DsService.Tank.LowLevelAlarm = CstAlarms_1.AlarmLevel.FuelSys.LowDsService;
        // #endregion
        mobx_1.makeObservable(this, { Thick: mobx_1.action });
    }
    Thick() {
        // reevaluate DsStorage removing each Tick, to may possibilities to catch in callback functions
        this.DsStorage.Tank.RemoveEachStep = 0;
        // remove from storage tank, DsStorage is Ratio bigger then DsService tank
        if (this.DsStorage.OutletValve.isOpen && this.DsService.IntakeValve.isOpen) {
            this.DsStorage.Tank.RemoveEachStep = Cst_1.CstFuelSys.DsServiceTank.TankAddStep / Cst_1.CstFuelSys.RatioStorageServiceTanks;
            // DsSerivice is full, no transfer this thick,
            // don't stop stop tranfer may be next tick DsServic isn't full any more
            if (this.DsService.Tank.Content === Cst_1.CstFuelSys.DsServiceTank.TankVolume) {
                this.DsStorage.Tank.RemoveEachStep = 0;
            }
        }
        // also draining ?
        if (this.DsStorage.DrainValve.isOpen) {
            this.DsStorage.Tank.RemoveEachStep += Cst_1.CstChanges.DrainStep;
        }
        this.DsService.Tank.AddEachStep = (this.DsStorage.Tank.Content !== 0 && this.DsService.Tank.Adding)
            //  filling service tank if storage isn't empty
            ? Cst_1.CstFuelSys.DsServiceTank.TankAddStep
            // stop filling service tank if storage is empty
            : 0;
        // service tank needs first to Thick to detect full
        // -> stop from removing from storage
        this.DsService.Thick();
        this.DsStorage.Thick();
    }
}
exports.default = FuelSystem;
