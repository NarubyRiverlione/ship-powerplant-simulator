import PurificationUnit from '../../Components/Appliances/PurificationUnit'
import { CstFuelSys } from '../../Cst'
import mockPowerBus from '../mocks/mockPowerBus'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'


let purUnit: PurificationUnit
const sourceContent = 100
const steamSourceContent = CstFuelSys.Purification.SteamNeeded
const testRate = 25

const dummyBus = new mockPowerBus("dummy powerbus")
const dummySourceTank = new mockTank("dummy source tank", 100, sourceContent)
const dummySourceValve = new mockValve("dummy source valve", dummySourceTank)

const dummySteamSourceTank = new mockTank("dummy steam source tank", 100, steamSourceContent)
const dummySteamSourceValve = new mockValve("dummy steam source valve", dummySteamSourceTank)

beforeEach(() => {
  dummyBus.Voltage = 440
  purUnit = new PurificationUnit('test purification unit', testRate, dummySourceValve,
    dummyBus, dummySteamSourceValve)
})

describe("init", () => {
  test('no running, no content', () => {
    expect(purUnit.isRunning).toBeFalsy()
    expect(purUnit.Content).toBe(0)
  })
  test('intake valve is closed', () => {
    expect(purUnit.IntakeValve.isOpen).toBeFalsy()
  })
  test('steam intake valve is closed', () => {
    expect(purUnit.SteamIntakeValve.isOpen).toBeFalsy()
  })
})

describe("start / stop", () => {
  test('start with power & steam = content is rate', () => {
    purUnit.SteamIntakeValve.Open()
    purUnit.IntakeValve.Open()
    purUnit.Start()
    purUnit.Thick()
    expect(purUnit.CheckPower).toBeTruthy()
    expect(purUnit.HasSteam).toBeTruthy()
    expect(purUnit.isRunning).toBeTruthy()
    expect(purUnit.Content).toBe(testRate)
  })
  test('start with power & steam  but closed intake valve = not running', () => {
    purUnit.SteamIntakeValve.Open()
    purUnit.IntakeValve.Close()
    purUnit.Start()
    purUnit.Thick()
    expect(purUnit.isRunning).toBeFalsy()
    expect(purUnit.Content).toBe(0)
  })
  test('start with power & steam  & open intake valve but no source = no content', () => {
    purUnit.SteamIntakeValve.Open()
    purUnit.IntakeValve.Open()
    dummySourceTank.Inside = 0
    purUnit.Start()
    purUnit.Thick()
    expect(purUnit.isRunning).toBeFalsy()
    expect(purUnit.Content).toBe(0)
  })
  test('start with power but closed  steam intake valve =  not running', () => {
    purUnit.SteamIntakeValve.Close()
    purUnit.IntakeValve.Open()
    purUnit.Start()
    purUnit.Thick()
    expect(purUnit.HasSteam).toBeFalsy()
    expect(purUnit.isRunning).toBeFalsy()
    expect(purUnit.Content).toBe(0)
  })
  test('start with power but not enough  steam = not running', () => {
    purUnit.SteamIntakeValve.Open()
    purUnit.IntakeValve.Open()
    dummySteamSourceTank.Inside = CstFuelSys.Purification.SteamNeeded - 1
    purUnit.Start()
    purUnit.Thick()
    expect(purUnit.HasSteam).toBeFalsy()
    expect(purUnit.isRunning).toBeFalsy()
    expect(purUnit.Content).toBe(0)
  })
  test('stop after start =  not running', () => {
    purUnit.SteamIntakeValve.Open()
    purUnit.IntakeValve.Open()
    purUnit.Start()
    purUnit.Thick()
    purUnit.Stop()
    purUnit.Thick()
    expect(purUnit.isRunning).toBeFalsy()
    expect(purUnit.Content).toBe(0)
  })
})