"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
class mockPowerBus {
    constructor(name) {
        this.Thick = () => { };
        this.Name = name;
        this.Voltage = 0;
        this.Providers = 0;
    }
    get Content() { return this.Voltage; }
}
exports.default = mockPowerBus;
