const AirSys = require('../../src/Systems/AirSystem')
const { CstAirSys } = require('../../src/Cst')

let airSys
const dummyMainBus = { Voltage: 440 }
const dummyEmergencyBus = { Voltage: 440 }
beforeEach(() => {
  airSys = new AirSys(dummyMainBus, dummyEmergencyBus)
})

describe('Init', () => {
  test('Emergency air receiver is empty', () => {
    expect(airSys.EmergencyReceiver.Tank.Content()).toBe(0)
    expect(airSys.EmergencyReceiver.IntakeValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyReceiver.OutletValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyReceiver.Tank.Volume).toBe(CstAirSys.EmergencyReceiver.TankPressure)
  })
  test('Emergency compressor not running', () => {
    expect(airSys.EmergencyCompressor.isRunning).toBeFalsy()
  })
  test('Emergency outlet valve closed, source set as emergency compressor', () => {
    expect(airSys.EmergencyOutletValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyOutletValve.Source).toEqual(airSys.EmergencyCompressor)
  })
})

describe('Emergency compressor', () => {
  test('Open outlet valve & running = fill receiver', () => {
    airSys.EmergencyCompressor.Start()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.isRunning).toBeTruthy()
    expect(airSys.EmergencyCompressor.RatedFor).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyCompressor.Output).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyCompressor.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)

    airSys.EmergencyOutletValve.Open()
    airSys.Thick()
    expect(airSys.EmergencyOutletValve.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)

    airSys.EmergencyReceiver.IntakeValve.Open()
    airSys.Thick()
    expect(airSys.EmergencyReceiver.IntakeValve.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyReceiver.Tank.Adding).toBeTruthy()
    expect(airSys.EmergencyReceiver.Tank.AddEachStep).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyReceiver.Tank.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)
  })
  test('first open inlet receiver, then outlet compressor = fill receiver', () => {
    airSys.EmergencyReceiver.IntakeValve.Open()
    airSys.EmergencyOutletValve.Open()
    airSys.EmergencyCompressor.Start()
    airSys.Thick()

    expect(airSys.EmergencyCompressor.isRunning).toBeTruthy()
    expect(airSys.EmergencyReceiver.Tank.Adding).toBeTruthy()
    expect(airSys.EmergencyReceiver.Tank.AddEachStep).toBe(CstAirSys.EmergencyCompressor.AddStep)

    expect(airSys.EmergencyReceiver.Tank.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)
  })
})
