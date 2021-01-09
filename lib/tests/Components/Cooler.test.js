"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cooler_1 = __importDefault(require("../../Components/Cooler"));
const coolingRate = 123;
let cooler;
beforeEach(() => {
    cooler = new Cooler_1.default('test cooler', coolingRate);
});
describe('Init', () => {
    test('does\'t have cooling', () => {
        expect(cooler.hasCooling).toBeFalsy();
        expect(cooler.isCooling).toBeFalsy();
        expect(cooler.Content).toBe(0);
    });
    test('Cooling input rate', () => {
        expect(cooler.CoolingInputRate).toBe(coolingRate);
    });
    test('no hot circuit ', () => {
        expect(cooler.HotCircuitComplete).toBeFalsy();
    });
    test('no cool circuit', () => {
        expect(cooler.CoolingCircuitComplete).toBeFalsy();
    });
});
describe('Cooling rate checks', () => {
    test('Cooling input > cooling rate = is cooling', () => {
        const coolInput = 789;
        cooler.CoolingProviders = coolInput;
        expect(cooler.CheckCoolingRate).toBeTruthy();
    });
    test('Cooling input < cooling rate = no cooling', () => {
        const coolInput = 122;
        cooler.CoolingProviders = coolInput;
        expect(cooler.CheckCoolingRate).toBeFalsy();
    });
});
describe('Has cooling', () => {
    test('Circuit ok & providers > rate =  has cooling', () => {
        cooler.CoolingCircuitComplete = true;
        cooler.CoolingProviders = 456;
        cooler.Thick();
        expect(cooler.hasCooling).toBeTruthy();
    });
    test('Circuit ok & providers < rae = has no cooling', () => {
        cooler.CoolingCircuitComplete = true;
        cooler.CoolingProviders = 2;
        cooler.Thick();
        expect(cooler.hasCooling).toBeFalsy();
    });
    test('Circuit nok & providers > rate = has no cooling', () => {
        cooler.CoolingCircuitComplete = false;
        cooler.CoolingProviders = 2895;
        cooler.Thick();
        expect(cooler.hasCooling).toBeFalsy();
    });
    test('Circuit nok & providers < rate = has no cooling', () => {
        cooler.CoolingCircuitComplete = false;
        cooler.CoolingProviders = 56;
        cooler.Thick();
        expect(cooler.hasCooling).toBeFalsy();
    });
});
describe('Is cooling', () => {
    test('has cooling but no hot circuit = not cooling', () => {
        cooler.CoolingProviders = 546;
        cooler.Thick();
        expect(cooler.isCooling).toBeFalsy();
    });
    test('hot circuit but no has no cooling = not cooling', () => {
        cooler.HotCircuitComplete = true;
        cooler.CoolingCircuitComplete = false;
        cooler.Thick();
        expect(cooler.isCooling).toBeFalsy();
    });
    test('has cooling and hot circuit = cooling', () => {
        cooler.CoolingProviders = 127;
        cooler.HotCircuitComplete = true;
        cooler.CoolingCircuitComplete = true;
        cooler.Thick();
        expect(cooler.isCooling).toBeTruthy();
        expect(cooler.Content).toBe(1);
    });
    test('not enough cooling and hot circuit = not cooling', () => {
        cooler.CoolingProviders = 7;
        cooler.HotCircuitComplete = true;
        cooler.CoolingCircuitComplete = true;
        cooler.Thick();
        expect(cooler.hasCooling).toBeFalsy();
        expect(cooler.isCooling).toBeFalsy();
    });
});
