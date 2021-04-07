import Cooler from '../../Components/Cooler'

let cooler: Cooler

beforeEach(() => {
  cooler = new Cooler('test cooler')
})

describe('Init', () => {
  test('does\'t have cooling', () => {
    expect(cooler.HotCircuitComplete).toBeFalsy()
    expect(cooler.CoolCircuitComplete).toBeFalsy()
    expect(cooler.IsCooling).toBeFalsy()
    expect(cooler.Content).toBe(0)
  })
})

describe('Is cooling', () => {
  test('has cooling but no hot circuit = not cooling', () => {
    cooler.CoolCircuitComplete = true
    cooler.HotCircuitComplete = false
    expect(cooler.IsCooling).toBeFalsy()
  })
  test('hot circuit but no has no cooling = not cooling', () => {
    cooler.HotCircuitComplete = true
    cooler.CoolCircuitComplete = false
    expect(cooler.IsCooling).toBeFalsy()
  })
  test('has cooling and hot circuit = cooling', () => {
    cooler.HotCircuitComplete = true
    cooler.CoolCircuitComplete = true
    expect(cooler.IsCooling).toBeTruthy()
    expect(cooler.Content).toBe(1)
  })
  test('cooling but cool circuit stops  = not cooling anymore', () => {
    cooler.HotCircuitComplete = true
    cooler.CoolCircuitComplete = true
    expect(cooler.IsCooling).toBeTruthy()
    cooler.CoolCircuitComplete = false
    expect(cooler.IsCooling).toBeFalsy()
  })
})
