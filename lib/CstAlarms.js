"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlarmLevel = exports.AlarmDescription = exports.AlarmCode = void 0;
exports.AlarmCode = {
    LowDsStorageTank: 1,
    EmptyDsStorageTank: 2,
    LowDsServiceTank: 3,
    EmptyDsServiceTank: 4,
    LowLubStorageTank: 5,
    EmptyLubStorageTank: 6
};
exports.AlarmDescription = {
    [exports.AlarmCode.LowDsStorageTank]: 'Diesel storage tank level is low',
    [exports.AlarmCode.EmptyDsStorageTank]: 'Diesel storage tank is empty',
    [exports.AlarmCode.LowDsServiceTank]: 'Diesel service tank level is low',
    [exports.AlarmCode.EmptyDsServiceTank]: 'Diesel service tank is empty',
    [exports.AlarmCode.LowLubStorageTank]: 'Lubrication storage tank level is low',
    [exports.AlarmCode.EmptyLubStorageTank]: 'Lubrication storage  tank is empty'
};
exports.AlarmLevel = {
    FuelSys: {
        LowDsStorage: 25,
        LowDsService: 25
    },
    LubSys: {
        LowStorage: 25
    }
};
