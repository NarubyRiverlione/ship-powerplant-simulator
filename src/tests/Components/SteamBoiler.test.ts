import SteamBoiler from '../../Components/SteamBoiler'
import { CstChanges, CstSteamSys, CstDsFuelSys } from '../../Cst'

import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'

let boiler: SteamBoiler

beforeEach(() => {
  const dummyWaterSource = new mockTank('dummy feed water source', 100, 100)
  const dummyFuelSourceTank = new mockTank('dummy fuel source', 100, 100)
  const dummyFuelSourceOutletValve = new mockValve('dummy fuel valve', dummyFuelSourceTank)

  boiler = new SteamBoiler('test boiler', dummyWaterSource, dummyFuelSourceOutletValve, dummyFuelSourceTank)
})
describe('Init', () => {
  test('Boiler water level is zero', () => {
    expect(boiler.WaterLevel).toBe(0)
    expect(boiler.WaterIntakeValve.Source.Content).toBe(100)
  })
  test('Boiler pressure is (almost) 0 bar', () => {
    expect(boiler.Pressure).toBeCloseTo(0, 0)
    expect(boiler.Content).toBeCloseTo(0, 0)
  })
  test('Boiler temp is start temp', () => {
    expect(boiler.Temperature).toBe(CstChanges.StartTemp)
  })
  test('water intake valve is closed', () => {
    expect(boiler.WaterIntakeValve.isOpen).toBeFalsy()
  })
  test('fuel intake valve is closed', () => {
    expect(boiler.FuelIntakeValve.isOpen).toBeFalsy()
    expect(boiler.FuelIntakeValve.Source.Content).toBe(100)
  })
  test('safety release valve is closed', () => {
    expect(boiler.SafetyRelease.isOpen).toBeFalsy()
  })
  test('steam vent valve is closed', () => {
    expect(boiler.SteamVent.isOpen).toBeFalsy()
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
    expect(boiler.WaterLevel).toBe(startVolume - CstChanges.DrainRatio)

    boiler.Thick()
    expect(boiler.WaterLevel).toBe(startVolume - CstChanges.DrainRatio * 2)
  })
  test('re-close previous open drain  = stop remove water from boiler', () => {
    const startVolume = 45
    boiler.WaterTank.Inside = startVolume
    boiler.WaterDrainValve.Open()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(startVolume - CstChanges.DrainRatio)

    boiler.WaterDrainValve.Close()
    boiler.Thick()
    expect(boiler.WaterLevel).toBe(startVolume - CstChanges.DrainRatio)

  })
  test('Expand water by heat = raise water level', () => {
    const { WaterTank, FuelIntakeValve } = boiler
    WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Temperature = CstSteamSys.Boiler.StartExpandTemp
    FuelIntakeValve.Open()
    boiler.Ignite()
    boiler.Thick()
    expect(WaterTank.Content).toBe(CstSteamSys.Boiler.MinWaterLvlForFlame + CstSteamSys.Boiler.ExpandRate)
    boiler.Thick()
    expect(WaterTank.Content).toBe(CstSteamSys.Boiler.MinWaterLvlForFlame + CstSteamSys.Boiler.ExpandRate * 2)
  })
  test('Shrink water by cooling down = raise water level', () => {
    const { WaterTank } = boiler
    WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Temperature = CstSteamSys.Boiler.EndExpandTemp
    boiler.Thick()
    expect(WaterTank.Content).toBe(CstSteamSys.Boiler.MinWaterLvlForFlame - CstSteamSys.Boiler.ExpandRate)
    boiler.Thick()
    expect(WaterTank.Content).toBe(CstSteamSys.Boiler.MinWaterLvlForFlame - CstSteamSys.Boiler.ExpandRate * 2)
  })
})

describe('Fuel', () => {
  test('open fuel intake valve with fuel source = boiler has fuel', () => {
    boiler.FuelIntakeValve.Open()
    expect(boiler.HasFuel).toBeTruthy()
  })
  test('open fuel intake valve with empty fuel source = boiler has no fuel', () => {
    const emptyFuelSource = new mockTank('dummy fuel source', 100, 0)
    boiler.FuelIntakeValve.Source = emptyFuelSource
    boiler.FuelIntakeValve.Open()

    expect(boiler.HasFuel).toBeFalsy()
  })
})

