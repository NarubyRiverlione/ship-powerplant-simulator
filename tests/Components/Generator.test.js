const Generator = require('../../Components/Generator')

let generator
beforeEach(() => {
  generator = new Generator()
})

describe('Generator init', () => {
  test('No running after startup', () => {
    expect(generator.isRunning).toBeFalsy()
    expect(generator.HasFuel).toBeFalsy()
    expect(generator.HasCooling).toBeFalsy()
    expect(generator.HasLubrication).toBeFalsy()
    generator.Thick()
    expect(generator.Output).toBe(0)
  })
})
describe('Generator start/stop', () => {
  test('Cannot start without fuel', () => {
    generator.HasLubrication = true; generator.HasCooling = true
    expect(generator.HasFuel).toBeFalsy()
    generator.Start()
    generator.Thick()
    expect(generator.isRunning).toBeFalsy()
    expect(generator.Output).toBe(0)
  })
  test('Cannot start without cooling', () => {
    generator.HasFuel = true; generator.HasLubrication = true
    expect(generator.HasCooling).toBeFalsy()
    generator.Start()
    generator.Thick()
    expect(generator.isRunning).toBeFalsy()
    expect(generator.Output).toBe(0)
  })
  test('Cannot start without lubrication', () => {
    generator.HasFuel = true; generator.HasCooling = true
    expect(generator.HasLubrication).toBeFalsy()
    generator.Start()
    generator.Thick()
    expect(generator.isRunning).toBeFalsy()
    expect(generator.Output).toBe(0)
  })
  test('Correct start', () => {
    const rate = 12358
    generator.RatedFor = rate
    generator.HasFuel = true
    generator.HasCooling = true
    generator.HasLubrication = true
    generator.Start()
    generator.Thick()
    expect(generator.isRunning).toBeTruthy()
    expect(generator.Output).toBe(rate)
  })
  test('No running after stop', () => {
    generator.RatedFor = 1236982
    generator.HasFuel = true
    generator.HasCooling = true
    generator.HasLubrication = true
    generator.Start()
    generator.Thick()
    generator.Stop()
    generator.Thick()
    expect(generator.isRunning).toBeFalsy()
    expect(generator.Output).toBe(0)
  })
  test('Trip without fuel', () => {
    generator.HasLubrication = true; generator.HasCooling = true; generator.HasFuel = true
    generator.Start()
    generator.Thick()
    generator.HasFuel = false
    generator.Thick()
    expect(generator.isRunning).toBeFalsy()
    expect(generator.Output).toBe(0)
  })
  test('Trip without cooling', () => {
    generator.HasLubrication = true; generator.HasCooling = true; generator.HasFuel = true
    generator.Start()
    generator.Thick()
    generator.HasCooling = false
    generator.Thick()
    expect(generator.isRunning).toBeFalsy()
    expect(generator.Output).toBe(0)
  })
  test('Trip without lubrication', () => {
    generator.HasLubrication = true; generator.HasCooling = true; generator.HasFuel = true
    generator.Start()
    generator.Thick()
    generator.HasLubrication = false
    generator.Thick()
    expect(generator.isRunning).toBeFalsy()
    expect(generator.Output).toBe(0)
  })
})
describe('Fuel consumption', () => {
  test('running = consume fuel', () => {
    const consumption = 1235
    const fuelSource = { RemoveEachStep: 0 }
    generator.FuelProvider = fuelSource
    generator.FuelConsumption = consumption
    generator.HasFuel = true
    generator.HasCooling = true
    generator.HasLubrication = true
    generator.Start()
    generator.Thick()
    expect(generator.isRunning).toBeTruthy()
    expect(generator.FuelConsumption).toBe(consumption)
    expect(generator.FuelProvider.RemoveEachStep).toBe(consumption)
    expect(generator.FuelProvider.Removing).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(consumption)
  })
  test('stop after running = no consume fuel', () => {
    const consumption = 1235
    const fuelSource = { RemoveEachStep: 0 }
    generator.FuelProvider = fuelSource
    generator.FuelConsumption = consumption
    generator.HasFuel = true
    generator.HasCooling = true
    generator.HasLubrication = true
    generator.Start()
    generator.Thick()
    generator.Stop()
    generator.Thick()

    expect(fuelSource.RemoveEachStep).toBe(0)
    expect(generator.FuelProvider.Removing).toBeFalsy()
  })
})
describe('Toggle', () => {
  test('toggle stopped --> running', () => {
    generator.HasCooling = true; generator.HasFuel = true; generator.HasLubrication = true
    generator.Toggle()
    expect(generator.isRunning).toBeTruthy()
  })
  test('toggle running --> stopped', () => {
    generator.HasCooling = true; generator.HasFuel = true; generator.HasLubrication = true
    generator.Start()
    generator.Toggle()
    expect(generator.isRunning).toBeFalsy()
  })
})
