import TankWithValves from '../../Components/TankWithValves'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'
import { CstChanges } from '../../Cst'

let tankV: TankWithValves
const Volume = 10000
const StartContent = 9000
const SourceContent = 100
const IntakeValveVolume = 5
const OutletValveVolume = 15


const dummySource = new mockTank('dummy source tank', 1000, SourceContent)
const dummySourceValve = new mockValve('test dummy source valve', dummySource)

beforeEach(() => {
  tankV = new TankWithValves('test tank', Volume, StartContent, dummySourceValve)
})

describe('Init', () => {
  test('volume & start content', () => {
    expect(tankV.Tank.Content).toBe(StartContent)
    expect(tankV.Content).toBe(StartContent)
    expect(tankV.Tank.Volume).toBe(Volume)
  })
  test('Intake & outlet valves are closed', () => {
    expect(tankV.IntakeValve.isOpen).toBeFalsy()
    expect(tankV.OutletValve.isOpen).toBeFalsy()
  })
  // test('Intake source', () => {
  //   //  expect(tankV.IntakeValve.Source).toBe(dummySourceValve)
  //   expect(tankV.IntakeValve.Content).toBe(dummySource.Inside)
  // })
  test('outlet source', () => {
    expect(tankV.OutletValve.Source).toEqual(tankV.Tank)
    expect(tankV.OutletValve.Source.Content).toBe(StartContent)
  })
  test('Drain valve is closed', () => {
    expect(tankV.DrainValve.isOpen).toBeFalsy()
    expect(tankV.DrainValve.Content).toBe(0)
  })
})
describe('Intake valve', () => {
  test('intake & source valves are closed --> no filling', () => {
    dummySourceValve.Close()
    tankV.Thick()
    expect(dummySourceValve.isOpen).toBeFalsy()
    expect(tankV.Tank.Inside).toBe(StartContent)
  })
  test('open intake, closed source --> no filling', () => {
    tankV.IntakeValve.Open()
    dummySourceValve.Close()
    tankV.Thick()
    expect(dummySourceValve.isOpen).toBeFalsy()
    expect(dummySourceValve.Content).toBe(0)
    expect(tankV.Tank.Inside).toBe(StartContent)
  })
  test('closed intake, open source --> no filling', () => {
    dummySourceValve.Open()
    tankV.Thick()
    expect(tankV.IntakeValve.isOpen).toBeFalsy()
    expect(tankV.Tank.Inside).toBe(StartContent)
  })
  test('both intake and source valves are open (unrestricted intake valve) --> filling with complete source content', () => {
    dummySourceValve.Open()
    tankV.IntakeValve.Open()
    tankV.Thick()
    expect(tankV.Tank.Inside).toBe(StartContent + SourceContent)
  })
  test('both intake and source valves are open --> restricted volume of intake valve filling', () => {
    tankV.IntakeValve.Volume = IntakeValveVolume
    dummySourceValve.Open()
    tankV.IntakeValve.Open()
    tankV.Thick()
    expect(tankV.Tank.Inside).toBe(StartContent + IntakeValveVolume)
    tankV.Thick()
    expect(tankV.Tank.Inside).toBe(StartContent + IntakeValveVolume * 2)
    tankV.Thick()
    expect(tankV.Tank.Inside).toBe(StartContent + IntakeValveVolume * 3)
  })
  test('re-open intake valve after both where closed --> no filling', () => {
    dummySourceValve.Open()
    tankV.IntakeValve.Open()
    tankV.Thick()
    tankV.IntakeValve.Close()
    tankV.Thick()
    expect(tankV.Tank.Inside).toBe(StartContent + SourceContent)

  })
  /*
  cannot test as there is no 'Thick' in a valve
   and dummy source valve has no logic to control adding in tank
  test('re-open source valve after both where closed --> no filling', () => {
    dummySourceValve.isOpen = true
    tankV.IntakeValve.Open()
    expect(tankV.Tank.Adding).toBeTruthy()
    dummySourceValve.isOpen = false

    // expect(tankV.Tank.Adding).toBeFalsy()
  })
  */
})

describe('Drain valve', () => {
  test('open drain valve = remove from tank', () => {
    const startContent = 1450
    tankV.Tank.Inside = startContent
    tankV.DrainValve.Open()
    tankV.Thick()
    expect(tankV.Tank.Content).toBe(startContent - CstChanges.DrainStep)
    tankV.Thick()
    expect(tankV.Tank.Content).toBe(startContent - CstChanges.DrainStep * 2)
  })
  test('closing previous open drain valve = stop remove from tank', () => {
    const startContent = 560
    tankV.Tank.Inside = startContent
    tankV.DrainValve.Open()
    tankV.Thick()
    expect(tankV.Tank.Content).toBe(startContent - CstChanges.DrainStep)
    tankV.DrainValve.Close()
    tankV.Thick()
    expect(tankV.Tank.Content).toBe(startContent - CstChanges.DrainStep)
  })
})

