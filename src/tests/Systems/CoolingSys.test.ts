import mockPowerBus from '../mocks/mockPowerBus'
import { CstCoolantSys, CstChanges } from '../../Cst'
import CoolingSystem from '../../Systems/CoolingSystem'

const dummyEmergencyBus = new mockPowerBus('dummy emergency bus')
dummyEmergencyBus.Voltage = 440
const dummyMainBus = new mockPowerBus('dummy main bus')
dummyMainBus.Voltage = 440

let coolingSys: CoolingSystem
beforeEach(() => {
  coolingSys = new CoolingSystem(dummyMainBus, dummyEmergencyBus)
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
    expect(coolingSys.SwAvailable.Inside).toBe(0)
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
  test('FW cooler start air, not cooling', () => {
    const { FwCoolerStartAir } = coolingSys
    expect(FwCoolerStartAir.CoolingInputRate).toBe(CstCoolantSys.FwCoolerStartAir.coolingRate)
    expect(FwCoolerStartAir.CoolingProviders).toBe(0)
    expect(FwCoolerStartAir.hasCooling).toBeFalsy()
    expect(FwCoolerStartAir.isCooling).toBeFalsy()
  })
  test('Steam conderser, not cooling', () => {
    const { SteamCondensor } = coolingSys
    expect(SteamCondensor.CoolingInputRate).toBe(CstCoolantSys.SteamCondensor.coolingRate)
    expect(SteamCondensor.CoolingProviders).toBe(0)
    expect(SteamCondensor.hasCooling).toBeFalsy()
    expect(SteamCondensor.isCooling).toBeFalsy()
  })
  test('FW cooler diesel generator, not cooling', () => {
    const { FwCoolerDsGen } = coolingSys
    expect(FwCoolerDsGen.CoolingInputRate).toBe(CstCoolantSys.FwCoolerDsGen.coolingRate)
    expect(FwCoolerDsGen.CoolingProviders).toBe(0)
    expect(FwCoolerDsGen.hasCooling).toBeFalsy()
    expect(FwCoolerDsGen.isCooling).toBeFalsy()
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
  test('FW intake valve has no content', () => {
    expect(coolingSys.FwIntakeValve.Content).toBe(0)
    expect(coolingSys.FwIntakeValve.isOpen).toBeFalsy()
  })
  test('FW drain valve has no content', () => {
    expect(coolingSys.FwDrainValve.Content).toBe(0)
    expect(coolingSys.FwDrainValve.isOpen).toBeFalsy()
  })
  test('sea water over board valve has no content', () => {
    expect(coolingSys.OverboardDumpValve.Content).toBe(0)
    expect(coolingSys.OverboardDumpValve.isOpen).toBeFalsy()
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
    expect(coolingSys.SwAvailable.Inside).toBe(CstCoolantSys.AuxSuctionPump)
  })
  test('Suction pump 1 with low suction valve open = output is rated', () => {
    const { SuctionPump1 } = coolingSys
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    coolingSys.Thick()
    expect(SuctionPump1.isRunning).toBeTruthy()
    expect(SuctionPump1.Providers).toBe(CstCoolantSys.SeaChest)
    expect(SuctionPump1.Content).toBe(CstCoolantSys.SuctionPumps)
    expect(coolingSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps)
  })
  test('Suction pump 2 with high suction valve open = output is rated', () => {
    const { SuctionPump2 } = coolingSys
    coolingSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump2.Start()
    coolingSys.Thick()
    expect(SuctionPump2.isRunning).toBeTruthy()
    expect(SuctionPump2.Providers).toBe(CstCoolantSys.SeaChest)
    expect(SuctionPump2.Content).toBe(CstCoolantSys.SuctionPumps)
    expect(coolingSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps)
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
    expect(coolingSys.SwAvailable.Inside).toBe(0)
  })
  test('Suction pump 1 & aux pump running  = output is aux + suction', () => {
    const { SuctionPump1, AuxPump } = coolingSys
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    AuxPump.Start()
    coolingSys.Thick()
    expect(coolingSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps + CstCoolantSys.AuxSuctionPump)
  })
})

describe('Over board valve', () => {
  test('over board vale open but no pump running = valve has no content', () => {
    const { OverboardDumpValve } = coolingSys
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(OverboardDumpValve.Content).toBe(0)
  })
  test('over board vale open and aux pump running = valve has  content', () => {
    const { OverboardDumpValve, AuxPump, SeaChestLowSuctionIntakeValve } = coolingSys
    OverboardDumpValve.Open()
    SeaChestLowSuctionIntakeValve.Open()
    coolingSys.Thick()
    AuxPump.Start()
    coolingSys.Thick()
    expect(AuxPump.isRunning).toBeTruthy()
    expect(AuxPump.Content).toBe(CstCoolantSys.AuxSuctionPump)
    expect(OverboardDumpValve.Content).toBe(CstCoolantSys.AuxSuctionPump)
  })
  test('Aux pump running, low sea suction valve open but over board valve is closed = no cooling', () => {
    const {
      AuxPump, FwCoolerDsGen: FwCoolerDsGen, FwCoolerStartAir: FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Close()
    coolingSys.Thick()
    expect(OverboardDumpValve.isOpen).toBeFalsy()
    expect(OverboardDumpValve.Content).toBe(0)

    expect(FwCoolerDsGen.hasCooling).toBeFalsy()
    expect(FwCoolerDsGen2.hasCooling).toBeFalsy()
    expect(SteamCondensor.hasCooling).toBeFalsy()
  })
  test('Had cooling via high sea chest & SuctionPump1 but now closing overboard valve = stop cooling', () => {
    const {
      SuctionPump1, FwCoolerDsGen: FwCoolerDsGen, FwCoolerStartAir: FwCoolerDsGen2, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    OverboardDumpValve.Close()
    coolingSys.Thick()
    expect(FwCoolerDsGen.hasCooling).toBeFalsy()
    expect(FwCoolerDsGen2.hasCooling).toBeFalsy()
    expect(SteamCondensor.hasCooling).toBeFalsy()
  })
})
describe('Aux pump', () => {
  test('Aux pump providing cooling for FW dsgen, not for Start Air nor Steam Condensor', () => {
    const {
      AuxPump, FwCoolerDsGen: FwCoolerDsGen, FwCoolerStartAir, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(coolingSys.SwAvailable.Inside).toBe(CstCoolantSys.AuxSuctionPump)

    expect(FwCoolerDsGen.CoolingCircuitComplete).toBeTruthy()
    expect(FwCoolerDsGen.CoolingProviders).toBe(CstCoolantSys.AuxSuctionPump)
    expect(FwCoolerDsGen.CheckCoolingRate).toBeTruthy()
    expect(FwCoolerDsGen.hasCooling).toBeTruthy()

    // Aux pump hasn't enough flow for the Start Air nor Stream Condensor coolers
    expect(FwCoolerStartAir.hasCooling).toBeFalsy()
    expect(SteamCondensor.hasCooling).toBeFalsy()
  })
})
describe('Suction pumps ', () => {
  test('Suction pump 1 providing cooling for all coolers', () => {
    const {
      SuctionPump1, FwCoolerDsGen: FwCoolerDsGen, FwCoolerStartAir, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestHighSuctionIntakeValve.Open()
    SuctionPump1.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(coolingSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps)

    expect(FwCoolerDsGen.hasCooling).toBeTruthy()
    // suction pump has enough flow for Start Air and Stream condensor
    expect(FwCoolerStartAir.hasCooling).toBeTruthy()
    expect(SteamCondensor.hasCooling).toBeTruthy()
  })
  test('Suction pump 2 providing cooling for all coolers', () => {
    const {
      SuctionPump2, FwCoolerDsGen: FwCoolerDsGen, FwCoolerStartAir, OverboardDumpValve, SteamCondensor
    } = coolingSys

    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump2.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(coolingSys.SwAvailable.Inside).toBe(CstCoolantSys.SuctionPumps)

    expect(FwCoolerDsGen.hasCooling).toBeTruthy()
    // suction pump has enough flow for Start Air and stream condensor
    expect(FwCoolerStartAir.hasCooling).toBeTruthy()
    expect(SteamCondensor.hasCooling).toBeTruthy()
  })
})

describe('Fresh water expand tank', () => {
  test('fill expand tank by open the intake valve', () => {
    coolingSys.FwIntakeValve.Open()
    coolingSys.Thick()
    expect(coolingSys.FwExpandTank.Content).toBe(CstCoolantSys.FwExpandTank.TankAddStep)
    expect(coolingSys.FwIntakeValve.Content).toBe(CstCoolantSys.FwMakeUp)
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

describe('Diesel gen lubrication cooler', () => {
  test('Fresh water available =  has cooling', () => {
    const { DsGenLubCooler } = coolingSys
    const FwContent = 50
    coolingSys.FwExpandTank.Inside = FwContent
    coolingSys.Thick()
    expect(DsGenLubCooler.CheckCoolingRate).toBeTruthy()
    expect(DsGenLubCooler.CoolingCircuitComplete).toBeTruthy()
    expect(DsGenLubCooler.CoolingProviders).toBe(FwContent)
    expect(DsGenLubCooler.hasCooling).toBeTruthy()
  })
  test('has cooling +  Fw cooler is cooling', () => {
    const {
      AuxPump, FwCoolerDsGen, OverboardDumpValve, DsGenLubCooler: DsGen1LubCooler
    } = coolingSys
    // setup Fw cooler via Aux suction pump
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(FwCoolerDsGen.hasCooling).toBeTruthy()
    // setup Lub cooler
    const FwContent = 50
    coolingSys.FwExpandTank.Inside = FwContent
    coolingSys.Thick()
    expect(DsGen1LubCooler.hasCooling).toBeTruthy()

    coolingSys.Thick()
    expect(FwCoolerDsGen.HotCircuitComplete).toBeTruthy()
    expect(FwCoolerDsGen.isCooling).toBeTruthy()
    expect(DsGen1LubCooler.isCooling).toBeTruthy()
  })
})
describe('Start air cooler', () => {
  test('Fresh water available = hot side has cooling', () => {
    const { StartAirCooler } = coolingSys
    const FwContent = 50
    coolingSys.FwExpandTank.Inside = FwContent
    coolingSys.Thick()
    expect(StartAirCooler.CoolingProviders).toBe(FwContent)
    expect(StartAirCooler.CheckCoolingRate).toBeTruthy()
    expect(StartAirCooler.CoolingCircuitComplete).toBeTruthy()
    expect(StartAirCooler.hasCooling).toBeTruthy()
  })
  test('has cooling + Fresh water available =  cooler is cooling', () => {
    const {
      SuctionPump1, FwCoolerStartAir, OverboardDumpValve, StartAirCooler
    } = coolingSys
    // setup Fw cooler via Suction pump 1
    coolingSys.SeaChestLowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    OverboardDumpValve.Open()
    coolingSys.Thick()
    expect(FwCoolerStartAir.hasCooling).toBeTruthy()
    // setup Lub cooler
    const FwContent = 50
    coolingSys.FwExpandTank.Inside = FwContent
    coolingSys.Thick()
    expect(StartAirCooler.hasCooling).toBeTruthy()

    coolingSys.Thick()
    expect(FwCoolerStartAir.HotCircuitComplete).toBeTruthy()
    expect(FwCoolerStartAir.isCooling).toBeTruthy()
    expect(StartAirCooler.isCooling).toBeTruthy()
  })
})
