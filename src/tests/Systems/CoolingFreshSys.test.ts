import mockPowerBus from '../mocks/mockPowerBus'
import { CstCoolantSys, CstChanges } from '../../Cst'
import CoolingFreshWaterSystem from '../../Systems/CoolingFreshWaterSystem'
import mockCooler from '../mocks/mockCooler'

const dummyEmergencyBus = new mockPowerBus('dummy emergency bus')
dummyEmergencyBus.Voltage = 440
const dummyMainBus = new mockPowerBus('dummy main bus')
dummyMainBus.Voltage = 440

const dummyFwCoolerDsGen = new mockCooler('dummy FW Ds Gen cooler')
const dummyFwCoolerStartAir = new mockCooler('dummy FW Start air cooler')


let coolingFreshSys: CoolingFreshWaterSystem
beforeEach(() => {
  dummyFwCoolerDsGen.CoolCircuitComplete = true
  dummyFwCoolerStartAir.CoolCircuitComplete = true

  coolingFreshSys = new CoolingFreshWaterSystem(
    dummyFwCoolerDsGen, dummyFwCoolerStartAir,
    dummyMainBus, dummyEmergencyBus,
  )

})

describe('Init', () => {
  test('FW cooler start air, not cooling', () => {
    const { FwCoolerStartAir } = coolingFreshSys
    expect(FwCoolerStartAir.IsCooling).toBeFalsy()
  })
  test('FW cooler diesel generator, not cooling', () => {
    const { FwCoolerDsGen } = coolingFreshSys
    expect(FwCoolerDsGen.IsCooling).toBeFalsy()
  })
  test('FW expand tank is empty', () => {
    expect(coolingFreshSys.FwExpandTank.Content).toBe(0)
  })
  test('Fw expand tank intake valve is closed', () => {
    expect(coolingFreshSys.FwIntakeValve.isOpen).toBeFalsy()
  })
  test('Fw expand tank drain valve  is closed', () => {
    expect(coolingFreshSys.FwDrainValve.isOpen).toBeFalsy()
  })
  test('Fw pump diesel generator cooler not running', () => {
    expect(coolingFreshSys.FwPumpDsGen.isRunning).toBeFalsy()
  })
  test('Fw pump start air compressor cooler not running', () => {
    expect(coolingFreshSys.FwPumpStartAir.isRunning).toBeFalsy()
  })

})

describe('Fresh water expand tank', () => {
  test('fill expand tank by open the intake valve', () => {
    coolingFreshSys.FwIntakeValve.Open()
    coolingFreshSys.Thick()
    expect(coolingFreshSys.FwIntakeValve.Content).toBe(CstCoolantSys.FwExpandTank.IntakeValveVolume)
    expect(coolingFreshSys.FwExpandTank.Content).toBe(CstCoolantSys.FwExpandTank.IntakeValveVolume)
  })
  test('closing intake valve, stop filling expand tank', () => {
    coolingFreshSys.FwIntakeValve.Open()
    coolingFreshSys.Thick()
    expect(coolingFreshSys.FwExpandTank.Content).toBe(CstCoolantSys.FwExpandTank.IntakeValveVolume)
    coolingFreshSys.FwIntakeValve.Close()
    coolingFreshSys.Thick()
    expect(coolingFreshSys.FwExpandTank.Content).toBe(CstCoolantSys.FwExpandTank.IntakeValveVolume)
  })
  test('Drain expand tank', () => {
    const startContent = 60
    coolingFreshSys.FwExpandTank.Inside = startContent
    coolingFreshSys.FwDrainValve.Open()
    coolingFreshSys.Thick()
    expect(coolingFreshSys.FwExpandTank.Content).toBe(startContent - CstChanges.DrainStep)

    coolingFreshSys.FwDrainValve.Close()
    coolingFreshSys.Thick()
    expect(coolingFreshSys.FwExpandTank.Content).toBe(startContent - CstChanges.DrainStep)
  })
})