describe('Ignition / flame', () => {
  test('has fuel but not enough water + ignite = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.HasEnoughWaterForFlame).toBeFalsy()
    expect(boiler.HasFlame).toBeFalsy()
    expect(boiler.FuelSourceTank.RemoveThisStep).toBe(0)
  })
  test('has fuel + ignite = has flame = burn fuel', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Ignite()
    boiler.Thick()
    expect(boiler.HasFlame).toBeTruthy()
    expect(boiler.FuelSourceTank.RemoveThisStep).toBe(CstDsFuelSys.SteamBoiler.Consumption.Diesel)
  })
  test('has fuel + toggle = has flame = burn fuel', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Toggle()
    boiler.Thick()
    expect(boiler.HasFlame).toBeTruthy()
    expect(boiler.FuelSourceTank.RemoveThisStep).toBe(CstDsFuelSys.SteamBoiler.Consumption.Diesel)
  })
  test('no fuel + ignite = no flame', () => {
    expect(boiler.FuelIntakeValve.isOpen).toBeFalsy()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeFalsy()
  })
  test('has flame but now not enough water = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame - 0.1
    boiler.Thick()
    expect(boiler.HasEnoughWaterForFlame).toBeFalsy()
    expect(boiler.HasFlame).toBeFalsy()
    expect(boiler.FuelSourceTank.RemoveThisStep).toBe(0)
  })
  test('has flame + close fuel valve = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.FuelIntakeValve.Close()
    boiler.Thick()
    expect(boiler.HasFlame).toBeFalsy()
    expect(boiler.FuelSourceTank.RemoveThisStep).toBe(0)
  })
  test('has flame + toggle = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.Toggle()
    expect(boiler.HasFlame).toBeFalsy()
    expect(boiler.FuelSourceTank.RemoveThisStep).toBe(0)
  })
  test('has flame + Extinguishing = no flame', () => {
    boiler.FuelIntakeValve.Open()
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.Extinguishing()
    expect(boiler.HasFlame).toBeFalsy()
    expect(boiler.FuelSourceTank.RemoveThisStep).toBe(0)
  })
})

describe('Temperature', () => {
  test('has flame = temp raising', () => {
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()

    boiler.Thick()
    expect(boiler.Temperature).toBe(CstChanges.StartTemp + CstSteamSys.Boiler.TempAddStep)

    boiler.Thick()
    expect(boiler.Temperature).toBe(CstChanges.StartTemp + CstSteamSys.Boiler.TempAddStep * 2)
  })

  test('no flame = cool down until start temp', () => {
    boiler.Temperature = CstChanges.StartTemp + CstSteamSys.Boiler.TempCoolingStep * 2
    boiler.Thick()
    expect(boiler.Temperature).toBeCloseTo(CstChanges.StartTemp + CstSteamSys.Boiler.TempCoolingStep)
    boiler.Thick()
    expect(boiler.Temperature).toBeCloseTo(CstChanges.StartTemp)
    boiler.Thick()
    expect(boiler.Temperature).toBeCloseTo(CstChanges.StartTemp)
  })
})

describe('Pressure calculation', () => {
  test('Temperature 100°C = 1 bar pressure', () => {
    const startTemp = 100
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.Pressure).toBeCloseTo(1, 0)
  })
  test('at operational temperature  = operational pressure', () => {
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Thick()
    boiler.Ignite()
    expect(boiler.Pressure).toBeCloseTo(CstSteamSys.Boiler.OperatingPressure, 0)
  })
})

describe('Safety release valve', () => {
  test('Safety open if pressure is to high', () => {
    const startTemp = CstSteamSys.Boiler.SafetyTemp
    boiler.Temperature = startTemp
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.Thick()
    expect(boiler.Pressure).toBeGreaterThanOrEqual(CstSteamSys.Boiler.SafetyPressure)
    expect(boiler.SafetyRelease.isOpen).toBeTruthy()
    expect(boiler.HasFlame).toBeFalsy()
    expect(boiler.WaterLevel).toBe(CstSteamSys.Boiler.MinWaterLvlForFlame - CstSteamSys.Boiler.WaterLossBySafetyRelease)
  })
  test('Safety close when pressure is back below max', () => {
    const startTemp = CstSteamSys.Boiler.SafetyTemp
    boiler.Temperature = startTemp
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.Thick()
    expect(boiler.SafetyRelease.isOpen).toBeTruthy()
    expect(boiler.HasFlame).toBeFalsy()

    boiler.Thick()
    expect(boiler.HasFlame).toBeFalsy()
    // flame is killed by safety = boiler cools
    expect(boiler.Temperature).toBeCloseTo(CstSteamSys.Boiler.SafetyTemp - CstSteamSys.Boiler.TempLossBySafetyRelease, 0)
    boiler.Thick()
    boiler.Thick()
    boiler.Thick()
    boiler.Thick()
    expect(boiler.Pressure).toBeLessThan(CstSteamSys.Boiler.SafetyPressure)
    expect(boiler.SafetyRelease.isOpen).toBeFalsy()
  })
})

