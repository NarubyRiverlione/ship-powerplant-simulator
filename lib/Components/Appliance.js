"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
class Appliance {
    constructor(name, bus) {
        this.Name = name;
        this.isRunning = false;
        this.Bus = bus;
        mobx_1.makeObservable(this, {
            isRunning: mobx_1.observable,
            CheckPower: mobx_1.computed,
            Start: mobx_1.action,
            Stop: mobx_1.action,
            Thick: mobx_1.action
        });
    }
    get Content() { return 0; }
    get CheckPower() {
        return this.Bus.Voltage !== 0;
    }
    Start() {
        if (this.CheckPower)
            this.isRunning = true;
    }
    Stop() {
        this.isRunning = false;
    }
    Thick() {
        this.isRunning = this.isRunning && this.CheckPower;
    }
    Toggle() {
        if (this.isRunning)
            this.Stop();
        else
            this.Start();
    }
}
exports.default = Appliance;
