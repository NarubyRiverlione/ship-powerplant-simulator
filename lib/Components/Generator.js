"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
class Generator {
    constructor(Name, Rate, fuelProvider) {
        this.Name = Name;
        this.RatedFor = Rate;
        this.isRunning = false;
        this.Output = 0;
        this.HasFuel = false;
        this.HasCooling = false;
        this.HasLubrication = false;
        this.FuelProvider = fuelProvider;
        this.FuelConsumption = 0;
        mobx_1.makeObservable(this, {
            isRunning: mobx_1.observable,
            Output: mobx_1.observable,
            HasFuel: mobx_1.observable,
            HasCooling: mobx_1.observable,
            HasLubrication: mobx_1.observable,
            Start: mobx_1.action,
            Stop: mobx_1.action,
            Thick: mobx_1.action,
            Toggle: mobx_1.action
        });
    }
    get Content() { return this.Output; }
    TestRunning() {
        // not running, keep stopped
        if (!this.isRunning)
            return false;
        const prerequisites = this.HasCooling && this.HasFuel && this.HasLubrication;
        // already running and  prerequisites are still ok --> continue running
        if (prerequisites)
            return true;
        // prerequisites aren't met any more --> Stop
        this.Stop();
        return false;
    }
    Start() {
        this.isRunning = true;
        this.FuelProvider.Removing = true;
        this.FuelProvider.RemoveEachStep += this.FuelConsumption;
    }
    Stop() {
        this.isRunning = false;
        this.FuelProvider.Removing = false;
        this.FuelProvider.RemoveEachStep -= this.FuelConsumption;
    }
    Toggle() {
        if (this.isRunning)
            this.Stop();
        else
            this.Start();
    }
    Thick() {
        this.isRunning = this.TestRunning();
        this.Output = this.isRunning ? this.RatedFor : 0;
    }
}
exports.default = Generator;
