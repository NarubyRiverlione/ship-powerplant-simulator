const { CstFuelSys, CstChanges } = require('../../Cst')
import FuelSystem from '../../Systems/FuelSystem'
import CstTxt from '../../CstTxt'
import { AlarmCode, AlarmLevel } from '../../CstAlarms'
import mockAlarmSys from '../mocks/mockAlarmSys'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'
import mockPowerBus from '../mocks/mockPowerBus'
import { CstPowerSys, CstSteamSys } from '../../Cst'
const { FuelSysTxt } = CstTxt

let fuelSys: FuelSystem
const dummyAlarmSys = new mockAlarmSys()
const dummyPowerbus = new mockPowerBus("dummy mainbus")
const steamSourceContent = CstFuelSys.Purification.SteamNeeded
const dummySteamSourceTank = new mockTank("dummy steam source tank", 100, steamSourceContent)
const dummySteamSourceValve = new mockValve("dummy steam source valve", dummySteamSourceTank)

beforeEach(() => {
  fuelSys = new FuelSystem(dummyAlarmSys)
  dummyPowerbus.Voltage = CstPowerSys.Voltage

  fuelSys.DsPurification.Bus = dummyPowerbus
  fuelSys.DsPurification.SteamIntakeValve.Source = dummySteamSourceValve
})

describe('Fuel system init', () => {
  test('Empty diesel tank', () => {
    expect(fuelSys.DsStorage.Tank.Content).toBe(0)
    expect(fuelSys.DsStorage.Tank.Volume).toBe(CstFuelSys.DsStorageTank.TankVolume)
    expect(fuelSys.DsStorage.Tank.Name).toBe(FuelSysTxt.DsStorageTank)
  })
  test('Empty diesel service tank', () => {
    expect(fuelSys.DsService.Tank.Content).toBe(0)
    expect(fuelSys.DsService.Tank.Volume).toBe(CstFuelSys.DsServiceTank.TankVolume)
    expect(fuelSys.DsService.Tank.Name).toBe(FuelSysTxt.DsServiceTank)
  })
  test('Diesel shore fill valve is closed', () => {
    expect(fuelSys.DsShoreValve.isOpen).toBeFalsy()
  })
  test('Diesel fuel storage outlet valve is closed', () => {
    expect(fuelSys.DsStorage.OutletValve.isOpen).toBeFalsy()
    expect(fuelSys.DsStorage.OutletValve.Content).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Diesel fuel service intake valve is closed', () => {
    expect(fuelSys.DsService.IntakeValve.isOpen).toBeFalsy()
    expect(fuelSys.DsService.IntakeValve.Content).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Shore has fuel', () => {
    // valve only has content of opened, so test here source
    expect(fuelSys.DsShoreValve.Source.Content).toBe(CstFuelSys.ShoreVolume)
  })
  test('Purification unit is not running', () => {
    const { DsPurification } = fuelSys
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
    fuelSys.DsShoreValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeTruthy()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeFalsy()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content).toBe(0)
  })
  test('Opening intake valve, shore fill valve stays closed --> no adding to diesel tank', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeFalsy()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeTruthy()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content).toBe(0)
  })
  test('open first intake valve then shore fill --> filling', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    fuelSys.DsShoreValve.Open()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.IntakeValve.Content).toBe(CstFuelSys.DsStorageTank.IntakeValveVolume)
    expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.IntakeValveVolume)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.IntakeValve.Content).toBe(CstFuelSys.DsStorageTank.IntakeValveVolume)
    expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.IntakeValveVolume * 2)
  })
  test('open first shore fill valve then intake --> filling', () => {
    fuelSys.DsShoreValve.Open()
    fuelSys.DsStorage.IntakeValve.Open()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.IntakeValveVolume)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.IntakeValveVolume * 2)
  })
  test('Closing shore fill valve, both where open = stop filling', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    fuelSys.DsShoreValve.Open()
    // add 2
    fuelSys.Thick()
    fuelSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = fuelSys.DsStorage.Tank.Content
    fuelSys.DsShoreValve.Close()
    // check nothing is added after valve is opened
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content).toBe(contentBeforeReopeningIntakeValve)
  })
  test('Closing intake valve, both where open = stop filling', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    fuelSys.DsShoreValve.Open()
    // add 2
    fuelSys.Thick()
    fuelSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = fuelSys.DsStorage.Tank.Content
    fuelSys.DsStorage.IntakeValve.Close()
    // check nothing is added after valve is opened
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content).toBe(contentBeforeReopeningIntakeValve)
  })
  test('only Drain valve open', () => {
    const start = CstFuelSys.DsStorageTank.TankVolume
    const { DsStorage } = fuelSys
    DsStorage.Tank.Inside = start
    DsStorage.DrainValve.Open()
    fuelSys.Thick()
    expect(DsStorage.Tank.Content).toBe(start - (DsStorage.Tank.Volume / CstChanges.DrainRatio))
    fuelSys.Thick()
    expect(DsStorage.Tank.Content).toBe(start - (DsStorage.Tank.Volume / CstChanges.DrainRatio) * 2)
  })
  test('Drain valve and already transfering to service tank', () => {
    const { DsStorage, DsService, DsBypassValve } = fuelSys
    const contentTank = CstFuelSys.DsStorageTank.TankVolume
    DsStorage.Tank.Inside = contentTank
    DsStorage.OutletValve.Open()
    DsService.IntakeValve.Open()
    DsBypassValve.Open()
    DsStorage.DrainValve.Open()

    fuelSys.Thick()
    const expectRemoved = CstFuelSys.BypassValveVolume + (DsStorage.Tank.Volume / CstChanges.DrainRatio)
    expect(DsStorage.Tank.Content).toBe(contentTank - expectRemoved)

    fuelSys.Thick()
    expect(DsStorage.Tank.Content).toBe(contentTank - expectRemoved * 2)

  })
})

