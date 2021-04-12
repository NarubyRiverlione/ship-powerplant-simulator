import HandPump from '../../Components/HandPump'
import mockTank from '../mocks/mockTank'
import mockValve from '../mocks/mockValve'

let handPump: HandPump
const CstPumpVolume = 10
const sourceStartContent = 100

let dummySourceTank: mockTank
let dummySourceValve: mockValve

beforeEach(() => {
  dummySourceTank = new mockTank("dummy source", 100, sourceStartContent)
  dummySourceValve = new mockValve("dummy source valve", dummySourceTank)
  dummySourceValve.Open()

  handPump = new HandPump('Test handpump', CstPumpVolume, dummySourceValve)
})

describe('Init', () => {
  test('Pump is not cranking, has no content', () => {
    expect(handPump.IsCranked).toBeFalsy()
    expect(handPump.Content).toBe(0)
  })
})

describe('Cranking', () => {
  test('Thick if cranking =  has content', () => {
    handPump.Crank()
    handPump.Thick()
    expect(handPump.IsCranked).toBeFalsy()
    expect(handPump.Content).toBe(CstPumpVolume)
  })
  test(' cranking with limit source =  has all source content', () => {
    dummySourceTank.Inside = 1
    handPump.Crank()
    handPump.Thick()
    expect(handPump.IsCranked).toBeFalsy()
    expect(handPump.Content).toBe(1)
  })
  test('2the Thick after 1 cranking =  no content', () => {
    handPump.Crank()
    handPump.Thick()
    handPump.Thick()
    expect(handPump.IsCranked).toBeFalsy()
    expect(handPump.Content).toBe(0)
  })
  test('Thick if not cranked, still no content', () => {
    expect(handPump.IsCranked).toBeFalsy()
    handPump.Thick()
    expect(handPump.IsCranked).toBeFalsy()
    expect(handPump.Content).toBe(0)
  })

  test('Thick after cranking removes from source', () => {
    handPump.Crank()
    handPump.Thick()
    expect(handPump.IsCranked).toBeFalsy()
    expect(handPump.Content).toBe(CstPumpVolume)
    expect(handPump.Inside).toBe(CstPumpVolume)

    expect(dummySourceTank.Content).toBe(sourceStartContent - CstPumpVolume)
  })
})