describe('Steam vent valve', () => {
  test('open steam vent loss temperture and water', () => {
    const { WaterTank, SteamVent } = boiler
    WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    boiler.Temperature = CstSteamSys.Boiler.OperatingTemp
    boiler.FuelIntakeValve.Open()
    boiler.Ignite()
    boiler.Thick()
    expect(boiler.HasFlame).toBeTruthy()
    expect(boiler.Temperature).toBeCloseTo(startTemp + CstSteamSys.Boiler.TempAddStep)

    SteamVent.Open()
    boiler.Thick()
    expect(SteamVent.isOpen).toBeTruthy()
    expect(boiler.Temperature).toBeCloseTo(startTemp + CstSteamSys.Boiler.TempAddStep * 2 - CstSteamSys.Boiler.TempVentLoss)
    expect(WaterTank.Content).toBe(CstSteamSys.Boiler.WaterVolume - CstSteamSys.Boiler.WaterVentLoss)

    boiler.Thick()
    expect(WaterTank.Content).toBe(CstSteamSys.Boiler.WaterVolume - CstSteamSys.Boiler.WaterVentLoss * 2)
    expect(boiler.Temperature).toBeCloseTo(startTemp + CstSteamSys.Boiler.TempAddStep * 3 - CstSteamSys.Boiler.TempVentLoss * 2)
  })
  test('closed an previous opened steam vent = no more loss temperture and water', () => {
    const { WaterTank, SteamVent } = boiler
    WaterTank.Inside = CstSteamSys.Boiler.WaterVolume
    const startTemp = 120
    boiler.Temperature = startTemp
    boiler.FuelIntakeValve.Open()
    boiler.Ignite()
    boiler.Thick()
    expect(boiler.HasFlame).toBeTruthy()
    expect(boiler.Temperature).toBeCloseTo(startTemp + CstSteamSys.Boiler.TempAddStep)

    SteamVent.Open()
    boiler.Thick()
    expect(SteamVent.isOpen).toBeTruthy()

    boiler.Thick()
    expect(boiler.Temperature).toBeCloseTo(startTemp + CstSteamSys.Boiler.TempAddStep * 3 - CstSteamSys.Boiler.TempVentLoss, 0)
    expect(WaterTank.Content).toBe(CstSteamSys.Boiler.WaterVolume - CstSteamSys.Boiler.WaterVentLoss * 2)
    SteamVent.Close()
    boiler.Thick()
    expect(boiler.Temperature).toBeCloseTo(startTemp + CstSteamSys.Boiler.TempAddStep * 4 - CstSteamSys.Boiler.TempVentLoss, 0)
    expect(WaterTank.Content).toBe(CstSteamSys.Boiler.WaterVolume - CstSteamSys.Boiler.WaterVentLoss * 2)
  })
})

describe('Auto flame', () => {
  test('Can be enabled inside auto zone around operational temp', () => {
    const startTemp = CstSteamSys.Boiler.OperatingTemp
    boiler.Temperature = startTemp
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.Thick()
    expect(boiler.TempInsideAutoZone).toBeTruthy()
    boiler.AutoFlameToggle()
    boiler.Thick()
    expect(boiler.AutoFlame).toBeTruthy()
  })
  test('Can not be enabled below auto zone', () => {
    const startTemp = CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.AutoEnableZone * 2
    boiler.Temperature = startTemp
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.Thick()
    boiler.AutoFlameToggle()
    boiler.Thick()
    expect(boiler.AutoFlame).toBeFalsy()
  })
  test('Can not be enabled above auto zone', () => {
    const startTemp = CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.AutoEnableZone * 2
    boiler.Temperature = startTemp
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.Thick()
    expect(boiler.Temperature).toBeGreaterThan(CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.AutoEnableZone)
    boiler.AutoFlameToggle()
    boiler.Thick()
    expect(boiler.AutoFlame).toBeFalsy()
  })
  test('auto flame kill flame if temp is above operational', () => {
    const startTemp = CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.AutoEnableZone / 2
    boiler.Temperature = startTemp
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    boiler.Ignite()
    expect(boiler.HasFlame).toBeTruthy()
    boiler.AutoFlameToggle()
    boiler.Thick()
    expect(boiler.AutoFlame).toBeTruthy()
    expect(boiler.HasFlame).toBeFalsy()
  })
  test('auto flame re-ignite flame if temp is again below operational', () => {
    const startTemp = CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.AutoEnableZone / 2
    boiler.Temperature = startTemp
    boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
    boiler.FuelIntakeValve.Open()
    expect(boiler.HasFlame).toBeFalsy()
    boiler.AutoFlameToggle()

    boiler.Thick()
    expect(boiler.AutoFlame).toBeTruthy()
    expect(boiler.HasFlame).toBeTruthy()

    boiler.Thick()
    const expectTemp = CstSteamSys.Boiler.OperatingTemp - CstSteamSys.Boiler.AutoEnableZone / 2 + CstSteamSys.Boiler.TempAddStep
    expect(boiler.Temperature).toBeCloseTo(expectTemp, 0)

  })
})
