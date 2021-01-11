import Boiler from '../../Components/Boiler'
import { CstChanges, CstSteamSys } from '../../Cst'
import mockTank from '../mocks/mockTank'

let boiler: Boiler
const dummyWaterSource = new mockTank('dummy feed water source', 100, 100)
const dummyFuelSource = new mockTank('dummy fuel source', 100, 100)


beforeEach(() => {
  boiler = new Boiler('test boiler', dummyWaterSource, dummyFuelSource)
})

describe('Init', () => {
  test('Boiler water level is zero', () => {
    expect(boiler.WaterLevel).toBe(0)
    expect(boiler.WaterIntakeValve.Source.Content).toBe(100)
  })
  test('Boiler pressure is 0 bar', () => {
    expect(boiler.Pressure).toBe(0)
    expect(boiler.Content).toBe(0)
  })
  test('Boiler temp is start temp', () => {
    expect(boiler.Temperature).toBe(CstSteamSys.Boiler.StartTemp)
  })
  test('water intake valve is closed', () => {
    expect(boiler.WaterIntakeValve.isOpen).toBeFalsy()
  })
  test('fuel intake valve is closed', () => {
    expect(boiler.FuelIntakeValve.isOpen).toBeFalsy()
    expect(boiler.FuelIntakeValve.Source.Content).toBe(100)
  })
  test('main steam  valve is closed', () => {
    expect(boiler.MainSteamValve.isOpen).toBeFalsy()
  })
})

describe('water level', () => {
  test('open intake valve = fill boiler', () => {
    const waterSource = 45
    dummyWaterSource.Inside = waterSource
    boiler.WaterIntakeValve.Open()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(waterSource)
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(waterSource * 2)
  })
  test('re-close previous open intake valve = stop fill boiler', () => {
    const waterSource = 45
    dummyWaterSource.Inside = waterSource
    boiler.WaterIntakeValve.Open()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(waterSource)
    boiler.WaterIntakeValve.Close()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(waterSource)
  })
  test('drain open = remove water from boiler', () => {
    const startVolume = 87
    boiler.WaterTank.Inside = startVolume
    boiler.WaterDrainValve.Open()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(startVolume - CstChanges.DrainStep)

    boiler.Thick()
    expect(boiler.WaterLevel).toBe(startVolume - CstChanges.DrainStep * 2)
  })
  test('re-close previous open drain  = stop remove water from boiler', () => {
    const startVolume = 45
    boiler.WaterTank.Inside = startVolume
    boiler.WaterDrainValve.Open()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(startVolume - CstChanges.DrainStep)

    boiler.WaterDrainValve.Close()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(startVolume - CstChanges.DrainStep)

  })
})

describe('Fuel', () => {
  test('open fuel intake valve with fuel source = boiler has fuel', () => {
    boiler.FuelIntakeValve.Open()
    expect(boiler.hasFuel).toBeTruthy()
  })
  test('open fuel intake valve with empty fuel source = boiler has no fuel', () => {
    const emptyFuelSource = new mockTank('dummy fuel source', 100, 0)
    boiler.FuelIntakeValve.Source = emptyFuelSource
    boiler.FuelIntakeValve.Open()

    expect(boiler.hasFuel).toBeFalsy()
  })
})

describe('Ignition / flame', () => {
  test('has fuel but not enough water + ignite = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.hasEnoughWaterForFlame).toBeFalsy()
    expect(boiler.hasFlame).toBeFalsy()
  })
  test('has fuel + ignite = has flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.hasFlame).toBeTruthy()
  })
  test('no fuel + ignite = no flame', () => {
    expect(boiler.FuelIntakeValve.isOpen).toBeFalsy()
    boiler.Ignite()
    expect(boiler.hasFlame).toBeFalsy()
  })
  test('has flame but now not enough water = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.hasFlame).toBeTruthy()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame - 0.1
    boiler.Thick()
    expect(boiler.hasEnoughWaterForFlame).toBeFalsy()
    expect(boiler.hasFlame).toBeFalsy()
  })
  test('has flame + close fuel valve = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.hasFlame).toBeTruthy()
    boiler.FuelIntakeValve.Close()
    boiler.Thick()
    expect(boiler.hasFlame).toBeFalsy()
  })
  test('has flame + exting = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.hasFlame).toBeTruthy()
    boiler.Exting()
    expect(boiler.hasFlame).toBeFalsy()
  })
})

