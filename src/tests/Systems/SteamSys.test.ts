import SteamSystem from '../../Systems/SteamSystem'
import mockPowerBus from '../mocks/mockPowerBus'
import { CstPowerSys, CstSteamSys } from '../../Cst'
import mockTank from '../mocks/mockTank'
let steamSys: SteamSystem

const dummyMainBus = new mockPowerBus('dummy main bus 1')
dummyMainBus.Voltage = CstPowerSys.Voltage

const dummyFuelSource = new mockTank('dummy fuel source', 100, 0)
beforeEach(() => {
  steamSys = new SteamSystem(dummyMainBus, dummyFuelSource)
})

describe('init', () => {
  test('Feed water supply is empty', () => {
    expect(steamSys.FeedWaterSupply.Tank.Content).toBe(0)
    expect(steamSys.FeedWaterSupply.IntakeValve.isOpen).toBeFalsy()
  })
  test('Feed water pump not running', () => {
    expect(steamSys.FeedWaterPump.isRunning).toBeFalsy()
  })
  test('Boiler water level is zero', () => {
    expect(steamSys.Boiler.WaterLevel).toBe(0)
  })
})

describe('Feed water', () => {
  test('Fill feed water supply via intake valve', () => {
    steamSys.FeedWaterSupply.IntakeValve.Open()
    steamSys.Thick()
    expect(steamSys.FeedWaterSupply.Tank.Content).toBe(CstSteamSys.FeedWaterSupply.TankAddStep)

    steamSys.FeedWaterSupply.IntakeValve.Close()
    steamSys.Thick()
    expect(steamSys.FeedWaterSupply.Tank.Content).toBe(CstSteamSys.FeedWaterSupply.TankAddStep)
  })
  test('supply tank content > pump rate, open outlet valve & start feed water pump = pump running at rate', () => {
    const { FeedWaterSupply, FeedWaterPump } = steamSys
    const startVolume = CstSteamSys.FeedWaterPump + 15
    FeedWaterSupply.Tank.Inside = startVolume
    FeedWaterSupply.OutletValve.Open()
    FeedWaterPump.Start()
    steamSys.Thick()
    expect(FeedWaterSupply.OutletValve.Content).toBe(startVolume)
    expect(FeedWaterPump.Providers).toBe(FeedWaterSupply.OutletValve.Content)
    expect(FeedWaterPump.CheckPower).toBeTruthy()
    expect(FeedWaterPump.isRunning).toBeTruthy()
    expect(FeedWaterPump.Content).toBe(CstSteamSys.FeedWaterPump)
  })
  test('Feed water pump running & boiler intake open = fill boiler', () => {
    const { FeedWaterSupply, FeedWaterPump, Boiler } = steamSys
    const startVolume = CstSteamSys.FeedWaterSupply.TankVolume
    FeedWaterSupply.Tank.Inside = startVolume
    FeedWaterSupply.OutletValve.Open()
    FeedWaterPump.Start()

    steamSys.Thick()
    expect(FeedWaterPump.Content).toBe(CstSteamSys.FeedWaterPump)

    Boiler.WaterIntakeValve.Open()
    steamSys.Thick()
    expect(Boiler.WaterIntakeValve.Content).toBe(CstSteamSys.FeedWaterPump)
    expect(Boiler.WaterLevel).toBe(CstSteamSys.FeedWaterPump)
  })
})


