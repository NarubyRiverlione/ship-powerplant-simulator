"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PowerBus_1 = __importDefault(require("../../Components/PowerBus"));
const Cst_1 = require("../../Cst");
describe('Init', () => {
    test('init', () => {
        const testBus = new PowerBus_1.default('testbus');
        testBus.Thick();
        expect(testBus.Name).toBe('testbus');
        expect(testBus.Voltage).toBe(0);
        expect(testBus.Providers).toBe(0);
    });
});
describe('Voltage', () => {
    test('Provider --> voltage', () => {
        const testBus = new PowerBus_1.default('test bus');
        testBus.Providers = 1000;
        testBus.Thick();
        expect(testBus.Voltage).toBe(Cst_1.CstPowerSys.Voltage);
    });
    test('Remove provider --> voltage =0 ', () => {
        const testBus = new PowerBus_1.default('test bus');
        testBus.Providers = 1000;
        testBus.Thick();
        testBus.Providers = 0;
        testBus.Thick();
        expect(testBus.Voltage).toBe(0);
    });
});
