import AlarmSystem from '../../Systems/AlarmSystem'

let alarmSys: AlarmSystem

beforeEach(() => {
  alarmSys = new AlarmSystem()
})

describe('Init', () => {
  test('Empty alarm list', () => {
    expect(alarmSys.AlarmList.size).toBe(0)
  })
})

describe('add', () => {
  test('Add new alarm', () => {
    const testAlarm = 42
    let addedCode = 0
    const testCb = (code: number) => { addedCode = code }
    alarmSys.cbAlarmAdded = testCb

    alarmSys.AddAlarm(testAlarm)
    expect(alarmSys.AlarmList.size).toBe(1)
    expect(alarmSys.AlarmExist(testAlarm)).toBeTruthy()
    expect(addedCode).toBe(testAlarm)
  })
  test('Add an already raised alarm, no cbAlarmAdded', () => {
    const testAlarm = 589
    let cbNumberCalled = 0
    const testCb = () => { cbNumberCalled += 1 }
    alarmSys.cbAlarmAdded = testCb

    alarmSys.AddAlarm(testAlarm)
    expect(cbNumberCalled).toBe(1)
    alarmSys.AddAlarm(testAlarm)

    expect(alarmSys.AlarmList.size).toBe(1)
    expect(alarmSys.AlarmExist(testAlarm)).toBeTruthy()
    expect(cbNumberCalled).toBe(1)
  })
})

describe('Remove alarm', () => {
  test('remove', () => {
    const testAlarm = 15
    let cbNumberCalled = 0
    let alarmRemoved = 0
    const testCb = (removed: number) => { cbNumberCalled += 1; alarmRemoved = removed }
    alarmSys.cbAlarmRemoved = testCb

    alarmSys.AddAlarm(testAlarm)
    alarmSys.RemoveAlarm(testAlarm)
    expect(alarmSys.AlarmList.size).toBe(0)
    expect(alarmSys.AlarmExist(testAlarm)).toBeFalsy()
    expect(cbNumberCalled).toBe(1)
    expect(alarmRemoved).toBe(testAlarm)
  })
})
