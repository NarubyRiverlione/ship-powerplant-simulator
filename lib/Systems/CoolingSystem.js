"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const Cst_1 = require("../Cst");
const CstTxt_1 = __importDefault(require("../CstTxt"));
const { CoolantSysTxt } = CstTxt_1.default;
const Tank_1 = __importDefault(require("../Components/Tank"));
const Valve_1 = __importDefault(require("../Components/Valve"));
const ElectricPump_1 = __importDefault(require("../Components/ElectricPump"));
const Cooler_1 = __importDefault(require("../Components/Cooler"));
const PowerBus_1 = __importDefault(require("../Components/PowerBus"));
/* eslint-disable max-len */
/*
** Sea water cooling circuit **
|- Suction pump 1 (main bus) --|     |- Fresh water cooler Diesel generator 1 (aux capable) ->-|
Sea chest high  - suction Valve ->-|     |- Suction pump 2 (main bus) --|==>==|- Fresh water cooler Diesel generator 2 (aux capable) ->-|==>== over board dump valve
|==>==|- Aux pump (emergency bus)----|     |- Steam condensor (cannot work not on aux pump) ------->-|
Sea chest low  - suction valve -> -|

** Fresh water cooling circuits**
Fresh water Expand tank
|
|->- Fresh water cooler Diesel generator 1 ->-|
|                                             |
|-<- Lubrication cooler diesel generator 1 -<-|

*/
/* eslint-enable max-len */
class CoolingSystem {
    constructor(mainBus = new PowerBus_1.default('dummy mainBus'), emergencyBus = new PowerBus_1.default('dummy emergency power bus')) {
        this.SwAvailable = new Tank_1.default('virtual tank that combines the possible outputs of AuxPump, SuctionPump 1 & 2', 1e6, 0);
        const SeaChest = new Tank_1.default('Sea water chest', 1e6, 1e6);
        // #region Sea chests suction valves
        this.SeaChestLowSuctionIntakeValve = new Valve_1.default(CoolantSysTxt.LowSuctionIntakeValve, SeaChest);
        this.SeaChestHighSuctionIntakeValve = new Valve_1.default(CoolantSysTxt.HighSuctionIntakeValve, SeaChest);
        // #endregion
        // #region (aux) SuctionPumps
        this.AuxPump = new ElectricPump_1.default(CoolantSysTxt.AuxSuctionPump, emergencyBus, Cst_1.CstCoolantSys.AuxSuctionPump);
        this.SuctionPump1 = new ElectricPump_1.default(CoolantSysTxt.SuctionPump1, mainBus, Cst_1.CstCoolantSys.SuctionPumps);
        this.SuctionPump2 = new ElectricPump_1.default(CoolantSysTxt.SuctionPump2, mainBus, Cst_1.CstCoolantSys.SuctionPumps);
        // #endregion
        // #region primair FW circuit
        this.FwCoolerDsGen1 = new Cooler_1.default(CoolantSysTxt.FwCoolerDsGen1, Cst_1.CstCoolantSys.FwCoolerDsGen1.coolingRate);
        this.FwCoolerDsGen2 = new Cooler_1.default(CoolantSysTxt.FwCoolerDsGen2, Cst_1.CstCoolantSys.FwCoolerDsGen2.coolingRate);
        this.SteamCondensor = new Cooler_1.default(CoolantSysTxt.SteamCondensor, Cst_1.CstCoolantSys.SteamCondensor.coolingRate);
        // #endregion
        // #region Over board dump valve
        this.OverboardDumpValve = new Valve_1.default(CoolantSysTxt.OverboardDumpValve, this.SwAvailable);
        this.OverboardDumpValve.cbNowOpen = () => {
            this.FwCoolerDsGen1.CoolingCircuitComplete = true;
            this.FwCoolerDsGen2.CoolingCircuitComplete = true;
            this.SteamCondensor.CoolingCircuitComplete = true;
        };
        this.OverboardDumpValve.cbNowClosed = () => {
            this.FwCoolerDsGen1.CoolingCircuitComplete = false;
            this.FwCoolerDsGen2.CoolingCircuitComplete = false;
            this.SteamCondensor.CoolingCircuitComplete = false;
        };
        // #endregion
        // #region FW Expand tank
        this.FwExpandTank = new Tank_1.default(CoolantSysTxt.FwExpandTank, Cst_1.CstCoolantSys.FwExpandTank.TankVolume);
        this.FwExpandTank.AddEachStep = Cst_1.CstCoolantSys.FwExpandTank.TankAddStep;
        this.FwExpandTank.RemoveEachStep = Cst_1.CstChanges.DrainStep;
        const FwMakeUp = new Tank_1.default('Fresh water make up', 1e6, 1e6);
        this.FwIntakeValve = new Valve_1.default(CoolantSysTxt.FwIntakeValve, FwMakeUp);
        this.FwIntakeValve.cbNowOpen = () => {
            this.FwExpandTank.Adding = true;
        };
        this.FwIntakeValve.cbNowClosed = () => {
            this.FwExpandTank.Adding = false;
        };
        this.FwDrainValve = new Valve_1.default(CoolantSysTxt.FwDrainValve, this.FwExpandTank);
        this.FwDrainValve.cbNowOpen = () => {
            this.FwExpandTank.Removing = true;
        };
        this.FwDrainValve.cbNowClosed = () => {
            this.FwExpandTank.Removing = false;
        };
        // #endregion
        // #region DsGen 1 Lubrication cooler (secundaire FW circuit)
        this.DsGen1LubCooler = new Cooler_1.default(CoolantSysTxt.DsGen1LubCooler, Cst_1.CstCoolantSys.DsGenLubCooler.coolingRate);
        this.DsGen1LubCooler.CoolingCircuitComplete = true; // TODO check if no Fw outlet valve is needed
        // TODO set (via Simulator Thick?): if DsGen 1 slump has lub,circulation valve is open, (filter  is selected)
        this.DsGen1LubCooler.HotCircuitComplete = true;
        // #endregion
        // #region DsGen 2 Lubrication cooler (secundaire FW circuit)
        this.DsGen2LubCooler = new Cooler_1.default(CoolantSysTxt.DsGen2LubCooler, Cst_1.CstCoolantSys.DsGenLubCooler.coolingRate);
        this.DsGen2LubCooler.CoolingCircuitComplete = true; // TODO check if no Fw outlet valve is needed
        // TODO set (via Simulator Thick?): if DsGen 1 slump has lub,circulation valve is open, (filter  is selected)
        this.DsGen2LubCooler.HotCircuitComplete = true;
        // #endregion
        mobx_1.makeAutoObservable(this);
    }
    Thick() {
        this.AuxPump.Providers = this.SeaChestLowSuctionIntakeValve.Content
            + this.SeaChestHighSuctionIntakeValve.Content;
        this.AuxPump.Thick();
        this.SuctionPump1.Providers = this.SeaChestLowSuctionIntakeValve.Content
            + this.SeaChestHighSuctionIntakeValve.Content;
        this.SuctionPump1.Thick();
        this.SuctionPump2.Providers = this.SeaChestLowSuctionIntakeValve.Content
            + this.SeaChestHighSuctionIntakeValve.Content;
        this.SuctionPump2.Thick();
        this.SwAvailable.Inside = this.AuxPump.Content
            + this.SuctionPump1.Content
            + this.SuctionPump2.Content;
        this.OverboardDumpValve.Source = this.SwAvailable;
        this.FwCoolerDsGen1.CoolingProviders = this.SwAvailable.Inside;
        this.FwCoolerDsGen1.HotCircuitComplete = this.DsGen1LubCooler.hasCooling;
        this.FwCoolerDsGen1.Thick();
        this.FwCoolerDsGen2.CoolingProviders = this.SwAvailable.Inside;
        this.FwCoolerDsGen2.HotCircuitComplete = this.DsGen2LubCooler.hasCooling;
        this.FwCoolerDsGen2.Thick();
        this.SteamCondensor.CoolingProviders = this.SwAvailable.Inside;
        this.SteamCondensor.Thick();
        this.FwExpandTank.Thick();
        // hot side of Fw DsGen 1 cooler is complete  if Lub cooler has cooling (has fresh water)
        this.DsGen1LubCooler.CoolingProviders = this.FwExpandTank.Content;
        this.DsGen1LubCooler.isCooling = this.DsGen1LubCooler.isCooling && this.FwCoolerDsGen1.hasCooling;
        this.DsGen1LubCooler.Thick();
        // hot side of Fw DsGen 2 cooler is complete  if Lub cooler has cooling (has fresh water)
        this.DsGen2LubCooler.CoolingProviders = this.FwExpandTank.Content;
        this.DsGen2LubCooler.isCooling = this.DsGen2LubCooler.isCooling && this.FwCoolerDsGen2.hasCooling;
        this.DsGen2LubCooler.Thick();
    }
}
exports.default = CoolingSystem;
