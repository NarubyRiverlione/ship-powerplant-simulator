"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cst_1 = require("../Cst");
const mobx_1 = require("mobx");
class PowerBus {
    constructor(name) {
        this.Name = name;
        this.Voltage = 0;
        this.Providers = 0;
        mobx_1.makeAutoObservable(this);
    }
    get Content() { return this.Voltage; }
    Thick() {
        this.Voltage = this.Providers > 0
            ? Cst_1.CstPowerSys.Voltage
            : 0;
    }
}
exports.default = PowerBus;
