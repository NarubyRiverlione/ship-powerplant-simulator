const Pump = require('../../src/Components/ElectricPump')

describe('Init', () => {
  test('set possible output', () => {
    const ratedFor = 6916
    const pump = new Pump('test', null, ratedFor)
    expect(pump.RatedFor).toBe(ratedFor)
  })
  test('no output', () => {
    const ratedFor = 16381
    const testBus = { Voltage: 158 }
    const pump = new Pump('test bus', testBus, ratedFor)
    expect(pump.Output).toBe(0)
    expect(pump.Content()).toBe(0)
  })
})

describe('output', () => {
  test('not running pump  = zero output', () => {
    const ratedFor = 16381
    const testBus = { Voltage: 158 }
    const pump = new Pump('test bus', testBus, ratedFor)
    pump.Thick()
    expect(pump.isRunning).toBeFalsy()
    expect(pump.Output).toBe(0)
    expect(pump.Content()).toBe(0)
  })
  test('running pump without provides = not running, zero output', () => {
    const ratedFor = 16381
    const testBus = { Voltage: 158 }
    const pump = new Pump('test bus', testBus, ratedFor)
    pump.Start()
    pump.Thick()
    expect(pump.isRunning).toBeFalsy()
    expect(pump.Output).toBe(0)
    expect(pump.Content()).toBe(0)
  })
  test('running pump with provides > rated = output is limited to rated', () => {
    const ratedFor = 16381
    const testBus = { Voltage: 158 }
    const pump = new Pump('test bus', testBus, ratedFor)
    pump.Providers = 123456789
    pump.Start()
    pump.Thick()
    expect(pump.isRunning).toBeTruthy()
    expect(pump.Output).toBe(ratedFor)
    expect(pump.Content()).toBe(ratedFor)
  })
  test('running pump with provides < rated = output is limited to provided', () => {
    const ratedFor = 16381
    const input = 42
    const testBus = { Voltage: 158 }
    const pump = new Pump('test bus', testBus, ratedFor)
    pump.Providers = input
    pump.Start()
    pump.Thick()
    expect(pump.isRunning).toBeTruthy()
    expect(pump.Output).toBe(input)
    expect(pump.Content()).toBe(input)
  })
})
