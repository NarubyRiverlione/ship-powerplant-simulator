const { CstCoolantSys, CstChanges } = require('../../src/Cst')
const CoolingSys = require('../../src/Systems/CoolingSys')

const dummyEmergencyBus = { Voltage: 440 }
const dummyMainBus = { Voltage: 440 }
let coolingSys
beforeEach(() => {
  coolingSys = new CoolingSys(dummyMainBus, dummyEmergencyBus)
})

describe('Init', () => {
  test('Sea chest intake valves are closed', () => {
    const { SeaChestLowSuctionIntakeValve, SeaChestHighSuctionIntakeValve } = coolingSys
    expect(SeaChestLowSuctionIntakeValve.isOpen).toBeFalsy()
    expect(SeaChestHighSuctionIntakeValve.isOpen).toBeFalsy()
    expect(SeaChestLowSuctionIntakeValve.Content).toBe(0)
    expect(SeaChestHighSuctionIntakeValve.Content).toBe(0)
  })
  test('Over board dump valve is closed', () => {
    expect(coolingSys.OverboardDumpValve.isOpen).toBeFalsy()
  })
  test('no sea water available', () => {
    expect(coolingSys.SwAvailable).toBe(0)
  })
  test('Aux pump not running, nothing provided', () => {
    expect(coolingSys.AuxPump.isRunning).toBeFalsy()
    expect(coolingSys.AuxPump.Content).toBe(0)
  })
  test('Suction pump 1 not running, nothing provided', () => {
    expect(coolingSys.SuctionPump1.isRunning).toBeFalsy()
    expect(coolingSys.SuctionPump1.Content).toBe(0)
  })
  test('Suction pump 2 not running, nothing provided', () => {
    expect(coolingSys.SuctionPump2.isRunning).toBeFalsy()
    expect(coolingSys.SuctionPump2.Content).toBe(0)
  })
  test('FW cooler diesel generator 2, not cooling', () => {
    const { FwCoolerDsGen2 } = coolingSys
    expect(FwCoolerDsGen2.CoolingInputRate).toBe(CstCoolantSys.FwCoolerDsGen2.coolingRate)
    expect(FwCoolerDsGen2.CoolingProviders).toBe(0)
    expect(FwCoolerDsGen2.hasCooling).toBeFalsy()
    expect(FwCoolerDsGen2.isCooling).toBeFalsy()
  })
  test('Steam conderser, not cooling', () => {
    const { SteamCondensor } = coolingSys
    expect(SteamCondensor.CoolingInputRate).toBe(CstCoolantSys.SteamCondensor.coolingRate)
    expect(SteamCondensor.CoolingProviders).toBe(0)
    expect(SteamCondensor.hasCooling).toBeFalsy()
    expect(SteamCondensor.isCooling).toBeFalsy()
  })
  test('FW cooler diesel generator 1, not cooling', () => {
    const { FwCoolerDsGen1 } = coolingSys
    expect(FwCoolerDsGen1.CoolingInputRate).toBe(CstCoolantSys.FwCoolerDsGen2.coolingRate)
    expect(FwCoolerDsGen1.CoolingProviders).toBe(0)
    expect(FwCoolerDsGen1.hasCooling).toBeFalsy()
    expect(FwCoolerDsGen1.isCooling).toBeFalsy()
  })
  test('FW expand tank is empty', () => {
    expect(coolingSys.FwExpandTank.Content).toBe(0)
  })
  test('Fw expand tank intake valve is closed', () => {
    expect(coolingSys.FwIntakeValve.isOpen).toBeFalsy()
  })
  test('Fw expand tank drain valve  is closed', () => {
    expect(coolingSys.FwDrainValve.isOpen).toBeFalsy()
  })
})

