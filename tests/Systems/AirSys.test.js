const AirSys = require('../../src/Systems/AirSystem')
const { CstAirSys } = require('../../src/Cst')

let airSys
const dummyMainBus = { Voltage: 440 }
const dummyEmergencyBus = { Voltage: 440 }
beforeEach(() => {
  airSys = new AirSys(dummyMainBus, dummyEmergencyBus)
})

describe('Init', () => {
  test('Compressor 1 air receiver is empty', () => {
    expect(airSys.StartAirReceiver1.Tank.Content()).toBe(0)
    expect(airSys.StartAirReceiver1.IntakeValve.isOpen).toBeFalsy()
    expect(airSys.StartAirReceiver1.OutletValve.isOpen).toBeFalsy()
    expect(airSys.StartAirReceiver1.Tank.Volume).toBe(CstAirSys.StartAirReceiver1.TankPressure)
  })
  test('Compressor 1 compressor not running', () => {
    expect(airSys.StartAirCompressor1.isRunning).toBeFalsy()
    expect(airSys.StartAirCompressor1.Content()).toBe(0)
  })
  test('Compressor 1 outlet valve closed, source set as emergency compressor', () => {
    expect(airSys.StartCompressor1OutletValve.isOpen).toBeFalsy()
    expect(airSys.StartCompressor1OutletValve.Source).toEqual(airSys.StartAirCompressor1)
  })
  test('Emergency air receiver is empty', () => {
    expect(airSys.EmergencyReceiver.Tank.Content()).toBe(0)
    expect(airSys.EmergencyReceiver.IntakeValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyReceiver.OutletValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyReceiver.Tank.Volume).toBe(CstAirSys.EmergencyReceiver.TankPressure)
  })
  test('Emergency compressor not running', () => {
    expect(airSys.EmergencyCompressor.isRunning).toBeFalsy()
    expect(airSys.EmergencyCompressor.Content()).toBe(0)
  })
  test('Emergency outlet valve closed, source set as emergency compressor', () => {
    expect(airSys.EmergencyOutletValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyOutletValve.Source).toEqual(airSys.EmergencyCompressor)
  })
})

