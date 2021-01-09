"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mobx_1 = require("mobx");
const Cst_1 = require("../Cst");
const Generator_1 = __importDefault(require("../Components/Generator"));
const DieselGenerator_1 = __importDefault(require("../Components/DieselGenerator"));
const Breaker_1 = __importDefault(require("../Components/Breaker"));
const PowerBus_1 = __importDefault(require("../Components/PowerBus"));
const Tank_1 = __importDefault(require("../Components/Tank"));
/*
** Switchboard **
Diesel generator 1 -->  Breaker DsGen 1
                                  |         ShoreBreaker <-- Shore
                                  |                |       |-<--- Emergency generator
==== PROVIDERS  ============================================
                        |                     | (switch)
                   MainBreaker1               |
                        |                   Emergency Bus
                        |
                    MainBus1
                        |

** Diesel generator 1 **
-- (Diesel service tank) ----------->-- Diesel oil intake valve
-- (Emergency start air receiver) -->-- Start air intake valve (mim start up)
-- (Lubrication service tank) ------>-- Lubrication intake valve -->-- Slump (min level)
-- (Lubrication cooler DsGen 1) ---->--
*/
class PowerSystem {
    constructor(DsGen1FuelValve, DsGen1LubValve, DsGen1AirValve, LubCooler) {
        this.Providers = 0; // sum of all providers, can be connected to main busses
        //  Shore power
        this.ShoreBreaker = new Breaker_1.default('Shore breaker');
        this.ShoreBreaker.Providers = Cst_1.CstPowerSys.Shore;
        this.ShoreBreaker.RatedFor = Cst_1.CstPowerSys.Shore + 2000; // TODO use case rated for in breaker?
        // Mainbus & breaker
        this.MainBreaker1 = new Breaker_1.default('Main bus 1 breaker');
        this.MainBus1 = new PowerBus_1.default('Main bus 1');
        //  Emergency Generator
        this.EmergencyBus = new PowerBus_1.default('Emergency bus');
        // TODO emergency generator needs fuel ?
        const dummyEmergencyFuel = new Tank_1.default('dummy emergency fuel', 1e6, 1e6);
        this.EmergencyGen = new Generator_1.default('Emergency generator', Cst_1.CstPowerSys.EmergencyGen.RatedFor, dummyEmergencyFuel);
        // emergency generator doesn't need cooling nor lubrication
        this.EmergencyGen.HasCooling = true;
        this.EmergencyGen.HasLubrication = true;
        this.EmergencyGen.HasFuel = true;
        // Diesel Generator 1
        this.DsGen1 = new DieselGenerator_1.default('Diesel generator 1', Cst_1.CstPowerSys.DsGen1.RatedFor, DsGen1FuelValve, DsGen1LubValve, DsGen1AirValve, LubCooler);
        this.DsGen1.FuelConsumption = Cst_1.CstFuelSys.DieselGenerator.Consumption;
        this.DsGenBreaker1 = new Breaker_1.default('Breaker diesel generator 1 ');
        mobx_1.makeAutoObservable(this);
    }
    ConnectShore() {
        this.ShoreBreaker.Close();
        this.Providers += this.ShoreBreaker.Providers;
        // if connected to shore, stop emergency generators
        this.EmergencyGen.Stop();
    }
    DisconnectShore() {
        this.ShoreBreaker.Open();
        this.Providers -= this.ShoreBreaker.Providers;
    }
    Thick() {
        // already connected to Shore  and start emergency generator --> emergency generator trips
        if (!this.ShoreBreaker.isOpen && this.EmergencyGen.isRunning)
            this.EmergencyGen.Stop();
        // DsGen is running and breaker is closed and start emergency generator --> emergency generator trips
        if (this.DsGen1.isRunning && !this.DsGenBreaker1.isOpen && this.EmergencyGen.isRunning)
            this.EmergencyGen.Stop();
        // DsGen is stopped --> trip generator breaker
        if (!this.DsGen1.isRunning && !this.DsGenBreaker1.isOpen)
            this.DsGenBreaker1.Open();
        // Check generators
        this.EmergencyGen.Thick();
        this.DsGen1.Thick();
        // #region Providers
        /* Also recalculate Providers form zero  */
        // emergency generator connect to Providers
        this.Providers = this.EmergencyGen.isRunning ? this.EmergencyGen.Output : 0;
        // shore connects to Providers
        this.Providers += this.ShoreBreaker.isOpen ? 0 : Cst_1.CstPowerSys.Shore;
        // breaker diesel generator 1 connect to Providers
        this.Providers += this.DsGenBreaker1.isOpen ? 0 : this.DsGen1.Output;
        // emergency bus takes from shore or emergency generator
        // TODO takes also for diesel generator(s)
        this.EmergencyBus.Providers = this.Providers;
        this.EmergencyBus.Thick();
        // #endregion
        //  main breaker is connected to Provides
        this.MainBreaker1.Providers = this.Providers;
        this.MainBreaker1.Thick(); // check if main breaker is tripped
        // main bus is connected to main breaker
        this.MainBus1.Providers = this.MainBreaker1.isOpen ? 0 : this.MainBreaker1.Providers;
        this.MainBus1.Thick(); // check if mainBus has voltage
    }
}
exports.default = PowerSystem;
