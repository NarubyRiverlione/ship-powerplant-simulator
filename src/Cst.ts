export const CstChanges = {
  Interval: 1000,
  DrainStep: 2
}
export const CstPowerSys = {
  Voltage: 440,
  Shore: 1000, // 10 kW
  EmergencyGen: {
    RatedFor: 1 // 1 kW
  },
  DsGen: {
    RatedFor: 1000, // 10 kW
    Slump: {
      TankVolume: 100,
      TankAddStep: 10,
      MinForLubrication: 40
    }
  }
}
export const CstLubSys = {
  ShoreVolume: 1e6,
  // storage tank is Ratio bigger then slump
  RatioStorageDsGenSlump: 5,
  StorageTank: {
    TankVolume: 100,
    TankAddStep: 1
  }
}
export const CstFuelSys = {
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
  DieselGenerator: { Consumption: { Diesel: 0.05, } },
  SteamBoiler: { Consumption: 0.1 }
}
export const CstAirSys = {
  StartAirCompressor1: {
    AddStep: 0.5
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
  DieselGenerator: { StarAirConsumption: 60 }
}
export const CstCoolantSys = {
  SeaChest: 1e6,
  AuxSuctionPump: 1200,
  SuctionPumps: 10000,
  FwMakeUp: 1e6,
  FwExpandTank: {
    TankVolume: 100,
    TankAddStep: 1,
    MinForCooling: 25
  },
  FwPumpDsGen: 1000,
  FwPumpStartAir: 2000

}
export const CstSteamSys = {
  FeedWaterSupply: {
    TankVolume: 100,
    TankAddStep: 5
  },
  FeedWaterPump: 2,
  FuelPump: 10,
  Boiler: {
    WaterVolume: 100,
    StartTemp: 25,

    OperatingTemp: 166,
    OperatingPressure: 7.179,

    SafetyTemp: 182,
    SafetyPressure: 10,
    WaterLossBySafetyRelease: 5,
    TempLossBySafetyRelease: 1,

    TempAddStep: 0.5,
    TempCoolingStep: 0.3,

    TempVentLoss: 0.1,
    WaterVentLoss: 1,

    MinWaterLvlForFlame: 30,
    WaterLossByNotCoolingSteam: 2,

    AutoEnableZone: 2 // temp zone + and - operation temp where auto can be enabled
  }
}
export const CstStartConditions = {
  SetFuelTanksFull: 'SetFuelTanksFull',
  SetLubTanksFull: 'SetLubTanksFull',
  SetEmergencyStartAir: 'SetEmergencyStartAir',
  SetEmergencyPower: 'SetEmergencyPower',
  SetSeawaterCoolingAuxRunning: 'SetSeawaterCoolingAuxRunning',
  SetFreshwaterCooling: 'SetFreshwaterCooling',
  RunningDsGen1: 'RunningDsGen1',
  SeaWaterCoolingSupplyPump1Running: 'SeaWaterCoolingSupplyPump1Running',
  BoilerOperational: 'BoilerOperational',
  BoilerDeliversSteam: 'BoilerDeliversSteam'
}