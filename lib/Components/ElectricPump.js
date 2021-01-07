"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const Appliance_1 = __importDefault(require("./Appliance"));
class ElectricPump extends Appliance_1.default {
    constructor(name, bus, rate) {
        super(name, bus);
        this.RatedFor = rate;
        this.Output = 0;
        this.Providers = 0;
        mobx_1.makeObservable(this, { Output: mobx_1.observable, Thick: mobx_1.action, Content: mobx_1.computed });
    }
    get Content() { return this.Output; }
    Thick() {
        // pump cannot run dry without providers
        if (this.Providers === 0)
            super.Stop();
        super.Thick();
        if (!this.isRunning) {
            this.Output = 0;
            return;
        }
        this.Output = this.Providers > this.RatedFor ? this.RatedFor : this.Providers;
    }
}
exports.default = ElectricPump;
