const { CStCoolantSys } = require('../../src/Cst')
const SwCoolingSys = require('../../src/Systems/SeaWaterCoolingSys')

const dummyEmergencyBus = { Voltage: 440 }
const dummyMainBus = { Voltage: 440 }
let coolantSys
beforeEach(() => {
  coolantSys = new SwCoolingSys(dummyMainBus, dummyEmergencyBus)
})

describe('Init', () => {
  test('Sea chest intake valves are closed', () => {
    const { SeaChestLowSuctionIntakeValve, SeaChestHighSuctionIntakeValve } = coolantSys
    expect(SeaChestLowSuctionIntakeValve.isOpen).toBeFalsy()
    expect(SeaChestHighSuctionIntakeValve.isOpen).toBeFalsy()
    expect(SeaChestLowSuctionIntakeValve.Content()).toBe(0)
    expect(SeaChestHighSuctionIntakeValve.Content()).toBe(0)
  })
  test('Over board dump valve is closed', () => {
    expect(coolantSys.OverboardDumpValve.isOpen).toBeFalsy()
  })
  test('no sea water available', () => {
    expect(coolantSys.SwAvailable).toBe(0)
  })
  test('Aux pump not running, nothing provided', () => {
    expect(coolantSys.AuxPump.isRunning).toBeFalsy()
    expect(coolantSys.AuxPump.Content()).toBe(0)
  })
  test('Suction pump 1 not running, nothing provided', () => {
    expect(coolantSys.SuctionPump1.isRunning).toBeFalsy()
    expect(coolantSys.SuctionPump1.Content()).toBe(0)
  })
  test('Suction pump 2 not running, nothing provided', () => {
    expect(coolantSys.SuctionPump2.isRunning).toBeFalsy()
    expect(coolantSys.SuctionPump2.Content()).toBe(0)
  })
  test('FW cooler diesel generator 1, not cooling', () => {
    const { FwCoolerDsGen1 } = coolantSys
    expect(FwCoolerDsGen1.CoolingInputRate).toBe(CStCoolantSys.FwCoolerDsGen2.coolingRate)
    expect(FwCoolerDsGen1.CoolingProviders).toBe(0)
    expect(FwCoolerDsGen1.hasCooling).toBeFalsy()
    expect(FwCoolerDsGen1.isCooling).toBeFalsy()
  })
})

