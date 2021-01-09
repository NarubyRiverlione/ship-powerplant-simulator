"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const TankWithValves_1 = __importDefault(require("../Components/TankWithValves"));
const PowerBus_1 = __importDefault(require("../Components/PowerBus"));
const Compressor_1 = __importDefault(require("../Components/Compressor"));
const Cst_1 = require("../Cst");
const CstTxt_1 = __importDefault(require("../CstTxt"));
const { AirSysTxt } = CstTxt_1.default;
/*
Start air compressor 1 - outlet valve  ------ (intake valve) Start air receiver 1 (outlet valve)
                                                              (drain)

Emergency compressor - outlet valve  ------ (intake valve) Emergence receiver (outlet valve)
                                                              (drain)
*/
class AirSystem {
    constructor(mainBus = new PowerBus_1.default('dummy mainBus'), emergencyBus = new PowerBus_1.default('dummy emergency power bus')) {
        // #region  Compressor 1
        this.StartAirCompressor1 = new Compressor_1.default(AirSysTxt.Compressor1, mainBus, Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        this.StartAirCompressor1.OutletValve.cbNowOpen = () => {
            if (this.StartAirReceiver1.IntakeValve.isOpen) {
                this.StartAirReceiver1.Tank.Adding = true;
            }
        };
        this.StartAirCompressor1.OutletValve.cbNowClosed = () => {
            this.StartAirReceiver1.Tank.Adding = false;
        };
        this.StartAirReceiver1 = new TankWithValves_1.default(AirSysTxt.StartAirReceiver1, Cst_1.CstAirSys.StartAirReceiver1.TankPressure, 0, this.StartAirCompressor1.OutletValve);
        this.StartAirReceiver1.Tank.AddEachStep = Cst_1.CstAirSys.StartAirCompressor1.AddStep;
        // #endregion
        // #region Emergency compressor
        this.EmergencyCompressor = new Compressor_1.default(AirSysTxt.EmergencyCompressor, emergencyBus, Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        this.EmergencyCompressor.OutletValve.cbNowOpen = () => {
            if (this.EmergencyReceiver.IntakeValve.isOpen) {
                this.EmergencyReceiver.Tank.Adding = true;
            }
        };
        this.EmergencyCompressor.OutletValve.cbNowClosed = () => {
            this.EmergencyReceiver.Tank.Adding = false;
        };
        this.EmergencyReceiver = new TankWithValves_1.default(AirSysTxt.EmergencyReceiver, Cst_1.CstAirSys.EmergencyReceiver.TankPressure, 0, this.EmergencyCompressor.OutletValve);
        // #endregion
        this.EmergencyReceiver.Tank.AddEachStep = Cst_1.CstAirSys.EmergencyCompressor.AddStep;
        mobx_1.makeAutoObservable(this);
    }
    Thick() {
        this.StartAirCompressor1.Thick();
        this.StartAirReceiver1.Thick();
        this.StartAirCompressor1.OutletValve.Source = this.StartAirCompressor1;
        this.EmergencyCompressor.Thick();
        this.EmergencyReceiver.Thick();
        // this.EmergencyCompressor.OutletValve.Source = this.EmergencyCompressor
    }
}
exports.default = AirSystem;
