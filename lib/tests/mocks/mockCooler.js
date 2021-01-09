"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class mockCooler {
    constructor(name, coolingInputRate) {
        this.Name = name;
        this.isCooling = true; // mock cooler : cooling circuit & rate is ok
        this.hasCooling = false; // isCooling && hot circuit is ok
        this.CoolingInputRate = coolingInputRate;
        this.CoolingProviders = 0;
        this.CoolingCircuitComplete = false;
        this.HotCircuitComplete = false;
    }
    Thick() { }
    get Content() { return this.isCooling ? 1 : 0; }
    get CheckCoolingRate() {
        return this.CoolingProviders >= this.CoolingInputRate;
    }
}
exports.default = mockCooler;