describe('Sea chests', () => {
  test('Low suction intake valve open = content', () => {
    const { SeaChestLowSuctionIntakeValve } = coolingSys
    SeaChestLowSuctionIntakeValve.Open()
    expect(SeaChestLowSuctionIntakeValve.isOpen).toBeTruthy()
    expect(SeaChestLowSuctionIntakeValve.Content).toBe(CstCoolantSys.SeaChest)
  })
  test('High suction intake valve open = content', () => {
    const { SeaChestHighSuctionIntakeValve } = coolingSys
    SeaChestHighSuctionIntakeValve.Open()
    expect(SeaChestHighSuctionIntakeValve.Content).toBe(CstCoolantSys.SeaChest)
  })
})
describe('Suction pumps', () => {
  test('Aux pump with low suction valve open = output is rated', () => {
    const { AuxPump } = coolingSys
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    coolingSys.Thick()
    expect(AuxPump.isRunning).toBeTruthy()
    expect(AuxPump.Providers).toBe(CstCoolantSys.SeaChest)
    expect(AuxPump.Content).toBe(CstCoolantSys.AuxSuctionPump)
    expect(coolingSys.SwAvailable).toBe(CstCoolantSys.AuxSuctionPump)
  })
  test('Suction pump 1 with low suction valve open = output is rated', () => {
    const { SuctionPump1 } = coolingSys
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    coolingSys.Thick()
    expect(SuctionPump1.isRunning).toBeTruthy()
    expect(SuctionPump1.Providers).toBe(CstCoolantSys.SeaChest)
    expect(SuctionPump1.Content).toBe(CstCoolantSys.SuctionPumps)
    expect(coolingSys.SwAvailable).toBe(CstCoolantSys.SuctionPumps)
  })
  test('Suction pump 2 with high suction valve open = output is rated', () => {
    const { SuctionPump2 } = coolingSys
    coolingSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump2.Start()
    coolingSys.Thick()
    expect(SuctionPump2.isRunning).toBeTruthy()
    expect(SuctionPump2.Providers).toBe(CstCoolantSys.SeaChest)
    expect(SuctionPump2.Content).toBe(CstCoolantSys.SuctionPumps)
    expect(coolingSys.SwAvailable).toBe(CstCoolantSys.SuctionPumps)
  })
  test('Running Suction pump 2, close suction valve  = stop running, output zero', () => {
    const { SuctionPump2 } = coolingSys
    coolingSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump2.Start()
    coolingSys.Thick()
    coolingSys.SeaChestHighSuctionIntakeValve.Close()
    coolingSys.Thick()
    expect(SuctionPump2.isRunning).toBeFalsy()
    expect(SuctionPump2.Providers).toBe(0)
    expect(SuctionPump2.Content).toBe(0)
    expect(coolingSys.SwAvailable).toBe(0)
  })
  test('Suction pump 1 & aux pump running  = output is aux + suction', () => {
    const { SuctionPump1, AuxPump } = coolingSys
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    AuxPump.Start()
    coolingSys.Thick()
    expect(coolingSys.SwAvailable).toBe(CstCoolantSys.SuctionPumps + CstCoolantSys.AuxSuctionPump)
  })
})

