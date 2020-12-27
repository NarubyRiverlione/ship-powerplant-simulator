const FuelSystem = require('../../src/Systems/FuelSystem')
const { CstFuelSys, CstTxt } = require('../../src/Cst')
const { FuelSysTxt } = CstTxt

let fuelSys
beforeEach(() => {
  fuelSys = new FuelSystem()
})

describe('Fuel system init', () => {
  test('Empty diesel tank', () => {
    expect(fuelSys.DsStorage.Tank.Content()).toBe(0)
    expect(fuelSys.DsStorage.Tank.Volume).toBe(CstFuelSys.DsStorageTank.TankVolume)
    expect(fuelSys.DsStorage.Tank.Name).toBe(FuelSysTxt.DsStorageTank)
  })
  test('Empty diesel service tank', () => {
    expect(fuelSys.DsService.Tank.Content()).toBe(0)
    expect(fuelSys.DsService.Tank.Volume).toBe(CstFuelSys.DsServiceTank.TankVolume)
    expect(fuelSys.DsService.Tank.Name).toBe(FuelSysTxt.DsServiceTank)
  })
  test('Diesel shore fill valve is closed', () => {
    expect(fuelSys.DsShoreValve.isOpen).toBeFalsy()
  })
  test('Diesel fuel storage outlet valve is closed', () => {
    expect(fuelSys.DsStorage.OutletValve.isOpen).toBeFalsy()
    expect(fuelSys.DsStorage.OutletValve.Content()).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Diesel fuel service intake valve is closed', () => {
    expect(fuelSys.DsService.IntakeValve.isOpen).toBeFalsy()
    expect(fuelSys.DsService.IntakeValve.Content()).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Shore has fuel', () => {
    // valve only has content of opened, so test here source
    expect(fuelSys.DsShoreValve.Source.Content()).toBe(CstFuelSys.ShoreVolume)
  })
})

