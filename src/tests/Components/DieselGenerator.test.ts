import Cooler from '../../Components/Cooler'
import DieselGenerator from '../../Components/DieselGenerator'
import mockTank from '../mocks/mockTank'
import Valve from '../../Components/Valve'
import {
  CstFuelSys, CstAirSys, CstPowerSys, CstLubSys
} from '../../Cst'

const Rated = 30000
const startFuelAmount = 10.0
const startLubAmount = 60.0
const startAirAmount = CstAirSys.DieselGenerator.MinPressure

let dsgen: DieselGenerator

beforeEach(() => {
  const fuelSource = new mockTank('dummy fuel tank', 100, startFuelAmount)
  const dummyFuelOutletValve = new Valve('test fuel source outlet valve', fuelSource)
  dummyFuelOutletValve.Open()

  const lubSource = new mockTank('dummy lub  tank', 100, startLubAmount)
  const dummyLubOutletValve = new Valve('test lub source outlet valve', lubSource)
  dummyLubOutletValve.Open()

  const airSource = new mockTank('dummy air receiver', 100, startAirAmount)
  const dummyAirOutletValve = new Valve('test air source valve', airSource)
  dummyAirOutletValve.Open()

  const dummyLubCooler = new Cooler('dummy cooler', 1)
  dummyLubCooler.isCooling = true

  dsgen = new DieselGenerator('test diesel generator', Rated,
    dummyFuelOutletValve, dummyLubOutletValve, dummyAirOutletValve, dummyLubCooler)

  dsgen.FuelConsumption = CstFuelSys.DieselGenerator.Consumption
})

describe('init', () => {
  test('generator not running, requisites are not met', () => {
    expect(dsgen.RatedFor).toBe(Rated)
    expect(dsgen.Output).toBe(0)
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(dsgen.HasCooling).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
  })
  test('Fuel intake valve closed at start', () => {
    expect(dsgen.FuelIntakeValve.Source.Content).toBe(startFuelAmount)
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    // expect(dsgen.FuelProvider).toEqual(fuelSource)
    expect(dsgen.FuelConsumption).toBe(CstFuelSys.DieselGenerator.Consumption)
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(0)
  })
  test('Lubrication intake valve closed at start', () => {
    expect(dsgen.LubIntakeValve.Source.Content).toBe(startLubAmount)
    expect(dsgen.LubIntakeValve.isOpen).toBeFalsy()
    // expect(dsgen.LubProvider).toEqual(lubSource)
  })
  test('Air intake valve closed at start', () => {
    expect(dsgen.AirIntakeValve.Source.Content).toBe(startAirAmount)
    expect(dsgen.AirIntakeValve.isOpen).toBeFalsy()
    // expect(dsgen.AirProvider).toEqual(airSource)
  })
  test('Empty slump', () => {
    expect(dsgen.LubSlump.Content).toBe(0)
  })
})
describe('Slump', () => {
  test('Open lub intake = slump adding, remove from Lub provider', () => {
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubSlump.AddEachStep).toBe(CstPowerSys.DsGen1.Slump.TankAddStep)
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen1.Slump.TankAddStep)
    expect(dsgen.LubProvider.RemoveEachStep)
      .toBe(CstPowerSys.DsGen1.Slump.TankAddStep / CstLubSys.RatioStorageDsGenSlump)
  })
  test('Re-close lub intake = slump stop adding', () => {
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubProvider.RemoveEachStep)
      .toBe(CstPowerSys.DsGen1.Slump.TankAddStep / CstLubSys.RatioStorageDsGenSlump)
    dsgen.LubIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen1.Slump.TankAddStep)
    expect(dsgen.LubProvider.RemoveEachStep).toBe(0)
    expect(dsgen.LubSlump.AddEachStep).toBe(0)
  })
  test('Lub source is empty, stop adding slump', () => {
    dsgen.LubProvider = new mockTank('dummy', 100, CstPowerSys.DsGen1.Slump.TankAddStep)
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubSlump.AddEachStep).toBe(CstPowerSys.DsGen1.Slump.TankAddStep)
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen1.Slump.TankAddStep)
    // dummy test source  hasn't logic to remove content, set manual to 0
    dsgen.LubIntakeValve.Source = new mockTank('dummy', 100, 0)
    expect(dsgen.LubIntakeValve.Source.Content).toBe(0)

    dsgen.Thick()
    expect(dsgen.LubSlump.AddEachStep).toBe(0)
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen1.Slump.TankAddStep)
    dsgen.Thick()
    expect(dsgen.LubSlump.AddEachStep).toBe(0)
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen1.Slump.TankAddStep)
  })

  test('slump above minimum = has lubrication', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.Thick()
    expect(dsgen.HasLubrication).toBeTruthy()
  })
})
describe('Start', () => {
  test('closed fuel & lubrication valves & no air = cannot start', () => {
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
    // expect(dsgen.HasCooling).toBeFalsy()
  })
  test('closed fuel intake, has lubrication valve & no air  = cannot start', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.HasLubrication).toBeTruthy()
    // expect(dsgen.HasCooling).toBeFalsy()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
  })
  test('open fuel intake, closed lubrication valve & no air  = cannot start', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy()
    expect(dsgen.FuelIntakeValve.Content).toBe(startFuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
  })
  test('open fuel valve & has lubrication & min air  = can start = consumes fuel', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy()
    expect(dsgen.FuelIntakeValve.Content).toBe(startFuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()

    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubIntakeValve.Content).toBe(startLubAmount)
    expect(dsgen.HasLubrication).toBeTruthy()

    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

  })
  test('running and no fuel  = stop', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.LubIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()

    const emptyFuelSource = new mockTank('empty tank', 100, 0)
    const emptyFuelValve = new Valve('dummy', emptyFuelSource)

    dsgen.FuelIntakeValve = emptyFuelValve
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(emptyFuelSource.RemoveEachStep).toBe(0)
    // expect(dsgen.FuelProvider.RemoveEachStep).toBe(0)
  })
  test('running and open fuel valve = stop', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

    dsgen.FuelIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(0)
  })
  test('running and not enough lubrication valve = stop', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen1.Slump.MinForLubrication)
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication - 1
    dsgen.Thick()
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen1.Slump.MinForLubrication - 1)
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(0)
  })
  test('running no air = keep running as air is only needed to start', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

    dsgen.AirIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)
  })
  test('fuel & lubrication but to less air = cannot start', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.AirIntakeValve.Source = new mockTank('dummy', 100,
      CstAirSys.DieselGenerator.MinPressure - 0.1)
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.FuelProvider.RemoveEachStep).toBe(0)
  })
  test('without cooling = cannot start', () => {
    dsgen.LubCooler.isCooling = false
    dsgen.Start()
    expect(dsgen.isRunning).toBeFalsy()
  })
  test('running and stop cooling = stop generator', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.LubSlump.Inside = CstPowerSys.DsGen1.Slump.MinForLubrication
    dsgen.Start()
    expect(dsgen.isRunning).toBeTruthy()

    dsgen.LubCooler.isCooling = false
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
  })
})
