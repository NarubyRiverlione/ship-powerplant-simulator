import SteamSystem from '../../Systems/SteamSystem'
import mockPowerBus from '../mocks/mockPowerBus'
import { CstPowerSys, CstSteamSys, CstFuelSys, CstChanges } from '../../Cst'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'
import mockCooler from '../mocks/mockCooler'
import TankWithValves from '../../Components/TankWithValves'
let steamSys: SteamSystem

const dummyMainBus = new mockPowerBus('dummy main bus 1')
dummyMainBus.Voltage = CstPowerSys.Voltage

beforeEach(() => {
  const dummyFuelStortageTank = new mockTank('dummy fuel source', 100, 100)
  const dummyFuelSourceValve = new mockValve('dummy fuel valve', dummyFuelStortageTank)

  const dummyFuelSource = new TankWithValves('dummy fuel source', 100, 100, dummyFuelSourceValve)
  dummyFuelSource.OutletValve.Open()
  dummyFuelSource.Thick()
  const dummySteamCondensor = new mockCooler('dummy steam condensor')
  steamSys = new SteamSystem(dummyMainBus, dummyFuelSource, dummySteamCondensor)
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
    expect(steamSys.FeedWaterSupply.Tank.Content).toBe(CstSteamSys.FeedWaterSupply.IntakeValveVolume)

    steamSys.FeedWaterSupply.IntakeValve.Close()
    steamSys.Thick()
    expect(steamSys.FeedWaterSupply.Tank.Content).toBe(CstSteamSys.FeedWaterSupply.IntakeValveVolume)
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
    const expectLevel = startVolume - CstSteamSys.FeedWaterPump - FeedWaterSupply.Tank.Volume / CstChanges.DrainRatio
    expect(FeedWaterSupply.Tank.Content).toBe(expectLevel)
    expect(Boiler.WaterLevel).toBe(CstSteamSys.FeedWaterPump)
  })
})

describe('Fuel', () => {
  test('Fuel pump cannot run with closed fuel source valve', () => {
    const { FuelPump, FuelSourceValve } = steamSys
    expect(FuelSourceValve.Content).toBe(0)
    FuelPump.Start()
    steamSys.Thick()
    expect(FuelPump.CheckPower).toBeTruthy()
    expect(FuelPump.Providers).toBe(0)
    expect(FuelPump.isRunning).toBeFalsy()
  })
  test('Fuel pump running without flame = not burn fuel form FuelProviderTank', () => {
    const { FuelPump, Boiler, FuelSourceValve } = steamSys
    FuelSourceValve.Open()
    steamSys.Thick()
    expect(FuelSourceValve.Content).toBe(100)
    FuelPump.Start()
    steamSys.Thick()
    expect(FuelPump.CheckPower).toBeTruthy()
    expect(FuelPump.Providers).not.toBe(0)
    expect(FuelPump.isRunning).toBeTruthy()
    expect(Boiler.HasFlame).toBeFalsy()
    expect(FuelPump.Content).toBe(CstSteamSys.FuelPump)
    const fuelSourceOutlet = FuelSourceValve.Source as mockValve
    const fuelSource = fuelSourceOutlet.Source as mockTank
    expect(fuelSource.RemoveThisStep).toBe(0)
  })
  test('Fuel pump running & flame = burn fuel from FuelProviderTank', () => {
    const { FuelPump, Boiler, FuelSourceValve } = steamSys
    FuelSourceValve.Open()
    FuelPump.Start()
    steamSys.Thick()

    expect(FuelPump.isRunning).toBeTruthy()
    Boiler.FuelIntakeValve.Open()
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    steamSys.Thick()

    Boiler.Ignite()
    steamSys.Thick()
    expect(Boiler.HasFlame).toBeTruthy()
    expect(FuelPump.Content).toBe(CstSteamSys.FuelPump)

    const fuelSourceOutlet = FuelSourceValve.Source as mockValve
    const fuelSource = fuelSourceOutlet.Source as mockTank
    expect(fuelSource.RemoveThisStep).toBe(CstFuelSys.SteamBoiler.Consumption.Diesel)
    fuelSource.Thick()
    steamSys.Thick()
    expect(fuelSource.RemoveThisStep).toBe(CstFuelSys.SteamBoiler.Consumption.Diesel)
  })
  test('Stop a running Fuel pump  = not burning fuel form FuelProviderTank', () => {
    const { FuelPump, Boiler, FuelSourceValve } = steamSys
    FuelSourceValve.Open()
    FuelPump.Start()
    steamSys.Thick()
    expect(FuelPump.isRunning).toBeTruthy()
    Boiler.FuelIntakeValve.Open()
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    expect(Boiler.HasFlame).toBeTruthy()

    const fuelSourceOutlet = FuelSourceValve.Source as mockValve
    const fuelSource = fuelSourceOutlet.Source as mockTank
    expect(fuelSource.RemoveThisStep).toBe(CstFuelSys.SteamBoiler.Consumption.Diesel)
    fuelSource.Thick()
    FuelPump.Stop()
    steamSys.Thick()
    expect(fuelSource.RemoveThisStep).toBe(0)
  })
  test('running Fuel pump  but Extinguishing flame = not burning fuel form FuelProviderTank', () => {
    const { FuelPump, Boiler, FuelSourceValve } = steamSys
    FuelSourceValve.Open()
    FuelPump.Start()
    steamSys.Thick()
    expect(FuelPump.isRunning).toBeTruthy()
    Boiler.FuelIntakeValve.Open()
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    expect(Boiler.HasFlame).toBeTruthy()

    const fuelSourceOutlet = FuelSourceValve.Source as mockValve
    const fuelSource = fuelSourceOutlet.Source as mockTank
    expect(fuelSource.RemoveThisStep).toBe(CstFuelSys.SteamBoiler.Consumption.Diesel)
    Boiler.Extinguishing()
    fuelSource.Thick()
    steamSys.Thick()
    expect(fuelSource.RemoveThisStep).toBe(0)
  })
})

