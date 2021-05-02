import LubricationSystem from '../../Systems/LubricationSystem'
import { CstLubSys } from '../../Constants/Cst'
import { AlarmCode, AlarmLevel } from '../../Constants/CstAlarms'
import MockAlarmSys from '../mocks/MockAlarmSys'

let lubSys: LubricationSystem
const dummyAlarmSys = new MockAlarmSys()

beforeEach(() => {
  lubSys = new LubricationSystem(dummyAlarmSys)
})
describe('Init', () => {
  test('Shore intake valve is closed', () => {
    expect(lubSys.ShoreValve.isOpen).toBeFalsy()
    expect(lubSys.ShoreValve.Content).toBe(0)
  })
  test('Storage tank is empty', () => {
    expect(lubSys.Storage.Tank.Content).toBe(0)
    expect(lubSys.Storage.Tank.AddThisStep).toBe(0)
  })
})

describe('Storage tank: fill from shore', () => {
  test('Opening shore fill valve, intake stays closed --> no adding to diesel tank', () => {
    lubSys.ShoreValve.Open()
    expect(lubSys.ShoreValve.isOpen).toBeTruthy()
    expect(lubSys.Storage.IntakeValve.isOpen).toBeFalsy()

    lubSys.Thick()
    expect(lubSys.Storage.Tank.Content).toBe(0)
  })
  test('Opening intake valve, shore fill valve stays closed --> no adding to diesel tank', () => {
    lubSys.Storage.IntakeValve.Open()
    expect(lubSys.ShoreValve.isOpen).toBeFalsy()
    expect(lubSys.Storage.IntakeValve.isOpen).toBeTruthy()

    lubSys.Thick()
    expect(lubSys.Storage.Tank.Content).toBe(0)
  })
  test('open first intake valve then shore fill --> filling', () => {
    lubSys.Storage.IntakeValve.Open()
    expect(lubSys.Storage.IntakeValve.isOpen).toBeTruthy()
    lubSys.ShoreValve.Open()
    expect(lubSys.ShoreValve.isOpen).toBeTruthy()

    lubSys.Thick()
    expect(lubSys.Storage.IntakeValve.Content).toBe(CstLubSys.StorageTank.IntakeValveVolume)
    expect(lubSys.Storage.Tank.Content).toBe(CstLubSys.StorageTank.IntakeValveVolume)
    lubSys.Thick()
    expect(lubSys.Storage.Tank.Content).toBe(CstLubSys.StorageTank.IntakeValveVolume * 2)
  })
  test('open first shore fill valve then intake --> filling', () => {
    lubSys.ShoreValve.Open()
    expect(lubSys.ShoreValve.isOpen).toBeTruthy()
    lubSys.Storage.IntakeValve.Open()
    expect(lubSys.Storage.IntakeValve.isOpen).toBeTruthy()

    lubSys.Thick()
    expect(lubSys.Storage.Tank.Content).toBe(CstLubSys.StorageTank.IntakeValveVolume)
    lubSys.Thick()
    expect(lubSys.Storage.Tank.Content).toBe(CstLubSys.StorageTank.IntakeValveVolume * 2)
  })
  test('Closing shore fill valve, both where open = stop filling', () => {
    lubSys.Storage.IntakeValve.Open()
    lubSys.ShoreValve.Open()
    // add 2
    lubSys.Thick()
    lubSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = lubSys.Storage.Tank.Content
    lubSys.ShoreValve.Close()
    // check nothing is added after valve is opened
    lubSys.Thick()
    expect(lubSys.Storage.Tank.Content).toBe(contentBeforeReopeningIntakeValve)
  })
  test('Closing intake valve, both where open = stop filling', () => {
    lubSys.Storage.IntakeValve.Open()
    lubSys.ShoreValve.Open()
    // add 2
    lubSys.Thick()
    lubSys.Thick()
    // stop adding by open the intake valve
    const contentBeforeReopeningIntakeValve = lubSys.Storage.Tank.Content
    lubSys.Storage.IntakeValve.Close()
    // check nothing is added after valve is opened
    lubSys.Thick()
    expect(lubSys.Storage.Tank.Content).toBe(contentBeforeReopeningIntakeValve)
  })
})
describe('Alarms', () => {
  test('Raise Low diesel storage tank', () => {
    // at alarm level = no alarm yet, must be below
    lubSys.Storage.Tank.Inside = AlarmLevel.LubSys.LowStorage
    lubSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowLubStorageTank)).toBeFalsy()
    // raise alarm
    lubSys.Storage.Tank.Inside = AlarmLevel.LubSys.LowStorage - 0.1
    lubSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowLubStorageTank)).toBeTruthy()
  })
  test('Cancel Low level storage tank', () => {
    // at alarm level = no alarm yet, must be below
    lubSys.Storage.Tank.Inside = AlarmLevel.LubSys.LowStorage - 5
    lubSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowLubStorageTank)).toBeTruthy()
    // above low level = cancel alarm
    lubSys.Storage.Tank.Inside = AlarmLevel.LubSys.LowStorage
    lubSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.LowLubStorageTank)).toBeFalsy()
  })
  test('Raise empty diesel storage tank', () => {
    // at alarm level = no alarm yet, must be below
    lubSys.Storage.Tank.Inside = 1
    lubSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyLubStorageTank)).toBeFalsy()
    // raise alarm
    lubSys.Storage.Tank.Inside = 0
    lubSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyLubStorageTank)).toBeTruthy()
  })
  test('Cancel empty level storage tank', () => {
    // raise empty alarm
    lubSys.Storage.Tank.Inside = 0
    lubSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyLubStorageTank)).toBeTruthy()
    //  cancel alarm
    lubSys.Storage.Tank.Inside = 0.1
    lubSys.Thick()
    expect(dummyAlarmSys.AlarmExist(AlarmCode.EmptyLubStorageTank)).toBeFalsy()
  })
})
