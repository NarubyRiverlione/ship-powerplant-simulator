"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const Appliance_1 = __importDefault(require("./Appliance"));
const Valve_1 = __importDefault(require("./Valve"));
class Compressor extends Appliance_1.default {
    constructor(name, bus, rate) {
        super(name, bus);
        this.Output = 0.0;
        this.RatedFor = rate;
        this.OutletValve = new Valve_1.default(name + ' - outlet valve', this);
        mobx_1.makeObservable(this, { Output: mobx_1.observable, Thick: mobx_1.action, Content: mobx_1.computed });
    }
    get Content() { return this.Output; }
    Thick() {
        super.Thick();
        this.Output = this.isRunning ? this.RatedFor : 0.0;
        this.OutletValve.Source = this;
    }
}
exports.default = Compressor;
