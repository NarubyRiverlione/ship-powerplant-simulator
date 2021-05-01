import HandPump from '../../Components/HandPump'
import MockTank from '../mocks/MockTank'
import MockValve from '../mocks/MockValve'

let handPump: HandPump
const CstPumpVolume = 10
const sourceStartContent = 100

let dummySourceTank: MockTank
let dummySourceValve: MockValve

beforeEach(() => {
  dummySourceTank = new MockTank('dummy source', 100, sourceStartContent)
  dummySourceValve = new MockValve('dummy source valve', dummySourceTank)
  dummySourceValve.Open()

  handPump = new HandPump('Test handpump', CstPumpVolume, dummySourceValve)
})

describe('Init', () => {
  test('Pump is not cranking, has no content', () => {
    expect(handPump.isCranked).toBeFalsy()
    expect(handPump.Content).toBe(0)
  })
})

describe('Cranking', () => {
  test('Thick if cranking =  has content', () => {
    handPump.Crank()
    handPump.Thick()
    expect(handPump.isCranked).toBeFalsy()
    expect(handPump.Content).toBe(CstPumpVolume)
  })
  test(' cranking with limit source =  has all source content', () => {
    dummySourceTank.Inside = 1
    handPump.Crank()
    handPump.Thick()
    expect(handPump.isCranked).toBeFalsy()
    expect(handPump.Content).toBe(1)
  })
  test('2the Thick after 1 cranking =  no content', () => {
    handPump.Crank()
    handPump.Thick()
    handPump.Thick()
    expect(handPump.isCranked).toBeFalsy()
    expect(handPump.Content).toBe(0)
  })
  test('Thick if not cranked, still no content', () => {
    expect(handPump.isCranked).toBeFalsy()
    handPump.Thick()
    expect(handPump.isCranked).toBeFalsy()
    expect(handPump.Content).toBe(0)
  })

  test.skip('Thick after cranking removes from source', () => {
    handPump.Crank()
    handPump.Thick()
    expect(handPump.isCranked).toBeFalsy()
    expect(handPump.Content).toBe(CstPumpVolume)
    expect(handPump.Inside).toBe(CstPumpVolume)

    expect(dummySourceTank.Content).toBe(sourceStartContent - CstPumpVolume)
  })
})
