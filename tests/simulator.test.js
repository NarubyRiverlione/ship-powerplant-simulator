const Simulator = require('../../Simulator')

let simulator
beforeEach(() => {
  simulator = new Simulator()
})

describe('Simulator running tests', () => {
  test('Not running after init', () => {
    expect(simulator.Running).toBeNull()
  })
  test('Running after start', done => {
    simulator.Start()
    expect(simulator.Running).not.toBeNull()
    simulator.Stop()
    done()
  })
  test('Not running after stop', () => {
    simulator.Start()
    simulator.Stop()
    expect(simulator.Running).toBeNull()
  })
  test('Stop a not running simulator (no crash :)', () => {
    simulator.Stop()
    expect(simulator.Running).toBeNull()
  })
})

describe.skip('Fuel sys via simulator start', () => {
  test('Fill diesel storage tank from shore', done => {
    simulator.Start()
    simulator.FuelSys.DieselShoreFillValve.Close()
    setTimeout(() => {
      expect(simulator.FuelSys.DieselTank.Content()).not.toBe(0)
      done()
    }, 1500)
  })
})