describe('Main steam valve', () => {
  test('main steam valve cannot open below min pressure', () => {
    const { Boiler, MainSteamValve } = steamSys
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = 120
    Boiler.Temperature = startTemp
    Boiler.FuelIntakeValve.Open()
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    MainSteamValve.Open()
    steamSys.Thick()
    expect(MainSteamValve.isOpen).toBeFalsy()
  })
  test('main valve closes when pressure drops below min pressure', () => {
    const { Boiler, MainSteamValve } = steamSys
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    Boiler.Temperature = startTemp
    Boiler.FuelIntakeValve.Open()
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    MainSteamValve.Open()
    Boiler.WaterDrainValve.Open()
    steamSys.Thick()
    Boiler.Temperature = 120
    steamSys.Thick()
    expect(Boiler.Pressure).toBeLessThanOrEqual(CstSteamSys.MinPressureForMainValve)
    expect(MainSteamValve.isOpen).toBeFalsy()
  })
  test('main steam valve and not cooling + drain open = adding losses', () => {
    const { Boiler, MainSteamValve } = steamSys
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    Boiler.Temperature = startTemp
    Boiler.FuelIntakeValve.Open()
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    MainSteamValve.Open()
    steamSys.Thick()
    Boiler.WaterDrainValve.Open()
    steamSys.Thick()
    expect(Boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.WaterLossByNotCoolingSteam * 2 - CstChanges.DrainRatio)
  })
  test('drain open the open main steam valve', () => {
    const { Boiler, MainSteamValve } = steamSys
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    Boiler.Temperature = startTemp
    Boiler.FuelIntakeValve.Open()
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    Boiler.WaterDrainValve.Open()
    steamSys.Thick()
    MainSteamValve.Open()
    steamSys.Thick()
    expect(Boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.WaterLossByNotCoolingSteam - CstChanges.DrainRatio * 2)
  })
  test('re-close previous open drain while  main steam valve remains open', () => {
    const { Boiler, MainSteamValve } = steamSys
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    Boiler.Temperature = startTemp
    Boiler.FuelIntakeValve.Open()
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    Boiler.WaterDrainValve.Open()
    steamSys.Thick()
    MainSteamValve.Open()
    steamSys.Thick()
    Boiler.WaterDrainValve.Close()
    steamSys.Thick()
    expect(Boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.WaterLossByNotCoolingSteam * 2 - CstChanges.DrainRatio * 2)
  })
  test('re-close previous open main steam valve while  drain  valve remains open', () => {
    const { Boiler, MainSteamValve } = steamSys
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    Boiler.Temperature = startTemp
    Boiler.FuelIntakeValve.Open()
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    Boiler.WaterDrainValve.Open()
    steamSys.Thick()
    MainSteamValve.Open()
    steamSys.Thick()
    MainSteamValve.Close()
    steamSys.Thick()
    expect(Boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.WaterLossByNotCoolingSteam - CstChanges.DrainRatio * 3)
  })
})

describe('Steam condensor', () => {
  test('steam valve is open = Condensor hot side complete', () => {
    const { Boiler, MainSteamValve, SteamCondensor } = steamSys
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    Boiler.Temperature = startTemp
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    SteamCondensor.CoolCircuitComplete = true

    Boiler.FuelIntakeValve.Open()
    Boiler.Ignite()
    MainSteamValve.Open()
    steamSys.Thick()
    expect(SteamCondensor.HotCircuitComplete).toBeTruthy()
  })
  test('steam valve is closed = Condensor has no hot side', () => {
    const { Boiler, MainSteamValve, SteamCondensor } = steamSys
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    Boiler.Temperature = startTemp
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    SteamCondensor.CoolCircuitComplete = true

    Boiler.FuelIntakeValve.Open()
    Boiler.Ignite()
    steamSys.Thick()
    expect(SteamCondensor.HotCircuitComplete).toBeFalsy()
  })
  test('no cooling = loss steam = lower water level', () => {
    const { Boiler, MainSteamValve, SteamCondensor } = steamSys
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    Boiler.Temperature = startTemp
    Boiler.FuelIntakeValve.Open()
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    MainSteamValve.Open()

    steamSys.Thick()
    expect(Boiler.WaterLevel).toBe(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.WaterLossByNotCoolingSteam)

    steamSys.Thick()
    expect(Boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.WaterLossByNotCoolingSteam * 2)
  })
  test('is cooling = no loss steam = same water level', () => {
    const { Boiler, MainSteamValve, SteamCondensor } = steamSys
    Boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = 120
    SteamCondensor.CoolCircuitComplete = true
    Boiler.Temperature = startTemp
    Boiler.FuelIntakeValve.Open()
    steamSys.Thick()
    Boiler.Ignite()
    steamSys.Thick()
    MainSteamValve.Open()

    steamSys.Thick()
    expect(Boiler.WaterLevel).toBe(CstSteamSys.Boiler.WaterVolume)
  })
})

