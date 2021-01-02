const CstTxt = {
  SimulationTxt: {
    Stopped: 'Simulation not running',
    Started: 'Simulation is running'
  },
  PowerTxt: {
    DieselGen1: 'Diesel generator 1',
    EmergencyGen: 'Emergency genertor',
    DsGen1_FuelIntake: 'Diesel generator 1 - fuel intake valve'
  },
  FuelSysTxt: {
    DsStorageTank: 'Diesel storage tank',
    DsServiceTank: 'Diesel service tank',
    DsShoreFillValve: 'Diesel shore fill valve',
    DsStorageOutletValve: 'Diesel storage - outlet valve',
    DsServiceIntakeValve: 'Diesel service - intake valve',
    DsServiceOutletValve: 'Diesel service - outlet valve'
  },
  LubSysTxt: {
    LubShoreFillValve: 'Lubrication shore fill valve',
    LubStorageTank: 'Lubrication storage tank',
    LubStorageOutletValve: 'Lubrication storage outlet valve'
  },
  AirSysTxt: {
    StartAirReceiver1: 'Start air receiver 1',
    StartAirReceiver2: 'Start air receiver 2',
    EmergencyReceiver: 'Emergency  start air receiver',
    EmergencyCompressor: 'Emergency compressor',
    Compressor1: 'Start air compressor 1'
  },
  CoolantSysTxt: {
    LowSuctionIntakeValve: 'Low suction Sea Chest intake valve ',
    HighSuctionIntakeValve: 'High suction Sea Chest intake valve ',
    OverboardDumpValve: 'Over board dump valve',
    AuxSuctionPump: 'Sea water Auxiliary suction pump',
    SuctionPump1: 'Sea water Suction pump 1',
    SuctionPump2: 'Sea water Suction pump 2',
    FwCoolerDsGen1: 'Fresh water cooler diesel generator 1',
    FwCoolerDsGen2: 'Fresh water cooler diesel generator 2',
    SteamCondensor: 'Steam condensor',
    FwIntakeValve: 'Fresh water expand tank intake valve',
    FwDrainValve: 'Fresh water expand tank drain valve',
    FwExpandTank: 'Fresh water expand tank',
    DsGen1LubCooler: 'Diesel generator 1 lubrication cooler',
    DsGen2LubCooler: 'Diesel generator 2 lubrication cooler'
  },
  DieselGeneratorTxt: {
    FuelIntakeValve: ' - fuel intake valve',
    LubIntakeValve: ' - lubrication intake valve',
    AirIntakeValve: ' - Air intake valve',
    LubSlump: 'slump'
  }
}

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
  DrainStep: 1
}
const CstLubSys = {
  ShoreVolume: 1e6,
  // storage tank is Ratio bigger then slump
  RatioStorageDsGenSlump: 5,
  StorageTank: {
    TankVolume: 100,
    TankAddStep: 10
  }
}
const CstFuelSys = {
  ShoreVolume: 1e6,
  // storage tank is Ratio bigger then service tank
  RatioStorageServiceTanks: 10,
  DsStorageTank: {
    TankVolume: 100,
    TankAddStep: 10,
    DrainStep: 10
  },
  DsServiceTank: {
    TankVolume: 100,
    TankAddStep: 10
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
    TankAddStep: 1,
    DrainStep: 1
  },
  DsGenLubCooler: { coolingRate: 10 }

}

module.exports = {
  CstPowerSys,
  CstChanges,
  CstTxt,
  CstFuelSys,
  CstLubSys,
  CstAirSys,
  CstCoolantSys
}
