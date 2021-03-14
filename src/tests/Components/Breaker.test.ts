import Breaker from '../../Components/Breaker'

let breaker: Breaker
beforeEach(() => {
  breaker = new Breaker('test breaker')
})

describe('Init breaker', () => {
  test('beaker is open', () => {
    expect(breaker.isOpen).toBeTruthy()
  })
  test('Rated = 0, load = 0, provider = 0', () => {
    expect(breaker.RatedFor).toBe(0)
    expect(breaker.Load).toBe(0)
    expect(breaker.Content).toBe(0)
    expect(breaker.Providers).toBe(0)
  })
})
describe('Open / close without load', () => {
  test('close', () => {
    breaker.Close()
    expect(breaker.isOpen).toBeFalsy()
  })
  test('open previous closed breaker', () => {
    breaker.Close()
    breaker.Open()
    expect(breaker.isOpen).toBeTruthy()
  })
})
describe('Breaker loaded', () => {
  test('Close with load < RatedFor --> stay closed', () => {
    breaker.RatedFor = 400
    breaker.Providers = 390
    breaker.Load = 100
    breaker.Close()
    expect(breaker.isOpen).toBeFalsy()
    breaker.Thick()
    expect(breaker.isOpen).toBeFalsy()
    expect(breaker.Content).toBe(breaker.Providers)
  })
  test('Closed with load > RatedFor --> open', () => {
    breaker.RatedFor = 400
    breaker.Load = 100
    breaker.Close()
    expect(breaker.isOpen).toBeFalsy()
    breaker.Load = 600
    breaker.Thick()
    expect(breaker.isOpen).toBeTruthy()
  })
  test('Tripped : Load < Providers', () => {
    breaker.RatedFor = 400
    breaker.Providers = 300
    breaker.Close()
    breaker.Load = 350
    breaker.Thick()
    expect(breaker.isOpen).toBeTruthy()
  })
})
describe('Toggle breaker', () => {
  test('toggle open --> closed', () => {
    breaker.Toggle()
    expect(breaker.isOpen).toBeFalsy()
    expect(breaker.Content).toBe(breaker.Providers)
  })
  test('toggle closed --> open', () => {
    breaker.Close()
    breaker.Toggle()
    expect(breaker.isOpen).toBeTruthy()
    expect(breaker.Content).toBe(0)
  })
})
