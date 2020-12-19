const Power = require('../Power')
const { CstBoundaries } = require('../Cst')
let powerSystem
beforeEach(() => {
  powerSystem = new Power()
})

describe('Init power', () => {
  test('Mainbus is zero at startup', () => {
    const mainBus = powerSystem.MainBus()
    expect(mainBus).toBe(0)
  })
  test('DS gen 1 not running at startup', () => {
    expect(powerSystem.DSgen1.Running).toBeFalsy()
  })
  test('Shore power not connected at startup', () => {
    expect(powerSystem.ShorePower).toBeFalsy()
  })
})

describe('Shore power', () => {
  test('Mainbus has voltage after connecting shore', () => {
    powerSystem.ConnectShore()
    const mainBus = powerSystem.MainBus()
    expect(mainBus).toBe(CstBoundaries.Power.Max)
  })
  test('Mainbus is zero after disconnecting shore', () => {
    powerSystem.ConnectShore()
    powerSystem.DisconnectShore()
    const mainBus = powerSystem.MainBus()
    expect(mainBus).toBe(0)
  })
})
