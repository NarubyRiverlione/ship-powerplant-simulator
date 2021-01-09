"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DieselGenerator_1 = __importDefault(require("../../Components/DieselGenerator"));
const mockTank_1 = __importDefault(require("../mocks/mockTank"));
const mockValve_1 = __importDefault(require("../mocks/mockValve"));
const mockCooler_1 = __importDefault(require("../mocks/mockCooler"));
const Cst_1 = require("../../Cst");
const Rated = 30000;
const startFuelAmount = 10.0;
const startLubAmount = 60.0;
const startAirAmount = Cst_1.CstAirSys.DieselGenerator.MinPressure;
let dsgen;
beforeEach(() => {
    const fuelSource = new mockTank_1.default('dummy fuel tank', 100, startFuelAmount);
    const dummyFuelOutletValve = new mockValve_1.default('test fuel source outlet valve', fuelSource);
    const lubSource = new mockTank_1.default('dummy lub  tank', 100, startLubAmount);
    const dummyLubOutletValve = new mockValve_1.default('test lub source outlet valve', lubSource);
    const airSource = new mockTank_1.default('dummy air receiver', 100, startAirAmount);
    const dummyAirOutletValve = new mockValve_1.default('test air source valve', airSource);
    const dummyLubCooler = new mockCooler_1.default('dummy cooler', 1);
    dummyLubCooler.isCooling = true;
    dsgen = new DieselGenerator_1.default('test diesel generator', Rated, dummyFuelOutletValve, dummyLubOutletValve, dummyAirOutletValve, dummyLubCooler);
    dsgen.FuelConsumption = Cst_1.CstFuelSys.DieselGenerator.Consumption;
});
describe('init', () => {
    test('generator not running, requisites are not met', () => {
        expect(dsgen.RatedFor).toBe(Rated);
        expect(dsgen.Output).toBe(0);
        expect(dsgen.isRunning).toBeFalsy();
        expect(dsgen.HasFuel).toBeFalsy();
        expect(dsgen.HasCooling).toBeFalsy();
        expect(dsgen.HasLubrication).toBeFalsy();
    });
    test('Fuel intake valve closed at start', () => {
        expect(dsgen.FuelIntakeValve.Source.Content).toBe(startFuelAmount);
        expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy();
        // expect(dsgen.FuelProvider).toEqual(fuelSource)
        expect(dsgen.FuelConsumption).toBe(Cst_1.CstFuelSys.DieselGenerator.Consumption);
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(0);
    });
    test('Lubrication intake valve closed at start', () => {
        expect(dsgen.LubIntakeValve.Source.Content).toBe(startLubAmount);
        expect(dsgen.LubIntakeValve.isOpen).toBeFalsy();
        // expect(dsgen.LubProvider).toEqual(lubSource)
    });
    test('Air intake valve closed at start', () => {
        expect(dsgen.AirIntakeValve.Source.Content).toBe(startAirAmount);
        expect(dsgen.AirIntakeValve.isOpen).toBeFalsy();
        // expect(dsgen.AirProvider).toEqual(airSource)
    });
    test('Empty slump', () => {
        expect(dsgen.LubSlump.Content).toBe(0);
    });
});
describe('Slump', () => {
    test('Open lub intake = slump adding, remove from Lub provider', () => {
        dsgen.LubIntakeValve.Open();
        dsgen.Thick();
        expect(dsgen.LubSlump.AddEachStep).toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
        expect(dsgen.LubSlump.Content).toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
        expect(dsgen.LubProvider.RemoveEachStep)
            .toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep / Cst_1.CstLubSys.RatioStorageDsGenSlump);
    });
    test('Re-close lub intake = slump stop adding', () => {
        dsgen.LubIntakeValve.Open();
        dsgen.Thick();
        expect(dsgen.LubProvider.RemoveEachStep)
            .toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep / Cst_1.CstLubSys.RatioStorageDsGenSlump);
        dsgen.LubIntakeValve.Close();
        dsgen.Thick();
        expect(dsgen.LubSlump.Content).toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
        expect(dsgen.LubProvider.RemoveEachStep).toBe(0);
        expect(dsgen.LubSlump.AddEachStep).toBe(0);
    });
    test('Lub source is empty, stop adding slump', () => {
        dsgen.LubProvider = new mockTank_1.default('dummy', 100, Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
        dsgen.LubIntakeValve.Open();
        dsgen.Thick();
        expect(dsgen.LubSlump.AddEachStep).toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
        expect(dsgen.LubSlump.Content).toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
        // dummy test source  hasn't logic to remove content, set manual to 0
        dsgen.LubIntakeValve.Source = new mockTank_1.default('dummy', 100, 0);
        expect(dsgen.LubIntakeValve.Source.Content).toBe(0);
        dsgen.Thick();
        expect(dsgen.LubSlump.AddEachStep).toBe(0);
        expect(dsgen.LubSlump.Content).toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
        dsgen.Thick();
        expect(dsgen.LubSlump.AddEachStep).toBe(0);
        expect(dsgen.LubSlump.Content).toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
    });
    test('slump above minimum = has lubrication', () => {
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.Thick();
        expect(dsgen.HasLubrication).toBeTruthy();
    });
});
describe('Start', () => {
    test('closed fuel & lubrication valves & no air = cannot start', () => {
        expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy();
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeFalsy();
        expect(dsgen.HasFuel).toBeFalsy();
        expect(dsgen.HasLubrication).toBeFalsy();
        // expect(dsgen.HasCooling).toBeFalsy()
    });
    test('closed fuel intake, has lubrication valve & no air  = cannot start', () => {
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.HasLubrication).toBeTruthy();
        // expect(dsgen.HasCooling).toBeFalsy()
        expect(dsgen.isRunning).toBeFalsy();
        expect(dsgen.HasFuel).toBeFalsy();
    });
    test('open fuel intake, closed lubrication valve & no air  = cannot start', () => {
        dsgen.FuelIntakeValve.Open();
        dsgen.Thick();
        expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy();
        expect(dsgen.FuelIntakeValve.Content).toBe(startFuelAmount);
        expect(dsgen.HasFuel).toBeTruthy();
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeFalsy();
        expect(dsgen.HasLubrication).toBeFalsy();
    });
    test('open fuel valve & has lubrication & min air  = can start = consumes fuel', () => {
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.FuelIntakeValve.Open();
        dsgen.Thick();
        expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy();
        expect(dsgen.FuelIntakeValve.Content).toBe(startFuelAmount);
        expect(dsgen.HasFuel).toBeTruthy();
        dsgen.LubIntakeValve.Open();
        dsgen.Thick();
        expect(dsgen.LubIntakeValve.Content).toBe(startLubAmount);
        expect(dsgen.HasLubrication).toBeTruthy();
        dsgen.AirIntakeValve.Open();
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeTruthy();
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(Cst_1.CstFuelSys.DieselGenerator.Consumption);
    });
    test('running and no fuel  = stop', () => {
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.FuelIntakeValve.Open();
        dsgen.LubIntakeValve.Open();
        dsgen.AirIntakeValve.Open();
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeTruthy();
        const emptyFuelSource = new mockTank_1.default('empty tank', 100, 0);
        const emptyFuelValve = new mockValve_1.default('dummy', emptyFuelSource);
        dsgen.FuelIntakeValve = emptyFuelValve;
        dsgen.Thick();
        expect(dsgen.isRunning).toBeFalsy();
        expect(dsgen.HasFuel).toBeFalsy();
        expect(emptyFuelSource.RemoveEachStep).toBe(0);
        // expect(dsgen.FuelProvider.RemoveEachStep).toBe(0)
    });
    test('running and open fuel valve = stop', () => {
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.FuelIntakeValve.Open();
        dsgen.AirIntakeValve.Open();
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeTruthy();
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(Cst_1.CstFuelSys.DieselGenerator.Consumption);
        dsgen.FuelIntakeValve.Close();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeFalsy();
        expect(dsgen.HasFuel).toBeFalsy();
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(0);
    });
    test('running and not enough lubrication valve = stop', () => {
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.FuelIntakeValve.Open();
        dsgen.AirIntakeValve.Open();
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.LubSlump.Content).toBe(Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication);
        expect(dsgen.isRunning).toBeTruthy();
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(Cst_1.CstFuelSys.DieselGenerator.Consumption);
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication - 1;
        dsgen.Thick();
        expect(dsgen.LubSlump.Content).toBe(Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication - 1);
        expect(dsgen.isRunning).toBeFalsy();
        expect(dsgen.HasLubrication).toBeFalsy();
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(0);
    });
    test('running no air = keep running as air is only needed to start', () => {
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.FuelIntakeValve.Open();
        dsgen.AirIntakeValve.Open();
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeTruthy();
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(Cst_1.CstFuelSys.DieselGenerator.Consumption);
        dsgen.AirIntakeValve.Close();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeTruthy();
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(Cst_1.CstFuelSys.DieselGenerator.Consumption);
    });
    test('fuel & lubrication but to less air = cannot start', () => {
        dsgen.FuelIntakeValve.Open();
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.AirIntakeValve.Source = new mockTank_1.default('dummy', 100, Cst_1.CstAirSys.DieselGenerator.MinPressure - 0.1);
        dsgen.AirIntakeValve.Open();
        dsgen.Start();
        dsgen.Thick();
        expect(dsgen.isRunning).toBeFalsy();
        expect(dsgen.FuelProvider.RemoveEachStep).toBe(0);
    });
    test('without cooling = cannot start', () => {
        dsgen.LubCooler.isCooling = false;
        dsgen.Start();
        expect(dsgen.isRunning).toBeFalsy();
    });
    test('running and stop cooling = stop generator', () => {
        dsgen.FuelIntakeValve.Open();
        dsgen.AirIntakeValve.Open();
        dsgen.LubSlump.Inside = Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication;
        dsgen.Start();
        expect(dsgen.isRunning).toBeTruthy();
        dsgen.LubCooler.isCooling = false;
        dsgen.Thick();
        expect(dsgen.isRunning).toBeFalsy();
    });
});
