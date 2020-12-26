const DieselGenerator = require('../../Components/DieselGenerator')
const { CstFuelSys } = require('../../Cst')

const Rated = 30000
const startFuelAmount = 10000
const startLubAmount = 2000

let dsgen
let fuelSource
const lubSource = { Content: () => startLubAmount }

beforeEach(() => {
  fuelSource = { Content: () => startFuelAmount, RemoveEachStep: 0 }

  const dummyFuelValve = { Source: fuelSource, isOpen: false }
  dummyFuelValve.Content = () => fuelSource.Content()

  const dummyLubValve = { Source: lubSource, isOpen: false }

  dsgen = new DieselGenerator('test diesel generator', Rated,
    fuelSource, dummyFuelValve,
    lubSource, dummyLubValve)

  dsgen.FuelConsumption = CstFuelSys.DieselGenerator.Consumption
  //  workaround to give DsGen1  cooling
  //  Don't test Generator here, test powerSys
  dsgen.HasCooling = true
})

describe('init', () => {
  test('generator not running', () => {
    expect(dsgen.RatedFor).toBe(Rated)
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    // expect(dsgen.HasCooling).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
  })
  test('Fuel intake valve closed at start', () => {
    //  expect(dsgen.FuelIntakeValve.Source).toEqual(dummyValve)
    // valve only has content of opened, so test here source
    expect(dsgen.FuelIntakeValve.Source.Content()).toBe(startFuelAmount)
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    expect(dsgen.FuelProvider).toEqual(fuelSource)
    expect(dsgen.FuelConsumption).toBe(CstFuelSys.DieselGenerator.Consumption)
    expect(fuelSource.RemoveEachStep).toBe(0)
  })
  test('Lubrication intake valve closed at start', () => {
    expect(dsgen.LubIntakeValve.Source.Content()).toBe(startLubAmount)
    expect(dsgen.LubIntakeValve.isOpen).toBeFalsy()
    expect(dsgen.LubProvider).toEqual(lubSource)
  })
})
describe('Start', () => {
  test('with closed fuel valve = not running', () => {
    const fuelSource = { Content: () => startFuelAmount, RemoveEachStep: 0 }
    const dummyValve = { Source: fuelSource, isOpen: false }
    dummyValve.Content = () => fuelSource.Content()

    const dsgen = new DieselGenerator('test diesel generator', Rated, fuelSource, dummyValve)
    dsgen.FuelConsumption = CstFuelSys.DieselGenerator.Consumption

    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    expect(dsgen.FuelIntakeValve.Content()).toBe(0)
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
  })
  test('with open fuel valve = running  = consumes fuel', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.Content()).toBe(startFuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)
    // cannot test fuelSource.content, dummy source hasn't the remove logic
  })
  test('running and open fuel valve = stop', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    dsgen.Start()
    expect(dsgen.isRunning).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

    dsgen.FuelIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(fuelSource.RemoveEachStep).toBe(0)
  })
})
