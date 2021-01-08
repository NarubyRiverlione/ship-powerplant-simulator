"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mockPowerBus_1 = __importDefault(require("../mocks/mockPowerBus"));
const Compressor_1 = __importDefault(require("../../Components/Compressor"));
let comp;
const ratedFor = 13568;
beforeEach(() => {
    const testBus = new mockPowerBus_1.default('test bus');
    testBus.Voltage = ratedFor;
    comp = new Compressor_1.default('test', testBus, ratedFor);
});
describe('Init', () => {
    test('set possible output', () => {
        expect(comp.RatedFor).toBe(ratedFor);
    });
    test('no output', () => {
        expect(comp.Output).toBe(0);
        expect(comp.Content).toBe(0);
    });
    test('outlet valve is closed', () => {
        expect(comp.OutletValve.isOpen).toBeFalsy();
        expect(comp.OutletValve.Content).toBe(0);
    });
});
describe('running', () => {
    test('running compressor has rated output', () => {
        comp.Start();
        expect(comp.isRunning).toBeTruthy();
        comp.Thick();
        expect(comp.Output).toBe(ratedFor);
        expect(comp.Content).toBe(ratedFor);
    });
    test('stop a running compressor = no output', () => {
        comp.Start();
        expect(comp.isRunning).toBeTruthy();
        comp.Thick();
        comp.Stop();
        comp.Thick();
        expect(comp.Output).toBe(0);
        expect(comp.Content).toBe(0);
    });
    test('running compressor lost power =no output', () => {
        comp.Start();
        expect(comp.isRunning).toBeTruthy();
        comp.Thick();
        comp.Bus.Voltage = 0;
        comp.Thick();
        expect(comp.isRunning).toBeFalsy();
        expect(comp.Output).toBe(0);
        expect(comp.Content).toBe(0);
    });
});
describe('output via outlet valve', () => {
    test('running + closed outlet = valve has no content', () => {
        comp.Start();
        expect(comp.isRunning).toBeTruthy();
        comp.Thick();
        expect(comp.OutletValve.Content).toBe(0);
    });
    test('running + open outlet = valve has  content', () => {
        comp.Start();
        expect(comp.isRunning).toBeTruthy();
        comp.OutletValve.Open();
        comp.Thick();
        expect(comp.OutletValve.Content).toBe(ratedFor);
    });
    test('not running + open outlet, then running = valve has  content', () => {
        comp.OutletValve.Open();
        comp.Thick();
        comp.Start();
        comp.Thick();
        expect(comp.isRunning).toBeTruthy();
        expect(comp.OutletValve.Content).toBe(ratedFor);
    });
});
