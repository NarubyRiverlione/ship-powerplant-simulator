const TankWithValves = require('../../Components/TankWithValves')

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
