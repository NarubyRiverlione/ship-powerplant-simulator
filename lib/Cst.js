"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CstSteamSys = exports.CstCoolantSys = exports.CstAirSys = exports.CstFuelSys = exports.CstLubSys = exports.CstChanges = exports.CstPowerSys = void 0;
exports.CstPowerSys = {
    Voltage: 440,
    Shore: 1000,
    EmergencyGen: {
        RatedFor: 1 // 1 kW
    },
    DsGen1: {
        RatedFor: 1000,
        Slump: {
            TankVolume: 100,
            TankAddStep: 10,
            MinForLubrication: 40
        }
    }
};
exports.CstChanges = {
    Interval: 1000,
    DrainStep: 2
};
exports.CstLubSys = {
    ShoreVolume: 1e6,
    // storage tank is Ratio bigger then slump
    RatioStorageDsGenSlump: 5,
    StorageTank: {
        TankVolume: 100,
        TankAddStep: 1
    }
};
exports.CstFuelSys = {
    ShoreVolume: 1e6,
    // storage tank is Ratio bigger then service tank
    RatioStorageServiceTanks: 10,
    DsStorageTank: {
        TankVolume: 100,
        TankAddStep: 1
    },
    DsServiceTank: {
        TankVolume: 100,
        TankAddStep: 1
    },
    DieselGenerator: { Consumption: 0.05 }
};
exports.CstAirSys = {
    StartAirCompressor1: {
        AddStep: 1
    },
    EmergencyCompressor: {
        AddStep: 1
    },
    StartAirReceiver1: {
        TankPressure: 100
    },
    EmergencyReceiver: {
        TankPressure: 100
    },
    DieselGenerator: { MinPressure: 80 }
};
exports.CstCoolantSys = {
    SeaChest: 1e6,
    AuxSuctionPump: 1200,
    SuctionPumps: 10000,
    FwCoolerDsGen1: { coolingRate: 1000 },
    FwCoolerDsGen2: { coolingRate: 1000 },
    SteamCondensor: { coolingRate: 5000 },
    FwMakeUp: 1e6,
    FwExpandTank: {
        TankVolume: 100,
        TankAddStep: 1
    },
    DsGenLubCooler: { coolingRate: 10 }
};
exports.CstSteamSys = {
    FeedWaterSupply: {
        TankVolume: 100,
        TankAddStep: 5
    },
    FeedWaterPump: 10,
    Boiler: {
        WaterVolume: 100,
        StartTemp: 25,
        OperatingTemp: 200,
        TempAddStep: 2,
        MinWaterLvlForFlame: 20
    }
};
