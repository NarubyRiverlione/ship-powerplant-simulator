import { CstHfFuelSys, CstPowerSys, CstSteamSys } from '../../Constants/Cst'
import HeavyFuelSystem from '../../Systems/HeavyFuelSystem'
import MockPowerBus from '../mocks/MockPowerBus'
import MockTank from '../mocks/MockTank'
import MockValve from '../mocks/MockValve'

let HfSys: HeavyFuelSystem

const dummySteamSource = new MockTank('dummy steam source', 100, CstSteamSys.Boiler.OperatingPressure)
const dummyMainSteamValve = new MockValve('dummy main steam valve', dummySteamSource)
const dummyMainbus = new MockPowerBus('dummy mainbus')

beforeEach(() => {
  HfSys = new HeavyFuelSystem(dummyMainSteamValve, dummyMainbus)
})

describe('Init', () => {
  test('Fore Bunker Tank is empty', () => {
    expect(HfSys.HfForeBunker.Tank.Content).toBe(0)
    expect(HfSys.HfForeBunker.Tank.Volume).toBe(CstHfFuelSys.HfForeBunker.TankVolume)
  })
  test('Aft Bunker Tank is empty', () => {
    expect(HfSys.HfAftBunker.Tank.Content).toBe(0)
    expect(HfSys.HfAftBunker.Tank.Volume).toBe(CstHfFuelSys.HfAftBunker.TankVolume)
  })
  test('Port Bunker Tank is empty', () => {
    expect(HfSys.HfPortBunker.Tank.Content).toBe(0)
    expect(HfSys.HfPortBunker.Tank.Volume).toBe(CstHfFuelSys.HfPortBunker.TankVolume)
  })
  test('Starboard Bunker Tank is empty', () => {
    expect(HfSys.HfStarboardBunker.Tank.Content).toBe(0)
    expect(HfSys.HfStarboardBunker.Tank.Volume).toBe(CstHfFuelSys.HfStarboardBunker.TankVolume)
  })
  test('Setteling Tank is empty', () => {
    expect(HfSys.HfSettelingTank.Tank.Content).toBe(0)
    expect(HfSys.HfSettelingTank.Tank.Volume).toBe(CstHfFuelSys.HfSettelingTank.TankVolume)
  })
  test('Shore intake valve is closed', () => {
    expect(HfSys.HfShoreValve.isOpen).toBeFalsy()
  })
  test('Fuel pump not running, no electricity', () => {
    const { HfPump } = HfSys
    expect(HfPump.isRunning).toBeFalsy()
    expect(HfPump.CheckPower).toBeFalsy()
  })
  test('Fuel pump outlet valve is closed', () => {
    expect(HfSys.HfPumpOutletValve.isOpen).toBeFalsy()
  })
  test('Purification not running', () => {
    expect(HfSys.HfPurification.isRunning).toBeFalsy()
  })
  test('Purification outlet valve closed', () => {
    expect(HfSys.HfPurificationOutletValve.isOpen).toBeFalsy()
  })
  test('Service tank is empty', () => (
    expect(HfSys.HfServiceTank.Content).toBe(0)
  ))
})

