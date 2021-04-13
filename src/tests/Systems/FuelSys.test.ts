const { CstFuelSys, CstChanges } = require('../../Cst')
import FuelSystem from '../../Systems/FuelSystem'
import CstTxt from '../../CstTxt'
import { AlarmCode, AlarmLevel } from '../../CstAlarms'
import mockAlarmSys from '../mocks/mockAlarmSys'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'
import mockPowerBus from '../mocks/mockPowerBus'
import { CstPowerSys } from '../../Cst'
const { FuelSysTxt } = CstTxt

let fuelSys: FuelSystem
const dummyAlarmSys = new mockAlarmSys()
const expectRemove = CstFuelSys.DsServiceTank.TankAddStep / CstFuelSys.RatioStorageServiceTanks
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
    expect(fuelSys.DsStorage.Tank.Adding).toBeFalsy()
    expect(fuelSys.DsStorage.Tank.Content).toBe(0)
  })
  test('Opening intake valve, shore fill valve stays closed --> no adding to diesel tank', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeFalsy()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeTruthy()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Adding).toBeFalsy()
    expect(fuelSys.DsStorage.Tank.Content).toBe(0)
  })
  test('open first intake valve then shore fill --> filling', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeTruthy()
    fuelSys.DsShoreValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeTruthy()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Adding).toBeTruthy()
    expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankAddStep * 2)
  })
  test('open first shore fill valve then intake --> filling', () => {
    fuelSys.DsShoreValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeTruthy()
    fuelSys.DsStorage.IntakeValve.Open()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeTruthy()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Adding).toBeTruthy()
    expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankAddStep * 2)
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
  test('Fill storage tank until full', () => {
    let fullFlag = false
    let steps = 0
    const expectedSteps = CstFuelSys.DsStorageTank.TankVolume / CstFuelSys.DsStorageTank.TankAddStep
    const cbFull = () => {
      // console.debug('tank is full')
      fullFlag = true
      expect(fuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume)
      expect(steps).toBe(expectedSteps - 1)
    }
    fuelSys.DsStorage.Tank.cbFull = cbFull
    fuelSys.DsStorage.Tank.cbAdded = () => { steps += 1 }

    fuelSys.DsShoreValve.Open()
    fuelSys.DsStorage.IntakeValve.Open()

    do {
      fuelSys.Thick()
    } while (!fullFlag)
  })
  test('only Drain valve open', () => {
    const start = 45
    const { DsStorage } = fuelSys
    DsStorage.Tank.Inside = start
    DsStorage.DrainValve.Open()
    fuelSys.Thick()
    expect(DsStorage.Tank.Removing).toBeTruthy()
    expect(DsStorage.Tank.RemoveEachStep).toBe(CstChanges.DrainStep)
    expect(DsStorage.Tank.Content).toBe(start - CstChanges.DrainStep)
    fuelSys.Thick()
    expect(DsStorage.Tank.Content).toBe(start - CstChanges.DrainStep * 2)
  })
  test.skip('Drain valve and already transfering to service tank', () => {
    const contentTank = 45
    fuelSys.DsStorage.Tank.Inside = contentTank
    fuelSys.DsStorage.OutletValve.Open()
    fuelSys.DsService.IntakeValve.Open()

    fuelSys.Thick()
    fuelSys.DsStorage.DrainValve.Open()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.RemoveEachStep)
      .toBe(expectRemove
        + CstChanges.DrainStep)

    const expectContent = contentTank
      - expectRemove * 2
      - CstChanges.DrainStep
    expect(fuelSys.DsStorage.Tank.Content).toBe(expectContent)
  })
})

