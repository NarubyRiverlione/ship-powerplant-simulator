const PowerSystem = require('../../Systems/PowerSystem')
const { CstBoundaries } = require('../../Cst')

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
})

describe('Shore power', () => {
  test('Providers after connecting shore', () => {
    powerSys.ConnectShore()
    expect(powerSys.Providers).toBe(CstBoundaries.PowerSys.Shore)
    expect(powerSys.MainBus1.Voltage).toBe(0)
  })
  test('Providers after disconnecting shore', () => {
    powerSys.ConnectShore()
    powerSys.DisconnectShore()
    expect(powerSys.Providers).toBe(0)
    expect(powerSys.MainBus1.Voltage).toBe(0)
  })
})
describe('Main bus', () => {
  test('Main breaker closed with shore power and no consumers --> main bus has voltage', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeFalsy()
    expect(powerSys.MainBreaker1.Providers).toBe(CstBoundaries.PowerSys.Shore)
    expect(powerSys.MainBus1.Providers).toBe(CstBoundaries.PowerSys.Shore)
    expect(powerSys.MainBus1.Voltage).toBe(CstBoundaries.PowerSys.Voltage)
  })
  test('Main breaker closed with shore power and to much consumers --> breaker open, main bus has no voltage', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    powerSys.MainBreaker1.Load = CstBoundaries.PowerSys.Shore + 1
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeTruthy()
    expect(powerSys.MainBus1.Providers).toBe(0)
    expect(powerSys.MainBus1.Voltage).toBe(0)
  })
  test('Main breaker tripped because consumers > providers, manually close --> stay open', () => {
    powerSys.ConnectShore()
    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    powerSys.MainBreaker1.Load = CstBoundaries.PowerSys.Shore + 1
    powerSys.Thick()

    powerSys.MainBreaker1.Close()
    powerSys.Thick()
    expect(powerSys.MainBreaker1.isOpen).toBeTruthy()
    expect(powerSys.MainBus1.Providers).toBe(0)
    expect(powerSys.MainBus1.Voltage).toBe(0)
  })
})
