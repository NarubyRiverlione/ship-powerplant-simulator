const CstPowerSys = {
  Voltage: 440,
  Shore: 1000, // 10 kW
  EmergencyGen: {
    RatedFor: 1 // 1 kW
  },
  DsGen1: {
    RatedFor: 1000, // 10 kW
    Slump: {
      TankVolume: 100,
      TankAddStep: 10,
      MinForLubrication: 40
    }
  }
}

const CstChanges = {
  Interval: 1000,
  DrainStep: 2
}
const CstLubSys = {
  ShoreVolume: 1e6,
  // storage tank is Ratio bigger then slump
  RatioStorageDsGenSlump: 5,
  StorageTank: {
    TankVolume: 100,
    TankAddStep: 1
  }
}
const CstFuelSys = {
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
}
const CstAirSys = {
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
}
const CstCoolantSys = {
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

}

module.exports = {
  CstPowerSys,
  CstChanges,
  CstFuelSys,
  CstLubSys,
  CstAirSys,
  CstCoolantSys
}
