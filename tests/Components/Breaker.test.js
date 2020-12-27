const Breaker = require('../../src/Components/Breaker')

describe('Init breaker', () => {
  test('beaker is open', () => {
    const breaker = new Breaker()
    expect(breaker.isOpen).toBeTruthy()
  })
  test('Rated = 0, load = 0, provider = 0', () => {
    const breaker = new Breaker()
    expect(breaker.RatedFor).toBe(0)
    expect(breaker.Load).toBe(0)
    expect(breaker.Providers).toBe(0)
  })
})
describe('Open / close without load', () => {
  test('close', () => {
    const breaker = new Breaker()
    breaker.Close()
    expect(breaker.isOpen).toBeFalsy()
  })
  test('open previous closed breaker', () => {
    const breaker = new Breaker()
    breaker.Close()
    breaker.Open()
    expect(breaker.isOpen).toBeTruthy()
  })
})
describe('Breaker loaded', () => {
  test('Close with load < RatedFor --> stay closed', () => {
    const breaker = new Breaker()
    breaker.RatedFor = 400
    breaker.Providers = 390
    breaker.Load = 100
    breaker.Close()
    expect(breaker.isOpen).toBeFalsy()
    breaker.Thick()
    expect(breaker.isOpen).toBeFalsy()
  })
  test('Closed with load > RatedFor --> open', () => {
    const breaker = new Breaker()
    breaker.RatedFor = 400
    breaker.Load = 100
    breaker.Close()
    expect(breaker.isOpen).toBeFalsy()
    breaker.Load = 600
    breaker.Thick()
    expect(breaker.isOpen).toBeTruthy()
  })
  test('Tripped : Load < Providers', () => {
    const breaker = new Breaker()
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
    const breaker = new Breaker()
    breaker.Toggle()
    expect(breaker.isOpen).toBeFalsy()
  })
  test('toggle closed --> open', () => {
    const breaker = new Breaker()
    breaker.Close()
    breaker.Toggle()
    expect(breaker.isOpen).toBeTruthy()
  })
})
