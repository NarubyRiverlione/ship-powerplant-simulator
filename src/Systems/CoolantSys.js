const { makeAutoObservable } = require('mobx')
const { CStCoolantSys, CstTxt } = require('../Cst')
const { CoolantSysTxt } = CstTxt

const Valve = require('../Components/Valve')
const Pump = require('../Components/ElectricPump')
const SeaChest = { Content: () => CStCoolantSys.SeaChests }

module.exports = class CoolantSys {
  constructor(mainBus, emergencyBus) {
    // this.MainBus = mainBus
    // this.EmergencyBus = emergencyBus

    this.SeaChests = {
      LowSuctionIntakeValve: new Valve(CoolantSysTxt.LowSuctionIntakeValve),
      HighSuctionIntakeValve: new Valve(CoolantSysTxt.HighSuctionIntakeValve),
      Content: () => this.SeaChests.LowSuctionIntakeValve.isOpen
        || this.SeaChests.HighSuctionIntakeValve.isOpen
        ? CStCoolantSys.SeaChest : 0
    }
    this.SeaChests.LowSuctionIntakeValve.Source = SeaChest
    this.SeaChests.HighSuctionIntakeValve.Source = SeaChest

    this.AuxPump = new Pump(CoolantSysTxt.AuxSuctionPump,
      emergencyBus, CStCoolantSys.AuxSuctionPump)

    this.SuctionPump1 = new Pump(CoolantSysTxt.SuctionPump1,
      mainBus, CStCoolantSys.SuctionPumps)
    this.SuctionPump2 = new Pump(CoolantSysTxt.SuctionPump2,
      mainBus, CStCoolantSys.SuctionPumps)
    makeAutoObservable(this)
  }

  Thick() {
    this.AuxPump.Providers = this.SeaChests.Content()
    this.AuxPump.Thick()
    this.SuctionPump1.Providers = this.SeaChests.Content()
    this.SuctionPump1.Thick()
    this.SuctionPump2.Providers = this.SeaChests.Content()
    this.SuctionPump2.Thick()
  }
}
