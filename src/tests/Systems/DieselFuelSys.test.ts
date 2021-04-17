const { CstDsFuelSys, CstChanges } = require('../../Cst')
import DieselFuelSystem from '../../Systems/DieselFuelSystem'
import CstTxt from '../../CstTxt'
import { AlarmCode, AlarmLevel } from '../../CstAlarms'
import mockAlarmSys from '../mocks/mockAlarmSys'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'
import mockPowerBus from '../mocks/mockPowerBus'
import { CstPowerSys } from '../../Cst'
const { FuelSysTxt } = CstTxt

let DsFuelSys: DieselFuelSystem
const dummyAlarmSys = new mockAlarmSys()
const dummyPowerbus = new mockPowerBus("dummy mainbus")
const steamSourceContent = CstDsFuelSys.Purification.SteamNeeded
const dummySteamSourceTank = new mockTank("dummy steam source tank", 100, steamSourceContent)
const dummySteamSourceValve = new mockValve("dummy steam source valve", dummySteamSourceTank)

beforeEach(() => {
  DsFuelSys = new DieselFuelSystem(dummyAlarmSys)
  dummyPowerbus.Voltage = CstPowerSys.Voltage

  DsFuelSys.DsPurification.Bus = dummyPowerbus
  DsFuelSys.DsPurification.SteamIntakeValve.Source = dummySteamSourceValve
})

describe('Fuel system init', () => {
  test('Empty diesel tank', () => {
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(0)
    expect(DsFuelSys.DsStorage.Tank.Volume).toBe(CstDsFuelSys.DsStorageTank.TankVolume)
    expect(DsFuelSys.DsStorage.Tank.Name).toBe(FuelSysTxt.DsStorageTank)
  })
  test('Empty diesel service tank', () => {
    expect(DsFuelSys.DsService.Tank.Content).toBe(0)
    expect(DsFuelSys.DsService.Tank.Volume).toBe(CstDsFuelSys.DsServiceTank.TankVolume)
    expect(DsFuelSys.DsService.Tank.Name).toBe(FuelSysTxt.DsServiceTank)
  })
  test('Diesel shore fill valve is closed', () => {
    expect(DsFuelSys.ShoreValve.isOpen).toBeFalsy()
  })
  test('Diesel fuel storage outlet valve is closed', () => {
    expect(DsFuelSys.DsStorage.OutletValve.isOpen).toBeFalsy()
    expect(DsFuelSys.DsStorage.OutletValve.Content).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Diesel fuel service intake valve is closed', () => {
    expect(DsFuelSys.DsService.IntakeValve.isOpen).toBeFalsy()
    expect(DsFuelSys.DsService.IntakeValve.Content).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Shore has fuel', () => {
    // valve only has content of opened, so test here source
    expect(DsFuelSys.ShoreValve.Source.Content).toBe(CstDsFuelSys.ShoreVolume)
  })
  test('Purification unit is not running', () => {
    const { DsPurification } = DsFuelSys
    expect(DsPurification.isRunning).toBeFalsy()
    expect(DsPurification.SteamIntakeValve.Source.Content).toBe(steamSourceContent)
  })
  /*
  test.skip('Handpump outlet valve is closed', () => {
    expect(fuelSys.DsHandPumpOutletValve.isOpen).toBeFalsy()
  })
  test.skip('Handpump is not cranked', () => {
    expect(fuelSys.DsHandpump.IsCranked).toBeFalsy()
    expect(fuelSys.DsHandpump.Content).toBe(0)
  })
  */
})

