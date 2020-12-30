const { CStCoolantSys } = require('../../src/Cst')
const CoolantSys = require('../../src/Systems/CoolantSys')

const dummyEmergencyBus = { Voltage: 440 }
const dummyMainBus = { Voltage: 440 }
let coolantSys
beforeEach(() => {
  coolantSys = new CoolantSys(dummyMainBus, dummyEmergencyBus)
})

describe('Init', () => {
  test('Sea chest intake valves are closed', () => {
    const { SeaChests } = coolantSys
    expect(SeaChests.LowSuctionIntakeValve.isOpen).toBeFalsy()
    expect(SeaChests.HighSuctionIntakeValve.isOpen).toBeFalsy()
  })
})

describe('Sea chests', () => {
  test('Low suction intake valve open = content', () => {
    const { SeaChests } = coolantSys
    SeaChests.LowSuctionIntakeValve.Open()
    expect(SeaChests.Content()).toBe(CStCoolantSys.SeaChest)
  })
  test('High suction intake valve open = content', () => {
    const { SeaChests } = coolantSys
    SeaChests.HighSuctionIntakeValve.Open()
    expect(SeaChests.Content()).toBe(CStCoolantSys.SeaChest)
  })
})
describe('Suction pumps', () => {
  test('Aux pump with low suction valve open = output is rated', () => {
    const { AuxPump } = coolantSys
    coolantSys.SeaChests.LowSuctionIntakeValve.Open()
    AuxPump.Start()
    coolantSys.Thick()
    expect(AuxPump.isRunning).toBeTruthy()
    expect(AuxPump.Providers).toBe(CStCoolantSys.SeaChest)
    expect(AuxPump.Content()).toBe(CStCoolantSys.AuxSuctionPump)
  })
  test('Suction pump 1 with low suction valve open = output is rated', () => {
    const { SuctionPump1 } = coolantSys
    coolantSys.SeaChests.LowSuctionIntakeValve.Open()
    SuctionPump1.Start()
    coolantSys.Thick()
    expect(SuctionPump1.isRunning).toBeTruthy()
    expect(SuctionPump1.Providers).toBe(CStCoolantSys.SeaChest)
    expect(SuctionPump1.Content()).toBe(CStCoolantSys.SuctionPumps)
  })
  test('Suction pump 2 with high suction valve open = output is rated', () => {
    const { SuctionPump2 } = coolantSys
    coolantSys.SeaChests.HighSuctionIntakeValve.Open()
    SuctionPump2.Start()
    coolantSys.Thick()
    expect(SuctionPump2.isRunning).toBeTruthy()
    expect(SuctionPump2.Providers).toBe(CStCoolantSys.SeaChest)
    expect(SuctionPump2.Content()).toBe(CStCoolantSys.SuctionPumps)
  })
})
