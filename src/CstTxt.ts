export default {
  SimulationTxt: {
    Stopped: 'Simulation not running',
    Started: 'Simulation is running',
    StartConditionsTxt: {
      SetFuelTanksFull: 'Full fuel tanks',
      SetLubTanksFull: 'Full lubrication tank',
      SetEmergencyStartAir: 'Emergency start air available',
      SetEmergencyPower: 'Emergency power available',
      SetSeawaterCoolingAuxRunning: 'Sea water cooling via aux. pump',
      SetFreshwaterCooling: 'Fresh water cooling available',
      RunningDsGen1: 'Diesel generator 1 is providing power for the main bus',
      Undefined: 'Unknown start condition: '
    }
  },
  PowerTxt: {
    ShoreBreaker: 'Shore breaker',
    MainBreaker1: 'Main bus 1 breaker',
    MainBus1: 'Main bus 1',
    EmergencyBus: 'Emergency bus',
    DsGenBreaker: 'Breaker diesel generator',
    EmergencyGen: 'Emergency genertor',
    DieselGen: 'Diesel generator',
    DsGen_FuelIntake: 'Diesel generator - fuel intake valve'
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
    FwCoolerDsGen: 'Fresh water cooler diesel generator 1',
    FwCoolerStartAir: 'Fresh water cooler start air',
    SteamCondensor: 'Steam condensor',
    FwIntakeValve: 'Fresh water expand tank intake valve',
    FwDrainValve: 'Fresh water expand tank drain valve',
    FwExpandTank: 'Fresh water expand tank',
    DsGenLubCooler: 'Diesel generator  lubrication cooler',
    StartAirCooler: 'Start air cooler',
    FwPumpDsGen: 'Fresh water pump diesel generator cooler',
    FwPumpStartAir: 'Fresh water pump start air cooler'
  },
  DieselGeneratorTxt: {
    FuelIntakeValve: ' - fuel intake valve',
    LubIntakeValve: ' - lubrication intake valve',
    AirIntakeValve: ' - Air intake valve',
    LubSlump: 'slump'
  },
  SteamSysTxt: {
    FeedWaterSupply: 'Feed water supply',
    FeedWaterPump: 'Feed water pump',
    FuelPump: 'Fuel pump',
    FuelSourceValve: 'Fuel source valve',
    Boiler: {
      Name: 'Oil fired boiler',
      WaterIntakeValve: 'Water intake valve',
      WaterDrainValve: 'Water drain valve',
      FuelIntakeValve: 'Fuel intake valve',
      MainSteamValve: 'Main steam valve'
    }
  }
}
