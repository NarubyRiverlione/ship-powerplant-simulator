"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
class mockValve {
    constructor(name, source) {
        this.isOpen = true; // mock valve is default open !
        this.cbNowOpen = () => { };
        this.cbNowClosed = () => { };
        this.Source = source;
        this.Name = name;
    }
    get Content() { return this.Source.Content; }
    Thick() { }
    Open() { } //this.isOpen = true
    Close() { this.isOpen = false; }
    Toggle() { }
}
exports.default = mockValve;
