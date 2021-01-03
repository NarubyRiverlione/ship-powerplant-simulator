const Tank = require('../../src/Components/Tank')

describe('Tank init', () => {
  test('New empty tank', () => {
    const name = 'test tank'
    const tank = new Tank(name, 250)
    expect(tank.Volume).toBe(250)
    expect(tank.Content()).toBe(0)
    expect(tank.Name).toBe(name)
    expect(tank.Adding).toBeFalsy()
    expect(tank.Removing).toBeFalsy()
  })
  test('New tank with content', () => {
    const name = 'tank with conent'
    const tank = new Tank(name, 3000, 100)
    expect(tank.Volume).toBe(3000)
    expect(tank.Content()).toBe(100)
    expect(tank.Name).toBe(name)
    expect(tank.Adding).toBeFalsy()
    expect(tank.Removing).toBeFalsy()
  })
})

describe('Tank add 1 step', () => {
  test('Add 1 step to empty tank', () => {
    const tank = new Tank('test tank', 250)
    tank.AddEachStep = 100
    tank.Adding = true
    tank.Thick()
    expect(tank.Content()).toBe(100)
    expect(tank.Adding).toBeTruthy()
    expect(tank.Removing).toBeFalsy()
  })
  test('Add 1 step to not empty tank', () => {
    const start = 200
    const addEachStep = 78
    const tank = new Tank('not empty test tank', 1000, start)
    tank.AddEachStep = addEachStep
    tank.Adding = true
    tank.Thick()
    expect(tank.Content()).toBe(start + addEachStep)
    expect(tank.Adding).toBeTruthy()
    expect(tank.Removing).toBeFalsy()
  })
  test('Try overfill tank', () => {
    let cbFullFlag = false

    const start = 240
    const volume = 250
    const addEachStep = 50
    const tank = new Tank('almost full tank', volume, start)
    tank.cbFull = () => {
      cbFullFlag = true
    }
    tank.AddEachStep = addEachStep

    tank.Adding = true
    tank.Thick()

    expect(tank.Content()).toBe(volume)
    expect(cbFullFlag).toBeTruthy()
    expect(tank.Adding).toBeTruthy()
    expect(tank.Removing).toBeFalsy()
  })
  test('Try overfill tank, without callback ', () => {
    const start = 240
    const volume = 250
    const addEachStep = 50
    const tank = new Tank('almost full tank', volume, start)
    tank.AddEachStep = addEachStep
    tank.Adding = true
    tank.Thick()
    expect(tank.Content()).toBe(volume)
    expect(tank.Adding).toBeTruthy()
    expect(tank.Removing).toBeFalsy()
  })
})

describe('Tank remove 1 step', () => {
  test('Remove from full tank', () => {
    let flagRemoved = false
    const start = 200
    const removeEachStep = 80
    const tank = new Tank('full tank', start, start)
    tank.RemoveEachStep = removeEachStep
    tank.Removing = true
    tank.cbRemoved = () => { flagRemoved = true }
    tank.Thick()
    expect(tank.Content()).toBe(start - removeEachStep)
    expect(tank.Removing).toBeTruthy()
    expect(tank.Adding).toBeFalsy()
    expect(flagRemoved).toBeTruthy()
  })
  test('Remove from empty tank, without callback', () => {
    const removeEachStep = 1
    const tank = new Tank('empty tank', 200)
    tank.RemoveEachStep = removeEachStep
    tank.Removing = true
    tank.Thick()
    expect(tank.Content()).toBe(0)
    expect(tank.Removing).toBeTruthy()
    expect(tank.Adding).toBeFalsy()
  })
  test('Remove from empty tank = empty (not negative content)', () => {
    const removeEachStep = 1
    const tank = new Tank('empty tank', 200)
    tank.RemoveEachStep = removeEachStep
    tank.Removing = true
    tank.Thick()
    expect(tank.Content()).toBe(0)
    expect(tank.Removing).toBeTruthy()
    expect(tank.Adding).toBeFalsy()
  })
  test('Remove from more then content from tank = empty (not negative content)', () => {
    const removeEachStep = 80
    const start = 50
    const tank = new Tank('not empty tank', 200, start)
    tank.RemoveEachStep = removeEachStep
    tank.Removing = true
    tank.Thick()
    expect(tank.Content()).toBe(0)
    expect(tank.Removing).toBeTruthy()
    expect(tank.Adding).toBeFalsy()
  })
})

describe('Tank add over time', () => {
  test('Add 4 steps of each 10', () => {
    const start = 20
    const addEachStep = 10

    const tank = new Tank('add over time', 100, start)
    tank.AddEachStep = addEachStep
    tank.Adding = true

    tank.Thick()
    expect(tank.Content()).toBe(start + addEachStep)
    expect(tank.Adding).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(start + addEachStep * 2)
    expect(tank.Adding).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(start + addEachStep * 3)
    expect(tank.Adding).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(start + addEachStep * 4)
    expect(tank.Adding).toBeTruthy()
  })
  test('Start filling until full', () => {
    const startContent = 50
    const addEachStep = 10
    const expectAmountOfSteps = 4
    const maxTank = 100
    let steps = 0
    const tank = new Tank('test tank', maxTank, startContent)
    tank.AddEachStep = addEachStep

    let cbFullFlag = false
    const cbFull = () => {
      cbFullFlag = true
      expect(tank.Content()).toBe(maxTank)
      expect(steps).toBe(expectAmountOfSteps)
    }

    const cbAdding = () => { steps += 1 }

    tank.cbFull = cbFull
    tank.cbAdded = cbAdding

    tank.Adding = true
    do {
      tank.Thick()
    } while (!cbFullFlag)
  })
})

describe('Tank remove over time', () => {
  test('Remove in 4 steps of each 10', () => {
    const start = 90
    const removeEachStep = 10

    const tank = new Tank('remove over time', 100, start)
    tank.RemoveEachStep = removeEachStep
    tank.Removing = true

    tank.Thick()
    expect(tank.Content()).toBe(start - removeEachStep)
    expect(tank.Removing).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(start - removeEachStep * 2)
    expect(tank.Removing).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(start - removeEachStep * 3)
    expect(tank.Removing).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(start - removeEachStep * 4)
    expect(tank.Removing).toBeTruthy()
  })
  test('Remove in until empty ', () => {
    const start = 20
    const removeEachStep = 10

    const tank = new Tank('remove over time', 100, start)
    tank.RemoveEachStep = removeEachStep
    tank.Removing = true

    tank.Thick()
    expect(tank.Content()).toBe(start - removeEachStep)
    expect(tank.Removing).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(start - removeEachStep * 2)
    expect(tank.Removing).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(0)
    expect(tank.Removing).toBeTruthy()
    tank.Thick()
    expect(tank.Content()).toBe(0)
    expect(tank.Removing).toBeTruthy()
  })
})

describe('Alarms', () => {
  let alarmTank
  let dummyAlarmSys
  const raisedAlarmCode = new Set()

  const AlarmCodeLow = 10
  const AlarmCodeEmpty = 60
  const LowLevelAlarm = 25
  beforeEach(() => {
    dummyAlarmSys = {
      AddAlarm: (raise) => { raisedAlarmCode.add(raise) },
      RemoveAlarm: (kill) => { raisedAlarmCode.delete(kill) },
      AlarmExist: (code) => raisedAlarmCode.has(code)
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
    alarmTank.AlarmSys = dummyAlarmSys
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
