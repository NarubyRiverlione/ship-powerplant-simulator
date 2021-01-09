import Cooler from '../../Components/Cooler'

const coolingRate = 123
let cooler: Cooler

beforeEach(() => {
  cooler = new Cooler('test cooler', coolingRate)
})

describe('Init', () => {
  test('does\'t have cooling', () => {
    cooler.hasCooling = false
    cooler.isCooling = false
  })
  test('Cooling input rate', () => {
    cooler.CoolingInputRate = coolingRate
  })
  test('no hot circuit ', () => {
    expect(cooler.HotCircuitComplete).toBeFalsy()
  })
  test('no cool circuit', () => {
    expect(cooler.CoolingCircuitComplete).toBeFalsy()
  })
})

describe('Cooling rate checks', () => {
  test('Cooling input > cooling rate = is cooling', () => {
    const coolInput = 789
    cooler.CoolingProviders = coolInput
    expect(cooler.CheckCoolingRate).toBeTruthy()
  })
  test('Cooling input < cooling rate = no cooling', () => {
    const coolInput = 122
    cooler.CoolingProviders = coolInput
    expect(cooler.CheckCoolingRate).toBeFalsy()
  })
})

describe('Has cooling', () => {
  test('Circuit ok & providers > rate =  has cooling', () => {
    cooler.CoolingCircuitComplete = true
    cooler.CoolingProviders = 456
    cooler.Thick()
    expect(cooler.hasCooling).toBeTruthy()
  })
  test('Circuit ok & providers < rae = has no cooling', () => {
    cooler.CoolingCircuitComplete = true
    cooler.CoolingProviders = 2
    cooler.Thick()
    expect(cooler.hasCooling).toBeFalsy()
  })
  test('Circuit nok & providers > rate = has no cooling', () => {
    cooler.CoolingCircuitComplete = false
    cooler.CoolingProviders = 2895
    cooler.Thick()
    expect(cooler.hasCooling).toBeFalsy()
  })
  test('Circuit nok & providers < rate = has no cooling', () => {
    cooler.CoolingCircuitComplete = false
    cooler.CoolingProviders = 56
    cooler.Thick()
    expect(cooler.hasCooling).toBeFalsy()
  })
})

describe('Is cooling', () => {
  test('has cooling but no hot circuit = not cooling', () => {
    cooler.CoolingProviders = 546
    cooler.Thick()
    expect(cooler.isCooling).toBeFalsy()
  })
  test('hot circuit but no has no cooling = not cooling', () => {
    cooler.HotCircuitComplete = true
    cooler.CoolingCircuitComplete = false
    cooler.Thick()
    expect(cooler.isCooling).toBeFalsy()
  })
  test('has cooling and hot circuit = cooling', () => {
    cooler.CoolingProviders = 127
    cooler.HotCircuitComplete = true
    cooler.CoolingCircuitComplete = true
    cooler.Thick()
    expect(cooler.isCooling).toBeTruthy()
  })
  test('not enough cooling and hot circuit = not cooling', () => {
    cooler.CoolingProviders = 7
    cooler.HotCircuitComplete = true
    cooler.CoolingCircuitComplete = true
    cooler.Thick()
    expect(cooler.hasCooling).toBeFalsy()
    expect(cooler.isCooling).toBeFalsy()
  })
})
