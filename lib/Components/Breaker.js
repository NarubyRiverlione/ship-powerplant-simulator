"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
class Breaker {
    constructor(name) {
        this.Name = name;
        this.isOpen = true;
        this.RatedFor = 0;
        this.Load = 0;
        this.Providers = 0;
        mobx_1.makeAutoObservable(this);
    }
    get Content() { return this.Load; }
    // Load > RatedFor
    TestLoad() {
        if (this.Load > this.RatedFor) {
            this.isOpen = true;
        }
    }
    // Load > Providers
    TestTripped() {
        if (this.Load > this.Providers) {
            this.isOpen = true;
        }
    }
    Thick() {
        this.TestLoad();
        this.TestTripped();
    }
    Open() {
        this.isOpen = true;
    }
    Close() {
        this.isOpen = false;
        this.TestLoad();
    }
    Toggle() {
        if (this.isOpen)
            this.Close();
        else
            this.Open();
    }
}
exports.default = Breaker;
