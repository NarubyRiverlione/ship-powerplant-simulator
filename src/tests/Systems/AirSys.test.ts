import AirSystem from '../../Systems/AirSystem'
import { CstAirSys } from '../../Cst'
import MockPowerBus from '../mocks/MockPowerBus'
import MockCooler from '../mocks/MockCooler'

let airSys: AirSystem
const dummyMainBus = new MockPowerBus('dummy main bus')
dummyMainBus.Voltage = 440

const dummyEmergencyBus = new MockPowerBus('dummy emergency bus')
dummyEmergencyBus.Voltage = 440

const dummyStartAirCooler = new MockCooler('dummy start air cooler')

beforeEach(() => {
  airSys = new AirSystem(dummyStartAirCooler, dummyMainBus, dummyEmergencyBus)
})

describe('Init', () => {
  test('Compressor  air receiver is empty', () => {
    expect(airSys.StartAirReceiver.Tank.Content).toBe(0)
    expect(airSys.StartAirReceiver.IntakeValve.isOpen).toBeFalsy()
    expect(airSys.StartAirReceiver.OutletValve.isOpen).toBeFalsy()
    expect(airSys.StartAirReceiver.Tank.Volume).toBe(CstAirSys.StartAirReceiver1.TankPressure)
  })
  test('Compressor  compressor not running', () => {
    expect(airSys.StartAirCompressor.isRunning).toBeFalsy()
    expect(airSys.StartAirCompressor.Content).toBe(0)
  })
  test('Compressor 1outlet valve closed, source set as emergency compressor', () => {
    expect(airSys.StartAirCompressor.OutletValve.isOpen).toBeFalsy()
    expect(airSys.StartAirCompressor.OutletValve.Source.Content)
      .toBe(airSys.StartAirCompressor.Content)
  })
  test('Emergency air receiver is empty', () => {
    expect(airSys.EmergencyReceiver.Tank.Content).toBe(0)
    expect(airSys.EmergencyReceiver.IntakeValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyReceiver.OutletValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyReceiver.Tank.Volume).toBe(CstAirSys.EmergencyReceiver.TankPressure)
  })
  test('Emergency compressor not running', () => {
    expect(airSys.EmergencyCompressor.isRunning).toBeFalsy()
    expect(airSys.EmergencyCompressor.Content).toBe(0)
  })
  test('Emergency outlet valve closed, source set as emergency compressor', () => {
    expect(airSys.EmergencyCompressor.OutletValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyCompressor.OutletValve.Source).toEqual(airSys.EmergencyCompressor)
  })
})

describe('Emergency compressor', () => {
  test('Open compressor outlet valve & intake valve but not running = not filling receiver', () => {
    expect(airSys.EmergencyCompressor.Content).toBe(0)
    airSys.EmergencyCompressor.OutletValve.Close()
    airSys.EmergencyReceiver.IntakeValve.Close()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(0)
    expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(0)
    expect(airSys.EmergencyReceiver.Tank.Content).toBe(0)
  })
  // eslint-disable-next-line max-len
  test('Open compressor outlet valve & running but closed intake valve = no receiver = open safety = not filling receiver', () => {
    airSys.EmergencyCompressor.Start()
    airSys.EmergencyCompressor.OutletValve.Open()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyCompressor.SafetyOpen).toBeTruthy()
    expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)

    airSys.EmergencyReceiver.IntakeValve.Close()
    airSys.Thick()
    expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(0)
    expect(airSys.EmergencyReceiver.Tank.Content).toBe(0)
  })
  // eslint-disable-next-line max-len
  test('open intake valve & running but closed compressor outlet valve = no receiver = open safety = not filling receiver', () => {
    airSys.EmergencyReceiver.IntakeValve.Open()
    airSys.EmergencyCompressor.Start()
    airSys.EmergencyCompressor.OutletValve.Close()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(0)
    expect(airSys.EmergencyCompressor.SafetyOpen).toBeTruthy()
    expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(0)
    expect(airSys.EmergencyReceiver.Tank.Content).toBe(0)
  })

  test('first open inlet receiver, then outlet compressor = fill receiver', () => {
    airSys.EmergencyReceiver.IntakeValve.Open()
    airSys.EmergencyCompressor.OutletValve.Open()
    airSys.EmergencyCompressor.Start()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.isRunning).toBeTruthy()
    expect(airSys.EmergencyCompressor.SafetyOpen).toBeFalsy()
    expect(airSys.EmergencyReceiver.Tank.AddThisStep).toBe(CstAirSys.EmergencyCompressor.AddStep)

    expect(airSys.EmergencyReceiver.Tank.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
  })
  test('Open compressor outlet valve & intake valve and running = fill receiver  ', () => {
    airSys.EmergencyCompressor.Start()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.SafetyOpen).toBeTruthy()
    expect(airSys.EmergencyCompressor.isRunning).toBeTruthy()
    expect(airSys.EmergencyCompressor.RatedFor).toBe(CstAirSys.EmergencyCompressor.AddStep)

    airSys.EmergencyCompressor.OutletValve.Open()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.SafetyOpen).toBeTruthy()
    airSys.EmergencyReceiver.IntakeValve.Open()
    airSys.Thick()

    expect(airSys.EmergencyCompressor.SafetyOpen).toBeFalsy()
    expect(airSys.EmergencyCompressor.OutletValve.isOpen).toBeTruthy()
    expect(airSys.EmergencyCompressor.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyCompressor.OutletValve.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyCompressor.HasReceiver).toBeTruthy()

    expect(airSys.EmergencyReceiver.IntakeValve.Source.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)

    expect(airSys.EmergencyReceiver.IntakeValve.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyReceiver.Tank.AddThisStep).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyReceiver.Tank.Content).toBe(CstAirSys.EmergencyCompressor.AddStep)
  })
})

