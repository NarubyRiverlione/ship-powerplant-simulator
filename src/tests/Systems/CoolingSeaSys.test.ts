import MockPowerBus from '../mocks/MockPowerBus'
import { CstCoolantSys } from '../../Constants/Cst'
import CoolingSeaSystem from '../../Systems/CoolingSeaWaterSystem'

const dummyEmergencyBus = new MockPowerBus('dummy emergency bus')
dummyEmergencyBus.Voltage = 440
const dummyMainBus = new MockPowerBus('dummy main bus')
dummyMainBus.Voltage = 440

let coolingSeaSys: CoolingSeaSystem
beforeEach(() => {
  coolingSeaSys = new CoolingSeaSystem(dummyMainBus, dummyEmergencyBus)
})

describe('Init', () => {
  test('Sea chest intake valves are closed', () => {
    const { SeaChestLowSuctionIntakeValve, SeaChestHighSuctionIntakeValve } = coolingSeaSys
    expect(SeaChestLowSuctionIntakeValve.isOpen).toBeFalsy()
    expect(SeaChestHighSuctionIntakeValve.isOpen).toBeFalsy()
    expect(SeaChestLowSuctionIntakeValve.Content).toBe(0)
    expect(SeaChestHighSuctionIntakeValve.Content).toBe(0)
  })
  test('Over board dump valve is closed', () => {
    expect(coolingSeaSys.OverboardDumpValve.isOpen).toBeFalsy()
  })
  test('no sea water available', () => {
    expect(coolingSeaSys.SwAvailable.Inside).toBe(0)
  })
  test('Aux pump not running, nothing provided', () => {
    expect(coolingSeaSys.AuxPump.isRunning).toBeFalsy()
    expect(coolingSeaSys.AuxPump.Content).toBe(0)
  })
  test('Suction pump 1 not running, nothing provided', () => {
    expect(coolingSeaSys.SuctionPump1.isRunning).toBeFalsy()
    expect(coolingSeaSys.SuctionPump1.Content).toBe(0)
  })
  test('Suction pump 2 not running, nothing provided', () => {
    expect(coolingSeaSys.SuctionPump2.isRunning).toBeFalsy()
    expect(coolingSeaSys.SuctionPump2.Content).toBe(0)
  })
  test('FW cooler start air, not cooling', () => {
    const { FwCoolerStartAir } = coolingSeaSys
    expect(FwCoolerStartAir.IsCooling).toBeFalsy()
  })
  test('Steam conderser, not cooling', () => {
    const { SteamCondensor } = coolingSeaSys
    expect(SteamCondensor.IsCooling).toBeFalsy()
  })
  test('FW cooler diesel generator, not cooling', () => {
    const { FwCoolerDsGen } = coolingSeaSys
    expect(FwCoolerDsGen.IsCooling).toBeFalsy()
  })
})