describe('Emergency compressor', () => {
  test('Open compressor outlet valve & intake valve but not running = not filling receiver', () => {
    expect(airSys.EmergencyCompressor.Content()).toBe(0)
    airSys.EmergencyOutletValve.Close()
    airSys.EmergencyReceiver.IntakeValve.Close()
    airSys.Thick()
    expect(airSys.EmergencyOutletValve.Content()).toBe(0)
    expect(airSys.EmergencyReceiver.IntakeValve.Content()).toBe(0)
    expect(airSys.EmergencyReceiver.Tank.Adding).toBeFalsy()
    expect(airSys.EmergencyReceiver.Tank.Content()).toBe(0)
  })
  test('Open compressor outlet valve &  running but closed intake valve = not filling receiver', () => {
    airSys.EmergencyCompressor.Start()
    airSys.EmergencyOutletValve.Open()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyOutletValve.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)

    airSys.EmergencyReceiver.IntakeValve.Close()
    airSys.Thick()
    expect(airSys.EmergencyReceiver.IntakeValve.Content()).toBe(0)
    expect(airSys.EmergencyReceiver.Tank.Adding).toBeFalsy()
    expect(airSys.EmergencyReceiver.Tank.Content()).toBe(0)
  })
  test('open intake valve & running but closed compressor outlet valve = not filling receiver', () => {
    airSys.EmergencyReceiver.IntakeValve.Open()
    airSys.EmergencyCompressor.Start()
    airSys.EmergencyOutletValve.Close()
    airSys.Thick()
    expect(airSys.EmergencyCompressor.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)
    expect(airSys.EmergencyOutletValve.Content()).toBe(0)

    expect(airSys.EmergencyReceiver.IntakeValve.Content()).toBe(0)
    expect(airSys.EmergencyReceiver.Tank.Adding).toBeFalsy()
    expect(airSys.EmergencyReceiver.Tank.Content()).toBe(0)
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
  test('Open compressor outlet valve & intake valve and running = fill receiver  ', () => {
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
})

describe('Start air compressor 1', () => {
  test('Open compressor outlet valve & intake valve but not running = not filling receiver', () => {
    expect(airSys.StartAirCompressor1.Content()).toBe(0)
    airSys.StartCompressor1OutletValve.Close()
    airSys.StartAirReceiver1.IntakeValve.Close()
    airSys.Thick()
    expect(airSys.StartCompressor1OutletValve.Content()).toBe(0)
    expect(airSys.StartAirReceiver1.IntakeValve.Content()).toBe(0)
    expect(airSys.StartAirReceiver1.Tank.Adding).toBeFalsy()
    expect(airSys.StartAirReceiver1.Tank.Content()).toBe(0)
  })
  test('Open compressor outlet valve &  running but closed intake valve = not filling receiver', () => {
    airSys.StartAirCompressor1.Start()
    airSys.StartCompressor1OutletValve.Open()
    airSys.Thick()
    expect(airSys.StartAirCompressor1.Content()).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartCompressor1OutletValve.Content()).toBe(CstAirSys.StartAirCompressor1.AddStep)

    airSys.StartAirReceiver1.IntakeValve.Close()
    airSys.Thick()
    expect(airSys.StartAirReceiver1.IntakeValve.Content()).toBe(0)
    expect(airSys.StartAirReceiver1.Tank.Adding).toBeFalsy()
    expect(airSys.StartAirReceiver1.Tank.Content()).toBe(0)
  })
  test('open intake valve & running but closed compressor outlet valve = not filling receiver', () => {
    airSys.StartAirReceiver1.IntakeValve.Open()
    airSys.StartAirCompressor1.Start()
    airSys.StartCompressor1OutletValve.Close()
    airSys.Thick()
    expect(airSys.StartAirCompressor1.Content()).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartCompressor1OutletValve.Content()).toBe(0)

    expect(airSys.StartAirReceiver1.IntakeValve.Content()).toBe(0)
    expect(airSys.StartAirReceiver1.Tank.Adding).toBeFalsy()
    expect(airSys.StartAirReceiver1.Tank.Content()).toBe(0)
  })
  test('Open outlet valve & running = fill receiver', () => {
    airSys.StartAirCompressor1.Start()
    airSys.Thick()
    expect(airSys.StartAirCompressor1.isRunning).toBeTruthy()
    expect(airSys.StartAirCompressor1.RatedFor).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirCompressor1.Output).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirCompressor1.Content()).toBe(CstAirSys.StartAirCompressor1.AddStep)

    airSys.StartCompressor1OutletValve.Open()
    airSys.Thick()
    expect(airSys.StartCompressor1OutletValve.Content()).toBe(CstAirSys.StartAirCompressor1.AddStep)

    airSys.StartAirReceiver1.IntakeValve.Open()
    airSys.Thick()
    expect(airSys.StartAirReceiver1.IntakeValve.Content()).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirReceiver1.Tank.Adding).toBeTruthy()
    expect(airSys.StartAirReceiver1.Tank.AddEachStep).toBe(CstAirSys.StartAirCompressor1.AddStep)
    expect(airSys.StartAirReceiver1.Tank.Content()).toBe(CstAirSys.StartAirCompressor1.AddStep)
  })
  test('first open inlet receiver, then outlet compressor = fill receiver', () => {
    airSys.StartAirReceiver1.IntakeValve.Open()
    airSys.StartCompressor1OutletValve.Open()
    airSys.StartAirCompressor1.Start()
    airSys.Thick()

    expect(airSys.StartAirCompressor1.isRunning).toBeTruthy()
    expect(airSys.StartAirReceiver1.Tank.Adding).toBeTruthy()
    expect(airSys.StartAirReceiver1.Tank.AddEachStep).toBe(CstAirSys.StartAirCompressor1.AddStep)

    expect(airSys.StartAirReceiver1.Tank.Content()).toBe(CstAirSys.StartAirCompressor1.AddStep)
  })
})
