"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Valve_1 = __importDefault(require("./Valve"));
const Tank_1 = __importDefault(require("./Tank"));
const Cst_1 = require("../Cst");
class TankWithValves {
    constructor(tankName, volume, startContent, sourceValve, drainTarget) {
        this.Name = tankName;
        this.IntakeValve = new Valve_1.default(`${tankName} - intake valve`, sourceValve);
        this.Tank = new Tank_1.default(tankName, volume, startContent);
        this.OutletValve = new Valve_1.default(`${tankName} - outlet valve`, this.Tank);
        this.DrainValve = new Valve_1.default(`${tankName} - drain valve`, this.Tank);
        this.DrainTarget = drainTarget;
        //  Inlet valve and Source valve are open
        // --> filling = adding this tank, removing from source
        this.IntakeValve.cbNowOpen = () => {
            if (sourceValve.isOpen) {
                this.Tank.Adding = true;
                const Source = sourceValve.Source;
                Source.Removing = true;
            }
        };
        // inlet valve closed
        // --> stop filling ( doesn't mater if source valve is open )
        this.IntakeValve.cbNowClosed = () => {
            this.Tank.Adding = false;
            const Source = sourceValve.Source;
            Source.Removing = false;
        };
        // Drain Valve
        this.DrainValve.cbNowOpen = () => {
            this.Tank.RemoveEachStep += Cst_1.CstChanges.DrainStep;
            this.Tank.Removing = true;
            if (this.DrainTarget) {
                this.DrainTarget.AddEachStep = Cst_1.CstChanges.DrainStep;
                this.DrainTarget.Adding = true;
            }
        };
        this.DrainValve.cbNowClosed = () => {
            this.Tank.RemoveEachStep -= Cst_1.CstChanges.DrainStep;
            // only stop removing is outlet valve is also closed
            this.Tank.Removing = this.OutletValve.isOpen;
        };
    }
    get Content() { return this.Tank.Content; }
    Thick() {
        this.Tank.Thick();
    }
}
exports.default = TankWithValves;
