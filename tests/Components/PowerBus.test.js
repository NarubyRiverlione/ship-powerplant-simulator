const PowerBus = require('../../Components/PowerBus')
const { CstBoundaries } = require('../../Cst')

describe('Init', () => {
  test('init', () => {
    const testBus = new PowerBus('testbus')
    testBus.Thick()
    expect(testBus.Name).toBe('testbus')
    expect(testBus.Voltage).toBe(0)
    expect(testBus.Providers).toBe(0)
  })
})

describe('Voltage', () => {
  test('Provider --> voltage', () => {
    const testBus = new PowerBus('test bus')
    testBus.Providers = 1000
    testBus.Thick()
    expect(testBus.Voltage).toBe(CstBoundaries.PowerSys.Voltage)
  })
  test('Remove provider --> voltage =0 ', () => {
    const testBus = new PowerBus('test bus')
    testBus.Providers = 1000
    testBus.Thick()
    testBus.Providers = 0
    testBus.Thick()
    expect(testBus.Voltage).toBe(0)
  })
})
