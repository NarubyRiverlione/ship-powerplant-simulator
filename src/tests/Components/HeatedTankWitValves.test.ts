import HeatedTankWithValves from '../../Components/HeatedTankWithValves'
import { CstChanges, CstSteamSys } from '../../Cst'
import MockTank from '../mocks/MockTank'
import MockValve from '../mocks/MockValve'

let heatedTank: HeatedTankWithValves
const TestSetpointTemp = 80
const Volume = 10000
const StartContent = 9000
const SourceContent = 100
const OutletVolume = 15
const SteamSource = CstSteamSys.Boiler.OperatingPressure

const dummySource = new MockTank('dummy source tank', 1000, SourceContent)
const dummySourceValve = new MockValve('dummy source valve', dummySource)
let dummySteamSource: MockTank

beforeEach(() => {
  dummySteamSource = new MockTank('dummy steam source', 100, SteamSource)
  const dummyMainSteamValve = new MockValve('dummy main steam valve', dummySteamSource)

  heatedTank = new HeatedTankWithValves('test tank', Volume, StartContent,
    dummySourceValve, dummyMainSteamValve, OutletVolume)
  heatedTank.SetpointTemp = TestSetpointTemp
})

describe('Init', () => {
  test('Tank at start temp', () => {
    expect(heatedTank.Temperature).toBe(CstChanges.StartTemp)
  })
  test('Set setpoint', () => {
    expect(heatedTank.SetpointTemp).toBe(TestSetpointTemp)
  })
  test('Default and set min steam to heat up', () => {
    // prevent oscillation form boiler flame on / out
    expect(heatedTank.MinSteam).toBe(CstSteamSys.Boiler.OperatingPressure - 0.5)
    heatedTank.MinSteam = 4
    expect(heatedTank.MinSteam).toBe(4)
  })
})
describe('Steam intake', () => {
  test('Has enough steam via intake valve', () => {
    const { SteamIntakeValve, MinSteam } = heatedTank
    SteamIntakeValve.Open()
    expect(SteamIntakeValve.Content).toBeGreaterThanOrEqual(MinSteam)
    expect(heatedTank.HasSteam).toBeTruthy()
  })
  test('Has not enough steam via intake valve', () => {
    const { SteamIntakeValve, MinSteam } = heatedTank
    dummySteamSource.Inside = MinSteam - 0.1
    SteamIntakeValve.Open()

    expect(SteamIntakeValve.Content).toBeLessThan(MinSteam)
    expect(heatedTank.HasSteam).toBeFalsy()
  })
  test('Heating step', () => {
    expect(heatedTank.HeatingStep).toBe(0)
  })
})

describe('Warming / cooling', () => {
  test('Has steam = warming', () => {
    const { SteamIntakeValve } = heatedTank
    const heatStep = 5
    heatedTank.HeatingStep = heatStep
    SteamIntakeValve.Open()
    heatedTank.Thick()
    expect(heatedTank.HasSteam).toBeTruthy()
    expect(heatedTank.HeatingStep).toBe(heatStep)

    expect(heatedTank.Temperature).toBe(CstChanges.StartTemp + heatStep)
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(CstChanges.StartTemp + heatStep * 2)
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(CstChanges.StartTemp + heatStep * 3)
  })
  test('Has steam but stops heating if setpoint is reached', () => {
    const { SteamIntakeValve, SetpointTemp } = heatedTank
    const heatStep = 5
    heatedTank.HeatingStep = heatStep
    heatedTank.Temperature = SetpointTemp - heatStep
    SteamIntakeValve.Open()

    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(SetpointTemp)
    expect(heatedTank.IsAtSetpoint).toBeTruthy()
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(SetpointTemp)
    expect(heatedTank.IsAtSetpoint).toBeTruthy()
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(SetpointTemp)
    expect(heatedTank.IsAtSetpoint).toBeTruthy()
  })
  test('Has no steam = cooling', () => {
    const heatStep = 5
    heatedTank.HeatingStep = heatStep
    heatedTank.Temperature = heatedTank.SetpointTemp
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(heatedTank.SetpointTemp - heatStep)
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(heatedTank.SetpointTemp - heatStep * 2)
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(heatedTank.SetpointTemp - heatStep * 3)
  })
  test('Has no steam but stops cooling if startpoints is reached', () => {
    const heatStep = 5
    heatedTank.HeatingStep = heatStep
    heatedTank.Temperature = CstChanges.StartTemp + heatStep
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(CstChanges.StartTemp)
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(CstChanges.StartTemp)
    heatedTank.Thick()
    expect(heatedTank.Temperature).toBe(CstChanges.StartTemp)
  })
})

describe('only output when on setpoint', () => {
  test('temp on setpoint =  open outlet valve has content', () => {
    const {
      SteamIntakeValve, SetpointTemp, OutletValve,
    } = heatedTank
    heatedTank.Temperature = SetpointTemp
    SteamIntakeValve.Open()
    OutletValve.Open()
    heatedTank.Thick()
    expect(heatedTank.IsAtSetpoint).toBeTruthy()
    expect(OutletValve.Content).toBe(OutletVolume)
  })
  test('temp not on setpoint =  open outlet valve has no content', () => {
    const { SetpointTemp, OutletValve } = heatedTank
    heatedTank.Temperature = SetpointTemp - 0.1
    OutletValve.Open()
    heatedTank.Thick()
    expect(heatedTank.IsAtSetpoint).toBeFalsy()
    expect(OutletValve.Content).toBe(0)
  })
})
