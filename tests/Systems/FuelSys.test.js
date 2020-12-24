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
  })
  test('Diesel shore fill valve is open', () => {
    expect(fuelSys.DieselShoreFillValve.isOpen).toBeTruthy()
  })
  test('Diesel fuel storage outlet valve is open', () => {
    expect(fuelSys.DsStorageOutletValve.isOpen).toBeTruthy()
    expect(fuelSys.DsStorageOutletValve.Content()).toBe(0) // empty dieseltank = empty fuel line valve
  })
  test('Diesel fuel service intake valve is open', () => {
    expect(fuelSys.DsServiceIntakeValve.isOpen).toBeTruthy()
    expect(fuelSys.DsServiceIntakeValve.Content()).toBe(0) // empty dieseltank = empty fuel line valve
  })
})

describe('Diesel storage tank: fill from shore', () => {
  test('Closing shore fill valve, adding to diesel tank then open valve', () => {
    fuelSys.DieselShoreFillValve.Close()
    expect(fuelSys.DieselShoreFillValve.isOpen).toBeFalsy()
    // add 1
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep)
    // Add second
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep * 2)
    // stop adding by closing the intake valve
    const contentBeforeReopeningIntakeValve = fuelSys.DieselTank.Content()
    fuelSys.DieselShoreFillValve.Open()
    // check nothing is added after valve is opened
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentBeforeReopeningIntakeValve)
  })

  test('Closing shore fill valve, adding to diesel tank until full', () => {
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

    fuelSys.DieselShoreFillValve.Close()
    expect(fuelSys.DieselShoreFillValve.isOpen).toBeFalsy()

    do {
      fuelSys.Thick()
    } while (!fullFlag)
  })
})

describe('Diesel storage tank: outlet valve', () => {
  test('Close diesel storage line valve', () => {
    fuelSys.DieselTank.Inside = 2000
    fuelSys.DsStorageOutletValve.Close()
    expect(fuelSys.DsStorageOutletValve.Content()).toBe(2000)
    expect(fuelSys.DsStorageOutletValve.isOpen).toBeFalsy()
  })
  test('Open a previous closed storage line valve', () => {
    fuelSys.DieselTank.Inside = 2000
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsStorageOutletValve.Open()
    expect(fuelSys.DsStorageOutletValve.Content()).toBe(0)
    expect(fuelSys.DsStorageOutletValve.isOpen).toBeTruthy()
  })
})

describe('Diesel service tank', () => {
  test('Close diesel service intake valve + open storage outlet = no transfer', () => {
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
  test('Open diesel service intake valve + closed storage outlet = no transfer', () => {
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
  test('Close diesel service intake valve then close storage outlet = transfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsServiceIntakeValve.Close()
    fuelSys.DsStorageOutletValve.Close()

    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep * 2)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
  })
  test('close storage outlet then close diesel service intake valve = transfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsServiceIntakeValve.Close()

    fuelSys.Thick()
    expect(fuelSys.DieselTank.RemoveEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.AddEachStep).toBe(CstFuelSys.DsServiceTank.TankAddStep)

    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep * 2)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep * 2)
  })
  test('re-open diesel service intake valve after both are closed = stop transfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsServiceIntakeValve.Close()

    fuelSys.Thick()
    fuelSys.DsServiceIntakeValve.Open()
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DieselTank.RemoveEachStep).toBe(0)
  })
  test('re-open diesel storage outlet valve after both are closed = stoptransfer', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsServiceIntakeValve.Close()

    fuelSys.Thick()
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.Thick()
    expect(fuelSys.DieselTank.Content()).toBe(contentTank - CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankAddStep)
    expect(fuelSys.DieselTank.RemoveEachStep).toBe(0)
  })
  test('re-open both valves after there where closed = no transfer (no double remove)', () => {
    const contentTank = 2000
    fuelSys.DieselTank.Inside = contentTank
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsServiceIntakeValve.Close()
    fuelSys.Thick()
    fuelSys.Thick()
    fuelSys.DsStorageOutletValve.Open()
    fuelSys.DsServiceIntakeValve.Open()
    fuelSys.Thick()

    expect(fuelSys.DieselTank.RemoveEachStep).toBe(0)
  })

  test('service tank is full, stop transfer, storage stops drain', () => {
    const contentDsTank = 2000
    fuelSys.DieselTank.Inside = contentDsTank
    const contentServiceTank = CstFuelSys.DsServiceTank.TankVolume - 30
    fuelSys.DsServiceTank.Inside = contentServiceTank

    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsServiceIntakeValve.Close()

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
    fuelSys.DsStorageOutletValve.Close()
    fuelSys.DsServiceIntakeValve.Close()
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
