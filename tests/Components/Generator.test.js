const Generator = require('../../Components/Generator')

let generator
beforeEach(() => {
  generator = new Generator()
})

describe('Generator init', () => {
  test('No running after startup', () => {
    expect(generator.Running).toBeFalsy()
    expect(generator.HasFuel).toBeFalsy()
    expect(generator.HasCooling).toBeFalsy()
    expect(generator.Status()).toEqual({ Running: false, HasFuel: false })
  })
})

describe('Generator start/stop', () => {
  test('Cannot start without fuel', () => {
    expect(generator.HasFuel).toBeFalsy()
    generator.Start()
    expect(generator.Running).toBeFalsy()
  })
  test('Runing after start with fuel', () => {
    generator.HasFuel = true
    generator.Start()
    expect(generator.Running).toBeTruthy()
  })
  test('No running after stop', () => {
    generator.HasFuel = true
    generator.Start()
    generator.Stop()
    expect(generator.Running).toBeFalsy()
  })
})
