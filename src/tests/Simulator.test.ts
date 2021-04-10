import Simulator from '../Simulator'
import {
  CstFuelSys, CstChanges, CstLubSys, CstAirSys, CstPowerSys, CstCoolantSys, CstSteamSys
} from '../Cst'

let simulator: Simulator
beforeEach(() => {
  simulator = new Simulator()
})
afterEach(() => {
  simulator.Stop()
})
describe('Simulator running tests', () => {
  test('Not running after init', () => {
    expect(simulator.Running).toBeUndefined()
  })
  test('Running after start', done => {
    simulator.Start()
    expect(simulator.Running).not.toBeNull()
    setTimeout(() => {
      // wait for 1 thick
      done()
    }, CstChanges.Interval)
  })
  test('Not running after stop', () => {
    simulator.Start()
    simulator.Stop()
    expect(simulator.Running).toBeUndefined()
  })
  test('Stop a not running simulator (no crash :)', () => {
    simulator.Stop()
    expect(simulator.Running).toBeUndefined()
  })
  test('Toggle from not running', () => {
    simulator.Toggle()
    expect(simulator.Running).not.toBeUndefined()
  })
  test('Toggle from running', () => {
    simulator.Start()
    simulator.Toggle()
    expect(simulator.Running).toBeUndefined()
  })
})