describe('Diesel service tank, filling via multi input', () => {
  describe('Filling via running purification unit', () => {
    beforeEach(() => {
      const { DsPurification, DsBypassValve } = fuelSys
      DsBypassValve.Close()
      DsPurification.IntakeValve.Open()
      DsPurification.SteamIntakeValve.Open()
    })
    test('First open diesel service intake valve, then open storage outlet = transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti, DsPurification } = fuelSys
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      fuelSys.Thick()
      expect(DsServiceMulti.Content).toBe(0)
      DsStorage.OutletValve.Open()
      DsPurification.Start()
      fuelSys.Thick()
      expect(DsPurification.isRunning).toBeTruthy()
      expect(DsServiceMulti.Content).toBe(CstFuelSys.Purification.Volume)
      expect(DsService.IntakeValve.Content).toBe(CstFuelSys.Purification.Volume)
      expect(DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume)

      expect(DsStorage.OutletValve.Content).toBe(contentTank - CstFuelSys.Purification.Volume)
      expect(DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.Purification.Volume)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstFuelSys.Purification.Volume * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume * 2)
    })
    test('First open storage outlet, then open diesel service intake valve = transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti, DsPurification } = fuelSys
      DsStorage.Tank.Inside = contentTank
      DsStorage.OutletValve.Open()
      DsPurification.Start()
      expect(DsService.IntakeValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      DsService.IntakeValve.Open()
      fuelSys.Thick()
      expect(DsPurification.isRunning).toBeTruthy()
      expect(DsPurification.isRunning).toBeTruthy()
      expect(DsServiceMulti.Content).toBe(CstFuelSys.Purification.Volume)
      expect(DsService.IntakeValve.Content).toBe(CstFuelSys.Purification.Volume)
      expect(DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume)

      expect(DsStorage.OutletValve.Content).toBe(contentTank - CstFuelSys.Purification.Volume)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstFuelSys.Purification.Volume * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume * 2)
    })

    test('Open diesel service intake valve + close storage outlet = no transfer', () => {
      const contentTank = 100
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      expect(fuelSys.DsService.IntakeValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      expect(fuelSys.DsBypassValve.Content).toBe(0)
      expect(fuelSys.DsService.IntakeValve.Content).toBe(0)
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank)
      expect(fuelSys.DsService.Tank.Content).toBe(0)
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
    })
    test('Closed diesel service intake valve + open storage outlet = no transfer', () => {
      const { DsStorage, DsService, DsServiceMulti } = fuelSys
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      expect(DsStorage.OutletValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank)
      expect(DsStorage.OutletValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)

      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsService.Tank.Content).toBe(0)

      fuelSys.Thick()
      expect(DsService.Tank.AddThisStep).toBe(0)
      expect(DsStorage.Tank.RemoveThisStep).toBe(0)
    })

    test('re-close diesel service intake valve after both where open = stop transfer', () => {
      const contentTank = 100
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()

      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()

      fuelSys.DsService.IntakeValve.Close()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.Purification.Volume)
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume)
    })
    test('re-close diesel storage outlet valve after both where open = stop transfer', () => {
      const contentTank = 100
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()

      fuelSys.DsStorage.OutletValve.Close()
      fuelSys.Thick()
      expect(fuelSys.DsPurification.isRunning).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.Purification.Volume)
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume)
    })
    test('re-close both valves after there where open = no transfer (no double remove)', () => {
      const contentTank = 2000
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()
      expect(fuelSys.DsPurification.isRunning).toBeTruthy()
      // expect(fuelSys.DsStorage.Tank.AmountRemovers).toBe(1)
      fuelSys.DsStorage.OutletValve.Close()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Close()
      fuelSys.Thick()
      // expect(fuelSys.DsStorage.Tank.AmountRemovers).toBe(0)
      // expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      // expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
    })

    test('filling and now stop purification  = stop transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsPurification, DsBypassValve, DsServiceMulti } = fuelSys
      DsStorage.Tank.Inside = contentTank

      DsService.IntakeValve.Open()
      fuelSys.Thick()

      DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()
      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.Purification.Volume)
      expect(DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstFuelSys.Purification.Volume * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume * 2)

      DsPurification.Stop()
      fuelSys.Thick()
      expect(DsPurification.isRunning).toBeFalsy()
      expect(DsBypassValve.isOpen).toBeFalsy()
      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstFuelSys.Purification.Volume * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.Purification.Volume * 2)
    })
  })

  describe('Filling via bypass valve', () => {
    beforeEach(() => {
      fuelSys.DsPurification.Stop()
      fuelSys.DsBypassValve.Open()
      fuelSys.Thick
      expect(fuelSys.DsPurification.isRunning).toBeFalsy()
    })
    test('First open storage outlet, then open diesel service intake valve = transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti, DsBypassValve } = fuelSys
      DsStorage.Tank.Inside = contentTank
      DsStorage.OutletValve.Open()
      expect(DsStorage.OutletValve.Content).toBe(contentTank) // outlet valve is unrestricted

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank) // outlet valve is unrestricted
      expect(DsStorage.OutletValve.Content).toBe(contentTank) // outlet valve is unrestricted
      expect(DsBypassValve.Source.Content).toBe(contentTank)
      expect(DsBypassValve.Content).toBe(CstFuelSys.BypassValveVolume)
      expect(DsServiceMulti.Content).toBe(CstFuelSys.BypassValveVolume)
      expect(DsService.IntakeValve.Content).toBe(0)
      DsService.IntakeValve.Open()

      fuelSys.Thick()
      expect(DsService.IntakeValve.Content).toBe(CstFuelSys.BypassValveVolume)
      expect(DsService.Tank.AddThisStep).toBe(CstFuelSys.BypassValveVolume)
      expect(DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume)
      expect(DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.BypassValveVolume)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstFuelSys.BypassValveVolume * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume * 2)
    })
    test('First open diesel service intake valve, then open storage outlet = transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti } = fuelSys
      DsStorage.Tank.Inside = contentTank

      DsService.IntakeValve.Open()
      fuelSys.Thick()

      DsStorage.OutletValve.Open()
      fuelSys.Thick()
      expect(DsServiceMulti.Content).toBe(CstFuelSys.BypassValveVolume)
      expect(DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.BypassValveVolume)

      expect(DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstFuelSys.BypassValveVolume * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume * 2)
    })

    test('Open diesel service intake valve + close storage outlet = no transfer', () => {
      const contentTank = 100
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      expect(fuelSys.DsService.IntakeValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      expect(fuelSys.DsService.IntakeValve.Content).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank)
      expect(fuelSys.DsService.Tank.Content).toBe(0)
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
    })
    test('Closed diesel service intake valve + open storage outlet = no transfer', () => {
      const { DsStorage, DsService, DsServiceMulti } = fuelSys
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      expect(DsStorage.OutletValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank)
      expect(DsStorage.OutletValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)
      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsService.Tank.Content).toBe(0)

      fuelSys.Thick()
      expect(DsService.Tank.AddThisStep).toBe(0)
      expect(DsStorage.Tank.RemoveThisStep).toBe(0)
    })

    test('re-close diesel service intake valve after both where open = stop transfer', () => {
      const contentTank = 100
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()

      fuelSys.DsService.IntakeValve.Close()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.BypassValveVolume)
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume)
    })
    test('re-close diesel storage outlet valve after both where open = stop transfer', () => {
      const contentTank = 100
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()

      fuelSys.DsStorage.OutletValve.Close()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.BypassValveVolume)
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume)
    })
    test('re-close both valves after there where open = no transfer (no double remove)', () => {
      const contentTank = 100
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.DsStorage.OutletValve.Close()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Close()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
    })

    test('service tank is full, stop transfer, storage stops remove', () => {
      // fill storage tank full
      fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
      // fill service tank almost full (full - fillSteps)
      const fillSteps = 3
      const contentServiceTank = CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.BypassValveVolume * fillSteps
      fuelSys.DsService.Tank.Inside = contentServiceTank
      fuelSys.Thick()
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()

      fuelSys.Thick()
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.BypassValveVolume * (fillSteps - 1))
      expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume - CstFuelSys.BypassValveVolume)
      fuelSys.Thick()
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.BypassValveVolume * (fillSteps - 2))
      expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume - CstFuelSys.BypassValveVolume * 2)
      fuelSys.Thick() // will be full
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume - CstFuelSys.BypassValveVolume * 2)
      fuelSys.Thick() // is full = no futher add
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume)
      expect(fuelSys.DsService.Tank.AddThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.RemoveThisStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume - CstFuelSys.BypassValveVolume * 2)

    })
    test('restart filling the service tank after it was full', () => {
      const { DsService, DsStorage, DsBypassValve, DsServiceMulti } = fuelSys
      // fill storage tank full
      DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
      // fill service tank almost full (full - fillSteps)
      const fillSteps = 3
      const contentServiceTank = CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.BypassValveVolume * fillSteps
      DsService.Tank.Inside = contentServiceTank
      fuelSys.Thick()
      DsStorage.OutletValve.Open()
      DsService.IntakeValve.Open()

      fuelSys.Thick() // step 2
      fuelSys.Thick() // step 1
      fuelSys.Thick() // will be full now
      fuelSys.Thick() //  is full
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume)
      expect(DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume - CstFuelSys.BypassValveVolume * 2)

      // drain service tanks so filling needs to continue
      fuelSys.DsService.DrainValve.Open()
      fuelSys.Thick()
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume - (DsService.Tank.Volume / CstChanges.DrainRatio))
      DsService.DrainValve.Close()

      fuelSys.Thick() // transfer is restarted next tick, first there need te be space is the DsService
      expect(DsBypassValve.Content).toBe(CstFuelSys.BypassValveVolume)
      expect(DsServiceMulti.Content).toBe(CstFuelSys.BypassValveVolume)
      expect(DsService.IntakeValve.Content).toBe(CstFuelSys.BypassValveVolume)
      expect(DsService.Tank.AddThisStep).toBe(CstFuelSys.BypassValveVolume)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume
        - (DsService.Tank.Volume / CstChanges.DrainRatio) + CstFuelSys.BypassValveVolume)

      // expect DsStorage has 4 thick removed (was 3 before fill)
      const expectContentStorageTank = CstFuelSys.DsStorageTank.TankVolume
        - CstFuelSys.BypassValveVolume * (fillSteps)
      expect(DsStorage.Tank.Content).toBeCloseTo(expectContentStorageTank)
    })
    test('storage tank empty, stop adding service tank', () => {
      const contentDsTank = CstFuelSys.BypassValveVolume
      fuelSys.DsStorage.Tank.Inside = contentDsTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(0)
      expect(fuelSys.DsService.Tank.Content).toBeCloseTo(contentDsTank)
      // add DS in storage tank --> continue filling service tank until dieseltank is empty again
      fuelSys.DsStorage.Tank.Inside = contentDsTank
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(0)
      expect(fuelSys.DsService.Tank.Content).toBeCloseTo(contentDsTank * 2)
    })
    test('filling and now close bypass valve  = stop transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsPurification, DsBypassValve, DsServiceMulti } = fuelSys
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      DsStorage.OutletValve.Open()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank - CstFuelSys.BypassValveVolume * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume * 2)

      DsBypassValve.Close()
      fuelSys.Thick()
      expect(DsBypassValve.isOpen).toBeFalsy()
      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - CstFuelSys.BypassValveVolume * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume * 2)
    })
  })

  test('Add via purification and bypass valve', () => {
    const { DsPurification, DsStorage, DsService } = fuelSys
    DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    DsStorage.OutletValve.Open()
    DsService.IntakeValve.Open()

    DsPurification.IntakeValve.Open()
    DsPurification.SteamIntakeValve.Open()
    DsPurification.Start()

    fuelSys.DsBypassValve.Open()
    fuelSys.Thick()
    expect(fuelSys.DsServiceMulti.Content).toBe(CstFuelSys.BypassValveVolume + CstFuelSys.Purification.Volume)
    expect(DsService.Tank.Content).toBe(CstFuelSys.BypassValveVolume + CstFuelSys.Purification.Volume)
    expect(DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume
      - (CstFuelSys.BypassValveVolume + CstFuelSys.Purification.Volume))

  })
})

