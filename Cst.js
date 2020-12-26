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
    DsStorageOutletValve: 'Diesel storage outlet valve',
    DsServiceIntakeValve: 'Diesel service intake valve',
    DsServiceOutletValve: 'Diesel service outlet valve'
  },
  LubSysTxt: {
    LubShoreFillValve: 'Lubrication shore fill valve',
    LubStorageTank: 'Lubrication storage tank',
    LubStorageOutletValve: 'Lubrication storage outlet valve'
  }
}

const CstBoundaries = {
  PowerSys: {
    Voltage: 440,
    Shore: 10000, // 10kW
    EmergencyGen: {
      RatedFor: 1000 // 1 kW
    },
    DsGen1: {
      RatedFor: 30000 // 30 kW
    }
  }
}

const CstChanges = {
  Interval: 1000
}
const CstLubSys = {
  ShoreVolume: 1000000,
  LubStorageTank: {
    TankVolume: 1000,
    TankAddStep: 100
  }

}
const CstFuelSys = {
  ShoreVolume: 1000000,
  DsStorageTank: {
    TankVolume: 2500,
    TankAddStep: 50
  },
  DsServiceTank: {
    TankVolume: 1000,
    TankAddStep: 10
  },
  DieselGenerator: { Consumption: 1 }
}

module.exports = {
  CstBoundaries,
  CstChanges,
  CstTxt,
  CstFuelSys,
  CstLubSys
}