describe('Intake from shore', () => {
  test('Fore tank filling', () => {
    const { HfShoreValve, HfForeBunker } = HfSys
    HfShoreValve.Open()
    HfForeBunker.IntakeValve.Open()
    HfSys.Thick()
    expect(HfForeBunker.Tank.Content).toBe(CstHfFuelSys.HfForeBunker.IntakeValveVolume)
    HfSys.Thick()
    expect(HfForeBunker.Tank.Content).toBe(CstHfFuelSys.HfForeBunker.IntakeValveVolume * 2)
    HfSys.Thick()
    expect(HfForeBunker.Tank.Content).toBe(CstHfFuelSys.HfForeBunker.IntakeValveVolume * 3)
  })
  test('Fore tank filling', () => {
    const { HfShoreValve, HfForeBunker } = HfSys
    HfShoreValve.Open()
    HfForeBunker.IntakeValve.Open()
    HfSys.Thick()
    expect(HfForeBunker.Tank.Content).toBe(CstHfFuelSys.HfForeBunker.IntakeValveVolume)
    HfSys.Thick()
    expect(HfForeBunker.Tank.Content).toBe(CstHfFuelSys.HfForeBunker.IntakeValveVolume * 2)
    HfSys.Thick()
    expect(HfForeBunker.Tank.Content).toBe(CstHfFuelSys.HfForeBunker.IntakeValveVolume * 3)
  })
  test('Aft tank filling', () => {
    const { HfShoreValve, HfAftBunker } = HfSys
    HfShoreValve.Open()
    HfAftBunker.IntakeValve.Open()
    HfSys.Thick()
    expect(HfAftBunker.Tank.Content).toBe(CstHfFuelSys.HfAftBunker.IntakeValveVolume)
    HfSys.Thick()
    expect(HfAftBunker.Tank.Content).toBe(CstHfFuelSys.HfAftBunker.IntakeValveVolume * 2)
    HfSys.Thick()
    expect(HfAftBunker.Tank.Content).toBe(CstHfFuelSys.HfAftBunker.IntakeValveVolume * 3)
  })
  test('Port tank filling', () => {
    const { HfShoreValve, HfPortBunker } = HfSys
    HfShoreValve.Open()
    HfPortBunker.IntakeValve.Open()
    HfSys.Thick()
    expect(HfPortBunker.Tank.Content).toBe(CstHfFuelSys.HfPortBunker.IntakeValveVolume)
    HfSys.Thick()
    expect(HfPortBunker.Tank.Content).toBe(CstHfFuelSys.HfPortBunker.IntakeValveVolume * 2)
    HfSys.Thick()
    expect(HfPortBunker.Tank.Content).toBe(CstHfFuelSys.HfPortBunker.IntakeValveVolume * 3)
  })
  test('Starboard tank filling', () => {
    const { HfShoreValve, HfStarboardBunker } = HfSys
    HfShoreValve.Open()
    HfStarboardBunker.IntakeValve.Open()
    HfSys.Thick()
    expect(HfStarboardBunker.Tank.Content).toBe(CstHfFuelSys.HfStarboardBunker.IntakeValveVolume)
    HfSys.Thick()
    expect(HfStarboardBunker.Tank.Content).toBe(CstHfFuelSys.HfStarboardBunker.IntakeValveVolume * 2)
    HfSys.Thick()
    expect(HfStarboardBunker.Tank.Content).toBe(CstHfFuelSys.HfStarboardBunker.IntakeValveVolume * 3)
  })
})