describe('Sea chests', () => {
  test('Low suction intake valve open = content', () => {
    const { SeaChestLowSuctionIntakeValve } = coolingSeaSys
    SeaChestLowSuctionIntakeValve.Open()
    expect(SeaChestLowSuctionIntakeValve.isOpen).toBeTruthy()
    expect(SeaChestLowSuctionIntakeValve.Content).toBe(CstCoolantSys.SeaChest)
  })
  test('High suction intake valve open = content', () => {
    const { SeaChestHighSuctionIntakeValve } = coolingSeaSys
    SeaChestHighSuctionIntakeValve.Open()
    expect(SeaChestHighSuctionIntakeValve.Content).toBe(CstCoolantSys.SeaChest)
  })
  test('sea water over board valve has no content', () => {
    expect(coolingSeaSys.OverboardDumpValve.Content).toBe(0)
    expect(coolingSeaSys.OverboardDumpValve.isOpen).toBeFalsy()
  })
})
describe('Suction pumps', () => {
  test('Aux pump with low suction valve open = output is rated', () => {
    const { AuxPump } = coolingSeaSys
    coolingSeaSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    coolingSeaSys.Thick()
    expect(AuxPump.isRunning).toBeTruthy()
    expect(AuxPump.Providers).toBe(CstCoolantSys.SeaChest)
    expect(AuxPump.Content).toBe(CstCoolantSys.AuxSuctionPump)
    expect(coolingSeaSys.SwAvailable.Inside).toBe(CstCoolantSys.AuxSuctionPump)
  })
  test('Suction pump 1 with low suction valve open = output is rated', () => {
    const { SuctionPump1 } = coolingSeaSys
    coolingSeaSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    coolingSeaSys.Thick()
    expect(SuctionPump1.isRunning).toBeTruthy()
    expect(SuctionPump1.Providers).toBe(CstCoolantSys.SeaChest)
    expect(SuctionPump1.Content).toBe(CstCoolantSys.SuctionPumps)
    expect(coolingSeaSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps)
  })
  test('Suction pump 2 with high suction valve open = output is rated', () => {
    const { SuctionPump2 } = coolingSeaSys
    coolingSeaSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump2.Start()
    coolingSeaSys.Thick()
    expect(SuctionPump2.isRunning).toBeTruthy()
    expect(SuctionPump2.Providers).toBe(CstCoolantSys.SeaChest)
    expect(SuctionPump2.Content).toBe(CstCoolantSys.SuctionPumps)
    expect(coolingSeaSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps)
  })
  test('Running Suction pump 2, close suction valve  = stop running, output zero', () => {
    const { SuctionPump2 } = coolingSeaSys
    coolingSeaSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump2.Start()
    coolingSeaSys.Thick()
    coolingSeaSys.SeaChestHighSuctionIntakeValve.Close()
    coolingSeaSys.Thick()
    expect(SuctionPump2.isRunning).toBeFalsy()
    expect(SuctionPump2.Providers).toBe(0)
    expect(SuctionPump2.Content).toBe(0)
    expect(coolingSeaSys.SwAvailable.Inside).toBe(0)
  })
  test('Suction pump 1 & aux pump running  = output is aux + suction', () => {
    const { SuctionPump1, AuxPump } = coolingSeaSys
    coolingSeaSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    AuxPump.Start()
    coolingSeaSys.Thick()
    expect(coolingSeaSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps + CstCoolantSys.AuxSuctionPump)
  })
})
describe('Over board valve', () => {
  test('over board vale open but no pump running = valve has no content', () => {
    const { OverboardDumpValve } = coolingSeaSys
    OverboardDumpValve.Open()
    coolingSeaSys.Thick()
    expect(OverboardDumpValve.Content).toBe(0)
  })
  test('over board vale open and aux pump running = valve has  content', () => {
    const {
      OverboardDumpValve, AuxPump, SeaChestLowSuctionIntakeValve, FwCoolerDsGen,
    } = coolingSeaSys
    OverboardDumpValve.Open()
    SeaChestLowSuctionIntakeValve.Open()
    coolingSeaSys.Thick()
    AuxPump.Start()
    coolingSeaSys.Thick()
    expect(AuxPump.isRunning).toBeTruthy()
    expect(AuxPump.Content).toBe(CstCoolantSys.AuxSuctionPump)
    expect(OverboardDumpValve.Content).toBe(CstCoolantSys.AuxSuctionPump)
    expect(FwCoolerDsGen.CoolCircuitComplete).toBeTruthy()
  })
  test('Aux pump running, low sea suction valve open but over board valve is closed = not cooling', () => {
    const {
      AuxPump, FwCoolerDsGen, FwCoolerStartAir, OverboardDumpValve, SteamCondensor,
    } = coolingSeaSys

    coolingSeaSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Close()
    coolingSeaSys.Thick()
    expect(OverboardDumpValve.isOpen).toBeFalsy()
    expect(OverboardDumpValve.Content).toBe(0)

    expect(FwCoolerDsGen.CoolCircuitComplete).toBeFalsy()
    expect(FwCoolerStartAir.CoolCircuitComplete).toBeFalsy()
    expect(SteamCondensor.CoolCircuitComplete).toBeFalsy()
  })
  test('Had cooling via high sea chest & SuctionPump1 but now closing overboard valve = stop cooling', () => {
    const {
      SuctionPump1, FwCoolerDsGen, FwCoolerStartAir, OverboardDumpValve, SteamCondensor,
    } = coolingSeaSys

    coolingSeaSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    OverboardDumpValve.Open()
    coolingSeaSys.Thick()
    OverboardDumpValve.Close()
    coolingSeaSys.Thick()
    expect(FwCoolerDsGen.CoolCircuitComplete).toBeFalsy()
    expect(FwCoolerStartAir.CoolCircuitComplete).toBeFalsy()
    expect(SteamCondensor.CoolCircuitComplete).toBeFalsy()
  })
})
describe('Aux pump', () => {
  test('Aux pump providing cooling for FW dsgen, not for Start Air nor Steam Condensor', () => {
    const {
      AuxPump, FwCoolerDsGen, FwCoolerStartAir, OverboardDumpValve, SteamCondensor,
    } = coolingSeaSys
    FwCoolerDsGen.HotCircuitComplete = true
    FwCoolerStartAir.HotCircuitComplete = true
    SteamCondensor.HotCircuitComplete = true

    coolingSeaSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Open()
    coolingSeaSys.Thick()
    expect(coolingSeaSys.SwAvailable.Inside).toBe(CstCoolantSys.AuxSuctionPump)

    expect(FwCoolerDsGen.CoolCircuitComplete).toBeTruthy()
    expect(FwCoolerDsGen.IsCooling).toBeTruthy()

    // Aux pump hasn't enough flow for the Start Air nor Stream Condensor coolers
    expect(FwCoolerStartAir.CoolCircuitComplete).toBeFalsy()
    expect(FwCoolerStartAir.IsCooling).toBeFalsy()
    expect(SteamCondensor.CoolCircuitComplete).toBeFalsy()
    expect(SteamCondensor.IsCooling).toBeFalsy()
  })
})
describe('Suction pumps ', () => {
  test('Suction pump 1 providing cooling for all coolers', () => {
    const {
      SuctionPump1, FwCoolerDsGen, FwCoolerStartAir, OverboardDumpValve, SteamCondensor,
    } = coolingSeaSys
    FwCoolerDsGen.HotCircuitComplete = true
    FwCoolerStartAir.HotCircuitComplete = true
    SteamCondensor.HotCircuitComplete = true

    coolingSeaSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump1.Start()
    OverboardDumpValve.Open()
    coolingSeaSys.Thick()
    expect(coolingSeaSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps)

    expect(FwCoolerDsGen.IsCooling).toBeTruthy()
    // suction pump has enough flow for Start Air and Stream condensor
    expect(FwCoolerStartAir.IsCooling).toBeTruthy()
    expect(SteamCondensor.IsCooling).toBeTruthy()
  })
  test('Suction pump 2 providing cooling for all coolers', () => {
    const {
      SuctionPump2, FwCoolerDsGen, FwCoolerStartAir, OverboardDumpValve, SteamCondensor,
    } = coolingSeaSys
    FwCoolerDsGen.HotCircuitComplete = true
    FwCoolerStartAir.HotCircuitComplete = true
    SteamCondensor.HotCircuitComplete = true

    coolingSeaSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump2.Start()
    OverboardDumpValve.Open()
    coolingSeaSys.Thick()
    expect(coolingSeaSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps)

    expect(FwCoolerDsGen.IsCooling).toBeTruthy()
    // suction pump has enough flow for Start Air and stream condensor
    expect(FwCoolerStartAir.IsCooling).toBeTruthy()
    expect(SteamCondensor.IsCooling).toBeTruthy()
  })
})