/*
describe.skip('Outlet valve', () => {
  test('full tank and open unrestricted outlet = valve has tank content', () => {
    tankV.OutletValve.Open()
    expect(tankV.OutletValve.Content).toBe(StartContent)
    tankV.Thick()
    expect(tankV.Tank.Content).toBe(0)
  })
  test('full tank and open restricted outlet = valve has his volume as content', () => {
    tankV.OutletValve.Volume = OutletValveVolume
    tankV.OutletValve.Open()
    expect(tankV.OutletValve.Content).toBe(OutletValveVolume)
    tankV.Thick()
    expect(tankV.Tank.Content).toBe(StartContent - OutletValveVolume)
  })
  test('full tank and re-close  outlet = tank stops removing', () => {
    tankV.OutletValve.Volume = OutletValveVolume
    tankV.OutletValve.Open()
    tankV.Thick()
    tankV.OutletValve.Close()
    expect(tankV.OutletValve.Content).toBe(0)
    tankV.Thick()
    expect(tankV.Tank.Content).toBe(StartContent - OutletValveVolume)
  })
  test('open outlet, empty tank, then add tank content = outlet has tank content', () => {
    tankV.Tank.Inside = 0
    tankV.OutletValve.Open()
    tankV.Thick()
    expect(tankV.OutletValve.Content).toBe(0)
    tankV.Tank.Inside = StartContent
    expect(tankV.OutletValve.Content).toBe(StartContent)
    tankV.Thick()
    expect(tankV.Tank.Content).toBe(0)
  })
})
describe.skip('Drain & outlet combo', () => {
  test('first drain then outlet open = remove Outlet + Drain volume ', () => {
    tankV.OutletValve.Volume = OutletValveVolume
    tankV.DrainValve.Open()
    tankV.Thick()
    expect(tankV.Tank.RemoveThisStep).toBe(CstChanges.DrainStep)
    tankV.Tank.RemoveThisStep = 0
    tankV.OutletValve.Open()
    tankV.Thick()
    expect(tankV.Tank.RemoveThisStep).toBe(CstChanges.DrainStep + OutletValveVolume)
  })
  test('first outlet then drain open', () => {
    tankV.OutletValve.Volume = OutletValveVolume
    tankV.OutletValve.Open()
    tankV.Thick()
    expect(tankV.Tank.RemoveThisStep).toBe(OutletValveVolume)
    tankV.DrainValve.Open()
    tankV.Thick()
    expect(tankV.Tank.RemoveThisStep).toBe(OutletValveVolume + CstChanges.DrainStep)
  })
  test('drain + outlet open, close drain = remove only volume of outlet', () => {
    tankV.OutletValve.Volume = OutletValveVolume
    tankV.DrainValve.Open()
    tankV.Thick()
    tankV.OutletValve.Open()
    tankV.Thick()
    tankV.DrainValve.Close()
    tankV.Thick()
    expect(tankV.Tank.RemoveThisStep).toBe(OutletValveVolume)
  })
  test('drain + outlet open, close outlet = remove only volume of drain', () => {
    tankV.OutletValve.Volume = OutletValveVolume
    tankV.DrainValve.Open()
    tankV.Thick()
    tankV.OutletValve.Open()
    tankV.Thick()
    tankV.OutletValve.Close()
    tankV.Thick()
    expect(tankV.Tank.RemoveThisStep).toBe(CstChanges.DrainStep)
  })
  test('drain + outlet open, close first outlet then drain', () => {
    const removeViaOutlet = 5
    tankV.OutletValve.cbNowOpen = () => {
      tankV.Tank.RemoveThisStep += removeViaOutlet
      //tankV.Tank.AmountRemovers += 1
    }
    tankV.OutletValve.cbNowClosed = () => {
      tankV.Tank.RemoveThisStep -= removeViaOutlet
      // tankV.Tank.AmountRemovers -= 1
    }
    tankV.DrainValve.Open()
    tankV.Thick()
    tankV.OutletValve.Open()
    tankV.Thick()
    tankV.OutletValve.Close()
    tankV.Thick()
    tankV.DrainValve.Close()
    tankV.Thick()
    expect(tankV.Tank.RemoveThisStep).toBe(0)
  })
  test('drain + outlet open, close first drain then outlet', () => {
    const removeViaOutlet = 5
    tankV.OutletValve.cbNowOpen = () => {
      tankV.Tank.RemoveThisStep += removeViaOutlet
      //tankV.Tank.AmountRemovers += 1
    }
    tankV.OutletValve.cbNowClosed = () => {
      tankV.Tank.RemoveThisStep -= removeViaOutlet
      // tankV.Tank.AmountRemovers -= 1
    }
    tankV.DrainValve.Open()
    tankV.Thick()
    tankV.OutletValve.Open()
    tankV.Thick()
    tankV.DrainValve.Close()
    tankV.Thick()
    tankV.OutletValve.Close()
    tankV.Thick()
    expect(tankV.Tank.RemoveThisStep).toBe(0)
  })

})
*/
