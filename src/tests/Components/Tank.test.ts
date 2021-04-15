import Tank from '../../Components/Tank'

describe('Tank init', () => {
  test('New empty tank', () => {
    const name = 'test tank'
    const tank = new Tank(name, 250)
    expect(tank.Volume).toBe(250)
    expect(tank.Content).toBe(0)
    expect(tank.Name).toBe(name)
  })
  test('New tank with content', () => {
    const name = 'tank with conent'
    const tank = new Tank(name, 3000, 100)
    expect(tank.Volume).toBe(3000)
    expect(tank.Content).toBe(100)
    expect(tank.Name).toBe(name)
  })
})

describe('Tank add 1 step', () => {
  test('Add 1 step to empty tank', () => {
    const tank = new Tank('test tank', 250)
    tank.AddThisStep = 100
    tank.Thick()
    expect(tank.Content).toBe(100)
  })
  test('Add 1 step to not empty tank', () => {
    const start = 200
    const addEachStep = 78
    const tank = new Tank('not empty test tank', 1000, start)
    tank.AddThisStep = addEachStep
    tank.Thick()
    expect(tank.Content).toBe(start + addEachStep)
  })
  test('Try overfill tank', () => {
    const start = 240
    const volume = 250
    const addEachStep = 50
    const tank = new Tank('almost full tank', volume, start)
    tank.AddThisStep = addEachStep
    tank.Thick()
    expect(tank.Content).toBe(volume)
    expect(tank.AddThisStep).toBe(0)
  })
})

describe('Tank remove 1 step', () => {
  test('Remove from full tank', () => {
    const start = 200
    const remove = 80
    const tank = new Tank('full tank', start, start)
    tank.RemoveThisStep = remove
    tank.Thick()
    expect(tank.Content).toBe(start - remove)
    expect(tank.ReadoutConsumption).toBe(remove)
  })
  test('Remove from empty tank = empty (not negative content)', () => {
    const remove = 1
    const tank = new Tank('empty tank', 200)
    tank.RemoveThisStep = remove
    tank.Thick()
    tank.Thick()
    expect(tank.Content).toBe(0)
    expect(tank.ReadoutConsumption).toBe(0)
  })
  test('Remove from more then content from tank = empty (not negative content)', () => {
    const remove = 80
    const start = 50
    const tank = new Tank('not empty tank', 200, start)
    tank.RemoveThisStep = remove
    tank.Thick()
    expect(tank.Content).toBe(0)
    expect(tank.ReadoutConsumption).toBe(start)
  })
})

describe('Tank add over time', () => {
  test('Add 4 steps of each 10', () => {
    const start = 20
    const addEachStep = 10

    const tank = new Tank('add over time', 100, start)
    tank.AddThisStep = addEachStep

    tank.Thick()
    expect(tank.Content).toBe(start + addEachStep)
    tank.Thick()
    expect(tank.Content).toBe(start + addEachStep * 2)
    tank.Thick()
    expect(tank.Content).toBe(start + addEachStep * 3)
    tank.Thick()
    expect(tank.Content).toBe(start + addEachStep * 4)
  })
  test('Start filling until full', () => {
    const startContent = 50
    const addEachStep = 10
    const maxTank = 100
    const tank = new Tank('test tank', maxTank, startContent)
    tank.AddThisStep = addEachStep
    do {
      tank.Thick()
    } while (tank.AddThisStep !== 0)
  })
})
/*
describe('Tank remove over time', () => {
  test('Remove in 4 steps of each 10', () => {
    const start = 90
    const removeEachStep = 10

    const tank = new Tank('remove over time', 100, start)
    tank.RemoveThisStep = removeEachStep
    // tank.AmountRemovers = 1

    tank.Thick()
    expect(tank.Content).toBe(start - removeEachStep)
    
    tank.Thick()
    expect(tank.Content).toBe(start - removeEachStep * 2)
    
    tank.Thick()
    expect(tank.Content).toBe(start - removeEachStep * 3)
    
    tank.Thick()
    expect(tank.Content).toBe(start - removeEachStep * 4)
    
  })
  test('Remove in until empty ', () => {
    const start = 20
    const removeEachStep = 10

    const tank = new Tank('remove over time', 100, start)
    tank.RemoveThisStep = removeEachStep
    // tank.AmountRemovers = 1

    tank.Thick()
    expect(tank.Content).toBe(start - removeEachStep)
    
    tank.Thick()
    expect(tank.Content).toBe(start - removeEachStep * 2)
    
    tank.Thick()
    expect(tank.Content).toBe(0)
    
    tank.Thick()
    expect(tank.Content).toBe(0)
    
  })
})
*/
describe('Alarms', () => {
  let alarmTank: Tank
  let dummyAlarmSys: any
  const raisedAlarmCode = new Set()

  const AlarmCodeLow = 10
  const AlarmCodeEmpty = 60
  const LowLevelAlarm = 25
  beforeEach(() => {
    dummyAlarmSys = {
      AddAlarm: (raise: number) => { raisedAlarmCode.add(raise) },
      RemoveAlarm: (kill: number) => { raisedAlarmCode.delete(kill) },
      AlarmExist: (code: number) => raisedAlarmCode.has(code)
    }
    alarmTank = new Tank('test alarm tank', 250)
    alarmTank.AlarmSystem = dummyAlarmSys
    alarmTank.LowLevelAlarm = LowLevelAlarm
    alarmTank.LowLevelAlarmCode = AlarmCodeLow
    alarmTank.EmptyAlarmCode = AlarmCodeEmpty
  })
  test('no low alarm code provided = no alarm raised', () => {
    alarmTank.LowLevelAlarmCode = 0
    // try raise alarm
    alarmTank.Inside = LowLevelAlarm - 0.1
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeLow)).toBeFalsy()
  })
  test('Raise Low level', () => {
    // at alarm level = no alarm yet, must be below
    alarmTank.Inside = LowLevelAlarm
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeLow)).toBeFalsy()
    // raise alarm
    alarmTank.Inside = LowLevelAlarm - 0.1
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeLow)).toBeTruthy()
  })
  test('Cancel Low level', () => {
    alarmTank.AlarmSystem = dummyAlarmSys
    // at alarm level = no alarm yet, must be below
    alarmTank.Inside = LowLevelAlarm - 5
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeLow)).toBeTruthy()
    // above low level = cancel alarm
    alarmTank.Inside = LowLevelAlarm
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeLow)).toBeFalsy()
  })
  test('no empty alarm code provided = no alarm raised', () => {
    alarmTank.EmptyAlarmCode = 0
    // try raise alarm
    alarmTank.Inside = 0
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeEmpty)).toBeFalsy()
  })
  test('Raise Empty alarm', () => {
    // not empty = no alarm
    alarmTank.Inside = 1
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeEmpty)).toBeFalsy()
    // raise alarm
    alarmTank.Inside = 0
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeEmpty)).toBeTruthy()
  })
  test('Cancel Empty alarm', () => {
    // raise alarm
    alarmTank.Inside = 0
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeEmpty)).toBeTruthy()
    // cancel alarm
    alarmTank.Inside = 0.1
    alarmTank.Thick()
    expect(raisedAlarmCode.has(AlarmCodeEmpty)).toBeFalsy()
  })
})
