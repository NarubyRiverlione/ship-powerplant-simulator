"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ElectricPump_1 = __importDefault(require("../../Components/ElectricPump"));
const PowerBus_1 = __importDefault(require("../../Components/PowerBus"));
const ratedFor = 6916;
const testBus = new PowerBus_1.default('dummy bus');
let pump;
beforeEach(() => {
    testBus.Voltage = 440;
    pump = new ElectricPump_1.default('test', testBus, ratedFor);
});
describe('Init', () => {
    test('set possible output', () => {
        expect(pump.RatedFor).toBe(ratedFor);
    });
    test('no output', () => {
        expect(pump.Output).toBe(0);
        expect(pump.Content).toBe(0);
    });
});
describe('output', () => {
    test('not running pump  = zero output', () => {
        pump.Thick();
        expect(pump.isRunning).toBeFalsy();
        expect(pump.Output).toBe(0);
        expect(pump.Content).toBe(0);
    });
    test('running pump without provides = not running, zero output', () => {
        pump.Start();
        pump.Thick();
        expect(pump.isRunning).toBeFalsy();
        expect(pump.Output).toBe(0);
        expect(pump.Content).toBe(0);
    });
    test('running pump with provides > rated = output is limited to rated', () => {
        pump.Providers = 123456789;
        pump.Start();
        pump.Thick();
        expect(pump.isRunning).toBeTruthy();
        expect(pump.Output).toBe(ratedFor);
        expect(pump.Content).toBe(ratedFor);
    });
    test('running pump with provides < rated = output is limited to provided', () => {
        const input = 42;
        pump.Providers = input;
        pump.Start();
        pump.Thick();
        expect(pump.isRunning).toBeTruthy();
        expect(pump.Output).toBe(input);
        expect(pump.Content).toBe(input);
    });
});
