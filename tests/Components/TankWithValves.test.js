const TankWithValves = require('../../src/Components/TankWithValves')
const { CstChanges } = require('../../src/Cst')

let tankV
const Volume = 315689746
const StartContent = 66599

const dummySource = { Inside: 887, Removing: false }
const dummySourceValve = {
  isOpen: false,
  Source: dummySource,
  Content: () => this.Source.Inside
}

beforeEach(() => {
  tankV = new TankWithValves('test tank', Volume, StartContent, dummySourceValve)
})

describe('Init', () => {
  test('volume & start content', () => {
    expect(tankV.Tank.Content()).toBe(StartContent)
    expect(tankV.Tank.Volume).toBe(Volume)
  })
  test('Intake & outlet valves are closed', () => {
    expect(tankV.IntakeValve.isOpen).toBeFalsy()
    expect(tankV.OutletValve.isOpen).toBeFalsy()
  })
  // test('Intake source', () => {
  //   //  expect(tankV.IntakeValve.Source).toBe(dummySourceValve)
  //   expect(tankV.IntakeValve.Content()).toBe(dummySource.Inside)
  // })
  test('outlet source', () => {
    expect(tankV.OutletValve.Source).toEqual(tankV.Tank)
    expect(tankV.OutletValve.Source.Content()).toBe(StartContent)
  })
  test('Drain valve is closed', () => {
    expect(tankV.DrainValve.isOpen).toBeFalsy()
  })
})

describe('Intake valve', () => {
  test('intake & source valves are closed --> no filling', () => {
    expect(dummySourceValve.isOpen).toBeFalsy()
    expect(tankV.Tank.Adding).toBeFalsy()
  })
  test('open intake, closed source --> no filling', () => {
    tankV.IntakeValve.Open()
    expect(tankV.IntakeValve.isOpen).toBeTruthy()
    expect(tankV.Tank.Adding).toBeFalsy()
  })
  test('closed intake, open source --> no filling', () => {
    dummySource.isOpen = true
    expect(tankV.IntakeValve.isOpen).toBeFalsy()
    expect(tankV.Tank.Adding).toBeFalsy()
  })
  test('both intake and source valves are open --> filling', () => {
    dummySourceValve.isOpen = true
    tankV.IntakeValve.Open()
    expect(tankV.IntakeValve.isOpen).toBeTruthy()
    expect(tankV.Tank.Adding).toBeTruthy()
  })
  test('re-open intake valve after both where closed --> no filling', () => {
    dummySourceValve.isOpen = true
    tankV.IntakeValve.Open()
    expect(tankV.Tank.Adding).toBeTruthy()
    tankV.IntakeValve.Close()
    expect(tankV.IntakeValve.isOpen).toBeFalsy()
    expect(tankV.Tank.Adding).toBeFalsy()
  })
  /*
  cannot test as there is no 'Thick' in a valve
   and dummy source valve has no logic to control adding in tank
  test('re-open source valve after both where closed --> no filling', () => {
    dummySourceValve.isOpen = true
    tankV.IntakeValve.Open()
    expect(tankV.Tank.Adding).toBeTruthy()
    dummySourceValve.isOpen = false

    expect(tankV.Tank.Adding).toBeFalsy()
  })
  */
})
describe('Outlet valve', () => {
  test('full tank and open outlet = valve has tank content', () => {
    tankV.Tank.Inside = StartContent
    tankV.OutletValve.Open()
    tankV.Thick()
    expect(tankV.OutletValve.Content()).toBe(StartContent)
  })
  test('full tank and re-close  outlet = valve has no content', () => {
    tankV.Tank.Inside = StartContent
    tankV.OutletValve.Open()
    tankV.Thick()
    tankV.OutletValve.Close()
    tankV.Thick()
    expect(tankV.OutletValve.Content()).toBe(0)
  })
  test('open outlet, empty tank, then add tank content = outlet has tank content', () => {
    tankV.Tank.Inside = 0
    tankV.OutletValve.Open()
    tankV.Thick()
    expect(tankV.OutletValve.Content()).toBe(0)
    tankV.Tank.Inside = StartContent
    tankV.Thick()
    expect(tankV.OutletValve.Content()).toBe(StartContent)
  })
})
describe('Drain valve', () => {
  test('open drain valve = remove from tank', () => {
    const startContent = 1435
    const drainTarget = { Inside: 0, AddEachStep: 0, Adding: false }
    tankV.Tank.Inside = startContent
    tankV.DrainTarget = drainTarget
    tankV.DrainValve.Open()
    tankV.Thick()
    expect(tankV.Tank.Content()).toBe(startContent - CstChanges.DrainStep)
    expect(drainTarget.AddEachStep).toBe(CstChanges.DrainStep)
    expect(drainTarget.Adding).toBeTruthy()
  })
  test('closing previous open drain valve = stop remove from tank', () => {
    const startContent = 563
    tankV.Tank.Inside = startContent
    tankV.DrainValve.Open()
    tankV.Thick()
    tankV.DrainValve.Close()
    expect(tankV.Tank.Content()).toBe(startContent - CstChanges.DrainStep)
  })
})