describe('Diesel storage tank', () => {
  test('Opening shore fill valve, intake stays closed --> no adding to diesel tank', () => {
    DsFuelSys.ShoreValve.Open()
    expect(DsFuelSys.ShoreValve.isOpen).toBeTruthy()
    expect(DsFuelSys.DsStorage.IntakeValve.isOpen).toBeFalsy()
    DsFuelSys.Thick()
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(0)
  })
  test('Opening intake valve, shore fill valve stays closed --> no adding to diesel tank', () => {
    DsFuelSys.DsStorage.IntakeValve.Open()
    expect(DsFuelSys.ShoreValve.isOpen).toBeFalsy()
    expect(DsFuelSys.DsStorage.IntakeValve.isOpen).toBeTruthy()
    DsFuelSys.Thick()
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(0)
  })
  test('open first intake valve then shore fill --> filling', () => {
    DsFuelSys.DsStorage.IntakeValve.Open()
    DsFuelSys.ShoreValve.Open()
    DsFuelSys.Thick()
    expect(DsFuelSys.DsStorage.IntakeValve.Content).toBe(CstDsFuelSys.DsStorageTank.IntakeValveVolume)
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.IntakeValveVolume)
    DsFuelSys.Thick()
    expect(DsFuelSys.DsStorage.IntakeValve.Content).toBe(CstDsFuelSys.DsStorageTank.IntakeValveVolume)
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.IntakeValveVolume * 2)
  })
  test('open first shore fill valve then intake --> filling', () => {
    DsFuelSys.ShoreValve.Open()
    DsFuelSys.DsStorage.IntakeValve.Open()
    DsFuelSys.Thick()
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.IntakeValveVolume)
    DsFuelSys.Thick()
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.IntakeValveVolume * 2)
  })
  test('Closing shore fill valve, both where open = stop filling', () => {
    DsFuelSys.DsStorage.IntakeValve.Open()
    DsFuelSys.ShoreValve.Open()
    // add 2
    DsFuelSys.Thick()
    DsFuelSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = DsFuelSys.DsStorage.Tank.Content
    DsFuelSys.ShoreValve.Close()
    // check nothing is added after valve is opened
    DsFuelSys.Thick()
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(contentBeforeReopeningIntakeValve)
  })
  test('Closing intake valve, both where open = stop filling', () => {
    DsFuelSys.DsStorage.IntakeValve.Open()
    DsFuelSys.ShoreValve.Open()
    // add 2
    DsFuelSys.Thick()
    DsFuelSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = DsFuelSys.DsStorage.Tank.Content
    DsFuelSys.DsStorage.IntakeValve.Close()
    // check nothing is added after valve is opened
    DsFuelSys.Thick()
    expect(DsFuelSys.DsStorage.Tank.Content).toBe(contentBeforeReopeningIntakeValve)
  })
  test('only Drain valve open', () => {
    const start = CstDsFuelSys.DsStorageTank.TankVolume
    const { DsStorage } = DsFuelSys
    DsStorage.Tank.Inside = start
    DsStorage.DrainValve.Open()
    DsFuelSys.Thick()
    expect(DsStorage.Tank.Content).toBe(start - (DsStorage.Tank.Volume / CstChanges.DrainRatio))
    DsFuelSys.Thick()
    expect(DsStorage.Tank.Content).toBe(start - (DsStorage.Tank.Volume / CstChanges.DrainRatio) * 2)
  })
  test('Drain valve and already transfering to service tank', () => {
    const { DsStorage, DsService, DsBypassValve } = DsFuelSys
    const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
    DsStorage.Tank.Inside = contentTank
    DsStorage.OutletValve.Open()
    DsService.IntakeValve.Open()
    DsBypassValve.Open()
    DsStorage.DrainValve.Open()

    DsFuelSys.Thick()
    const expectRemoved = CstDsFuelSys.BypassValveVolume + (DsStorage.Tank.Volume / CstChanges.DrainRatio)
    expect(DsStorage.Tank.Content).toBe(contentTank - expectRemoved)

    DsFuelSys.Thick()
    expect(DsStorage.Tank.Content).toBe(contentTank - expectRemoved * 2)

  })
})