describe('Start air compressor ', () => {
  test('Air compressor star but no cooling = stop compressor', () => {
    airSys.StartAirCompressor.Start()
    airSys.StartAirCooler.CoolCircuitComplete = false
    airSys.Thick()
    expect(airSys.StartAirCompressor.isRunning).toBeFalsy()
  })
  test('Air compressor starr with  cooling = start compressor', () => {
    airSys.StartAirCompressor.Start()
    airSys.StartAirCooler.CoolCircuitComplete = true
    airSys.Thick()
    expect(airSys.StartAirCompressor.isRunning).toBeTruthy()
  })
  test('Air compressor running with  cooling -> stop cooling = stop compressor', () => {
    airSys.StartAirCompressor.Start()
    airSys.StartAirCooler.CoolCircuitComplete = true
    airSys.Thick()
    airSys.StartAirCooler.CoolCircuitComplete = false
    airSys.Thick()
    expect(airSys.StartAirCompressor.isRunning).toBeFalsy()
  })

  test('Open compressor outlet valve & intake valve but not running = not filling receiver', () => {
    expect(airSys.StartAirCompressor.Content).toBe(0)
    airSys.StartAirCompressor.OutletValve.Close()
    airSys.StartAirReceiver.IntakeValve.Close()
    airSys.Thick()
    expect(airSys.StartAirCompressor.OutletValve.Content).toBe(0)
    expect(airSys.StartAirReceiver.IntakeValve.Content).toBe(0)
    expect(airSys.StartAirReceiver.Tank.Content).toBe(0)
  })
  test('Open compressor outlet valve &  running but closed intake valve = not filling receiver', () => {
    airSys.StartAirCompressor.Start()
    airSys.StartAirCompressor.OutletValve.Open()
    airSys.StartAirCooler.CoolCircuitComplete = true
    airSys.Thick()
    expect(airSys.StartAirCompressor.Content).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirCompressor.SafetyOpen).toBeTruthy()
    expect(airSys.StartAirCompressor.OutletValve.Content).toBe(CstAirSys.StartAirCompressor1.AddStep)

    airSys.StartAirReceiver.IntakeValve.Close()
    airSys.Thick()
    expect(airSys.StartAirCompressor.SafetyOpen).toBeTruthy()
    expect(airSys.StartAirReceiver.IntakeValve.Content).toBe(0)
    expect(airSys.StartAirReceiver.Tank.Content).toBe(0)
  })
  test('open intake valve & running but closed compressor outlet valve = not filling receiver', () => {
    airSys.StartAirReceiver.IntakeValve.Open()
    airSys.StartAirCompressor.Start()
    airSys.StartAirCompressor.OutletValve.Close()
    airSys.StartAirCooler.CoolCircuitComplete = true
    airSys.Thick()
    expect(airSys.StartAirCompressor.SafetyOpen).toBeTruthy()
    expect(airSys.StartAirCompressor.Content).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirCompressor.OutletValve.Content).toBe(0)

    expect(airSys.StartAirReceiver.IntakeValve.Content).toBe(0)
    expect(airSys.StartAirReceiver.Tank.Content).toBe(0)
  })
  test('Open outlet valve & running = fill receiver', () => {
    airSys.StartAirCooler.CoolCircuitComplete = true
    airSys.StartAirCompressor.Start()
    airSys.Thick()
    expect(airSys.StartAirCompressor.isRunning).toBeTruthy()
    expect(airSys.StartAirCompressor.RatedFor).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirCompressor.SafetyOpen).toBeTruthy()
    expect(airSys.StartAirCompressor.Output).toBe(CstAirSys.StartAirCompressor1.AddStep)

    airSys.StartAirCompressor.OutletValve.Open()
    airSys.Thick()
    expect(airSys.StartAirCompressor.SafetyOpen).toBeTruthy()
    expect(airSys.StartAirCompressor.OutletValve.Content).toBe(CstAirSys.StartAirCompressor1.AddStep)

    airSys.StartAirReceiver.IntakeValve.Open()
    airSys.Thick()
    expect(airSys.StartAirCompressor.SafetyOpen).toBeFalsy()
    expect(airSys.StartAirReceiver.IntakeValve.Content).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirReceiver.Tank.AddThisStep).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirReceiver.Tank.Content).toBe(CstAirSys.StartAirCompressor1.AddStep)
  })
  test('first open inlet receiver, then outlet compressor = fill receiver', () => {
    airSys.StartAirReceiver.IntakeValve.Open()
    airSys.StartAirCompressor.OutletValve.Open()
    airSys.StartAirCooler.CoolCircuitComplete = true
    airSys.StartAirCompressor.Start()
    airSys.Thick()

    expect(airSys.StartAirCompressor.isRunning).toBeTruthy()
    expect(airSys.StartAirReceiver.Tank.AddThisStep).toBe(CstAirSys.StartAirCompressor1.AddStep)

    expect(airSys.StartAirReceiver.Tank.Content).toBe(CstAirSys.StartAirCompressor1.AddStep)
  })
})
