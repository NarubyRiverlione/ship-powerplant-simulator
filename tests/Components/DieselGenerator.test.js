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

  const dummyFuelValve = { Source: fuelSource, isOpen: true }
  dummyFuelValve.Content = () => fuelSource.Content()

  const dummyLubValve = { Source: lubSource, isOpen: true }
  dummyLubValve.Content = () => lubSource.Content()

  dsgen = new DieselGenerator('test diesel generator', Rated,
    dummyFuelValve, dummyLubValve)

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
    expect(dsgen.FuelIntakeValve.Source.Content()).toBe(startFuelAmount)
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    // expect(dsgen.FuelProvider).toEqual(fuelSource)
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
  test('closed fuel & lubrication valves = cannot start', () => {
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    expect(dsgen.LubIntakeValve.isOpen).toBeFalsy()

    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
  })
  test('closed fuel intake, open lubrication valve = cannot start', () => {
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubIntakeValve.Content()).toBe(startLubAmount)
    expect(dsgen.HasLubrication).toBeTruthy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
  })
  test('open fuel intake, closed lubrication valve = cannot start', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy()
    expect(dsgen.FuelIntakeValve.Content()).toBe(startFuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
  })
  test('open fuel valve & open lubrication = can start = consumes fuel', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy()
    expect(dsgen.FuelIntakeValve.Content()).toBe(startFuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()

    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubIntakeValve.Content()).toBe(startLubAmount)
    expect(dsgen.HasLubrication).toBeTruthy()

    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)
    // cannot test fuelSource.content, dummy source hasn't the remove logic
  })
  test('running and open fuel valve = stop', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.LubIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

    dsgen.FuelIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(fuelSource.RemoveEachStep).toBe(0)
  })
  test('running and open lubrication valve = stop', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.LubIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

    dsgen.LubIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
    expect(fuelSource.RemoveEachStep).toBe(0)
  })
})
