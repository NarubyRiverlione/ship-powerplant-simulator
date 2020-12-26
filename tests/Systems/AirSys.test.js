const AirSys = require('../../Systems/AirSystem')

let airSys
beforeEach(() => {
  airSys = new AirSys()
})

describe('Init', () => {
  test('Emergency air receiver is empty', () => {
    expect(airSys.EmergencyReceiver.Tank.Content()).toBe(0)
    expect(airSys.EmergencyReceiver.IntakeValve.isOpen).toBeFalsy()
    expect(airSys.EmergencyReceiver.OutletValve.isOpen).toBeFalsy()
  })
})
