import Boiler from '../../Components/Boiler'
import { CstChanges, CstSteamSys, CstFuelSys } from '../../Cst'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'

let boiler: Boiler

beforeEach(() => {
  const dummyWaterSource = new mockTank('dummy feed water source', 100, 100)
  const dummyFuelSourceTank = new mockTank('dummy fuel source', 100, 100)
  const dummyFuelSourceOutletValve = new mockValve('dummy fuel valve', dummyFuelSourceTank)
  boiler = new Boiler('test boiler', dummyWaterSource, dummyFuelSourceOutletValve, dummyFuelSourceTank)
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

describe('Water level', () => {
  test('open intake valve = fill boiler', () => {
    const water = 45
    const waterSource = boiler.WaterIntakeValve.Source as mockTank
    waterSource.Inside = water
    boiler.WaterIntakeValve.Open()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(water)
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(water * 2)
  })
  test('re-close previous open intake valve = stop fill boiler', () => {
    const water = 45
    const waterSource = boiler.WaterIntakeValve.Source as mockTank
    waterSource.Inside = water
    boiler.WaterIntakeValve.Open()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(water)
    boiler.WaterIntakeValve.Close()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(water)
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

    expect(boiler.FuelSourceTank.AmountRemovers).toBe(0)
    expect(boiler.FuelSourceTank.RemoveEachStep).toBe(0)
  })
  test('has fuel + ignite = has flame = burn fuel', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.hasFlame).toBeTruthy()

    expect(boiler.FuelSourceTank.AmountRemovers).toBe(1)
    expect(boiler.FuelSourceTank.RemoveEachStep).toBe(CstFuelSys.SteamBoiler.Consumption)
  })
  test('no fuel + ignite = no flame', () => {
    expect(boiler.FuelIntakeValve.isOpen).toBeFalsy()
    boiler.Ignite()
    expect(boiler.hasFlame).toBeFalsy()

    expect(boiler.FuelSourceTank.AmountRemovers).toBe(0)
    expect(boiler.FuelSourceTank.RemoveEachStep).toBe(0)
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

    expect(boiler.FuelSourceTank.AmountRemovers).toBe(0)
    expect(boiler.FuelSourceTank.RemoveEachStep).toBe(0)
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

    expect(boiler.FuelSourceTank.AmountRemovers).toBe(0)
    expect(boiler.FuelSourceTank.RemoveEachStep).toBe(0)
  })
  test('has flame + Extinguishing = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.hasFlame).toBeTruthy()
    boiler.Extinguishing()
    expect(boiler.hasFlame).toBeFalsy()

    expect(boiler.FuelSourceTank.AmountRemovers).toBe(0)
    expect(boiler.FuelSourceTank.RemoveEachStep).toBe(0)
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
    const startTestTemp = CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.TempAddStep
    boiler.Temperature = startTestTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    boiler.Thick()
    boiler.Thick()
    expect(boiler.hasFlame).toBeTruthy()
    expect(boiler.Temperature).toBe(CstSteamSys.Boiler.OperatingTemp)

    boiler.Thick()
    expect(boiler.Temperature).toBe(CstSteamSys.Boiler.OperatingTemp)
  })
  test('no flame = cool down until start temp', () => {
    boiler.Temperature = CstSteamSys.Boiler.StartTemp + CstSteamSys.Boiler.TempCoolingStep * 2
    boiler.Thick()
    expect(boiler.Temperature).toBeCloseTo(CstSteamSys.Boiler.StartTemp + CstSteamSys.Boiler.TempCoolingStep)
    boiler.Thick()
    expect(boiler.Temperature).toBeCloseTo(CstSteamSys.Boiler.StartTemp)
    boiler.Thick()
    expect(boiler.Temperature).toBeCloseTo(CstSteamSys.Boiler.StartTemp)
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
  test('at operational temperature  = operational pressure', () => {
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.Pressure).toBeCloseTo(CstSteamSys.Boiler.OperatingPressure)
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