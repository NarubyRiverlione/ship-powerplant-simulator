import PurificationUnit from '../../Components/PurificationUnit'
import mockPowerBus from '../mocks/mockPowerBus'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'


let purUnit: PurificationUnit
const sourceContent = 100
const dummyBus = new mockPowerBus("dummy powerbus")
const dummySourceTank = new mockTank("dummy source tank", 100, sourceContent)
const dummySourceValve = new mockValve("dummy source valve", dummySourceTank)

beforeEach(() => {
  dummyBus.Voltage = 440
  purUnit = new PurificationUnit('test purification unit', dummyBus, dummySourceValve)
})

describe("init", () => {
  test('no running, no content', () => {
    expect(purUnit.isRunning).toBeFalsy()
    expect(purUnit.Content).toBe(0)
  })
})

describe("start / stop", () => {
  test('start = content', () => {
    purUnit.Start()
    purUnit.Thick()
    expect(purUnit.CheckPower).toBeTruthy()
    expect(purUnit.isRunning).toBeTruthy()
    expect(purUnit.Content).toBe(sourceContent)
  })
  test('stop after start = no content', () => {
    purUnit.Start()
    purUnit.Thick()
    purUnit.Stop()
    purUnit.Thick()
    expect(purUnit.isRunning).toBeFalsy()
    expect(purUnit.Content).toBe(0)
  })
})