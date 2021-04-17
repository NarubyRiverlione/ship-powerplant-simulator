export const CstChanges = {
  Interval: 1000,
  DrainRatio: 20  // how many step it takes to drain a tank (drain valve volume = tankvolume / drainratio)
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
      IntakeValveVolume: 10,
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
    IntakeValveVolume: 1
  }
}
export const CstFuelSys = {
  ShoreVolume: 1e6,
  DsStorageTank: {
    TankVolume: 2000,
    IntakeValveVolume: 100
  },
  DsHandpumpVolume: 5,
  DsServiceTank: {
    TankVolume: 100,
    IntakeValveVolume: 10
  },
  BypassValveVolume: 0.5,
  Purification: { Volume: 1, SteamNeeded: 4 },
  DieselGenerator: { Consumption: { Diesel: 0.1 } },
  SteamBoiler: { Consumption: { Diesel: 0.5 } },
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
    IntakeValveVolume: 5,
    MinForCooling: 30
  },
  FwPumpDsGen: 1000,
  FwPumpStartAir: 2000

}
export const CstSteamSys = {
  FeedWaterSupply: {
    TankVolume: 100,
    IntakeValveVolume: 5
  },
  FeedWaterPump: 1,
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
    WaterLossByNotCoolingSteam: 0.5,

    AutoEnableZone: 2, // temp zone + and - operation temp where auto can be enabled

    StartExpandTemp: 80, // water expands by heat
    EndExpandTemp: 99,
    ExpandRate: 1
  },
  MinPressureForMainValve: 2
}
export const CstStartConditions = {
  ColdAndDark: 'ColdAndDark',
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