describe('Pumping', () => {
  test('no pump output if tank is not heated', () => {
    const {
      HfForeBunker, HfPump, HfPumpOutletValve, HfSettelingTank,
    } = HfSys
    HfForeBunker.Tank.Inside = CstHfFuelSys.HfForeBunker.TankVolume
    HfForeBunker.Temperature = CstHfFuelSys.TempSetpoint - 0.1
    HfForeBunker.OutletValve.Open()
    HfPumpOutletValve.Open()
    HfPump.Bus.Voltage = CstPowerSys.Voltage
    HfPump.Start()
    HfSys.Thick()
    expect(HfSys.HasBunkOutput).toBeFalsy()
    expect(HfForeBunker.OutletValve.Content).toBe(0)
    expect(HfPump.isRunning).toBeFalsy()
    expect(HfPumpOutletValve.Content).toBe(0)
    expect(HfSettelingTank.Content).toBe(0)
  })
  test('only from heated Fore tank, setteling tank is filling', () => {
    const {
      HfForeBunker, HfPump, HfPumpOutletValve, HfSettelingTank,
    } = HfSys
    HfForeBunker.Tank.Inside = CstHfFuelSys.HfForeBunker.TankVolume
    HfForeBunker.Temperature = CstHfFuelSys.TempSetpoint - CstHfFuelSys.HeatingStep
    HfForeBunker.OutletValve.Open()
    HfForeBunker.SteamIntakeValve.Open()
    HfPumpOutletValve.Open()
    HfSettelingTank.IntakeValve.Open()
    HfPump.Bus.Voltage = CstPowerSys.Voltage
    HfPump.Start()
    HfSys.Thick()
    expect(HfForeBunker.HasSteam).toBeTruthy()
    expect(HfForeBunker.Temperature).toBe(CstHfFuelSys.TempSetpoint)
    expect(HfForeBunker.IsAtSetpoint).toBeTruthy()
    expect(HfForeBunker.OutletValve.Content).toBe(CstHfFuelSys.HfPumpVolume)

    expect(HfPump.Providers).toBe(HfForeBunker.OutletValve.Content)
    expect(HfPump.isRunning).toBeTruthy()
    expect(HfPumpOutletValve.Content).toBe(CstHfFuelSys.HfPumpVolume)

    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume)
    // RemoveThisStep will only have effect next Thick, so check Bunk tank removale after next Thick
    HfSys.Thick()
    expect(HfSys.HasBunkOutput).toBeTruthy()
    expect(HfForeBunker.Content).toBe(CstHfFuelSys.HfForeBunker.TankVolume - CstHfFuelSys.HfPumpVolume)
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume * 2)

    HfSys.Thick()
    expect(HfForeBunker.Content).toBe(CstHfFuelSys.HfForeBunker.TankVolume - CstHfFuelSys.HfPumpVolume * 2)
  })
  test('only from heated Aft tank, setteling tank is filling', () => {
    const {
      HfAftBunker, HfPump, HfPumpOutletValve, HfSettelingTank,
    } = HfSys
    HfAftBunker.Tank.Inside = CstHfFuelSys.HfAftBunker.TankVolume
    HfAftBunker.Temperature = CstHfFuelSys.TempSetpoint
    HfAftBunker.OutletValve.Open()
    HfPumpOutletValve.Open()
    HfAftBunker.SteamIntakeValve.Open()
    HfSettelingTank.IntakeValve.Open()
    HfPump.Bus.Voltage = CstPowerSys.Voltage
    HfPump.Start()
    HfSys.Thick()
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume)
    HfSys.Thick()
    expect(HfAftBunker.Content).toBe(CstHfFuelSys.HfAftBunker.TankVolume - CstHfFuelSys.HfPumpVolume)
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume * 2)
    HfSys.Thick()
    expect(HfAftBunker.Content).toBe(CstHfFuelSys.HfAftBunker.TankVolume - CstHfFuelSys.HfPumpVolume * 2)
  })
  test('only from heated Port tank, setteling tank is filling', () => {
    const {
      HfPortBunker, HfPump, HfPumpOutletValve, HfSettelingTank,
    } = HfSys
    HfPortBunker.Tank.Inside = CstHfFuelSys.HfPortBunker.TankVolume
    HfPortBunker.Temperature = CstHfFuelSys.TempSetpoint
    HfPortBunker.OutletValve.Open()
    HfPumpOutletValve.Open()
    HfPortBunker.SteamIntakeValve.Open()
    HfSettelingTank.IntakeValve.Open()
    HfPump.Bus.Voltage = CstPowerSys.Voltage
    HfPump.Start()
    HfSys.Thick()
    expect(HfSys.HasBunkOutput).toBeTruthy()
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume)
    HfSys.Thick()
    expect(HfPortBunker.Content).toBe(CstHfFuelSys.HfPortBunker.TankVolume - CstHfFuelSys.HfPumpVolume)
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume * 2)
    HfSys.Thick()
    expect(HfPortBunker.Content).toBe(CstHfFuelSys.HfPortBunker.TankVolume - CstHfFuelSys.HfPumpVolume * 2)
  })
  test('only from heated starboard tank, setteling tank is filling', () => {
    const {
      HfStarboardBunker, HfPump, HfPumpOutletValve, HfSettelingTank,
    } = HfSys
    HfStarboardBunker.Tank.Inside = CstHfFuelSys.HfStarboardBunker.TankVolume
    HfStarboardBunker.Temperature = CstHfFuelSys.TempSetpoint
    HfStarboardBunker.OutletValve.Open()
    HfPumpOutletValve.Open()
    HfStarboardBunker.SteamIntakeValve.Open()
    HfSettelingTank.IntakeValve.Open()
    HfPump.Bus.Voltage = CstPowerSys.Voltage
    HfPump.Start()
    HfSys.Thick()
    expect(HfSys.HasBunkOutput).toBeTruthy()
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume)
    HfSys.Thick()
    expect(HfStarboardBunker.Content).toBe(CstHfFuelSys.HfStarboardBunker.TankVolume - CstHfFuelSys.HfPumpVolume)
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume * 2)
    HfSys.Thick()
    expect(HfStarboardBunker.Content).toBe(CstHfFuelSys.HfStarboardBunker.TankVolume - CstHfFuelSys.HfPumpVolume * 2)
  })
  test('from heated Fore & Aft tanks, pump is limited to his rate', () => {
    const {
      HfForeBunker, HfAftBunker, HfPump, HfPumpOutletValve, HfSettelingTank,
    } = HfSys
    HfForeBunker.Tank.Inside = CstHfFuelSys.HfForeBunker.TankVolume
    HfAftBunker.Tank.Inside = CstHfFuelSys.HfAftBunker.TankVolume
    HfForeBunker.Temperature = CstHfFuelSys.TempSetpoint
    HfAftBunker.Temperature = CstHfFuelSys.TempSetpoint
    HfForeBunker.SteamIntakeValve.Open()
    HfAftBunker.SteamIntakeValve.Open()
    HfForeBunker.OutletValve.Open()
    HfAftBunker.OutletValve.Open()
    HfPumpOutletValve.Open()
    HfSettelingTank.IntakeValve.Open()
    HfPump.Bus.Voltage = CstPowerSys.Voltage
    HfPump.Start()
    HfSys.Thick()
    expect(HfSys.HasBunkOutput).toBeTruthy()
    expect(HfPumpOutletValve.Content).toBe(CstHfFuelSys.HfPumpVolume)
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfPumpVolume)
    HfSys.Thick()
    // FIXME don't remove from both
    expect(HfForeBunker.Content).toBe(CstHfFuelSys.HfForeBunker.TankVolume - CstHfFuelSys.HfPumpVolume)
    expect(HfAftBunker.Content).toBe(CstHfFuelSys.HfAftBunker.TankVolume - CstHfFuelSys.HfPumpVolume)
  })
  test('setteling tank is full, don\'t add nor remove from bunk tanks', () => {
    const {
      HfForeBunker, HfPump, HfPumpOutletValve, HfSettelingTank,
    } = HfSys
    HfForeBunker.Tank.Inside = CstHfFuelSys.HfForeBunker.TankVolume
    HfForeBunker.Temperature = CstHfFuelSys.TempSetpoint
    HfForeBunker.OutletValve.Open()
    HfForeBunker.SteamIntakeValve.Open()
    HfPumpOutletValve.Open()
    HfPump.Bus.Voltage = CstPowerSys.Voltage
    HfPump.Start()
    expect(HfSys.HasBunkOutput).toBeTruthy()
    // setteling tank is already full
    HfSettelingTank.Tank.Inside = CstHfFuelSys.HfSettelingTank.TankVolume
    HfSettelingTank.IntakeValve.Open()
    HfSys.Thick()

    expect(HfPump.Providers).toBe(HfForeBunker.OutletValve.Content)
    expect(HfPump.isRunning).toBeTruthy()
    expect(HfPumpOutletValve.Content).toBe(CstHfFuelSys.HfPumpVolume)

    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfSettelingTank.TankVolume)
    // RemoveThisStep will only have effect next Thick, so check Bunk tank removale after next Thick
    HfSys.Thick()
    // don't add, don't remove, both tanks must be remaining on max content
    expect(HfForeBunker.Content).toBe(CstHfFuelSys.HfForeBunker.TankVolume)
    expect(HfSettelingTank.Content).toBe(CstHfFuelSys.HfSettelingTank.TankVolume)

    HfSys.Thick()
    expect(HfForeBunker.Content).toBe(CstHfFuelSys.HfForeBunker.TankVolume)
  })
})

describe('Purification', () => {
  test('Running purification fill service tank', () => {
    const {
      HfPurificationOutletValve, HfServiceTank, HfPurification, HfSettelingTank,
    } = HfSys
    HfSettelingTank.Tank.Inside = CstHfFuelSys.HfSettelingTank.TankVolume
    HfSettelingTank.Temperature = CstHfFuelSys.TempSetpoint
    HfSettelingTank.SteamIntakeValve.Open()
    HfSys.Thick()
    HfSettelingTank.OutletValve.Open()
    HfPurification.IntakeValve.Open()
    HfServiceTank.IntakeValve.Open()
    HfPurificationOutletValve.Open()
    HfPurification.SteamIntakeValve.Open()
    HfPurification.Start()
    HfSys.Thick()
    expect(HfPurification.isRunning).toBeTruthy()
    expect(HfPurification.Content).toBe(CstHfFuelSys.HfPurification.Volume)

    expect(HfServiceTank.Content).toBe(CstHfFuelSys.HfPurification.Volume)
  })
})
