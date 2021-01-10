"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const Cst_1 = require("./Cst");
const PowerSystem_1 = __importDefault(require("./Systems/PowerSystem"));
const FuelSystem_1 = __importDefault(require("./Systems/FuelSystem"));
const AirSystem_1 = __importDefault(require("./Systems/AirSystem"));
const CoolingSystem_1 = __importDefault(require("./Systems/CoolingSystem"));
const LubricationSystem_1 = __importDefault(require("./Systems/LubricationSystem"));
const AlarmSystem_1 = __importDefault(require("./Systems/AlarmSystem"));
class Simulator {
    constructor() {
        this.Reset();
        mobx_1.makeAutoObservable(this);
    }
    Reset() {
        this.AlarmSys = new AlarmSystem_1.default();
        this.FuelSys = new FuelSystem_1.default(this.AlarmSys);
        this.LubSys = new LubricationSystem_1.default(this.AlarmSys);
        this.CoolingSys = new CoolingSystem_1.default();
        this.AirSys = new AirSystem_1.default();
        this.PowerSys = new PowerSystem_1.default(this.FuelSys.DsService.OutletValve, this.LubSys.Storage.OutletValve, this.AirSys.EmergencyReceiver.OutletValve, this.CoolingSys.DsGen1LubCooler);
        this.AirSys.EmergencyCompressor.Bus = this.PowerSys.EmergencyBus;
        this.AirSys.StartAirCompressor1.Bus = this.PowerSys.MainBus1;
        this.CoolingSys.SuctionPump1.Bus = this.PowerSys.MainBus1;
        this.CoolingSys.SuctionPump2.Bus = this.PowerSys.MainBus1;
        this.CoolingSys.AuxPump.Bus = this.PowerSys.EmergencyBus;
        this.Running = undefined;
    }
    Thick() {
        this.PowerSys.Thick();
        this.FuelSys.Thick();
        this.LubSys.Thick();
        this.AirSys.Thick();
        this.CoolingSys.Thick();
    }
    Start() {
        this.Running = setInterval(() => {
            this.Thick();
        }, Cst_1.CstChanges.Interval);
    }
    Stop() {
        if (this.Running) {
            clearInterval(this.Running);
            this.Running = undefined;
        }
    }
    Toggle() {
        if (this.Running)
            this.Stop();
        else
            this.Start();
    }
}
exports.default = Simulator;
