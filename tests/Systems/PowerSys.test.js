const PowerSystem = require('../../Systems/PowerSystem')
const { CstBoundaries } = require('../../Cst')
const { PowerSys: CstPower } = CstBoundaries

let powerSys
beforeEach(() => {
  powerSys = new PowerSystem()
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
  test('Diesel generator 1 not running, breaker open', () => {
    powerSys.Thick()
    expect(powerSys.DsGen1.isRunning).toBeFalsy()
    expect(powerSys.DsGenBreaker1.isOpen).toBeTruthy()
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
    powerSys.DsGen1.isRunning = true
    powerSys.DsGen1.HasFuel = true
    powerSys.DsGen1.HasCooling = true
    powerSys.DsGen1.HasLubrication = true
    powerSys.DsGenBreaker1.isOpen = false
    powerSys.EmergencyGen.Start()
    powerSys.Thick()
    expect(powerSys.EmergencyGen.isRunning).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPower.DsGen1.RatedFor)
    expect(powerSys.EmergencyBus.Voltage).toBe(CstPower.Voltage)
  })
})
describe('Diesel generator 1', () => {
  test('Start DS 1, leave breaker open --> nothing provided', () => {
    //  workaround to give DsGen1 fuel, cooling, lubrication.
    //  Don't test Generator here, test powerSys
    powerSys.DsGen1.HasFuel = true
    powerSys.DsGen1.HasCooling = true
    powerSys.DsGen1.HasLubrication = true
    powerSys.DsGen1.Start()
    powerSys.Thick()
    expect(powerSys.DsGen1.isRunning).toBeTruthy()
    expect(powerSys.DsGenBreaker1.isOpen).toBeTruthy()
    expect(powerSys.Providers).toBe(0)
  })
  test('Start DS 1, close breaker  -->  providing', () => {
    //  workaround to give DsGen1 fuel, cooling, lubrication.
    //  Don't test Generator here, test powerSys
    powerSys.DsGen1.HasFuel = true
    powerSys.DsGen1.HasCooling = true
    powerSys.DsGen1.HasLubrication = true
    powerSys.DsGen1.Start()
    powerSys.Thick()
    powerSys.DsGenBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.DsGen1.isRunning).toBeTruthy()
    expect(powerSys.DsGenBreaker1.isOpen).toBeFalsy()
    expect(powerSys.Providers).toBe(CstPower.DsGen1.RatedFor)
  })
})
