const PowerSystem = require('../../Systems/PowerSystem')
const { CstBoundaries, CstFuelSys } = require('../../Cst')
const { PowerSys: CstPower } = CstBoundaries

// fake fuel source, testing diesel generator only here, not the complete system (that's simulator test)
// const fuelSource = { Content: () => fuelAmount, RemoveEachStep: 0 }

const startFuelAmount = 10000
let powerSys
let fuelSource
beforeEach(() => {
  fuelSource = { Content: () => startFuelAmount, RemoveEachStep: 0 }
  const dummyValve = { Source: fuelSource, isOpen: false }
  dummyValve.Content = () => fuelSource.Content()
  powerSys = new PowerSystem(fuelSource, dummyValve)
  //  workaround to give DsGen1  cooling, lubrication.
  //  Don't test Generator here, test powerSys
  powerSys.DsGen1.HasCooling = true
  powerSys.DsGen1.HasLubrication = true
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
    expect(powerSys.MainBus1.Voltage).toBe(0)
    expect(powerSys.EmergencyBus.Voltage).toBe(0)
  })
  test('Diesel generator 1 not running, breaker open, fuel provider & consumption', () => {
    powerSys.Thick()
    expect(powerSys.DsGen1.isRunning).toBeFalsy()
    expect(powerSys.DsGenBreaker1.isOpen).toBeTruthy()
    // expect(powerSys.DsGen1.FuelProvider).toEqual(fuelSource)
    expect(powerSys.DsGen1.FuelConsumption).toBe(CstFuelSys.DieselGenerator.Consumption)
    // valve only has content of opened, so test here source
    expect(powerSys.DsGen1.FuelIntakeValve.Source.Content()).toBe(startFuelAmount)
  })
})
describe('Shore power', () => {
  test('Providers power after connecting shore', () => {
    powerSys.ConnectShore()
    powerSys.Thick()
    expect(powerSys.Providers).toBe(CstPower.Shore)
    expect(powerSys.EmergencyBus.Voltage).toBe(CstPower.Voltage)
    expect(powerSys.MainBus1.Voltage).toBe(0) // main breaker is open -> no voltage in main bus
  })
  test('No power after disconnecting shore with no emergence generator running', () => {
    powerSys.ConnectShore()
    powerSys.DisconnectShore()
    expect(powerSys.Providers).toBe(0)
    expect(powerSys.MainBus1.Voltage).toBe(0)
    expect(powerSys.EmergencyBus.Voltage).toBe(0)
  })
})
describe('Main bus', () => {
  test('Main breaker closed with shore power and no consumers --> main bus has voltage', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeFalsy()
    expect(powerSys.MainBreaker1.Providers).toBe(CstPower.Shore)
    expect(powerSys.MainBus1.Providers).toBe(CstPower.Shore)
    expect(powerSys.MainBus1.Voltage).toBe(CstPower.Voltage)
  })
  test('Main breaker closed with shore power and to much consumers --> breaker open, main bus has no voltage', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    powerSys.MainBreaker1.Load = CstPower.Shore + 1
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeTruthy()
    expect(powerSys.MainBus1.Providers).toBe(0)
    expect(powerSys.MainBus1.Voltage).toBe(0)
  })
  test('Main breaker tripped because consumers > providers, manually close --> stay open', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    powerSys.MainBreaker1.Load = CstPower.Shore + 1
    powerSys.Thick()

    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeTruthy()
    expect(powerSys.MainBus1.Providers).toBe(0)
    expect(powerSys.MainBus1.Voltage).toBe(0)
  })
})
describe('Emergency generator', () => {
  test('Start emergency generator = provides power to emergency bus only', () => {
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeTruthy()
    expect(powerSys.Providers).toBe(CstPower.EmergencyGen.RatedFor)
    expect(powerSys.EmergencyBus.Voltage).toBe(CstPower.Voltage)
    expect(powerSys.MainBus1.Voltage).toBe(0)
  })
  test('After connecting shore emergency generator stops', () => {
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    powerSys.ConnectShore()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPower.Shore)
    expect(powerSys.EmergencyBus.Voltage).toBe(CstPower.Voltage)
  })
  test('already connected to shore & starting emergency generator --> trip = stops', () => {
    powerSys.ConnectShore()
    powerSys.Thick()
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPower.Shore)
    expect(powerSys.EmergencyBus.Voltage).toBe(CstPower.Voltage)
  })
  test('already DsGen 1 running & starting emergency generator --> trip = stops', () => {
    powerSys.DsGen1.FuelIntakeValve.Open()
    powerSys.DsGen1.HasCooling = true
    powerSys.DsGen1.HasLubrication = true
    powerSys.DsGen1.Start()
    powerSys.DsGenBreaker1.isOpen = false
    powerSys.Thick()
    expect(powerSys.DsGen1.isRunning).toBeTruthy()
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPower.DsGen1.RatedFor)
    expect(powerSys.EmergencyBus.Voltage).toBe(CstPower.Voltage)
  })
})
describe('Diesel generator 1', () => {
  test('Start DS 1, leave breaker open --> nothing provided', () => {
    powerSys.DsGen1.FuelIntakeValve.Open()
    powerSys.DsGen1.Start()
    powerSys.Thick()
    expect(powerSys.DsGen1.isRunning).toBeTruthy()
    expect(powerSys.DsGenBreaker1.isOpen).toBeTruthy()
    expect(powerSys.Providers).toBe(0)
  })
  test('Start DS 1, close breaker  -->  providing', () => {
    powerSys.DsGen1.FuelIntakeValve.Open()
    powerSys.DsGen1.Start()
    powerSys.Thick()
    powerSys.DsGenBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.DsGen1.isRunning).toBeTruthy()
    expect(powerSys.DsGenBreaker1.isOpen).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPower.DsGen1.RatedFor)
  })
  test('Stop a running generator --> trip generator breaker', () => {
    powerSys.DsGen1.FuelIntakeValve.Open()
    powerSys.DsGen1.Start()
    powerSys.Thick()
    powerSys.DsGenBreaker1.Close()
    powerSys.Thick()

    powerSys.DsGen1.Stop()
    powerSys.Thick()
    expect(powerSys.DsGenBreaker1.isOpen).toBeTruthy()
  })
  test('Running DS 1, consume fuel = set fuel consumption', () => {
    powerSys.DsGen1.FuelIntakeValve.Open()
    powerSys.DsGen1.Start()
    expect(powerSys.DsGen1.FuelProvider).toEqual(fuelSource)
    expect(powerSys.DsGen1.FuelConsumption).toBe(CstFuelSys.DieselGenerator.Consumption)

    powerSys.Thick()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)
  })
})
