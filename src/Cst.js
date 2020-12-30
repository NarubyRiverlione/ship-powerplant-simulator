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
    AirReceiver1: 'Start air receiver 1',
    AirReceiver2: 'Start air receiver 1',
    EmergencyReceiver: 'Emergency  start air receiver',
    EmergencyCompressor: 'Emergency compressor'
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
    FwExpandTank: 'Fresh water expand tank',
    DsGenLubCooler: 'Diesel generator 1 lubrication cooler'
  }
}

const CstPowerSys = {
  Voltage: 440,
  Shore: 1000, // 1 kW
  EmergencyGen: {
    RatedFor: 200 // 200 W
  },
  DsGen1: {
    RatedFor: 1000 // 1 kW
  }
}

const CstChanges = {
  Interval: 1000,
  DrainStep: 10
}
const CstLubSys = {
  ShoreVolume: 1e6,
  StorageTank: {
    TankVolume: 100,
    TankAddStep: 10
  }
}
const CstFuelSys = {
  ShoreVolume: 1e6,
  DsStorageTank: {
    TankVolume: 100,
    TankAddStep: 10,
    DrainStep: 10
  },
  DsServiceTank: {
    TankVolume: 100,
    TankAddStep: 10
  },
  DieselGenerator: { Consumption: 1 }
}
const CstAirSys = {
  Compressor1: {
    AddStep: 10
  },
  EmergencyCompressor: {
    AddStep: 10
  },
  StartAirReceiver1: {
    TankPressure: 5
  },
  EmergencyReceiver: {
    TankPressure: 100
  },
  DieselGenerator: { MinPressure: 2 }
}
const CStCoolantSys = {
  SeaChest: 1e6,
  AuxSuctionPump: 1200,
  SuctionPumps: 10000,
  FwCoolerDsGen1: { coolingRate: 1000 },
  FwCoolerDsGen2: { coolingRate: 1000 },
  SteamCondensor: { coolingRate: 5000 },
  FwMakeUp: 1e6,
  FwExpandTank: {
    TankVolume: 100,
    TankAddStep: 10,
    DrainStep: 10
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
  CStCoolantSys
}
