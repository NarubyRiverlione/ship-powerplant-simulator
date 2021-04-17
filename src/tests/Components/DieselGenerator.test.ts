import DieselGenerator from '../../Components/DieselGenerator'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'
import mockCooler from '../mocks/mockCooler'
import {
  CstDsFuelSys, CstAirSys, CstPowerSys, CstLubSys
} from '../../Cst'

const Rated = 30000
const startFuelAmount = 10.0
const startLubAmount = 60.0
const startAirAmount = 100

let dsgen: DieselGenerator

beforeEach(() => {
  const fuelSource = new mockTank('dummy fuel tank', 100, startFuelAmount)
  const dummyFuelOutletValve = new mockValve('test fuel source outlet valve', fuelSource)

  const lubSource = new mockTank('dummy lub  tank', 100, startLubAmount)
  const dummyLubOutletValve = new mockValve('test lub source outlet valve', lubSource, CstPowerSys.DsGen.Slump.IntakeValveVolume)

  const airSource = new mockTank('dummy air receiver', 100, startAirAmount)
  const dummyAirOutletValve = new mockValve('test air source valve', airSource)

  const dummyLubCooler = new mockCooler('dummy cooler')
  dummyLubCooler.CoolCircuitComplete = true

  dsgen = new DieselGenerator('test diesel generator', Rated,
    dummyFuelOutletValve, dummyLubOutletValve, dummyAirOutletValve, dummyLubCooler)

  dsgen.FuelConsumption = CstDsFuelSys.DieselGenerator.Consumption.Diesel
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
    expect(dsgen.FuelConsumption).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(0)
  })
  test('Lubrication intake valve closed at start', () => {
    expect(dsgen.LubIntakeValve.isOpen).toBeFalsy()
    expect(dsgen.LubIntakeValve.Source.Content).toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume)
  })
  test('Air intake valve closed at start', () => {
    expect(dsgen.AirIntakeValve.Source.Content).toBe(startAirAmount)
    expect(dsgen.AirIntakeValve.isOpen).toBeFalsy()
  })
  test('Empty slump', () => {
    expect(dsgen.LubSlump.Content).toBe(0)
  })
})

