const Compressor = require('../../src/Components/Compressor')

describe('Init', () => {
  test('set possible output', () => {
    const ratedFor = 13568
    const comp = new Compressor('test', null, ratedFor)
    expect(comp.RatedFor).toBe(ratedFor)
  })
  test('no output', () => {
    const ratedFor = 13568
    const testBus = { Voltage: 158 }
    const comp = new Compressor('test bus', testBus, ratedFor)
    expect(comp.Output).toBe(0)
    expect(comp.Content()).toBe(0)
  })
  test('outlet valve is closed', () => {
    const ratedFor = 13568
    const testBus = { Voltage: 158 }
    const comp = new Compressor('test bus', testBus, ratedFor)
    expect(comp.OutletValve.isOpen).toBeFalsy()
    expect(comp.OutletValve.Content()).toBe(0)
  })
})

describe('running', () => {
  test('running compressor has rated output', () => {
    const ratedFor = 13568
    const testBus = { Voltage: 158 }
    const comp = new Compressor('test bus', testBus, ratedFor)
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.Thick()
    expect(comp.Output).toBe(ratedFor)
    expect(comp.Content()).toBe(ratedFor)
  })
  test('stop a running compressor = no output', () => {
    const ratedFor = 13568
    const testBus = { Voltage: 158 }
    const comp = new Compressor('test bus', testBus, ratedFor)
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.Thick()
    comp.Stop()
    comp.Thick()
    expect(comp.Output).toBe(0)
    expect(comp.Content()).toBe(0)
  })
  test('running compressor lost power =no output', () => {
    const ratedFor = 13568
    const testBus = { Voltage: 158 }
    const comp = new Compressor('test bus', testBus, ratedFor)
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.Thick()
    testBus.Voltage = 0
    comp.Thick()
    expect(comp.isRunning).toBeFalsy()
    expect(comp.Output).toBe(0)
    expect(comp.Content()).toBe(0)
  })
})

describe('output via outlet valve', () => {
  test('running + closed outlet = valve has no content', () => {
    const ratedFor = 13568
    const testBus = { Voltage: 158 }
    const comp = new Compressor('test bus', testBus, ratedFor)
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.Thick()
    expect(comp.OutletValve.Content()).toBe(0)
  })
  test('running + open outlet = valve has  content', () => {
    const ratedFor = 13568
    const testBus = { Voltage: 158 }
    const comp = new Compressor('test bus', testBus, ratedFor)
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.OutletValve.Open()
    comp.Thick()
    expect(comp.OutletValve.Content()).toBe(ratedFor)
  })
  test('not running + open outlet, then running = valve has  content', () => {
    const ratedFor = 13568
    const testBus = { Voltage: 158 }
    const comp = new Compressor('test bus', testBus, ratedFor)
    comp.OutletValve.Open()
    comp.Thick()
    comp.Start()
    comp.Thick()
    expect(comp.isRunning).toBeTruthy()
    expect(comp.OutletValve.Content()).toBe(ratedFor)
  })
})