describe('Sea chests', () => {
  test('Low suction intake valve open = content', () => {
    const { SeaChestLowSuctionIntakeValve } = coolantSys
    SeaChestLowSuctionIntakeValve.Open()
    expect(SeaChestLowSuctionIntakeValve.isOpen).toBeTruthy()
    expect(SeaChestLowSuctionIntakeValve.Content()).toBe(CStCoolantSys.SeaChest)
  })
  test('High suction intake valve open = content', () => {
    const { SeaChestHighSuctionIntakeValve } = coolantSys
    SeaChestHighSuctionIntakeValve.Open()
    expect(SeaChestHighSuctionIntakeValve.Content()).toBe(CStCoolantSys.SeaChest)
  })
})
describe('Suction pumps', () => {
  test('Aux pump with low suction valve open = output is rated', () => {
    const { AuxPump } = coolantSys
    coolantSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    coolantSys.Thick()
    expect(AuxPump.isRunning).toBeTruthy()
    expect(AuxPump.Providers).toBe(CStCoolantSys.SeaChest)
    expect(AuxPump.Content()).toBe(CStCoolantSys.AuxSuctionPump)
    expect(coolantSys.SwAvailable).toBe(CStCoolantSys.AuxSuctionPump)
  })
  test('Suction pump 1 with low suction valve open = output is rated', () => {
    const { SuctionPump1 } = coolantSys
    coolantSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    coolantSys.Thick()
    expect(SuctionPump1.isRunning).toBeTruthy()
    expect(SuctionPump1.Providers).toBe(CStCoolantSys.SeaChest)
    expect(SuctionPump1.Content()).toBe(CStCoolantSys.SuctionPumps)
    expect(coolantSys.SwAvailable).toBe(CStCoolantSys.SuctionPumps)
  })
  test('Suction pump 2 with high suction valve open = output is rated', () => {
    const { SuctionPump2 } = coolantSys
    coolantSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump2.Start()
    coolantSys.Thick()
    expect(SuctionPump2.isRunning).toBeTruthy()
    expect(SuctionPump2.Providers).toBe(CStCoolantSys.SeaChest)
    expect(SuctionPump2.Content()).toBe(CStCoolantSys.SuctionPumps)
    expect(coolantSys.SwAvailable).toBe(CStCoolantSys.SuctionPumps)
  })
  test('Running Suction pump 2, close suction valve  = output zero', () => {
    const { SuctionPump2 } = coolantSys
    coolantSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump2.Start()
    coolantSys.Thick()
    coolantSys.SeaChestHighSuctionIntakeValve.Close()
    coolantSys.Thick()
    expect(SuctionPump2.isRunning).toBeTruthy()
    expect(SuctionPump2.Providers).toBe(0)
    expect(SuctionPump2.Content()).toBe(0)
    expect(coolantSys.SwAvailable).toBe(0)
  })
  test('Suction pump 1 & aux pump running  = output is aux + suction', () => {
    const { SuctionPump1, AuxPump } = coolantSys
    coolantSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    AuxPump.Start()
    coolantSys.Thick()
    expect(coolantSys.SwAvailable).toBe(CStCoolantSys.SuctionPumps + CStCoolantSys.AuxSuctionPump)
  })
})
describe('Coolers', () => {
  describe('FW cooler diesel generator 1', () => {
    test('Aux pump running, low sea suction valve open but over board valve is closed = no cooling', () => {
      const {
        AuxPump, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
      } = coolantSys

      coolantSys.SeaChestLowSuctionIntakeValve.Open()
      AuxPump.Start()
      OverboardDumpValve.Close()
      coolantSys.Thick()
      expect(OverboardDumpValve.isOpen).toBeFalsy()

      expect(FwCoolerDsGen1.hasCooling).toBeFalsy()
      expect(FwCoolerDsGen2.hasCooling).toBeFalsy()
      expect(SteamCondensor.hasCooling).toBeFalsy()
    })
    test('had cooling via high sea chest, SuctionPump1 but closed overboard valve = stop cooling', () => {
      const {
        SuctionPump1, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
      } = coolantSys

      coolantSys.SeaChestLowSuctionIntakeValve.Open()
      SuctionPump1.Start()
      OverboardDumpValve.Open()
      coolantSys.Thick()
      OverboardDumpValve.Close()
      coolantSys.Thick()
      expect(FwCoolerDsGen1.hasCooling).toBeFalsy()
      expect(FwCoolerDsGen2.hasCooling).toBeFalsy()
      expect(SteamCondensor.hasCooling).toBeFalsy()
    })
    test('Aux pump providing cooling for FW dsgen, not to steam condensor', () => {
      const {
        AuxPump, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
      } = coolantSys

      coolantSys.SeaChestLowSuctionIntakeValve.Open()
      AuxPump.Start()
      OverboardDumpValve.Open()
      coolantSys.Thick()
      expect(coolantSys.SwAvailable).toBe(CStCoolantSys.AuxSuctionPump)

      expect(FwCoolerDsGen1.CoolingCircuitComplete).toBeTruthy()
      expect(FwCoolerDsGen1.CoolingProviders).toBe(CStCoolantSys.AuxSuctionPump)
      expect(FwCoolerDsGen1.CheckCoolingRate()).toBeTruthy()
      expect(FwCoolerDsGen1.hasCooling).toBeTruthy()

      expect(FwCoolerDsGen2.hasCooling).toBeTruthy()

      // Aux pump hasn't enough flow for the stream condensor
      expect(SteamCondensor.hasCooling).toBeFalsy()
    })
    test('suction pump 1 providing cooling for FW dsgen AND to steam condensor', () => {
      const {
        SuctionPump1, FwCoolerDsGen1, FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
      } = coolantSys

      coolantSys.SeaChestHighSuctionIntakeValve.Open()
      SuctionPump1.Start()
      OverboardDumpValve.Open()
      coolantSys.Thick()
      expect(coolantSys.SwAvailable).toBe(CStCoolantSys.SuctionPumps)

      expect(FwCoolerDsGen1.hasCooling).toBeTruthy()
      expect(FwCoolerDsGen2.hasCooling).toBeTruthy()
      // suction pump has enough flow for the stream condensor
      expect(SteamCondensor.hasCooling).toBeTruthy()
    })
  })
})
