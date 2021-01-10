"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Simulator_1 = __importDefault(require("../Simulator"));
const Cst_1 = require("../Cst");
let simulator;
beforeEach(() => {
    simulator = new Simulator_1.default();
});
describe.skip('Simulator running tests', () => {
    test('Not running after init', () => {
        expect(simulator.Running).toBeUndefined();
    });
    test('Running after start', done => {
        simulator.Start();
        expect(simulator.Running).not.toBeNull();
        setTimeout(() => {
            // wait for 1 thick
            simulator.Stop();
            done();
        }, Cst_1.CstChanges.Interval);
    });
    test('Not running after stop', () => {
        simulator.Start();
        simulator.Stop();
        expect(simulator.Running).toBeUndefined();
    });
    test('Stop a not running simulator (no crash :)', () => {
        simulator.Stop();
        expect(simulator.Running).toBeUndefined();
    });
    test('Toggle from not running', () => {
        simulator.Toggle();
        expect(simulator.Running).not.toBeUndefined();
    });
    test('Toggle from running', () => {
        simulator.Start();
        simulator.Toggle();
        expect(simulator.Running).toBeUndefined();
    });
});
describe('Fuel sys via simulator start', () => {
    test('Fill diesel storage tank from shore', () => {
        simulator.FuelSys.DsShoreValve.Open();
        simulator.FuelSys.DsStorage.IntakeValve.Open();
        simulator.Thick();
        simulator.Thick();
        expect(simulator.FuelSys.DsStorage.Tank.Content).toBe(Cst_1.CstFuelSys.DsStorageTank.TankAddStep * 2);
    });
});
describe('Diesel generator - Fuel from diesel service tank', () => {
    test('open service outlet valve & DsGen intake valve = has fuel', () => {
        const { PowerSys: { DsGen1 } } = simulator;
        const { FuelSys: { DsService } } = simulator;
        DsService.Tank.Inside = Cst_1.CstFuelSys.DsServiceTank.TankVolume;
        //  expect(DsGen1.FuelIntakeValve.Source).toEqual(DsService.OutletValve)
        DsService.OutletValve.Open();
        expect(DsService.OutletValve.Content).toBe(Cst_1.CstFuelSys.DsServiceTank.TankVolume);
        DsGen1.FuelIntakeValve.Open();
        expect(DsGen1.FuelIntakeValve.Content).toBe(Cst_1.CstFuelSys.DsServiceTank.TankVolume);
        simulator.Thick();
        expect(DsGen1.HasFuel).toBeTruthy();
    });
    test('closed service outlet valve & open  DsGen intake valve = no fuel', () => {
        const { PowerSys: { DsGen1 } } = simulator;
        const { FuelSys: { DsService } } = simulator;
        DsService.Tank.Inside = Cst_1.CstFuelSys.DsServiceTank.TankVolume;
        expect(DsService.OutletValve.isOpen).toBeFalsy();
        expect(DsService.OutletValve.Content).toBe(0);
        DsGen1.FuelIntakeValve.Open();
        expect(DsGen1.FuelIntakeValve.Content).toBe(0);
        simulator.Thick();
        expect(DsGen1.HasFuel).toBeFalsy();
    });
    test('open service outlet valve & closed DsGen intake valve = no fuel', () => {
        const { PowerSys: { DsGen1 } } = simulator;
        const { FuelSys: { DsService } } = simulator;
        DsService.Tank.Inside = Cst_1.CstFuelSys.DsServiceTank.TankVolume;
        DsService.OutletValve.Open();
        expect(DsService.OutletValve.Content).toBe(Cst_1.CstFuelSys.DsServiceTank.TankVolume);
        expect(DsGen1.FuelIntakeValve.isOpen).toBeFalsy();
        expect(DsGen1.FuelIntakeValve.Content).toBe(0);
        simulator.Thick();
        expect(DsGen1.HasFuel).toBeFalsy();
    });
    test('close service outlet valve after both valves where open = no fuel', () => {
        const { PowerSys: { DsGen1 } } = simulator;
        const { FuelSys: { DsService } } = simulator;
        DsService.Tank.Inside = Cst_1.CstFuelSys.DsServiceTank.TankVolume;
        DsService.OutletValve.Open();
        DsGen1.FuelIntakeValve.Open();
        simulator.Thick();
        DsService.OutletValve.Close();
        simulator.Thick();
        expect(DsGen1.HasFuel).toBeFalsy();
    });
    test('close generator intake valve after both valves where open = no fuel', () => {
        const { PowerSys: { DsGen1 } } = simulator;
        const { FuelSys: { DsService } } = simulator;
        DsService.Tank.Inside = Cst_1.CstFuelSys.DsServiceTank.TankVolume;
        DsService.OutletValve.Open();
        DsGen1.FuelIntakeValve.Open();
        simulator.Thick();
        DsGen1.FuelIntakeValve.Close();
        simulator.Thick();
        expect(DsGen1.HasFuel).toBeFalsy();
    });
    test('both valves are open but service tank is empty = generator has no fuel', () => {
        const { PowerSys: { DsGen1 } } = simulator;
        const { FuelSys: { DsService } } = simulator;
        expect(DsService.Tank.Content).toBe(0);
        DsService.OutletValve.Open();
        expect(DsService.OutletValve.Content).toBe(0);
        DsGen1.FuelIntakeValve.Open();
        expect(DsGen1.FuelIntakeValve.Content).toBe(0);
        simulator.Thick();
        expect(DsGen1.HasFuel).toBeFalsy();
    });
});
describe('Diesel generator- Lubrication from Lub storage', () => {
    test('fill slump from storage', () => {
        const { PowerSys: { DsGen1 } } = simulator;
        const { LubSys: { Storage: LubStorage } } = simulator;
        LubStorage.Tank.Inside = Cst_1.CstLubSys.StorageTank.TankVolume;
        LubStorage.OutletValve.Open();
        DsGen1.LubIntakeValve.Open();
        simulator.Thick();
        expect(LubStorage.Tank.RemoveEachStep)
            .toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep / Cst_1.CstLubSys.RatioStorageDsGenSlump);
        expect(DsGen1.LubSlump.AddEachStep)
            .toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
        const expectStorage = Cst_1.CstLubSys.StorageTank.TankVolume
            - Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep / Cst_1.CstLubSys.RatioStorageDsGenSlump;
        expect(LubStorage.Tank.Content).toBe(expectStorage);
        expect(DsGen1.LubSlump.Content).toBe(Cst_1.CstPowerSys.DsGen1.Slump.TankAddStep);
    });
});
describe('Diesel generator- full startup diesel generator, startup power via emergency generator', () => {
    test('with full diesel service tank and lubrication storage tank', () => {
        const { PowerSys: { DsGen1, EmergencyGen, EmergencyBus } } = simulator;
        const { FuelSys: { DsService } } = simulator;
        const { LubSys: { Storage: LubStorage } } = simulator;
        const { AirSys: { EmergencyReceiver, EmergencyCompressor } } = simulator;
        const { CoolingSys: { SeaChestLowSuctionIntakeValve, AuxPump, FwCoolerDsGen1, OverboardDumpValve, FwExpandTank, DsGen1LubCooler } } = simulator;
        // Fuel (fake full diesel service tank)
        DsService.Tank.Inside = Cst_1.CstFuelSys.DsServiceTank.TankVolume;
        DsService.OutletValve.Open();
        DsGen1.FuelIntakeValve.Open();
        simulator.Thick();
        expect(DsGen1.HasFuel).toBeTruthy();
        // Lubrication (fake full lub storage tank)
        LubStorage.Tank.Inside = Cst_1.CstLubSys.StorageTank.TankVolume;
        LubStorage.OutletValve.Open();
        DsGen1.LubIntakeValve.Open();
        // wait until slump is at minmum level
        do {
            simulator.Thick();
        } while (DsGen1.LubSlump.Content <= Cst_1.CstPowerSys.DsGen1.Slump.MinForLubrication);
        expect(DsGen1.HasLubrication).toBeTruthy();
        DsGen1.LubIntakeValve.Close();
        // startup emergency generator
        EmergencyGen.Start();
        simulator.Thick();
        expect(EmergencyBus.Voltage).toBe(Cst_1.CstPowerSys.Voltage);
        // startup emergency start air compressor
        EmergencyCompressor.OutletValve.Open();
        EmergencyReceiver.IntakeValve.Open();
        EmergencyCompressor.Start();
        simulator.Thick();
        expect(EmergencyReceiver.Tank.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        // wait until enough pressure in the emergency receiver to start the diesel generator
        do {
            simulator.Thick();
        } while (EmergencyReceiver.Tank.Content < Cst_1.CstAirSys.DieselGenerator.MinPressure);
        // connect start air
        EmergencyReceiver.OutletValve.Open();
        DsGen1.AirIntakeValve.Open();
        simulator.Thick();
        // Sea water cooling via low suction valve and Aux pump
        SeaChestLowSuctionIntakeValve.Open();
        AuxPump.Start();
        OverboardDumpValve.Open();
        simulator.Thick();
        expect(AuxPump.isRunning).toBeTruthy();
        expect(FwCoolerDsGen1.hasCooling).toBeTruthy();
        // fresh water cooling lub dsgen 1 (fake 50% expand tank)
        FwExpandTank.Inside = 50;
        simulator.Thick();
        expect(DsGen1LubCooler.hasCooling).toBeTruthy();
        expect(DsGen1LubCooler.isCooling).toBeTruthy();
        // startup diesel generator 1
        DsGen1.Start();
        simulator.Thick();
        expect(DsGen1.isRunning).toBeTruthy();
        // running DsGen takes fuel from DsService tank
        expect(DsGen1.FuelConsumption).toBe(Cst_1.CstFuelSys.DieselGenerator.Consumption);
        expect(DsGen1.FuelProvider).toEqual(DsService.Tank);
        expect(DsGen1.FuelProvider.Removing).toBeTruthy();
        expect(DsService.Tank.Removing).toBeTruthy();
        expect(DsService.Tank.RemoveEachStep).toBe(Cst_1.CstFuelSys.DieselGenerator.Consumption);
        expect(DsService.Tank.Content).toBeCloseTo(Cst_1.CstFuelSys.DsServiceTank.TankVolume
            - Cst_1.CstFuelSys.DieselGenerator.Consumption);
        simulator.Thick();
        expect(DsService.Tank.Content).toBeCloseTo(Cst_1.CstFuelSys.DsServiceTank.TankVolume
            - Cst_1.CstFuelSys.DieselGenerator.Consumption * 2);
        simulator.Thick();
        expect(DsService.Tank.Content).toBeCloseTo(Cst_1.CstFuelSys.DsServiceTank.TankVolume
            - Cst_1.CstFuelSys.DieselGenerator.Consumption * 3);
    }, 8000);
});
describe('Sea water system', () => {
    test('Aux pump runs on emergency bus with a suction valve open = aux pump has content', () => {
        const { PowerSys: { EmergencyGen, EmergencyBus } } = simulator;
        const { CoolingSys: { SeaChestLowSuctionIntakeValve, AuxPump } } = simulator;
        EmergencyGen.Start();
        simulator.Thick();
        expect(EmergencyBus.Voltage).toBe(Cst_1.CstPowerSys.Voltage);
        SeaChestLowSuctionIntakeValve.Open();
        AuxPump.Start();
        simulator.Thick();
        expect(AuxPump.isRunning).toBeTruthy();
        expect(AuxPump.Providers).toBe(Cst_1.CstCoolantSys.SeaChest);
        expect(AuxPump.Content).toBe(Cst_1.CstCoolantSys.AuxSuctionPump);
    });
});