describe('Alarms', () => {
  test('Raise Low diesel storage tanks', () => {
    // full service tank to prevent low service alarm
    fuelSys.DsService.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    fuelSys.DsStorage.Tank.Inside = AlarmLevel.FuelSys.LowDsStorage
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsStorageTank)).toBeFalsy()
    // raise alarm
    fuelSys.DsStorage.Tank.Inside = AlarmLevel.FuelSys.LowDsStorage - 0.1
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsStorageTank)).toBeTruthy()
  })
  test('Cancel Low diesel storage tanks', () => {
    // full service tank to prevent low service alarm
    fuelSys.DsService.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    fuelSys.DsStorage.Tank.Inside = AlarmLevel.FuelSys.LowDsStorage - 5
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsStorageTank)).toBeTruthy()
    // above low level = cancel alarm
    fuelSys.DsStorage.Tank.Inside = AlarmLevel.FuelSys.LowDsStorage
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsStorageTank)).toBeFalsy()
  })

  test('Raise Low diesel service tanks', () => {
    // full storage tank to prevent low storage alarm
    fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    fuelSys.DsService.Tank.Inside = AlarmLevel.FuelSys.LowDsService
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsServiceTank)).toBeFalsy()
    // raise alarm
    fuelSys.DsService.Tank.Inside = AlarmLevel.FuelSys.LowDsService - 0.1
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsServiceTank)).toBeTruthy()
  })
  test('Cancel Low diesel service tanks', () => {
    // full service tank to prevent low service alarm
    fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    // raise alarm
    fuelSys.DsService.Tank.Inside = AlarmLevel.FuelSys.LowDsService - 5
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsServiceTank)).toBeTruthy()
    // above low level = cancel alarm
    fuelSys.DsService.Tank.Inside = AlarmLevel.FuelSys.LowDsService
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowDsServiceTank)).toBeFalsy()
  })

  test('Raise Empty diesel storage tanks', () => {
    // full service tank to prevent low service alarm
    fuelSys.DsService.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    fuelSys.DsStorage.Tank.Inside = 1
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsStorageTank)).toBeFalsy()

    fuelSys.DsStorage.Tank.Inside = 0
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsStorageTank)).toBeTruthy()
  })
  test('Cancel Empty diesel storage tanks', () => {
    // full service tank to prevent low service alarm
    fuelSys.DsService.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    // raise alarm
    fuelSys.DsStorage.Tank.Inside = 0
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsStorageTank)).toBeTruthy()
    // no longer empty = cancel alarm
    fuelSys.DsStorage.Tank.Inside = 0.1
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsStorageTank)).toBeFalsy()
  })

  test('Raise Empty diesel service tanks', () => {
    // full storage tank to prevent low storage alarm
    fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    // at alarm level = no alarm yet, must be below
    fuelSys.DsService.Tank.Inside = 1
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsServiceTank)).toBeFalsy()

    fuelSys.DsService.Tank.Inside = 0
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsServiceTank)).toBeTruthy()
  })
  test('Cancel Empty diesel service tanks', () => {
    // full storage tank to prevent low storage alarm
    fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
    // raise
    fuelSys.DsService.Tank.Inside = 0
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsServiceTank)).toBeTruthy()
    // cancel
    fuelSys.DsService.Tank.Inside = 5
    fuelSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyDsServiceTank)).toBeFalsy()
  })
})
