import MockPowerBus from '../mocks/MockPowerBus'
import Appliance from '../../Components/Appliances/Appliance'

const testVoltage = 440
const testRate = 25
let appliance: Appliance

beforeEach(() => {
  const testBus = new MockPowerBus('test bus')
  testBus.Voltage = testVoltage
  appliance = new Appliance('test bus', testBus, testRate)
})

describe('Init', () => {
  test('bus', () => {
    expect(appliance.Bus.Content).toEqual(testVoltage)
    expect(appliance.Content).toEqual(0)
  })
  test('not running', () => {
    expect(appliance.isRunning).toBeFalsy()
  })
})

describe('start/stop', () => {
  test('start without power on bus = not running', () => {
    appliance.Bus.Voltage = 0
    appliance.Start()
    expect(appliance.CheckPower).toBeFalsy()
    expect(appliance.isRunning).toBeFalsy()
  })
  test('start  power on bus =  running', () => {
    appliance.Start()
    appliance.Thick()
    expect(appliance.Bus.Voltage).toBe(testVoltage)
    expect(appliance.CheckPower).toBeTruthy()
    expect(appliance.isRunning).toBeTruthy()
    expect(appliance.Content).toBe(testRate)
  })
  test('stop running appliance = stop', () => {
    appliance.Start()
    appliance.Stop()
    expect(appliance.isRunning).toBeFalsy()
  })
  test('remove power from running appliance = stop', () => {
    appliance.Start()
    expect(appliance.isRunning).toBeTruthy()
    appliance.Bus.Voltage = 0
    appliance.Thick()
    expect(appliance.isRunning).toBeFalsy()
  })
  test('toggle not running  =  running', () => {
    appliance.Toggle()
    expect(appliance.isRunning).toBeTruthy()
  })
  test('toggle  running  =  not running', () => {
    appliance.Start()
    appliance.Thick()
    appliance.Toggle()
    expect(appliance.isRunning).toBeFalsy()
  })
})
