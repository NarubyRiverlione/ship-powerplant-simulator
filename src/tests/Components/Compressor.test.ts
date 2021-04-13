import mockPowerBus from '../mocks/mockPowerBus'
import Compressor from '../../Components/Appliances/Compressor'

let comp: Compressor
const ratedFor = 13568

beforeEach(() => {
  const testBus = new mockPowerBus('test bus')
  testBus.Voltage = ratedFor

  comp = new Compressor('test', testBus, ratedFor)
  comp.HasReceiver = true
})

describe('Init', () => {
  test('set possible output', () => {
    expect(comp.RatedFor).toBe(ratedFor)
  })
  test('no output', () => {
    expect(comp.Output).toBe(0)
    expect(comp.Content).toBe(0)
  })
  test('outlet valve is closed', () => {
    expect(comp.OutletValve.isOpen).toBeFalsy()
    expect(comp.OutletValve.Content).toBe(0)
  })
  test('safety is closed', () => {
    expect(comp.SafetyOpen).toBeFalsy()
  })
})

describe('running', () => {
  test('running compressor has rated output', () => {
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.Thick()
    expect(comp.Output).toBe(ratedFor)
    expect(comp.Content).toBe(ratedFor)
  })
  test('stop a running compressor = no output', () => {
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.Thick()
    comp.Stop()
    comp.Thick()
    expect(comp.Output).toBe(0)
    expect(comp.Content).toBe(0)
  })
  test('running compressor lost power =no output', () => {
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.Thick()
    comp.Bus.Voltage = 0
    comp.Thick()
    expect(comp.isRunning).toBeFalsy()
    expect(comp.Output).toBe(0)
    expect(comp.Content).toBe(0)
  })
  test('running compressor without receiver =  open safety but output available', () => {
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.Thick()
    comp.HasReceiver = false
    comp.Thick()
    expect(comp.isRunning).toBeTruthy()
    expect(comp.Output).toBe(ratedFor)
    expect(comp.Content).toBe(ratedFor)
  })
})

describe('output via outlet valve', () => {
  test('running + closed outlet = valve has no content', () => {
    comp.Start()
    comp.HasReceiver = false
    comp.Thick()
    expect(comp.OutletValve.Content).toBe(0)
    expect(comp.SafetyOpen).toBeTruthy()
  })
  test('running + closed outlet , then open outlet = valve has content', () => {
    comp.Start()
    comp.Thick()
    comp.OutletValve.Open()
    comp.Thick()
    expect(comp.SafetyOpen).toBeFalsy()
    expect(comp.OutletValve.Content).toBe(ratedFor)
  })
  test('running + open outlet = valve has  content', () => {
    comp.Start()
    expect(comp.isRunning).toBeTruthy()
    comp.OutletValve.Open()
    comp.Thick()
    expect(comp.OutletValve.Content).toBe(ratedFor)
  })
  test('not running + open outlet, then running = valve has  content', () => {
    comp.OutletValve.Open()
    comp.Thick()
    comp.Start()
    comp.Thick()
    expect(comp.isRunning).toBeTruthy()
    expect(comp.OutletValve.Content).toBe(ratedFor)
  })
})
