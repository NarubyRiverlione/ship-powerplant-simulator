import SteamSystem from '../../Systems/SteamSystem'
import mockPowerBus from '../mocks/mockPowerBus'
import { CstPowerSys, CstSteamSys, CstFuelSys, CstChanges } from '../../Cst'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'
import Boiler from '../../Components/Boiler'
let steamSys: SteamSystem

const dummyMainBus = new mockPowerBus('dummy main bus 1')
dummyMainBus.Voltage = CstPowerSys.Voltage

beforeEach(() => {
  const dummyFuelSourceTank = new mockTank('dummy fuel source', 100, 100)
  const dummyFuelSourceOutletValve = new mockValve('dummy fuel valve', dummyFuelSourceTank)
  steamSys = new SteamSystem(dummyMainBus, dummyFuelSourceOutletValve, dummyFuelSourceTank)
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
  test('Fuel pump not running', () => {
    expect(steamSys.FuelPump.isRunning).toBeFalsy()
    expect(steamSys.FuelPump.Content).toBe(0)
  })
  test('Fuel source valve is closed', () => {
    expect(steamSys.FuelSourceValve.isOpen).toBeFalsy()
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
  test('Feed water outlet valve open & pump running & boiler intake open = fill boiler &  remove from supply tank', () => {
    const { FeedWaterSupply, FeedWaterPump, Boiler } = steamSys
    const startVolume = CstSteamSys.FeedWaterSupply.TankVolume
    FeedWaterSupply.Tank.Inside = startVolume
    FeedWaterSupply.OutletValve.Open()
    Boiler.WaterIntakeValve.Open()
    steamSys.Thick()

    FeedWaterPump.Start()
    steamSys.Thick()
    expect(FeedWaterPump.isRunning).toBeTruthy()
    expect(FeedWaterPump.Content).toBe(CstSteamSys.FeedWaterPump)
    expect(FeedWaterSupply.Tank.Removing).toBeTruthy()
    expect(FeedWaterSupply.Tank.RemoveEachStep).toBe(CstSteamSys.FeedWaterPump)
    expect(FeedWaterSupply.Tank.Content).toBe(startVolume - CstSteamSys.FeedWaterPump)
    expect(Boiler.WaterLevel).toBe(CstSteamSys.FeedWaterPump)


    steamSys.Thick()
    expect(Boiler.WaterIntakeValve.Content).toBe(CstSteamSys.FeedWaterPump)
    expect(Boiler.WaterLevel).toBe(CstSteamSys.FeedWaterPump * 2)
    expect(FeedWaterSupply.Tank.Content).toBe(startVolume - CstSteamSys.FeedWaterPump * 2)
  })
  test('supply tank empty = stop filling boiler,', () => {
    const { FeedWaterSupply, FeedWaterPump, Boiler } = steamSys
    const startVolume = CstSteamSys.FeedWaterPump
    FeedWaterSupply.Tank.Inside = startVolume
    FeedWaterSupply.OutletValve.Open()
    Boiler.WaterIntakeValve.Open()
    steamSys.Thick()

    FeedWaterPump.Start()
    steamSys.Thick()
    expect(FeedWaterSupply.Tank.Content).toBe(0)
    expect(Boiler.WaterLevel).toBe(CstSteamSys.FeedWaterPump)

    steamSys.Thick()
    expect(FeedWaterPump.isRunning).toBeFalsy()
    expect(FeedWaterPump.Content).toBe(0)

    expect(FeedWaterSupply.Tank.Content).toBe(0)
    expect(Boiler.WaterLevel).toBe(CstSteamSys.FeedWaterPump)

  })
  test('running pump & open drain valve', () => {
    const { FeedWaterSupply, FeedWaterPump, Boiler } = steamSys
    const startVolume = CstSteamSys.FeedWaterSupply.TankVolume
    FeedWaterSupply.Tank.Inside = startVolume
    FeedWaterSupply.OutletValve.Open()
    Boiler.WaterIntakeValve.Open()
    steamSys.Thick()
    FeedWaterSupply.DrainValve.Open()
    FeedWaterPump.Start()
    steamSys.Thick()
    expect(FeedWaterSupply.Tank.RemoveEachStep).toBe(CstSteamSys.FeedWaterPump + CstChanges.DrainStep)
    const expectLevel = startVolume - CstSteamSys.FeedWaterPump - CstChanges.DrainStep
    expect(FeedWaterSupply.Tank.Content).toBe(expectLevel)
    expect(Boiler.WaterLevel).toBe(CstSteamSys.FeedWaterPump)
  })
})

describe('Fuel', () => {
  test('Fuel pump running without flame = not burn fuel form FuelProviderTank', () => {
    const { FuelPump, Boiler, FuelSourceValve } = steamSys
    FuelPump.Start()
    steamSys.Thick()
    expect(FuelPump.CheckPower).toBeTruthy()
    expect(FuelPump.Providers).not.toBe(0)
    expect(FuelPump.isRunning).toBeTruthy()
    expect(Boiler.hasFlame).toBeFalsy()
    expect(FuelPump.Content).toBe(CstSteamSys.FuelPump)
    const fuelSourceOutlet = FuelSourceValve.Source as mockValve
    const fuelSource = fuelSourceOutlet.Source as mockTank
    expect(fuelSource.Removing).toBeFalsy()
    expect(fuelSource.RemoveEachStep).toBe(0)
  })
  test('Fuel pump running & flame = burn fuel form FuelProviderTank', () => {
    const { FuelPump, Boiler, FuelSourceValve } = steamSys
    FuelPump.Start()
    steamSys.Thick()

    expect(FuelPump.isRunning).toBeTruthy()
    Boiler.FuelIntakeValve.Open()
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    steamSys.Thick()

    Boiler.Ignite()
    steamSys.Thick()
    expect(Boiler.hasFlame).toBeTruthy()
    expect(FuelPump.Content).toBe(CstSteamSys.FuelPump)

    const fuelSourceOutlet = FuelSourceValve.Source as mockValve
    const fuelSource = fuelSourceOutlet.Source as mockTank
    expect(fuelSource.AmountRemovers).toBe(1)
    expect(fuelSource.Removing).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.SteamBoiler.Consumption)
    steamSys.Thick()
    expect(fuelSource.Removing).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.SteamBoiler.Consumption)
  })
  test('Stop a running Fuel pump  = not burning fuel form FuelProviderTank', () => {
    const { FuelPump, Boiler, FuelSourceValve } = steamSys
    FuelPump.Start()
    steamSys.Thick()
    expect(FuelPump.isRunning).toBeTruthy()
    Boiler.FuelIntakeValve.Open()
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    expect(Boiler.hasFlame).toBeTruthy()

    const fuelSourceOutlet = FuelSourceValve.Source as mockValve
    const fuelSource = fuelSourceOutlet.Source as mockTank
    expect(fuelSource.Removing).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.SteamBoiler.Consumption)
    FuelPump.Stop()
    steamSys.Thick()
    expect(fuelSource.Removing).toBeFalsy()
    expect(fuelSource.RemoveEachStep).toBe(0)
  })
  test('running Fuel pump  but exting flame = not burning fuel form FuelProviderTank', () => {
    const { FuelPump, Boiler, FuelSourceValve } = steamSys
    FuelPump.Start()
    steamSys.Thick()
    expect(FuelPump.isRunning).toBeTruthy()
    Boiler.FuelIntakeValve.Open()
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    expect(Boiler.hasFlame).toBeTruthy()

    const fuelSourceOutlet = FuelSourceValve.Source as mockValve
    const fuelSource = fuelSourceOutlet.Source as mockTank
    expect(fuelSource.Removing).toBeTruthy()
    expect(fuelSource.RemoveEachStep).toBe(CstFuelSys.SteamBoiler.Consumption)
    Boiler.Exting()
    steamSys.Thick()
    expect(fuelSource.Removing).toBeFalsy()
    expect(fuelSource.RemoveEachStep).toBe(0)
  })
})