describe('Slump', () => {
  test('Open lub intake but closed source lub valve = not filling', () => {
    const lubSourceValve = dsgen.LubIntakeValve.Source as mockValve
    lubSourceValve.Close()
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubSlump.AddThisStep).toBe(0)
    expect(dsgen.LubSlump.Content).toBe(0)
    expect(dsgen.LubProvider.RemoveThisStep).toBe(0)
  })
  test('Open lub intake = slump adding, remove from Lub provider', () => {
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubSlump.AddThisStep).toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume)
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume)
    expect(dsgen.LubProvider.RemoveThisStep)
      .toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume / CstLubSys.RatioStorageDsGenSlump)
  })
  test('Re-close lub intake = slump stop adding', () => {
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubProvider.RemoveThisStep)
      .toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume / CstLubSys.RatioStorageDsGenSlump)
    dsgen.LubIntakeValve.Close()
    dsgen.Thick()
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume)
    expect(dsgen.LubProvider.RemoveThisStep).toBe(0)
    expect(dsgen.LubSlump.AddThisStep).toBe(0)
  })
  test('Lub source is empty, stop adding slump', () => {
    dsgen.LubProvider = new mockTank('dummy', 100, CstPowerSys.DsGen.Slump.IntakeValveVolume)
    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.LubSlump.AddThisStep).toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume)
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume)
    // dummy test source  hasn't logic to remove content, set manual to 0
    dsgen.LubIntakeValve.Source = new mockTank('dummy', 100, 0)
    expect(dsgen.LubIntakeValve.Source.Content).toBe(0)

    dsgen.Thick()
    expect(dsgen.LubSlump.AddThisStep).toBe(0)
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume)
    dsgen.Thick()
    expect(dsgen.LubSlump.AddThisStep).toBe(0)
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen.Slump.IntakeValveVolume)
  })

  test('slump above minimum = has lubrication', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.Thick()
    expect(dsgen.HasLubrication).toBeTruthy()
  })
})
describe('Start', () => {
  test('not fuel = cannot start', () => {
    expect(dsgen.FuelIntakeValve.isOpen).toBeFalsy()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
  })
  test('has fuel and has lubrication valve but air intake is closed  = cannot start', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.HasLubrication).toBeTruthy()
    expect(dsgen.HasFuel).toBeTruthy()
    expect(dsgen.AirIntakeValve.isOpen).toBeFalsy()
    expect(dsgen.CheckAir).toBeFalsy()

    dsgen.Start()
    expect(dsgen.isRunning).toBeFalsy()
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
  test('open fuel valve & has lubrication & min air & cooling = can start = consumes fuel & start air', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.FuelIntakeValve.isOpen).toBeTruthy()
    expect(dsgen.FuelIntakeValve.Content).toBe(startFuelAmount)
    expect(dsgen.HasFuel).toBeTruthy()

    dsgen.LubIntakeValve.Open()
    dsgen.Thick()
    expect(dsgen.HasLubrication).toBeTruthy()

    dsgen.AirIntakeValve.Open()
    dsgen.Start()

    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    // consumes fuel
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)
    // consumes one time start air
    expect(dsgen.AirProvider.Content).toEqual(startAirAmount - CstAirSys.DieselGenerator.StarAirConsumption)

    dsgen.Thick()
    // no futher air consomsion 
    expect(dsgen.AirProvider.Content).toEqual(startAirAmount - CstAirSys.DieselGenerator.StarAirConsumption)

  })
  test('running and no fuel  = stop', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.LubIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()

    const emptyFuelSource = new mockTank('empty tank', 100, 0)
    const emptyFuelValve = new mockValve('dummy', emptyFuelSource)

    dsgen.FuelIntakeValve = emptyFuelValve
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(emptyFuelSource.RemoveThisStep).toBe(0)
  })
  test('running and open fuel valve = stop', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.FuelProvider.Thick()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)

    dsgen.FuelIntakeValve.Close()
    dsgen.FuelProvider.Thick()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasFuel).toBeFalsy()
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(0)
  })
  test('running and not enough lubrication valve = stop', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.FuelProvider.Thick()
    dsgen.Thick()
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen.Slump.MinForLubrication)
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)

    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication - 1
    dsgen.FuelProvider.Thick()
    dsgen.Thick()
    expect(dsgen.LubSlump.Content).toBe(CstPowerSys.DsGen.Slump.MinForLubrication - 1)
    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.HasLubrication).toBeFalsy()
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(0)
  })
  test('running no air = keep running as air is only needed to start', () => {
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.Start()
    dsgen.FuelProvider.Thick()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)

    dsgen.AirIntakeValve.Close()
    dsgen.FuelProvider.Thick()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeTruthy()
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)
  })
  test('fuel & lubrication but to less air = cannot start', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    const notEnoughStartAir = CstAirSys.DieselGenerator.StarAirConsumption - 0.1
    const mockAirTank = new mockTank('dummy', 100, notEnoughStartAir)
    dsgen.AirProvider = mockAirTank

    dsgen.AirIntakeValve.Source = new mockValve('mock air outlet valve', mockAirTank)
    dsgen.AirIntakeValve.Open()
    dsgen.Thick()

    expect(dsgen.AirIntakeValve.Content).toEqual(notEnoughStartAir)
    dsgen.Start()
    dsgen.Thick()

    expect(dsgen.isRunning).toBeFalsy()
    expect(dsgen.FuelProvider.RemoveThisStep).toBe(0)
  })
  test('without cooling = cannot start', () => {
    dsgen.LubCooler.CoolCircuitComplete = false
    dsgen.Start()
    dsgen.Thick()
    expect(dsgen.isRunning).toBeFalsy()
  })
  test('running but stop cooling = stop generator', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.Start()
    expect(dsgen.isRunning).toBeTruthy()

    dsgen.LubCooler.CoolCircuitComplete = false
    dsgen.Thick()
    expect(dsgen.HasCooling).toBeFalsy()
    expect(dsgen.isRunning).toBeFalsy()
  })
  test('running but no enough lubrication = stop generator', () => {
    dsgen.FuelIntakeValve.Open()
    dsgen.AirIntakeValve.Open()
    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
    dsgen.Start()
    expect(dsgen.isRunning).toBeTruthy()

    dsgen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication - 1
    dsgen.Thick()
    expect(dsgen.HasLubrication).toBeFalsy()
    expect(dsgen.isRunning).toBeFalsy()
  })
})