describe('Diesel service tank, filling via multi input', () => {
  describe('Filling via running purification unit', () => {
    beforeEach(() => {
      const { DsPurification, DsBypassValve } = DsFuelSys
      DsBypassValve.Close()
      DsPurification.IntakeValve.Open()
      DsPurification.SteamIntakeValve.Open()
    })
    test('First open diesel service intake valve, then open storage outlet = transfer', () => {
      const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti, DsPurification } = DsFuelSys
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      DsFuelSys.Thick()
      expect(DsServiceMulti.Content).toBe(0)
      DsStorage.OutletValve.Open()
      DsPurification.Start()
      DsFuelSys.Thick()
      expect(DsPurification.isRunning).toBeTruthy()
      expect(DsServiceMulti.Content).toBe(CstDsFuelSys.Purification.Volume)
      expect(DsService.IntakeValve.Content).toBe(CstDsFuelSys.Purification.Volume)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume)

      expect(DsStorage.OutletValve.Content).toBe(contentTank - CstDsFuelSys.Purification.Volume)
      expect(DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.Purification.Volume)

      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstDsFuelSys.Purification.Volume * 2)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume * 2)
    })
    test('First open storage outlet, then open diesel service intake valve = transfer', () => {
      const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti, DsPurification } = DsFuelSys
      DsStorage.Tank.Inside = contentTank
      DsStorage.OutletValve.Open()
      DsPurification.Start()
      expect(DsService.IntakeValve.isOpen).toBeFalsy()

      DsFuelSys.Thick()
      DsService.IntakeValve.Open()
      DsFuelSys.Thick()
      expect(DsPurification.isRunning).toBeTruthy()
      expect(DsPurification.isRunning).toBeTruthy()
      expect(DsServiceMulti.Content).toBe(CstDsFuelSys.Purification.Volume)
      expect(DsService.IntakeValve.Content).toBe(CstDsFuelSys.Purification.Volume)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume)

      expect(DsStorage.OutletValve.Content).toBe(contentTank - CstDsFuelSys.Purification.Volume)

      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstDsFuelSys.Purification.Volume * 2)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume * 2)
    })

    test('Open diesel service intake valve + close storage outlet = no transfer', () => {
      const contentTank = 100
      DsFuelSys.DsStorage.Tank.Inside = contentTank
      DsFuelSys.DsStorage.OutletValve.Open()
      expect(DsFuelSys.DsService.IntakeValve.isOpen).toBeFalsy()

      DsFuelSys.Thick()
      expect(DsFuelSys.DsBypassValve.Content).toBe(0)
      expect(DsFuelSys.DsService.IntakeValve.Content).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(contentTank)
      expect(DsFuelSys.DsService.Tank.Content).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
    })
    test('Closed diesel service intake valve + open storage outlet = no transfer', () => {
      const { DsStorage, DsService, DsServiceMulti } = DsFuelSys
      const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      expect(DsStorage.OutletValve.isOpen).toBeFalsy()

      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank)
      expect(DsStorage.OutletValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)

      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsService.Tank.Content).toBe(0)

      DsFuelSys.Thick()
      expect(DsService.Tank.AddThisStep).toBe(0)
      expect(DsStorage.Tank.RemoveThisStep).toBe(0)
    })

    test('re-close diesel service intake valve after both where open = stop transfer', () => {
      const contentTank = 100
      DsFuelSys.DsStorage.Tank.Inside = contentTank
      DsFuelSys.DsStorage.OutletValve.Open()
      DsFuelSys.DsPurification.Start()

      DsFuelSys.DsService.IntakeValve.Open()
      DsFuelSys.Thick()

      DsFuelSys.DsService.IntakeValve.Close()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.Purification.Volume)
      expect(DsFuelSys.DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume)
    })
    test('re-close diesel storage outlet valve after both where open = stop transfer', () => {
      const contentTank = 100
      DsFuelSys.DsStorage.Tank.Inside = contentTank
      DsFuelSys.DsStorage.OutletValve.Open()
      DsFuelSys.DsPurification.Start()
      DsFuelSys.Thick()
      DsFuelSys.DsService.IntakeValve.Open()
      DsFuelSys.Thick()

      DsFuelSys.DsStorage.OutletValve.Close()
      DsFuelSys.Thick()
      expect(DsFuelSys.DsPurification.isRunning).toBeFalsy()
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.Purification.Volume)
      expect(DsFuelSys.DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume)
    })
    test('re-close both valves after there where open = no transfer (no double remove)', () => {
      const contentTank = 2000
      DsFuelSys.DsStorage.Tank.Inside = contentTank
      DsFuelSys.DsStorage.OutletValve.Open()
      DsFuelSys.DsPurification.Start()
      DsFuelSys.Thick()
      DsFuelSys.DsService.IntakeValve.Open()
      DsFuelSys.Thick()
      expect(DsFuelSys.DsPurification.isRunning).toBeTruthy()
      // expect(fuelSys.DsStorage.Tank.AmountRemovers).toBe(1)
      DsFuelSys.DsStorage.OutletValve.Close()
      DsFuelSys.Thick()
      DsFuelSys.DsService.IntakeValve.Close()
      DsFuelSys.Thick()
      // expect(fuelSys.DsStorage.Tank.AmountRemovers).toBe(0)
      // expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      // expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
    })

    test('filling and now stop purification  = stop transfer', () => {
      const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsPurification, DsBypassValve, DsServiceMulti } = DsFuelSys
      DsStorage.Tank.Inside = contentTank

      DsService.IntakeValve.Open()
      DsFuelSys.Thick()

      DsStorage.OutletValve.Open()
      DsFuelSys.DsPurification.Start()
      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.Purification.Volume)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume)

      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstDsFuelSys.Purification.Volume * 2)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume * 2)

      DsPurification.Stop()
      DsFuelSys.Thick()
      expect(DsPurification.isRunning).toBeFalsy()
      expect(DsBypassValve.isOpen).toBeFalsy()
      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstDsFuelSys.Purification.Volume * 2)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.Purification.Volume * 2)
    })
  })

  describe('Filling via bypass valve', () => {
    beforeEach(() => {
      DsFuelSys.DsPurification.Stop()
      DsFuelSys.DsBypassValve.Open()
      DsFuelSys.Thick
      expect(DsFuelSys.DsPurification.isRunning).toBeFalsy()
    })
    test('First open storage outlet, then open diesel service intake valve = transfer', () => {
      const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti, DsBypassValve } = DsFuelSys
      DsStorage.Tank.Inside = contentTank
      DsStorage.OutletValve.Open()
      expect(DsStorage.OutletValve.Content).toBe(contentTank) // outlet valve is unrestricted

      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank) // outlet valve is unrestricted
      expect(DsStorage.OutletValve.Content).toBe(contentTank) // outlet valve is unrestricted
      expect(DsBypassValve.Source.Content).toBe(contentTank)
      expect(DsBypassValve.Content).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsServiceMulti.Content).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsService.IntakeValve.Content).toBe(0)
      DsService.IntakeValve.Open()

      DsFuelSys.Thick()
      expect(DsService.IntakeValve.Content).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsService.Tank.AddThisStep).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.BypassValveVolume)

      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstDsFuelSys.BypassValveVolume * 2)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume * 2)
    })
    test('First open diesel service intake valve, then open storage outlet = transfer', () => {
      const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti } = DsFuelSys
      DsStorage.Tank.Inside = contentTank

      DsService.IntakeValve.Open()
      DsFuelSys.Thick()

      DsStorage.OutletValve.Open()
      DsFuelSys.Thick()
      expect(DsServiceMulti.Content).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.BypassValveVolume)

      expect(DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume)

      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstDsFuelSys.BypassValveVolume * 2)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume * 2)
    })

    test('Open diesel service intake valve + close storage outlet = no transfer', () => {
      const contentTank = 100
      DsFuelSys.DsStorage.Tank.Inside = contentTank
      DsFuelSys.DsStorage.OutletValve.Open()
      expect(DsFuelSys.DsService.IntakeValve.isOpen).toBeFalsy()

      DsFuelSys.Thick()
      expect(DsFuelSys.DsService.IntakeValve.Content).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(contentTank)
      expect(DsFuelSys.DsService.Tank.Content).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
    })
    test('Closed diesel service intake valve + open storage outlet = no transfer', () => {
      const { DsStorage, DsService, DsServiceMulti } = DsFuelSys
      const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      expect(DsStorage.OutletValve.isOpen).toBeFalsy()

      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank)
      expect(DsStorage.OutletValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)
      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsService.Tank.Content).toBe(0)

      DsFuelSys.Thick()
      expect(DsService.Tank.AddThisStep).toBe(0)
      expect(DsStorage.Tank.RemoveThisStep).toBe(0)
    })

    test('re-close diesel service intake valve after both where open = stop transfer', () => {
      const contentTank = 100
      DsFuelSys.DsStorage.Tank.Inside = contentTank
      DsFuelSys.DsStorage.OutletValve.Open()
      DsFuelSys.DsService.IntakeValve.Open()
      DsFuelSys.Thick()

      DsFuelSys.DsService.IntakeValve.Close()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.BypassValveVolume)
      expect(DsFuelSys.DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume)
    })
    test('re-close diesel storage outlet valve after both where open = stop transfer', () => {
      const contentTank = 100
      DsFuelSys.DsStorage.Tank.Inside = contentTank
      DsFuelSys.DsStorage.OutletValve.Open()
      DsFuelSys.DsService.IntakeValve.Open()
      DsFuelSys.Thick()

      DsFuelSys.DsStorage.OutletValve.Close()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.BypassValveVolume)
      expect(DsFuelSys.DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume)
    })
    test('re-close both valves after there where open = no transfer (no double remove)', () => {
      const contentTank = 100
      DsFuelSys.DsStorage.Tank.Inside = contentTank
      DsFuelSys.DsStorage.OutletValve.Open()
      DsFuelSys.DsService.IntakeValve.Open()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.DsStorage.OutletValve.Close()
      DsFuelSys.Thick()
      DsFuelSys.DsService.IntakeValve.Close()
      DsFuelSys.Thick()
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
    })

    test('service tank is full, stop transfer, storage stops remove', () => {
      // fill storage tank full
      DsFuelSys.DsStorage.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
      // fill service tank almost full (full - fillSteps)
      const fillSteps = 3
      const contentServiceTank = CstDsFuelSys.DsServiceTank.TankVolume - CstDsFuelSys.BypassValveVolume * fillSteps
      DsFuelSys.DsService.Tank.Inside = contentServiceTank
      DsFuelSys.Thick()
      DsFuelSys.DsStorage.OutletValve.Open()
      DsFuelSys.DsService.IntakeValve.Open()

      DsFuelSys.Thick()
      expect(DsFuelSys.DsService.Tank.Content).toBe(CstDsFuelSys.DsServiceTank.TankVolume - CstDsFuelSys.BypassValveVolume * (fillSteps - 1))
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.TankVolume - CstDsFuelSys.BypassValveVolume)
      DsFuelSys.Thick()
      expect(DsFuelSys.DsService.Tank.Content).toBe(CstDsFuelSys.DsServiceTank.TankVolume - CstDsFuelSys.BypassValveVolume * (fillSteps - 2))
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.TankVolume - CstDsFuelSys.BypassValveVolume * 2)
      DsFuelSys.Thick() // will be full
      expect(DsFuelSys.DsService.Tank.Content).toBe(CstDsFuelSys.DsServiceTank.TankVolume)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.TankVolume - CstDsFuelSys.BypassValveVolume * 2)
      DsFuelSys.Thick() // is full = no futher add
      expect(DsFuelSys.DsService.Tank.Content).toBe(CstDsFuelSys.DsServiceTank.TankVolume)
      expect(DsFuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(DsFuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.TankVolume - CstDsFuelSys.BypassValveVolume * 2)

    })
    test('restart filling the service tank after it was full', () => {
      const { DsService, DsStorage, DsBypassValve, DsServiceMulti } = DsFuelSys
      // fill storage tank full
      DsStorage.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
      // fill service tank almost full (full - fillSteps)
      const fillSteps = 3
      const contentServiceTank = CstDsFuelSys.DsServiceTank.TankVolume - CstDsFuelSys.BypassValveVolume * fillSteps
      DsService.Tank.Inside = contentServiceTank
      DsFuelSys.Thick()
      DsStorage.OutletValve.Open()
      DsService.IntakeValve.Open()

      DsFuelSys.Thick() // step 2
      DsFuelSys.Thick() // step 1
      DsFuelSys.Thick() // will be full now
      DsFuelSys.Thick() //  is full
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.DsServiceTank.TankVolume)
      expect(DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.TankVolume - CstDsFuelSys.BypassValveVolume * 2)

      // drain service tanks so filling needs to continue
      DsFuelSys.DsService.DrainValve.Open()
      DsFuelSys.Thick()
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.DsServiceTank.TankVolume - (DsService.Tank.Volume / CstChanges.DrainRatio))
      DsService.DrainValve.Close()

      DsFuelSys.Thick() // transfer is restarted next tick, first there need te be space is the DsService
      expect(DsBypassValve.Content).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsServiceMulti.Content).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsService.IntakeValve.Content).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsService.Tank.AddThisStep).toBe(CstDsFuelSys.BypassValveVolume)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.DsServiceTank.TankVolume
        - (DsService.Tank.Volume / CstChanges.DrainRatio) + CstDsFuelSys.BypassValveVolume)

      // expect DsStorage has 4 thick removed (was 3 before fill)
      const expectContentStorageTank = CstDsFuelSys.DsStorageTank.TankVolume
        - CstDsFuelSys.BypassValveVolume * (fillSteps)
      expect(DsStorage.Tank.Content).toBeCloseTo(expectContentStorageTank)
    })
    test('storage tank empty, stop adding service tank', () => {
      const contentDsTank = CstDsFuelSys.BypassValveVolume
      DsFuelSys.DsStorage.Tank.Inside = contentDsTank
      DsFuelSys.DsStorage.OutletValve.Open()
      DsFuelSys.DsService.IntakeValve.Open()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      expect(DsFuelSys.DsStorage.Tank.Content).toBeCloseTo(0)
      expect(DsFuelSys.DsService.Tank.Content).toBeCloseTo(contentDsTank)
      // add DS in storage tank --> continue filling service tank until dieseltank is empty again
      DsFuelSys.DsStorage.Tank.Inside = contentDsTank
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      expect(DsFuelSys.DsStorage.Tank.Content).toBeCloseTo(0)
      expect(DsFuelSys.DsService.Tank.Content).toBeCloseTo(contentDsTank * 2)
    })
    test('filling and now close bypass valve  = stop transfer', () => {
      const contentTank = CstDsFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsPurification, DsBypassValve, DsServiceMulti } = DsFuelSys
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      DsStorage.OutletValve.Open()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank - CstDsFuelSys.BypassValveVolume * 2)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume * 2)

      DsBypassValve.Close()
      DsFuelSys.Thick()
      expect(DsBypassValve.isOpen).toBeFalsy()
      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      DsFuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstDsFuelSys.BypassValveVolume * 2)
      expect(DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume * 2)
    })
  })

  test('Add via purification and bypass valve', () => {
    const { DsPurification, DsStorage, DsService } = DsFuelSys
    DsStorage.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    DsStorage.OutletValve.Open()
    DsService.IntakeValve.Open()

    DsPurification.IntakeValve.Open()
    DsPurification.SteamIntakeValve.Open()
    DsPurification.Start()

    DsFuelSys.DsBypassValve.Open()
    DsFuelSys.Thick()
    expect(DsFuelSys.DsServiceMulti.Content).toBe(CstDsFuelSys.BypassValveVolume + CstDsFuelSys.Purification.Volume)
    expect(DsService.Tank.Content).toBe(CstDsFuelSys.BypassValveVolume + CstDsFuelSys.Purification.Volume)
    expect(DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.TankVolume
      - (CstDsFuelSys.BypassValveVolume + CstDsFuelSys.Purification.Volume))

  })
})