describe('Over board valve', () => {
  test('Aux pump running, low sea suction valve open but over board valve is closed = no cooling', () => {
    const {
      AuxPump, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Close()
    coolingSys.Thick()
    expect(OverboardDumpValve.isOpen).toBeFalsy()

    expect(FwCoolerDsGen1.hasCooling).toBeFalsy()
    expect(FwCoolerDsGen2.hasCooling).toBeFalsy()
    expect(SteamCondensor.hasCooling).toBeFalsy()
  })
  test('Had cooling via high sea chest & SuctionPump1 but now closing overboard valve = stop cooling', () => {
    const {
      SuctionPump1, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    OverboardDumpValve.Close()
    coolingSys.Thick()
    expect(FwCoolerDsGen1.hasCooling).toBeFalsy()
    expect(FwCoolerDsGen2.hasCooling).toBeFalsy()
    expect(SteamCondensor.hasCooling).toBeFalsy()
  })
})
describe('Aux pump', () => {
  test('Aux pump providing cooling for FW dsgen, not to steam condensor', () => {
    const {
      AuxPump, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(coolingSys.SwAvailable).toBe(CstCoolantSys.AuxSuctionPump)

    expect(FwCoolerDsGen1.CoolingCircuitComplete).toBeTruthy()
    expect(FwCoolerDsGen1.CoolingProviders).toBe(CstCoolantSys.AuxSuctionPump)
    expect(FwCoolerDsGen1.CheckCoolingRate()).toBeTruthy()
    expect(FwCoolerDsGen1.hasCooling).toBeTruthy()

    expect(FwCoolerDsGen2.hasCooling).toBeTruthy()

    // Aux pump hasn't enough flow for the stream condensor
    expect(SteamCondensor.hasCooling).toBeFalsy()
  })
})
describe('Suction pumps ', () => {
  test('Suction pump 1 providing cooling for FW dsgen AND to steam condensor', () => {
    const {
      SuctionPump1, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump1.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(coolingSys.SwAvailable).toBe(CstCoolantSys.SuctionPumps)

    expect(FwCoolerDsGen1.hasCooling).toBeTruthy()
    expect(FwCoolerDsGen2.hasCooling).toBeTruthy()
    // suction pump has enough flow for the stream condensor
    expect(SteamCondensor.hasCooling).toBeTruthy()
  })
  test('Suction pump 2 providing cooling for FW dsgen AND to steam condensor', () => {
    const {
      SuctionPump2, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump2.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(coolingSys.SwAvailable).toBe(CstCoolantSys.SuctionPumps)

    expect(FwCoolerDsGen1.hasCooling).toBeTruthy()
    expect(FwCoolerDsGen2.hasCooling).toBeTruthy()
    // suction pump has enough flow for the stream condensor
    expect(SteamCondensor.hasCooling).toBeTruthy()
  })
})

describe('Fresh water expand tank', () => {
  test('fill expand tank by open the intake valve', () => {
    coolingSys.FwIntakeValve.Open()
    coolingSys.Thick()
    expect(coolingSys.FwExpandTank.Content).toBe(CstCoolantSys.FwExpandTank.TankAddStep)
  })
  test('closing intake valve, stop filling expand tank', () => {
    coolingSys.FwIntakeValve.Open()
    coolingSys.Thick()
    expect(coolingSys.FwExpandTank.Content).toBe(CstCoolantSys.FwExpandTank.TankAddStep)
    coolingSys.FwIntakeValve.Close()
    coolingSys.Thick()
    expect(coolingSys.FwExpandTank.Content).toBe(CstCoolantSys.FwExpandTank.TankAddStep)
  })
  test('Drain expand tank', () => {
    const startContent = 60
    coolingSys.FwExpandTank.Inside = startContent
    coolingSys.FwDrainValve.Open()
    coolingSys.Thick()
    expect(coolingSys.FwExpandTank.Content).toBe(startContent - CstChanges.DrainStep)

    coolingSys.FwDrainValve.Close()
    coolingSys.Thick()
    expect(coolingSys.FwExpandTank.Content).toBe(startContent - CstChanges.DrainStep)
  })
})

describe('Diesel gen 1 lubrication cooler', () => {
  test('Fresh water available = hs cooling', () => {
    const { DsGen1LubCooler } = coolingSys
    const FwContent = 50
    coolingSys.FwExpandTank.Inside = FwContent
    coolingSys.Thick()
    expect(DsGen1LubCooler.CoolingProviders).toBe(FwContent)
    expect(DsGen1LubCooler.CheckCoolingRate()).toBeTruthy()
    expect(DsGen1LubCooler.CoolingCircuitComplete).toBeTruthy()
    expect(DsGen1LubCooler.hasCooling).toBeTruthy()
  })
  test('has cooling +  Fw cooler is cooling', () => {
    const {
      AuxPump, FwCoolerDsGen1, OverboardDumpValve, DsGen1LubCooler
    } = coolingSys
    // setup Fw cooler
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(FwCoolerDsGen1.hasCooling).toBeTruthy()
    // setup Lub cooler
    const FwContent = 50
    coolingSys.FwExpandTank.Inside = FwContent
    coolingSys.Thick()
    expect(DsGen1LubCooler.hasCooling).toBeTruthy()

    coolingSys.Thick()
    expect(FwCoolerDsGen1.HotCircuitComplete).toBeTruthy()
    expect(FwCoolerDsGen1.isCooling).toBeTruthy()
    expect(DsGen1LubCooler.isCooling).toBeTruthy()
  })
})
describe('Diesel gen 2 lubrication cooler', () => {
  test('Fresh water available = hs cooling', () => {
    const { DsGen2LubCooler } = coolingSys
    const FwContent = 50
    coolingSys.FwExpandTank.Inside = FwContent
    coolingSys.Thick()
    expect(DsGen2LubCooler.CoolingProviders).toBe(FwContent)
    expect(DsGen2LubCooler.CheckCoolingRate()).toBeTruthy()
    expect(DsGen2LubCooler.CoolingCircuitComplete).toBeTruthy()
    expect(DsGen2LubCooler.hasCooling).toBeTruthy()
  })
  test('has cooling +  Fw cooler is cooling', () => {
    const {
      AuxPump, FwCoolerDsGen2, OverboardDumpValve, DsGen2LubCooler
    } = coolingSys
    // setup Fw cooler
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(FwCoolerDsGen2.hasCooling).toBeTruthy()
    // setup Lub cooler
    const FwContent = 50
    coolingSys.FwExpandTank.Inside = FwContent
    coolingSys.Thick()
    expect(DsGen2LubCooler.hasCooling).toBeTruthy()

    coolingSys.Thick()
    expect(FwCoolerDsGen2.HotCircuitComplete).toBeTruthy()
    expect(FwCoolerDsGen2.isCooling).toBeTruthy()
    expect(DsGen2LubCooler.isCooling).toBeTruthy()
  })
})
