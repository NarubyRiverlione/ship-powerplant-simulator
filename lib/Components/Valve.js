"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
class Valve {
    constructor(name, source) {
        this.isOpen = false;
        this.cbNowOpen = () => { };
        this.cbNowClosed = () => { };
        this.Source = source;
        this.Name = name;
        mobx_1.makeAutoObservable(this);
    }
    Open() {
        this.isOpen = true;
        this.cbNowOpen();
    }
    Close() {
        this.isOpen = false;
        this.cbNowClosed();
    }
    get Content() {
        return this.isOpen ? this.Source.Content : 0;
    }
    Thick() {
    }
    Toggle() {
        if (this.isOpen)
            this.Close();
        else
            this.Open();
    }
}
exports.default = Valve;
