const CstTxt = {
  SimulationTxt: {
    Stopped: 'Simulation not running',
    Started: 'Simulation is running'
  },
  PowerTxt: {
    // Connected: 'connected',
    // Disconnected: 'disconnected',
    // Running: 'running',
    // NotRunning: 'not running'
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
    EmergencyReceiver: 'Emergency  start air receiver'

  }
}

const CstBoundaries = {
  PowerSys: {
    Voltage: 440,
    Shore: 1000, // 1 kW
    EmergencyGen: {
      RatedFor: 200 // 200 W
    },
    DsGen1: {
      RatedFor: 1000 // 1 kW
    }
  }
}

const CstChanges = {
  Interval: 1000,
  DrainStep: 10
}
const CstLubSys = {
  ShoreVolume: 1000000,
  StorageTank: {
    TankVolume: 100,
    TankAddStep: 10
  }
}
const CstFuelSys = {
  ShoreVolume: 1000000,
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
  Compress1: {
    AddStep: 0.1,
    Volume: 100
  },
  EmergencyCompress: {
    AddStep: 0.1,
    Volume: 100
  },
  AirReceiver1: {
    TankVolume: 100
  },
  DieselGenerator: { MinPressure: 2 }
}

module.exports = {
  CstBoundaries,
  CstChanges,
  CstTxt,
  CstFuelSys,
  CstLubSys,
  CstAirSys
}