describe('Temperature', () => {
  test('has flame = temp raising', () => {
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()

    boiler.Thick()
    expect(boiler.Temperature).toBe(CstSteamSys.Boiler.StartTemp + CstSteamSys.Boiler.TempAddStep)

    boiler.Thick()
    expect(boiler.Temperature).toBe(CstSteamSys.Boiler.StartTemp + CstSteamSys.Boiler.TempAddStep * 2)
  })
  test('has flame = raising until operational temp', () => {
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    const startTemp = CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.TempAddStep
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()

    boiler.Thick()
    expect(boiler.Temperature).toBe(CstSteamSys.Boiler.OperatingTemp)

    boiler.Thick()
    expect(boiler.Temperature).toBe(CstSteamSys.Boiler.OperatingTemp)
  })
})

describe('Pressure', () => {
  test('Temperature 100°C = 1 bar pressure', () => {
    const startTemp = 100
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.Pressure).toBeCloseTo(1.01)
  })
  test('at operational temperature 200°C = 15.5 bar pressure', () => {
    const startTemp = 200
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.Pressure).toBeCloseTo(15.52)
  })
})

describe('Main steam valve', () => {
  test('open = use steam = lower water level', () => {
    boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = 120
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    boiler.Thick()
    boiler.MainSteamValve.Open()

    boiler.Thick()
    expect(boiler.WaterTank.Removing).toBeTruthy()
    expect(boiler.WaterTank.RemoveEachStep).toBe(CstSteamSys.Boiler.MainSteamValveWaterDrain)
    expect(boiler.WaterLevel).toBe(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.MainSteamValveWaterDrain)
    boiler.Thick()
    expect(boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.MainSteamValveWaterDrain * 2)
  })
  test('main steam valve + drain open', () => {
    boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = 120
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    boiler.Thick()
    boiler.MainSteamValve.Open()
    boiler.Thick()
    boiler.WaterDrainValve.Open()
    boiler.Thick()
    expect(boiler.WaterTank.RemoveEachStep).toBe(CstSteamSys.Boiler.MainSteamValveWaterDrain + CstChanges.DrainStep)
    expect(boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.MainSteamValveWaterDrain * 2 - CstChanges.DrainStep)
  })
  test('drain open the open main steam valve', () => {
    boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = 120
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    boiler.Thick()
    boiler.WaterDrainValve.Open()
    boiler.Thick()
    boiler.MainSteamValve.Open()
    boiler.Thick()
    expect(boiler.WaterTank.RemoveEachStep).toBe(CstSteamSys.Boiler.MainSteamValveWaterDrain + CstChanges.DrainStep)
    expect(boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.MainSteamValveWaterDrain - CstChanges.DrainStep * 2)
  })
  test('re-close previous open drain while  main steam valve remains open', () => {
    boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = 120
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    boiler.Thick()
    boiler.WaterDrainValve.Open()
    boiler.Thick()
    boiler.MainSteamValve.Open()
    boiler.Thick()
    boiler.WaterDrainValve.Close()
    boiler.Thick()
    expect(boiler.WaterTank.RemoveEachStep).toBeCloseTo(CstSteamSys.Boiler.MainSteamValveWaterDrain)
    expect(boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.MainSteamValveWaterDrain * 2 - CstChanges.DrainStep * 2)
  })
  test('re-close previous open main steam valve while  drain  valve remains open', () => {
    boiler.WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = 120
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    boiler.Thick()
    boiler.WaterDrainValve.Open()
    boiler.Thick()
    boiler.MainSteamValve.Open()
    boiler.Thick()
    boiler.MainSteamValve.Close()
    boiler.Thick()
    expect(boiler.WaterTank.RemoveEachStep).toBeCloseTo(CstChanges.DrainStep)
    expect(boiler.WaterLevel).toBeCloseTo(CstSteamSys.Boiler.WaterVolume
      - CstSteamSys.Boiler.MainSteamValveWaterDrain - CstChanges.DrainStep * 3)
  })
})