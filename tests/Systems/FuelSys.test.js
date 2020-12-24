const FuelSystem = require('../../Systems/FuelSystem')
const { CstFuelSys, CstTxt } = require('../../Cst')
const { FuelSysTxt } = CstTxt

let fuelSys
beforeEach(() => {
  fuelSys = new FuelSystem()
})

describe('Fuel system init', () => {
  test('Empty diesel tank', () => {
    expect(fuelSys.DieselTank.Content()).toBe(0)
    expect(fuelSys.DieselTank.MaxContent).toBe(CstFuelSys.DsStorageTank.TankVolume)
    expect(fuelSys.DieselTank.Name).toBe(FuelSysTxt.DsStorageTank)
  })
  test('Empty diesel service tank', () => {
    expect(fuelSys.DsServiceTank.Content()).toBe(0)
    expect(fuelSys.DsServiceTank.MaxContent).toBe(CstFuelSys.DsServiceTank.TankVolume)
    expect(fuelSys.DsServiceTank.Name).toBe(FuelSysTxt.DsServiceTank)
  })
  test('Diesel shore fill valve is closed', () => {
    expect(fuelSys.DieselShoreFillValve.isOpen).toBeFalsy()
  })
  test('Diesel fuel storage outlet valve is closed', () => {
    expect(fuelSys.DsStorageOutletValve.isOpen).toBeFalsy()
    expect(fuelSys.DsStorageOutletValve.Content()).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Diesel fuel service intake valve is closed', () => {
    expect(fuelSys.DsServiceIntakeValve.isOpen).toBeFalsy()
    expect(fuelSys.DsServiceIntakeValve.Content()).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Shore has fuel', () => {
    // valve only has content of opened, so test here source
    expect(fuelSys.DieselShoreFillValve.Source.Content()).toBe(CstFuelSys.ShoreVolume)
  })
})

describe('Diesel storage tank: fill from shore', () => {
  test('Opening shore fill valve, adding to diesel tank', () => {
    fuelSys.DieselShoreFillValve.Open()
    expect(fuelSys.DieselShoreFillValve.isOpen).toBeTruthy()
    // add 1
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep)
    // Add second
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep * 2)
  })
  test('Closing a previous open intake valve = stop filling', () => {
    fuelSys.DieselShoreFillValve.Open()
    expect(fuelSys.DieselShoreFillValve.isOpen).toBeTruthy()
    // add 2
    fuelSys.Thick()
    fuelSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = fuelSys.DieselTank.Content()
    fuelSys.DieselShoreFillValve.Close()
    // check nothing is added after valve is opened
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentBeforeReopeningIntakeValve)
  })
  test('Opening shore fill valve, adding to diesel tank until full', () => {
    let fullFlag = false
    let steps = 0
    const expectedSteps = CstFuelSys.DsStorageTank.TankVolume / CstFuelSys.DsStorageTank.TankAddStep
    const cbFull = () => {
      // console.debug('tank is full')
      fullFlag = true
      expect(fuelSys.DieselTank.Content()).toBe(CstFuelSys.DsStorageTank.TankVolume)
      expect(steps).toBe(expectedSteps - 1)
    }
    fuelSys.DieselTank.cbFull = cbFull
    fuelSys.DieselTank.cbAdded = () => { steps += 1 }

    fuelSys.DieselShoreFillValve.Open()

    do {
      fuelSys.Thick()
    } while (!fullFlag)
  })
})

describe('Diesel storage tank: outlet valve', () => {
  test('Open diesel storage outlet valve', () => {
    fuelSys.DieselTank.Inside = 2000
    fuelSys.DsStorageOutletValve.Open()
    expect(fuelSys.DsStorageOutletValve.Content()).toBe(2000)
    expect(fuelSys.DsStorageOutletValve.isOpen).toBeTruthy()
  })
  test('Close a previous open storage outlet valve', () => {
    fuelSys.DieselTank.Inside = 2000
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsStorageOutletValve.Close()
    expect(fuelSys.DsStorageOutletValve.Content()).toBe(0)
    expect(fuelSys.DsStorageOutletValve.isOpen).toBeFalsy()
  })
})

describe('Diesel service tank', () => {
  test('Open diesel service intake valve + close storage outlet = no transfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsServiceIntakeValve.Close()
    expect(fuelSys.DsServiceIntakeValve.Content()).toBe(0)
    expect(fuelSys.DsServiceIntakeValve.isOpen).toBeFalsy()
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank)
    expect(fuelSys.DsServiceTank.Content()).toBe(0)
  })
  test('Closed diesel service intake valve + open storage outlet = no transfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsServiceIntakeValve.Open()
    expect(fuelSys.DsServiceIntakeValve.Content()).toBe(0)
    expect(fuelSys.DsServiceIntakeValve.isOpen).toBeTruthy()
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank)
    expect(fuelSys.DsServiceTank.Content()).toBe(0)
  })

  test('First open diesel service intake valve, then open storage outlet = transfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsServiceIntakeValve.Open()
    fuelSys.DsStorageOutletValve.Open()

    fuelSys.Thick()
    expect(fuelSys.DieselTank.RemoveEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep * 2)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
  })
  test('First open storage outlet, then close diesel service intake valve = transfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsServiceIntakeValve.Open()

    fuelSys.Thick()
    expect(fuelSys.DieselTank.RemoveEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.AddEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)

    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep * 2)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
  })

  test('re-close diesel service intake valve after both where open = stop transfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsServiceIntakeValve.Open()

    fuelSys.Thick()
    fuelSys.DsServiceIntakeValve.Close()
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DieselTank.RemoveEachStep).toBe(0)
  })
  test('re-close diesel storage outlet valve after both where open = stoptransfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsServiceIntakeValve.Open()

    fuelSys.Thick()
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DieselTank.RemoveEachStep).toBe(0)
  })
  test('re-close both valves after there where open = no transfer (no double remove)', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsServiceIntakeValve.Open()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsServiceIntakeValve.Close()
    fuelSys.Thick()

    expect(fuelSys.DieselTank.RemoveEachStep).toBe(0)
  })

  test('service tank is full, stop transfer, storage stops drain', () => {
    const contentDsTank = 2000
    fuelSys.DieselTank.Inside = contentDsTank
    const contentServiceTank = CstFuelSys.DsServiceTank.TankVolume - 30
    fuelSys.DsServiceTank.Inside = contentServiceTank

    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsServiceIntakeValve.Open()

    fuelSys.Thick() // -20
    fuelSys.Thick() // -10
    fuelSys.Thick() // full
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentDsTank - CstFuelSys.DsServiceTank.TankAddStep * 3)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)
  })
  test('storage tank empty, stop adding service tank', () => {
    const contentDsTank = 20
    fuelSys.DieselTank.Inside = contentDsTank
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsServiceIntakeValve.Open()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(0)
    expect(fuelSys.DsServiceTank.Content()).toBe(20)
    // add DS in storage tank --> continue filling service tank until dieseltank is empty again
    fuelSys.DieselTank.Inside = 20
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(0)
    expect(fuelSys.DsServiceTank.Content()).toBe(40)
  })
})
