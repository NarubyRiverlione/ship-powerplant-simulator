"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AirSystem_1 = __importDefault(require("../../Systems/AirSystem"));
const Cst_1 = require("../../Cst");
const mockPowerBus_1 = __importDefault(require("../mocks/mockPowerBus"));
let airSys;
const dummyMainBus = new mockPowerBus_1.default('dummy main bus');
dummyMainBus.Voltage = 440;
const dummyEmergencyBus = new mockPowerBus_1.default('dummy emergency bus');
dummyEmergencyBus.Voltage = 440;
beforeEach(() => {
    airSys = new AirSystem_1.default(dummyMainBus, dummyEmergencyBus);
});
describe('Init', () => {
    test('Compressor 1 air receiver is empty', () => {
        expect(airSys.StartAirReceiver1.Tank.Content).toBe(0);
        expect(airSys.StartAirReceiver1.IntakeValve.isOpen).toBeFalsy();
        expect(airSys.StartAirReceiver1.OutletValve.isOpen).toBeFalsy();
        expect(airSys.StartAirReceiver1.Tank.Volume).toBe(Cst_1.CstAirSys.StartAirReceiver1.TankPressure);
    });
    test('Compressor 1 compressor not running', () => {
        expect(airSys.StartAirCompressor1.isRunning).toBeFalsy();
        expect(airSys.StartAirCompressor1.Content).toBe(0);
    });
    test('Compressor 1 outlet valve closed, source set as emergency compressor', () => {
        expect(airSys.StartAirCompressor1.OutletValve.isOpen).toBeFalsy();
        expect(airSys.StartAirCompressor1.OutletValve.Source.Content)
            .toBe(airSys.StartAirCompressor1.Content);
    });
    test('Emergency air receiver is empty', () => {
        expect(airSys.EmergencyReceiver.Tank.Content).toBe(0);
        expect(airSys.EmergencyReceiver.IntakeValve.isOpen).toBeFalsy();
        expect(airSys.EmergencyReceiver.OutletValve.isOpen).toBeFalsy();
        expect(airSys.EmergencyReceiver.Tank.Volume).toBe(Cst_1.CstAirSys.EmergencyReceiver.TankPressure);
    });
    test('Emergency compressor not running', () => {
        expect(airSys.EmergencyCompressor.isRunning).toBeFalsy();
        expect(airSys.EmergencyCompressor.Content).toBe(0);
    });
    test('Emergency outlet valve closed, source set as emergency compressor', () => {
        expect(airSys.EmergencyCompressor.OutletValve.isOpen).toBeFalsy();
        expect(airSys.EmergencyCompressor.OutletValve.Source).toEqual(airSys.EmergencyCompressor);
    });
});
describe('Emergency compressor', () => {
    test('Open compressor outlet valve & intake valve but not running = not filling receiver', () => {
        expect(airSys.EmergencyCompressor.Content).toBe(0);
        airSys.EmergencyCompressor.OutletValve.Close();
        airSys.EmergencyReceiver.IntakeValve.Close();
        airSys.Thick();
        expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(0);
        expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(0);
        expect(airSys.EmergencyReceiver.Tank.Adding).toBeFalsy();
        expect(airSys.EmergencyReceiver.Tank.Content).toBe(0);
    });
    test('Open compressor outlet valve &  running but closed intake valve = not filling receiver', () => {
        airSys.EmergencyCompressor.Start();
        airSys.EmergencyCompressor.OutletValve.Open();
        airSys.Thick();
        expect(airSys.EmergencyCompressor.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        airSys.EmergencyReceiver.IntakeValve.Close();
        airSys.Thick();
        expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(0);
        expect(airSys.EmergencyReceiver.Tank.Adding).toBeFalsy();
        expect(airSys.EmergencyReceiver.Tank.Content).toBe(0);
    });
    test('open intake valve & running but closed compressor outlet valve = not filling receiver', () => {
        airSys.EmergencyReceiver.IntakeValve.Open();
        airSys.EmergencyCompressor.Start();
        airSys.EmergencyCompressor.OutletValve.Close();
        airSys.Thick();
        expect(airSys.EmergencyCompressor.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(0);
        expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(0);
        expect(airSys.EmergencyReceiver.Tank.Adding).toBeFalsy();
        expect(airSys.EmergencyReceiver.Tank.Content).toBe(0);
    });
    test('first open inlet receiver, then outlet compressor = fill receiver', () => {
        airSys.EmergencyReceiver.IntakeValve.Open();
        airSys.EmergencyCompressor.OutletValve.Open();
        airSys.EmergencyCompressor.Start();
        airSys.Thick();
        expect(airSys.EmergencyCompressor.isRunning).toBeTruthy();
        expect(airSys.EmergencyReceiver.Tank.Adding).toBeTruthy();
        expect(airSys.EmergencyReceiver.Tank.AddEachStep).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyReceiver.Tank.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
    });
    test('Open compressor outlet valve & intake valve and running = fill receiver  ', () => {
        airSys.EmergencyCompressor.Start();
        airSys.Thick();
        expect(airSys.EmergencyCompressor.isRunning).toBeTruthy();
        expect(airSys.EmergencyCompressor.RatedFor).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyCompressor.Output).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyCompressor.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        airSys.EmergencyCompressor.OutletValve.Open();
        airSys.Thick();
        expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        airSys.EmergencyReceiver.IntakeValve.Open();
        airSys.Thick();
        expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyReceiver.Tank.Adding).toBeTruthy();
        expect(airSys.EmergencyReceiver.Tank.AddEachStep).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
        expect(airSys.EmergencyReceiver.Tank.Content).toBe(Cst_1.CstAirSys.EmergencyCompressor.AddStep);
    });
});
describe('Start air compressor 1', () => {
    test('Open compressor outlet valve & intake valve but not running = not filling receiver', () => {
        expect(airSys.StartAirCompressor1.Content).toBe(0);
        airSys.StartAirCompressor1.OutletValve.Close();
        airSys.StartAirReceiver1.IntakeValve.Close();
        airSys.Thick();
        expect(airSys.StartAirCompressor1.OutletValve.Content).toBe(0);
        expect(airSys.StartAirReceiver1.IntakeValve.Content).toBe(0);
        expect(airSys.StartAirReceiver1.Tank.Adding).toBeFalsy();
        expect(airSys.StartAirReceiver1.Tank.Content).toBe(0);
    });
    test('Open compressor outlet valve &  running but closed intake valve = not filling receiver', () => {
        airSys.StartAirCompressor1.Start();
        airSys.StartAirCompressor1.OutletValve.Open();
        airSys.Thick();
        expect(airSys.StartAirCompressor1.Content).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        expect(airSys.StartAirCompressor1.OutletValve.Content).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        airSys.StartAirReceiver1.IntakeValve.Close();
        airSys.Thick();
        expect(airSys.StartAirReceiver1.IntakeValve.Content).toBe(0);
        expect(airSys.StartAirReceiver1.Tank.Adding).toBeFalsy();
        expect(airSys.StartAirReceiver1.Tank.Content).toBe(0);
    });
    test('open intake valve & running but closed compressor outlet valve = not filling receiver', () => {
        airSys.StartAirReceiver1.IntakeValve.Open();
        airSys.StartAirCompressor1.Start();
        airSys.StartAirCompressor1.OutletValve.Close();
        airSys.Thick();
        expect(airSys.StartAirCompressor1.Content).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        expect(airSys.StartAirCompressor1.OutletValve.Content).toBe(0);
        expect(airSys.StartAirReceiver1.IntakeValve.Content).toBe(0);
        expect(airSys.StartAirReceiver1.Tank.Adding).toBeFalsy();
        expect(airSys.StartAirReceiver1.Tank.Content).toBe(0);
    });
    test('Open outlet valve & running = fill receiver', () => {
        airSys.StartAirCompressor1.Start();
        airSys.Thick();
        expect(airSys.StartAirCompressor1.isRunning).toBeTruthy();
        expect(airSys.StartAirCompressor1.RatedFor).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        expect(airSys.StartAirCompressor1.Output).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        expect(airSys.StartAirCompressor1.Content).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        airSys.StartAirCompressor1.OutletValve.Open();
        airSys.Thick();
        expect(airSys.StartAirCompressor1.OutletValve.Content).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        airSys.StartAirReceiver1.IntakeValve.Open();
        airSys.Thick();
        expect(airSys.StartAirReceiver1.IntakeValve.Content).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        expect(airSys.StartAirReceiver1.Tank.Adding).toBeTruthy();
        expect(airSys.StartAirReceiver1.Tank.AddEachStep).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        expect(airSys.StartAirReceiver1.Tank.Content).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
    });
    test('first open inlet receiver, then outlet compressor = fill receiver', () => {
        airSys.StartAirReceiver1.IntakeValve.Open();
        airSys.StartAirCompressor1.OutletValve.Open();
        airSys.StartAirCompressor1.Start();
        airSys.Thick();
        expect(airSys.StartAirCompressor1.isRunning).toBeTruthy();
        expect(airSys.StartAirReceiver1.Tank.Adding).toBeTruthy();
        expect(airSys.StartAirReceiver1.Tank.AddEachStep).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
        expect(airSys.StartAirReceiver1.Tank.Content).toBe(Cst_1.CstAirSys.StartAirCompressor1.AddStep);
    });
});