describe('Diesel gen lubrication cooler', () => {
  test('Fresh water available & FW cooler dsgen is cooling & pump running => lub cooler is also cooling', () => {
    const { FwPumpDsGen, DsGenLubCooler, FwCoolerDsGen, FwExpandTank } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling + 1
    FwExpandTank.Inside = FwContent
    DsGenLubCooler.HotCircuitComplete = true
    FwPumpDsGen.Start()
    coolingFreshSys.Thick()
    expect(FwPumpDsGen.isRunning).toBeTruthy()
    expect(FwCoolerDsGen.HotCircuitComplete).toBeTruthy()
    expect(FwCoolerDsGen.IsCooling).toBeTruthy()

    expect(DsGenLubCooler.CoolCircuitComplete).toBeTruthy()
    expect(DsGenLubCooler.IsCooling).toBeTruthy()

  })
  test('lub cooler is cooling but pump stopped ==> stop cooling', () => {
    const { FwPumpDsGen, DsGenLubCooler, FwCoolerDsGen, FwExpandTank } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling + 1
    FwExpandTank.Inside = FwContent
    DsGenLubCooler.HotCircuitComplete = true
    FwPumpDsGen.Start()
    coolingFreshSys.Thick()
    expect(FwPumpDsGen.isRunning).toBeTruthy()
    expect(DsGenLubCooler.IsCooling).toBeTruthy()

    FwPumpDsGen.Stop()
    coolingFreshSys.Thick()
    expect(FwPumpDsGen.isRunning).toBeFalsy()
    expect(DsGenLubCooler.IsCooling).toBeFalsy()
    expect(FwCoolerDsGen.HotCircuitComplete).toBeFalsy()
    expect(DsGenLubCooler.CoolCircuitComplete).toBeFalsy()
  })
  test('FW dsgen cooler is not cooling => lub cooler is not cooling', () => {
    const { FwPumpDsGen, FwCoolerDsGen, DsGenLubCooler, FwExpandTank
    } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling + 1
    FwExpandTank.Inside = FwContent
    FwPumpDsGen.Start()
    DsGenLubCooler.HotCircuitComplete = true

    coolingFreshSys.Thick()
    expect(FwCoolerDsGen.IsCooling).toBeTruthy()
    expect(DsGenLubCooler.IsCooling).toBeTruthy()
    FwCoolerDsGen.CoolCircuitComplete = false

    coolingFreshSys.Thick()
    expect(FwCoolerDsGen.IsCooling).toBeFalsy()
    expect(DsGenLubCooler.IsCooling).toBeFalsy()
  })
  test('not enough Fresh water ==> lub cooler is not cooling', () => {
    const { FwPumpDsGen, FwCoolerDsGen, DsGenLubCooler, FwExpandTank
    } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling - 1
    FwExpandTank.Inside = FwContent
    FwPumpDsGen.Start()
    DsGenLubCooler.HotCircuitComplete = true

    coolingFreshSys.Thick()
    expect(FwCoolerDsGen.HotCircuitComplete).toBeFalsy()
    expect(FwCoolerDsGen.IsCooling).toBeFalsy()
    expect(DsGenLubCooler.CoolCircuitComplete).toBeFalsy()
    expect(DsGenLubCooler.IsCooling).toBeFalsy()
  })
  test('enough Fresh water but pump not runing ==> lub cooler has not cooling', () => {
    const { FwPumpDsGen, FwCoolerDsGen, DsGenLubCooler, FwExpandTank
    } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling - 1
    FwExpandTank.Inside = FwContent
    DsGenLubCooler.HotCircuitComplete = true

    coolingFreshSys.Thick()
    expect(FwPumpDsGen.isRunning).toBeFalsy()
    expect(FwCoolerDsGen.HotCircuitComplete).toBeFalsy()
    expect(FwCoolerDsGen.IsCooling).toBeFalsy()
    expect(DsGenLubCooler.CoolCircuitComplete).toBeFalsy()
    expect(DsGenLubCooler.IsCooling).toBeFalsy()
  })
})

describe('Start air cooler', () => {
  test('Fresh water available & FW cooler start air  is cooling => start air cooler is cooling', () => {
    const { FwPumpStartAir, StartAirCooler, FwCoolerStartAir, FwExpandTank } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling + 1
    FwExpandTank.Inside = FwContent
    StartAirCooler.HotCircuitComplete = true
    FwPumpStartAir.Start()
    coolingFreshSys.Thick()
    expect(FwPumpStartAir.isRunning).toBeTruthy()
    expect(FwCoolerStartAir.IsCooling).toBeTruthy()
    expect(StartAirCooler.IsCooling).toBeTruthy()
  })
  test('start air cooler is cooling but pump stopped ==> stop cooling', () => {
    const { FwPumpStartAir, FwCoolerStartAir, StartAirCooler, FwExpandTank } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling + 1
    FwExpandTank.Inside = FwContent
    StartAirCooler.HotCircuitComplete = true
    FwPumpStartAir.Start()
    coolingFreshSys.Thick()
    expect(FwPumpStartAir.isRunning).toBeTruthy()
    expect(StartAirCooler.IsCooling).toBeTruthy()

    FwPumpStartAir.Stop()
    coolingFreshSys.Thick()
    expect(FwPumpStartAir.isRunning).toBeFalsy()
    expect(StartAirCooler.IsCooling).toBeFalsy()
    expect(FwCoolerStartAir.HotCircuitComplete).toBeFalsy()
    expect(StartAirCooler.CoolCircuitComplete).toBeFalsy()
  })
  test('FW start air cooler is not cooling => start air cooler is not cooling', () => {
    const { FwPumpStartAir, FwCoolerStartAir, StartAirCooler, FwExpandTank
    } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling + 1
    FwExpandTank.Inside = FwContent
    StartAirCooler.HotCircuitComplete = true
    FwPumpStartAir.Start()
    coolingFreshSys.Thick()
    FwCoolerStartAir.CoolCircuitComplete = false

    coolingFreshSys.Thick()
    expect(FwCoolerStartAir.IsCooling).toBeFalsy()
    expect(StartAirCooler.IsCooling).toBeFalsy()
  })
  test('not enough Fresh water ==> start air cooler is not cooling', () => {
    const { FwPumpStartAir, FwCoolerStartAir, StartAirCooler, FwExpandTank
    } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling - 1
    FwExpandTank.Inside = FwContent
    FwPumpStartAir.Start()
    coolingFreshSys.Thick()
    expect(FwCoolerStartAir.HotCircuitComplete).toBeFalsy()
    expect(FwCoolerStartAir.IsCooling).toBeFalsy()
    expect(StartAirCooler.CoolCircuitComplete).toBeFalsy()
    expect(StartAirCooler.IsCooling).toBeFalsy()
  })
  test('enough Fresh water but pump not runing ==> start air cooler is not cooling', () => {
    const { FwPumpStartAir, FwCoolerStartAir, StartAirCooler, FwExpandTank
    } = coolingFreshSys
    const FwContent = CstCoolantSys.FwExpandTank.MinForCooling - 1
    FwExpandTank.Inside = FwContent
    StartAirCooler.HotCircuitComplete = true

    coolingFreshSys.Thick()
    expect(FwPumpStartAir.isRunning).toBeFalsy()
    expect(FwCoolerStartAir.HotCircuitComplete).toBeFalsy()
    expect(FwCoolerStartAir.IsCooling).toBeFalsy()
    expect(StartAirCooler.CoolCircuitComplete).toBeFalsy()
    expect(StartAirCooler.IsCooling).toBeFalsy()
  })
})
