"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
class Cooler {
    constructor(name, coolingInputRate) {
        this.Name = name;
        this.isCooling = false; // cooling circuit & rate is ok
        this.hasCooling = false; // isCooling && hot circuit is ok
        this.CoolingInputRate = coolingInputRate;
        this.CoolingProviders = 0;
        this.CoolingCircuitComplete = false;
        this.HotCircuitComplete = false;
        mobx_1.makeAutoObservable(this);
    }
    get Content() { return this.isCooling ? 1 : 0; }
    CheckCoolingRate() {
        return this.CoolingProviders >= this.CoolingInputRate;
    }
    Thick() {
        this.hasCooling = this.CheckCoolingRate() && this.CoolingCircuitComplete;
        this.isCooling = this.hasCooling && this.HotCircuitComplete;
    }
}
exports.default = Cooler;