describe('Alarms', () => {
  test('Raise Low diesel storage tanks', () => {
    // full service tank to prevent low service alarm
    DsFuelSys.DsService.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    DsFuelSys.DsStorage.Tank.Inside = AlarmLevel.FuelSys.LowDsStorage
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsStorageTank)).toBeFalsy()
    // raise alarm
    DsFuelSys.DsStorage.Tank.Inside = AlarmLevel.FuelSys.LowDsStorage - 0.1
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsStorageTank)).toBeTruthy()
  })
  test('Cancel Low diesel storage tanks', () => {
    // full service tank to prevent low service alarm
    DsFuelSys.DsService.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    DsFuelSys.DsStorage.Tank.Inside = AlarmLevel.FuelSys.LowDsStorage - 5
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsStorageTank)).toBeTruthy()
    // above low level = cancel alarm
    DsFuelSys.DsStorage.Tank.Inside = AlarmLevel.FuelSys.LowDsStorage
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsStorageTank)).toBeFalsy()
  })

  test('Raise Low diesel service tanks', () => {
    // full storage tank to prevent low storage alarm
    DsFuelSys.DsStorage.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    DsFuelSys.DsService.Tank.Inside = AlarmLevel.FuelSys.LowDsService
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsServiceTank)).toBeFalsy()
    // raise alarm
    DsFuelSys.DsService.Tank.Inside = AlarmLevel.FuelSys.LowDsService - 0.1
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsServiceTank)).toBeTruthy()
  })
  test('Cancel Low diesel service tanks', () => {
    // full service tank to prevent low service alarm
    DsFuelSys.DsStorage.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    // raise alarm
    DsFuelSys.DsService.Tank.Inside = AlarmLevel.FuelSys.LowDsService - 5
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsServiceTank)).toBeTruthy()
    // above low level = cancel alarm
    DsFuelSys.DsService.Tank.Inside = AlarmLevel.FuelSys.LowDsService
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsServiceTank)).toBeFalsy()
  })

  test('Raise Empty diesel storage tanks', () => {
    // full service tank to prevent low service alarm
    DsFuelSys.DsService.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    DsFuelSys.DsStorage.Tank.Inside = 1
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsStorageTank)).toBeFalsy()

    DsFuelSys.DsStorage.Tank.Inside = 0
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsStorageTank)).toBeTruthy()
  })
  test('Cancel Empty diesel storage tanks', () => {
    // full service tank to prevent low service alarm
    DsFuelSys.DsService.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    // raise alarm
    DsFuelSys.DsStorage.Tank.Inside = 0
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsStorageTank)).toBeTruthy()
    // no longer empty = cancel alarm
    DsFuelSys.DsStorage.Tank.Inside = 0.1
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsStorageTank)).toBeFalsy()
  })

  test('Raise Empty diesel service tanks', () => {
    // full storage tank to prevent low storage alarm
    DsFuelSys.DsStorage.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    DsFuelSys.DsService.Tank.Inside = 1
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsServiceTank)).toBeFalsy()

    DsFuelSys.DsService.Tank.Inside = 0
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsServiceTank)).toBeTruthy()
  })
  test('Cancel Empty diesel service tanks', () => {
    // full storage tank to prevent low storage alarm
    DsFuelSys.DsStorage.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
    // raise
    DsFuelSys.DsService.Tank.Inside = 0
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsServiceTank)).toBeTruthy()
    // cancel
    DsFuelSys.DsService.Tank.Inside = 5
    DsFuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsServiceTank)).toBeFalsy()
  })
})
