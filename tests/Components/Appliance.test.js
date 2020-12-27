const Appliance = require('../../src/Components/Appliance')

describe('Init', () => {
  test('bus', () => {
    const testBus = { Voltage: 123 }
    const appliance = new Appliance('test bus', testBus)
    expect(appliance.Bus).toEqual(testBus)
  })
  test('not running', () => {
    const testBus = { Voltage: 123 }
    const appliance = new Appliance('test bus', testBus)
    expect(appliance.isRunning).toBeFalsy()
  })
})

describe('start/stop', () => {
  test('start without power on bus = not running', () => {
    const testBus = { Voltage: 0 }
    const appliance = new Appliance('test bus', testBus)
    appliance.Start()
    expect(appliance.isRunning).toBeFalsy()
  })
  test('start  power on bus =  running', () => {
    const testBus = { Voltage: 158 }
    const appliance = new Appliance('test bus', testBus)
    appliance.Start()
    expect(appliance.isRunning).toBeTruthy()
  })
  test('stop running appliance = stop', () => {
    const testBus = { Voltage: 158 }
    const appliance = new Appliance('test bus', testBus)
    appliance.Start()
    appliance.Stop()
    expect(appliance.isRunning).toBeFalsy()
  })
  test('remove power from running appliance = stop', () => {
    const testBus = { Voltage: 158 }
    const appliance = new Appliance('test bus', testBus)
    appliance.Start()
    expect(appliance.isRunning).toBeTruthy()
    testBus.Voltage = 0
    appliance.Thick()
    expect(appliance.isRunning).toBeFalsy()
  })
  test('toggle not running  =  running', () => {
    const testBus = { Voltage: 158 }
    const appliance = new Appliance('test bus', testBus)
    appliance.Toggle()
    expect(appliance.isRunning).toBeTruthy()
  })
  test('toggle  running  =  not running', () => {
    const testBus = { Voltage: 158 }
    const appliance = new Appliance('test bus', testBus)
    appliance.Start()
    appliance.Thick()
    appliance.Toggle()
    expect(appliance.isRunning).toBeFalsy()
  })
})
