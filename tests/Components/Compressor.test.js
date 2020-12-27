const Compressor = require('../../Components/Compressor')

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
})

describe('output', () => {
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
