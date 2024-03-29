import PowerSystem from '../../Systems/PowerSystem'
import { CstPowerSys, CstDsFuelSys, CstAirSys } from '../../Constants/Cst'
import MockValve from '../mocks/MockValve'
import MockTank from '../mocks/MockTank'
import MockCooler from '../mocks/MockCooler'

let powerSys: PowerSystem

const startFuelAmount = 10000
const startLubAmount = 2000
const startAirAmount = CstAirSys.DieselGenerator.StarAirConsumption
let fuelSource: MockTank

beforeEach(() => {
  fuelSource = new MockTank('dummy fuel source', 1e6, startFuelAmount)
  const lubSource = new MockTank('dummy lub source', 1e6, startLubAmount)
  const airSource = new MockTank('dummy air source', 1e6, startAirAmount)

  const dummyFuelOutletValve = new MockValve('dummy fuel source valve', fuelSource)
  const dummyLubOutletValve = new MockValve('dummy lub source valve', lubSource)
  const dummyAirOutletValve = new MockValve('dummy air source valve', airSource)

  const dummyLubCooler = new MockCooler('dummy FW cooler')
  dummyLubCooler.CoolCircuitComplete = true

  powerSys = new PowerSystem(dummyFuelOutletValve, dummyLubOutletValve, dummyAirOutletValve,
    dummyLubCooler)

  powerSys.DsGen.FuelIntakeValve.Open()
  powerSys.DsGen.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
  powerSys.DsGen.AirIntakeValve.Open()
})

describe('Init power', () => {
  test('Main breaker 1 is open at startup', () => {
    expect(powerSys.MainBreaker1.isOpen).toBeTruthy()
    expect(powerSys.MainBreaker1.Providers).toBe(0)
  })
  test('Shore power not connected at startup', () => {
    expect(powerSys.ShoreBreaker.isOpen).toBeTruthy()
  })
  test('Emergency generator is not running at startup', () => {
    expect(powerSys.EmergencyGen.isRunning).toBeFalsy()
  })
  test('No power in no busses at startup', () => {
    powerSys.Thick()
    expect(powerSys.MainBus1.Content).toBe(0)
    expect(powerSys.EmergencyBus.Content).toBe(0)
  })
  test('Diesel generator  not running, breaker open, fuel provider & consumption', () => {
    powerSys.Thick()
    expect(powerSys.DsGen.isRunning).toBeFalsy()
    expect(powerSys.DsGenBreaker.isOpen).toBeTruthy()
    // expect(powerSys.DsGen.FuelProvider).toEqual(fuelSource)
    expect(powerSys.DsGen.FuelConsumption).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)
    // valve only has content of opened, so test here source
    expect(powerSys.DsGen.FuelIntakeValve.Source.Content).toBe(startFuelAmount)
  })
})
describe('Shore power', () => {
  test('Providers power after connecting shore', () => {
    powerSys.ConnectShore()
    powerSys.Thick()
    expect(powerSys.Providers).toBe(CstPowerSys.Shore)
    expect(powerSys.EmergencyBus.Content).toBe(CstPowerSys.Voltage)
    expect(powerSys.MainBus1.Content).toBe(0) // main breaker is open -> no Content in main bus
  })
  test('No power after disconnecting shore with no emergence generator running', () => {
    powerSys.ConnectShore()
    powerSys.DisconnectShore()
    expect(powerSys.Providers).toBe(0)
    expect(powerSys.MainBus1.Content).toBe(0)
    expect(powerSys.EmergencyBus.Content).toBe(0)
  })
})
describe('Main bus', () => {
  test('Main breaker closed with shore power and no consumers --> main bus has Content', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeFalsy()
    expect(powerSys.MainBreaker1.Providers).toBe(CstPowerSys.Shore)
    expect(powerSys.MainBus1.Providers).toBe(CstPowerSys.Shore)
    expect(powerSys.MainBus1.Content).toBe(CstPowerSys.Voltage)
  })
  test('Main breaker closed with shore power and to much consumers --> breaker open, main bus has no Content', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    powerSys.MainBreaker1.Load = CstPowerSys.Shore + 1
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeTruthy()
    expect(powerSys.MainBus1.Providers).toBe(0)
    expect(powerSys.MainBus1.Content).toBe(0)
  })
  test('Main breaker tripped because consumers > providers, manually close --> stay open', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    powerSys.MainBreaker1.Load = CstPowerSys.Shore + 1
    powerSys.Thick()

    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeTruthy()
    expect(powerSys.MainBus1.Providers).toBe(0)
    expect(powerSys.MainBus1.Content).toBe(0)
  })
})
describe('Emergency generator', () => {
  test('Start emergency generator = provides power to emergency bus only', () => {
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeTruthy()
    expect(powerSys.EmergencyBus.Content).toBe(CstPowerSys.Voltage)
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.MainBus1.Content).toBe(0)
  })
  test('After connecting shore emergency generator stops', () => {
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    powerSys.ConnectShore()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPowerSys.Shore)
    expect(powerSys.EmergencyBus.Providers).toBe(CstPowerSys.Shore)
    expect(powerSys.EmergencyBus.Content).toBe(CstPowerSys.Voltage)
  })
  test('already connected to shore & starting emergency generator --> trip = stops', () => {
    powerSys.ConnectShore()
    powerSys.Thick()
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPowerSys.Shore)
    expect(powerSys.EmergencyBus.Content).toBe(CstPowerSys.Voltage)
  })
  test('already DsGen 1 running & starting emergency generator --> trip = stops', () => {
    powerSys.DsGen.Start()
    powerSys.DsGenBreaker.isOpen = false
    powerSys.Thick()
    expect(powerSys.DsGen.isRunning).toBeTruthy()
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPowerSys.DsGen.RatedFor)
    expect(powerSys.EmergencyBus.Content).toBe(CstPowerSys.Voltage)
  })
})
describe('Diesel generator ', () => {
  test('Start DS, leave breaker open --> nothing provided', () => {
    powerSys.DsGen.Start()
    powerSys.Thick()
    expect(powerSys.DsGen.isRunning).toBeTruthy()
    expect(powerSys.DsGenBreaker.isOpen).toBeTruthy()
    expect(powerSys.Providers).toBe(0)
  })
  test('Start DS, close breaker  -->  providing', () => {
    powerSys.DsGen.Start()
    powerSys.Thick()
    powerSys.DsGenBreaker.Close()
    powerSys.Thick()
    expect(powerSys.DsGen.isRunning).toBeTruthy()
    expect(powerSys.DsGenBreaker.isOpen).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPowerSys.DsGen.RatedFor)
  })
  test('Stop a running generator --> trip generator & main breaker', () => {
    powerSys.DsGen.Start()
    powerSys.Thick()
    expect(powerSys.DsGen.isRunning).toBeTruthy()
    powerSys.DsGenBreaker.Close()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()

    powerSys.DsGen.Stop()
    powerSys.Thick()
    expect(powerSys.DsGenBreaker.isOpen).toBeTruthy()
    expect(powerSys.MainBreaker1.isOpen).toBeTruthy()
  })
  test('Running DS, consume fuel = set fuel consumption', () => {
    const { DsGen } = powerSys

    DsGen.Start()
    expect(DsGen.isRunning).toBeTruthy()
    expect(DsGen.FuelConsumption).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)

    powerSys.Thick()
    expect(DsGen.FuelProvider.RemoveThisStep).toBe(CstDsFuelSys.DieselGenerator.Consumption.Diesel)
  })
})
