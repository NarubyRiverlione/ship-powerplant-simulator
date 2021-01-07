"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const Generator_1 = __importDefault(require("./Generator"));
const Valve_1 = __importDefault(require("./Valve"));
const Tank_1 = __importDefault(require("./Tank"));
const Cst_1 = require("../Cst");
const CstTxt_1 = __importDefault(require("../CstTxt"));
const { DieselGeneratorTxt } = CstTxt_1.default;
class DieselGenerator extends Generator_1.default {
    constructor(name, rate, dieselValve, lubValve, airValve, lubCooler) {
        super(name, rate, dieselValve.Source);
        this.FuelIntakeValve = new Valve_1.default(`${name} ${DieselGeneratorTxt.FuelIntakeValve}`, dieselValve);
        this.FuelProvider = dieselValve.Source;
        this.LubIntakeValve = new Valve_1.default(`${name} ${DieselGeneratorTxt.LubIntakeValve}`, lubValve);
        this.LubProvider = lubValve.Source;
        this.LubIntakeValve.cbNowOpen = () => {
            const lub = this.LubIntakeValve.Source;
            if (lub.isOpen) {
                this.LubSlump.Adding = true;
                this.LubProvider.Removing = true;
            }
        };
        this.LubIntakeValve.cbNowClosed = () => {
            this.LubSlump.Adding = false;
            this.LubProvider.RemoveEachStep = Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep / Cst_1.CstLubSys.RatioStorageDsGenSlump;
            this.LubProvider.Removing = false;
        };
        this.LubSlump = new Tank_1.default(DieselGeneratorTxt.LubSlump, Cst_1.CstPowerSys.DsGen1.Slump.TankVolume);
        // this.LubSlump.Source = this.LubIntakeValve.Source as Tank
        this.LubSlump.AddEachStep = Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep;
        this.LubSlump.RemoveEachStep = Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep;
        this.AirIntakeValve = new Valve_1.default(`${name} ${DieselGeneratorTxt.AirIntakeValve}`, airValve);
        this.LubCooler = lubCooler;
        mobx_1.makeObservable(this, {
            CheckAir: mobx_1.computed,
            Start: mobx_1.action,
            Stop: mobx_1.action,
            Thick: mobx_1.action
        });
    }
    CheckFuel() {
        this.HasFuel = this.FuelIntakeValve.Content !== 0;
    }
    CheckLubrication() {
        this.HasLubrication = this.LubSlump.Content >= Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
    }
    CheckCooling() {
        this.HasCooling = this.LubCooler.isCooling;
    }
    get CheckAir() {
        return this.AirIntakeValve.Content >= Cst_1.CstAirSys.DieselGenerator.MinPressure;
    }
    Start() {
        if (this.CheckAir)
            super.Start();
    }
    Thick() {
        this.LubProvider.RemoveEachStep = 0;
        this.LubSlump.AddEachStep = 0;
        if (this.LubSlump.Adding && this.LubIntakeValve.Source.Content !== 0) {
            // only  fill slump tank if lub source is not empty
            this.LubProvider.RemoveEachStep += Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep / Cst_1.CstLubSys.RatioStorageDsGenSlump;
            this.LubSlump.AddEachStep = Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep;
        }
        this.LubSlump.Thick();
        this.CheckFuel();
        this.CheckLubrication();
        this.CheckCooling();
        super.Thick();
    }
}
exports.default = DieselGenerator;
