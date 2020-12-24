const DieselGenerator = require('../../Components/DieselGenerator')

const Rated = 30000
const fuelAmount = 10000
const fuelSource = { Content: () => fuelAmount }

describe('init', () => {
  test('Fuel valve closed at start', () => {
    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource)
    expect(dsgen.RatedFor).toBe(Rated)
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    // valve only has content of opened, so test here source
    expect(dsgen.FuelIntakeValve.Source.Content()).toBe(fuelAmount)
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
  })
})
describe('Start', () => {
  test('with closed fuel valve = not running', () => {
    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource)
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
  })
  test('with open fuel valve = running', () => {
    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource)
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.Content()).toBe(fuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()
    dsgen.Start()
    expect(dsgen.isRunning).toBeTruthy()
  })
  test('running and open fuel valve = stop', () => {
    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource)
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    dsgen.Start()
    expect(dsgen.isRunning).toBeTruthy()
    dsgen.FuelIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
  })
})
