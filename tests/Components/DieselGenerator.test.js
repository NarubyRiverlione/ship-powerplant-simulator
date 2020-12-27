const DieselGenerator = require('../../src/Components/DieselGenerator')
const { CstFuelSys, CstAirSys } = require('../../src/Cst')

const Rated = 30000
const startFuelAmount = 10000
const startLubAmount = 2000
const startAirAmount = 5

let dsgen
let fuelSource
const lubSource = { Content: () => startLubAmount }
const airSource = { Content: () => startAirAmount }

beforeEach(() => {
  fuelSource = { Content: () => startFuelAmount, RemoveEachStep: 0 }

  const dummyFuelValve = { Source: fuelSource, isOpen: true }
  dummyFuelValve.Content = () => fuelSource.Content()

  const dummyLubValve = { Source: lubSource, isOpen: true }
  dummyLubValve.Content = () => lubSource.Content()

  const dummyAirValve = { Source: airSource, isOpen: true }
  dummyAirValve.Content = () => airSource.Content()

  dsgen = new DieselGenerator('test diesel generator', Rated,
    dummyFuelValve, dummyLubValve, dummyAirValve)

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
  test('Air intake valve closed at start', () => {
    expect(dsgen.AirIntakeValve.Source.Content()).toBe(startAirAmount)
    expect(dsgen.AirIntakeValve.isOpen).toBeFalsy()
    expect(dsgen.AirProvider).toEqual(airSource)
  })
})
describe('Start', () => {
  test('closed fuel & lubrication valves & no air = cannot start', () => {
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    expect(dsgen.LubIntakeValve.isOpen).toBeFalsy()

    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
  })
  test('closed fuel intake, open lubrication valve & no air  = cannot start', () => {
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubIntakeValve.Content()).toBe(startLubAmount)
    expect(dsgen.HasLubrication).toBeTruthy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
  })
  test('open fuel intake, closed lubrication valve & no air  = cannot start', () => {
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
  test('open fuel valve & open lubrication & min air  = can start = consumes fuel', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy()
    expect(dsgen.FuelIntakeValve.Content()).toBe(startFuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()

    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubIntakeValve.Content()).toBe(startLubAmount)
    expect(dsgen.HasLubrication).toBeTruthy()

    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)
    // cannot test fuelSource.content, dummy source hasn't the remove logic
  })
  test('running and open fuel valve = stop', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.LubIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
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
    dsgen.AirIntakeValve.Open()
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
  test('running no air = keep running as air is only needed to start', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.LubIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

    dsgen.AirIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)
  })
  test('fuel & lubrication but to less air = cannot start', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.LubIntakeValve.Open()

    dsgen.AirIntakeValve.Source = { Content: () => CstAirSys.DieselGenerator.MinPressure - 0.1 }
    dsgen.AirIntakeValve.Open()
    dsgen.Thick()

    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(fuelSource.RemoveEachStep).toBe(0)
  })
})