describe('Diesel service tank', () => {
  describe('Filling via running purification unit', () => {
    beforeEach(() => {
      fuelSys.DsBypassValve.Close()
      fuelSys.DsPurification.IntakeValve.Open()
      fuelSys.DsPurification.SteamIntakeValve.Open()
    })
    test('Open diesel service intake valve + close storage outlet = no transfer', () => {
      const contentTank = 2000
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      expect(fuelSys.DsService.IntakeValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      expect(fuelSys.DsService.IntakeValve.Content).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank)
      expect(fuelSys.DsService.Tank.Content).toBe(0)
      expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddEachStep).toBe(0)
    })
    test('Closed diesel service intake valve + open storage outlet = no transfer', () => {
      const { DsStorage, DsService, DsServiceMulti } = fuelSys
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      expect(DsStorage.OutletValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank)
      expect(DsStorage.Tank.Removing).toBeFalsy()
      expect(DsStorage.OutletValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)

      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsService.Tank.Adding).toBeFalsy()
      expect(DsService.Tank.Content).toBe(0)

      fuelSys.Thick()
      expect(DsService.Tank.AddEachStep).toBe(0)
      expect(DsStorage.Tank.RemoveEachStep).toBe(0)
    })

    test('First open diesel service intake valve, then open storage outlet = transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti, DsPurification } = fuelSys
      DsStorage.Tank.Inside = contentTank

      DsService.IntakeValve.Open()
      fuelSys.Thick()

      DsStorage.OutletValve.Open()
      DsPurification.Start()
      fuelSys.Thick()
      expect(DsPurification.isRunning).toBeTruthy()
      expect(DsStorage.OutletValve.Content).toBe(contentTank - expectRemove)
      expect(DsServiceMulti.Content).toBe(CstFuelSys.Purification.Volume)
      expect(DsStorage.Tank.RemoveEachStep).toBe(expectRemove)
      expect(DsStorage.Tank.Content).toBe(contentTank - expectRemove)

      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content)
        .toBeCloseTo(contentTank - expectRemove * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
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
      expect(DsStorage.Tank.RemoveEachStep).toBe(expectRemove)
      expect(DsStorage.Tank.Removing).toBeTruthy()
      expect(DsStorage.Tank.Content).toBe(contentTank - expectRemove)

      expect(DsServiceMulti.Content).toBe(CstFuelSys.Purification.Volume)

      expect(DsService.Tank.AddEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - expectRemove * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
    })

    test('re-close diesel service intake valve after both where open = stop transfer', () => {
      const contentTank = 2000
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()

      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()

      fuelSys.DsService.IntakeValve.Close()
      fuelSys.Thick()
      expect(fuelSys.DsPurification.isRunning).toBeTruthy()
      expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddEachStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank)
      expect(fuelSys.DsService.Tank.Content).toBe(0)
    })
    test('re-close diesel storage outlet valve after both where open = stop transfer', () => {
      const contentTank = 2000
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()

      fuelSys.DsStorage.OutletValve.Close()
      fuelSys.Thick()
      expect(fuelSys.DsPurification.isRunning).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddEachStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content)
        .toBe(contentTank - expectRemove)
      expect(fuelSys.DsService.Tank.Content)
        .toBe(CstFuelSys.DsServiceTank.TankAddStep)
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
      expect(fuelSys.DsStorage.Tank.AmountRemovers).toBe(1)
      fuelSys.DsStorage.OutletValve.Close()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Close()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.AmountRemovers).toBe(0)
      expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddEachStep).toBe(0)
    })

    test('service tank is full, stop transfer, storage stops remove', () => {
      // fill storage tank full
      fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
      // fill service tank almost full (full - fillSteps)
      const fillSteps = 3
      const contentServiceTank = CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.Purification.Volume * fillSteps
      fuelSys.DsService.Tank.Inside = contentServiceTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick() // -20
      expect(fuelSys.DsPurification.isRunning).toBeTruthy()
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.Purification.Volume * 2)
      fuelSys.Thick() // -10
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.Purification.Volume)
      fuelSys.Thick() // will be full
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume)
      fuelSys.Thick() // is full
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      const expectContentStorageTank = CstFuelSys.DsStorageTank.TankVolume
        - expectRemove * (fillSteps)
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(expectContentStorageTank)
      expect(fuelSys.DsService.Tank.Content).toBeCloseTo(CstFuelSys.DsServiceTank.TankVolume)
    })
    test('restart filling the service tank after it was full', () => {
      // fill storage tank full
      fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
      // fill service tank almost full (full - fillSteps)
      const fillSteps = 3
      const contentServiceTank = CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.DsServiceTank.TankAddStep * fillSteps
      fuelSys.DsService.Tank.Inside = contentServiceTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick() // -20
      expect(fuelSys.DsPurification.isRunning).toBeTruthy()
      fuelSys.Thick() // -10
      fuelSys.Thick() // will be full now
      fuelSys.Thick() //  is full
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)

      // drain service tanks so filling needs to continue
      fuelSys.DsService.DrainValve.Open()
      fuelSys.Thick()
      expect(fuelSys.DsService.Tank.Content)
        .toBe(CstFuelSys.DsServiceTank.TankVolume - CstChanges.DrainStep)

      fuelSys.Thick() // transfer is restarted next tick, first there need te be space is the DsService
      expect(fuelSys.DsStorage.Tank.RemoveEachStep)
        .toBe(expectRemove)
      // expect DsStorage has 4 thick removed (was 3 before fill)
      const expectContentStorageTank = CstFuelSys.DsStorageTank.TankVolume
        - expectRemove * (fillSteps + 1)
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(expectContentStorageTank)
    })
    test('storage tank empty, stop adding service tank', () => {
      const contentDsTank = CstFuelSys.Purification.Volume / CstFuelSys.RatioStorageServiceTanks
      fuelSys.DsStorage.Tank.Inside = contentDsTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsPurification.Start()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(0)
      expect(fuelSys.DsService.Tank.Content).toBeCloseTo(contentDsTank * CstFuelSys.RatioStorageServiceTanks)
      // add DS in storage tank --> continue filling service tank until dieseltank is empty again
      fuelSys.DsStorage.Tank.Inside = contentDsTank
      // restart purification as it tripped without empty intake
      fuelSys.DsPurification.Start()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(0)
      expect(fuelSys.DsService.Tank.Content).toBeCloseTo(contentDsTank * CstFuelSys.RatioStorageServiceTanks * 2)
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
      expect(DsStorage.Tank.Content).toBe(contentTank - expectRemove)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - expectRemove * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)

      DsPurification.Stop()
      fuelSys.Thick()
      expect(DsPurification.isRunning).toBeFalsy()
      expect(DsBypassValve.isOpen).toBeFalsy()
      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - expectRemove * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
    })
  })

  describe('Filling via bypass valve', () => {
    beforeEach(() => {
      fuelSys.DsPurification.Stop()
      fuelSys.DsBypassValve.Open()
      fuelSys.Thick
      expect(fuelSys.DsPurification.isRunning).toBeFalsy()
    })
    test('Open diesel service intake valve + close storage outlet = no transfer', () => {
      const contentTank = 2000
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      expect(fuelSys.DsService.IntakeValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      expect(fuelSys.DsService.IntakeValve.Content).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content).toBe(contentTank)
      expect(fuelSys.DsService.Tank.Content).toBe(0)
      expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddEachStep).toBe(0)
    })
    test('Closed diesel service intake valve + open storage outlet = no transfer', () => {
      const { DsStorage, DsService, DsServiceMulti } = fuelSys
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      DsStorage.Tank.Inside = contentTank
      DsService.IntakeValve.Open()
      expect(DsStorage.OutletValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank)
      expect(DsStorage.Tank.Removing).toBeFalsy()
      expect(DsStorage.OutletValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)

      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsService.Tank.Adding).toBeFalsy()
      expect(DsService.Tank.Content).toBe(0)

      fuelSys.Thick()
      expect(DsService.Tank.AddEachStep).toBe(0)
      expect(DsStorage.Tank.RemoveEachStep).toBe(0)
    })

    test('First open diesel service intake valve, then open storage outlet = transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti } = fuelSys
      DsStorage.Tank.Inside = contentTank

      DsService.IntakeValve.Open()
      fuelSys.Thick()

      DsStorage.OutletValve.Open()
      fuelSys.Thick()
      expect(DsStorage.OutletValve.Content).toBe(contentTank - expectRemove)
      expect(DsServiceMulti.Content).toBe(contentTank - expectRemove)
      expect(DsStorage.Tank.RemoveEachStep).toBe(expectRemove)
      expect(DsStorage.Tank.Content).toBe(contentTank - expectRemove)

      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content)
        .toBeCloseTo(contentTank - expectRemove * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
    })
    test('First open storage outlet, then open diesel service intake valve = transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsServiceMulti } = fuelSys
      DsStorage.Tank.Inside = contentTank
      DsStorage.OutletValve.Open()
      expect(DsService.IntakeValve.isOpen).toBeFalsy()

      fuelSys.Thick()
      DsService.IntakeValve.Open()

      fuelSys.Thick()
      expect(DsStorage.Tank.RemoveEachStep).toBe(expectRemove)
      expect(DsStorage.Tank.Removing).toBeTruthy()
      expect(DsStorage.Tank.Content).toBe(contentTank - expectRemove)

      expect(DsServiceMulti.Content).toBe(contentTank - expectRemove)

      expect(DsService.Tank.AddEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - expectRemove * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
    })

    test('re-close diesel service intake valve after both where open = stop transfer', () => {
      const contentTank = 2000
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()

      fuelSys.DsService.IntakeValve.Close()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddEachStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content)
        .toBe(contentTank - expectRemove)
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    })
    test('re-close diesel storage outlet valve after both where open = stop transfer', () => {
      const contentTank = 2000
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()

      fuelSys.DsStorage.OutletValve.Close()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddEachStep).toBe(0)
      expect(fuelSys.DsStorage.Tank.Content)
        .toBe(contentTank - expectRemove)
      expect(fuelSys.DsService.Tank.Content)
        .toBe(CstFuelSys.DsServiceTank.TankAddStep)
    })
    test('re-close both valves after there where open = no transfer (no double remove)', () => {
      const contentTank = 2000
      fuelSys.DsStorage.Tank.Inside = contentTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.AmountRemovers).toBe(1)
      fuelSys.DsStorage.OutletValve.Close()
      fuelSys.Thick()
      fuelSys.DsService.IntakeValve.Close()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.AmountRemovers).toBe(0)
      expect(fuelSys.DsStorage.Tank.Removing).toBeFalsy()
      expect(fuelSys.DsService.Tank.Adding).toBeFalsy()
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      expect(fuelSys.DsService.Tank.AddEachStep).toBe(0)
    })

    test('service tank is full, stop transfer, storage stops remove', () => {
      // fill storage tank full
      fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
      // fill service tank almost full (full - fillSteps)
      const fillSteps = 3
      const contentServiceTank = CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.DsServiceTank.TankAddStep * fillSteps
      fuelSys.DsService.Tank.Inside = contentServiceTank
      fuelSys.Thick()
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()

      fuelSys.Thick() // -20
      expect(fuelSys.DsStorage.Tank.RemoveEachStep)
        .toBe(expectRemove)
      fuelSys.Thick() // -10
      expect(fuelSys.DsStorage.Tank.RemoveEachStep)
        .toBe(expectRemove)
      fuelSys.Thick() // will be full
      expect(fuelSys.DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankVolume)
      fuelSys.Thick() // is full
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
      const expectContentStorageTank = CstFuelSys.DsStorageTank.TankVolume
        - expectRemove * (fillSteps)
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(expectContentStorageTank)
      expect(fuelSys.DsService.Tank.Content).toBeCloseTo(CstFuelSys.DsServiceTank.TankVolume)
    })
    test('restart filling the service tank after it was full', () => {
      // fill storage tank full
      fuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
      // fill service tank almost full (full - fillSteps)
      const fillSteps = 3
      const contentServiceTank = CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.DsServiceTank.TankAddStep * fillSteps
      fuelSys.DsService.Tank.Inside = contentServiceTank
      fuelSys.Thick()
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()

      fuelSys.Thick() // -20
      fuelSys.Thick() // -10
      fuelSys.Thick() // will be full now
      fuelSys.Thick() //  is full
      expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)

      // drain service tanks so filling needs to continue
      fuelSys.DsService.DrainValve.Open()
      fuelSys.Thick()
      expect(fuelSys.DsService.Tank.Content)
        .toBe(CstFuelSys.DsServiceTank.TankVolume - CstChanges.DrainStep)

      fuelSys.Thick() // transfer is restarted next tick, first there need te be space is the DsService
      expect(fuelSys.DsStorage.Tank.RemoveEachStep)
        .toBe(expectRemove)
      // expect DsStorage has 4 thick removed (was 3 before fill)
      const expectContentStorageTank = CstFuelSys.DsStorageTank.TankVolume
        - expectRemove * (fillSteps + 1)
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(expectContentStorageTank)
    })
    test('storage tank empty, stop adding service tank', () => {
      const contentDsTank = expectRemove
      fuelSys.DsStorage.Tank.Inside = contentDsTank
      fuelSys.DsStorage.OutletValve.Open()
      fuelSys.DsService.IntakeValve.Open()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(0)
      expect(fuelSys.DsService.Tank.Content).toBeCloseTo(contentDsTank * CstFuelSys.RatioStorageServiceTanks)
      // add DS in storage tank --> continue filling service tank until dieseltank is empty again
      fuelSys.DsStorage.Tank.Inside = contentDsTank
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      fuelSys.Thick()
      expect(fuelSys.DsStorage.Tank.Content).toBeCloseTo(0)
      expect(fuelSys.DsService.Tank.Content).toBeCloseTo(contentDsTank * CstFuelSys.RatioStorageServiceTanks * 2)
    })
    test('filling and now close bypass valve  = stop transfer', () => {
      const contentTank = CstFuelSys.DsStorageTank.TankVolume
      const { DsStorage, DsService, DsPurification, DsBypassValve, DsServiceMulti } = fuelSys
      DsStorage.Tank.Inside = contentTank

      DsService.IntakeValve.Open()
      fuelSys.Thick()

      DsStorage.OutletValve.Open()
      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBe(contentTank - expectRemove)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep)

      fuelSys.Thick()
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - expectRemove * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)

      DsBypassValve.Close()
      fuelSys.Thick()
      expect(DsPurification.isRunning).toBeFalsy()
      expect(DsBypassValve.isOpen).toBeFalsy()
      expect(DsService.IntakeValve.Content).toBe(0)
      expect(DsServiceMulti.Content).toBe(0)
      expect(DsStorage.Tank.Content).toBeCloseTo(contentTank - expectRemove * 2)
      expect(DsService.Tank.Content).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
    })
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