describe('Diesel storage tank: fill from shore', () => {
  test('Opening shore fill valve, intake stays closed --> no adding to diesel tank', () => {
    fuelSys.DsShoreValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeTruthy()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeFalsy()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Adding).toBeFalsy()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(0)
  })
  test('Opening intake valve, shore fill valve stays closed --> no adding to diesel tank', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeFalsy()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeTruthy()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Adding).toBeFalsy()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(0)
  })
  test('open first intake valve then shore fill --> filling', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeTruthy()
    fuelSys.DsShoreValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeTruthy()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Adding).toBeTruthy()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep * 2)
  })
  test('open first shore fill valve then intake --> filling', () => {
    fuelSys.DsShoreValve.Open()
    expect(fuelSys.DsShoreValve.isOpen).toBeTruthy()
    fuelSys.DsStorage.IntakeValve.Open()
    expect(fuelSys.DsStorage.IntakeValve.isOpen).toBeTruthy()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Adding).toBeTruthy()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep * 2)
  })
  test('Closing shore fill valve, both where open = stop filling', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    fuelSys.DsShoreValve.Open()
    // add 2
    fuelSys.Thick()
    fuelSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = fuelSys.DsStorage.Tank.Content()
    fuelSys.DsShoreValve.Close()
    // check nothing is added after valve is opened
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentBeforeReopeningIntakeValve)
  })
  test('Closing intake valve, both where open = stop filling', () => {
    fuelSys.DsStorage.IntakeValve.Open()
    fuelSys.DsShoreValve.Open()
    // add 2
    fuelSys.Thick()
    fuelSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = fuelSys.DsStorage.Tank.Content()
    fuelSys.DsStorage.IntakeValve.Close()
    // check nothing is added after valve is opened
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentBeforeReopeningIntakeValve)
  })
  test('Fill storage tank until full', () => {
    let fullFlag = false
    let steps = 0
    const expectedSteps = CstFuelSys.DsStorageTank.TankVolume / CstFuelSys.DsStorageTank.TankAddStep
    const cbFull = () => {
      // console.debug('tank is full')
      fullFlag = true
      expect(fuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankVolume)
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
})

describe('Diesel service tank', () => {
  test('Open diesel service intake valve + close storage outlet = no transfer', () => {
    const contentTank = 2000
    fuelSys.DsStorage.Tank.Inside = contentTank
    fuelSys.DsStorage.OutletValve.Open()
    fuelSys.DsService.IntakeValve.Close()
    expect(fuelSys.DsService.IntakeValve.Content()).toBe(0)
    expect(fuelSys.DsService.IntakeValve.isOpen).toBeFalsy()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentTank)
    expect(fuelSys.DsService.Tank.Content()).toBe(0)
  })
  test('Closed diesel service intake valve + open storage outlet = no transfer', () => {
    const contentTank = 2000
    fuelSys.DsStorage.Tank.Inside = contentTank
    fuelSys.DsStorage.OutletValve.Close()
    fuelSys.DsService.IntakeValve.Open()
    expect(fuelSys.DsService.IntakeValve.Content()).toBe(0)
    expect(fuelSys.DsService.IntakeValve.isOpen).toBeTruthy()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentTank)
    expect(fuelSys.DsService.Tank.Content()).toBe(0)
  })

  test('First open diesel service intake valve, then open storage outlet = transfer', () => {
    const contentTank = 2000
    fuelSys.DsStorage.Tank.Inside = contentTank
    fuelSys.DsService.IntakeValve.Open()
    fuelSys.DsStorage.OutletValve.Open()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep * 2)
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
  })
  test('First open storage outlet, then close diesel service intake valve = transfer', () => {
    const contentTank = 2000
    fuelSys.DsStorage.Tank.Inside = contentTank
    fuelSys.DsStorage.OutletValve.Open()
    fuelSys.DsService.IntakeValve.Open()

    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsService.Tank.AddEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)

    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep * 2)
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
  })

  test('re-close diesel service intake valve after both where open = stop transfer', () => {
    const contentTank = 2000
    fuelSys.DsStorage.Tank.Inside = contentTank
    fuelSys.DsStorage.OutletValve.Open()
    fuelSys.DsService.IntakeValve.Open()

    fuelSys.Thick()
    fuelSys.DsService.IntakeValve.Close()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
  })
  test('re-close diesel storage outlet valve after both where open = stoptransfer', () => {
    const contentTank = 2000
    fuelSys.DsStorage.Tank.Inside = contentTank
    fuelSys.DsStorage.OutletValve.Open()
    fuelSys.DsService.IntakeValve.Open()

    fuelSys.Thick()
    fuelSys.DsStorage.OutletValve.Close()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
  })
  test('re-close both valves after there where open = no transfer (no double remove)', () => {
    const contentTank = 2000
    fuelSys.DsStorage.Tank.Inside = contentTank
    fuelSys.DsStorage.OutletValve.Open()
    fuelSys.DsService.IntakeValve.Open()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.DsStorage.OutletValve.Close()
    fuelSys.DsService.IntakeValve.Close()
    fuelSys.Thick()

    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
  })

  test('service tank is full, stop transfer, storage stops drain', () => {
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
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    fuelSys.Thick() // -10
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    fuelSys.Thick() // full
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
    // FIXME: stop removing 1 step to soon, the Thick  tank is full still needs to remove last time
    expect(fuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankVolume
      - CstFuelSys.DsServiceTank.TankAddStep * (fillSteps - 1))
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)
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
    fuelSys.Thick() // full
    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(0)
    // FIXME: stop removing 1 step to soon, the Thick  tank is full still needs to remove last time
    expect(fuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankVolume
      - CstFuelSys.DsServiceTank.TankAddStep * (fillSteps - 1))
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)

    // drain service tanks so filling needs  to continue
    fuelSys.DsService.Tank.Inside -= CstFuelSys.DsServiceTank.TankAddStep * 2
    fuelSys.Thick()
    expect(fuelSys.DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume
      - CstFuelSys.DsServiceTank.TankAddStep)

    expect(fuelSys.DsStorage.Tank.RemoveEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankVolume
      - CstFuelSys.DsServiceTank.TankAddStep * (fillSteps))
  })
  test('storage tank empty, stop adding service tank', () => {
    const contentDsTank = 20
    fuelSys.DsStorage.Tank.Inside = contentDsTank
    fuelSys.DsStorage.OutletValve.Open()
    fuelSys.DsService.IntakeValve.Open()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(0)
    expect(fuelSys.DsService.Tank.Content()).toBe(20)
    // add DS in storage tank --> continue filling service tank until dieseltank is empty again
    fuelSys.DsStorage.Tank.Inside = 20
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.Thick()
    expect(fuelSys.DsStorage.Tank.Content()).toBe(0)
    expect(fuelSys.DsService.Tank.Content()).toBe(40)
  })
})
