const LubSys = require('../../Systems/LubricationSystem')
const { CstLubSys } = require('../../Cst')

let lubSys
beforeEach(() => {
  lubSys = new LubSys()
})
describe('Init', () => {
  test('Shore intake valve is closed', () => {
    expect(lubSys.LubShoreIntakeValve.isOpen).toBeFalsy()
    expect(lubSys.LubShoreIntakeValve.Content()).toBe(0)
  })
  test('Storage tank is empty', () => {
    expect(lubSys.LubStorageTank.Content()).toBe(0)
    expect(lubSys.LubStorageTank.AddEachStep).toBe(CstLubSys.LubStorageTank.TankAddStep)
  })
  test('Storage outlet  valve is closed', () => {
    expect(lubSys.LubStorageOutletValve.isOpen).toBeFalsy()
    expect(lubSys.LubStorageOutletValve.Content()).toBe(0)
  })
})

describe('Add from shore', () => {
  test('Open shore fill valve = filling storage tank', () => {
    lubSys.LubShoreIntakeValve.Open()
    lubSys.Thick()
    expect(lubSys.LubStorageTank.Content()).toBe(CstLubSys.LubStorageTank.TankAddStep)
    lubSys.Thick()
    expect(lubSys.LubStorageTank.Content()).toBe(CstLubSys.LubStorageTank.TankAddStep * 2)
  })
  test('close a previous open shore fill valve = stop  filling', () => {
    lubSys.LubShoreIntakeValve.Open()
    lubSys.Thick()
    lubSys.LubShoreIntakeValve.Close()
    lubSys.Thick()
    expect(lubSys.LubStorageTank.Content()).toBe(CstLubSys.LubStorageTank.TankAddStep)
  })
})
