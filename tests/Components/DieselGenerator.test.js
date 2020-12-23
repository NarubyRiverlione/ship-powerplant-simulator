const DieselGenerator = require('../../Components/DieselGenerator')

const Rated = 30000
const fuelAmount = 10000
const fuelSource = {}
fuelSource.Content = () => fuelAmount

describe('init', () => {
  test('Fuel valve open at start', () => {
    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource)
    expect(dsgen.RatedFor).toBe(Rated)
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.FuelIntakeValve.Source.Content()).toBe(fuelAmount)
    expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy()
  })
})
describe('Start', () => {
  test('with open fuel valve = not running', () => {
    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource)
    expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
  })
  test('with closed fuel valve = running', () => {
    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource)
    dsgen.FuelIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.Content()).toBe(fuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()
    dsgen.Start()
    expect(dsgen.isRunning).toBeTruthy()
  })
  test('running and closing fuel valve = stop', () => {
    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource)
    dsgen.FuelIntakeValve.Close()
    dsgen.Thick()
    dsgen.Start()
    expect(dsgen.isRunning).toBeTruthy()
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
  })
})
