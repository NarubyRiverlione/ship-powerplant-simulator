const { makeAutoObservable } = require('mobx')
const { CStCoolantSys, CstTxt } = require('../Cst')
const { CoolantSysTxt } = CstTxt

const Valve = require('../Components/Valve')
const Pump = require('../Components/ElectricPump')
const Cooler = require('../Components/Cooler')
const SeaChest = { Content: () => CStCoolantSys.SeaChest }

module.exports = class SeaWaterCoolingSys {
  constructor(mainBus, emergencyBus) {
    this.SwAvailable = 0

    this.SeaChestLowSuctionIntakeValve = new Valve(CoolantSysTxt.LowSuctionIntakeValve)
    this.SeaChestLowSuctionIntakeValve.Source = SeaChest
    this.SeaChestHighSuctionIntakeValve = new Valve(CoolantSysTxt.HighSuctionIntakeValve)
    this.SeaChestHighSuctionIntakeValve.Source = SeaChest

    this.AuxPump = new Pump(CoolantSysTxt.AuxSuctionPump, emergencyBus, CStCoolantSys.AuxSuctionPump)
    this.SuctionPump1 = new Pump(CoolantSysTxt.SuctionPump1, mainBus, CStCoolantSys.SuctionPumps)
    this.SuctionPump2 = new Pump(CoolantSysTxt.SuctionPump2, mainBus, CStCoolantSys.SuctionPumps)

    this.FwCoolerDsGen1 = new Cooler(CoolantSysTxt.FwCoolerDsGen1, CStCoolantSys.FwCoolerDsGen1.coolingRate)
    this.FwCoolerDsGen2 = new Cooler(CoolantSysTxt.FwCoolerDsGen2, CStCoolantSys.FwCoolerDsGen2.coolingRate)
    this.SteamCondensor = new Cooler(CoolantSysTxt.SteamCondensor, CStCoolantSys.SteamCondensor.coolingRate)

    this.OverboardDumpValve = new Valve(CoolantSysTxt.OverboardDumpValve)
    this.OverboardDumpValve.cbNowOpen = () => {
      this.FwCoolerDsGen1.CoolingCircuitComplete = true
      this.FwCoolerDsGen2.CoolingCircuitComplete = true
      this.SteamCondensor.CoolingCircuitComplete = true
    }
    this.OverboardDumpValve.cbNowClosed = () => {
      this.FwCoolerDsGen1.CoolingCircuitComplete = false
      this.FwCoolerDsGen2.CoolingCircuitComplete = false
      this.SteamCondensor.CoolingCircuitComplete = false
    }

    makeAutoObservable(this)
  }

  Thick() {
    this.AuxPump.Providers = this.SeaChestLowSuctionIntakeValve.Content()
      + this.SeaChestHighSuctionIntakeValve.Content()
    this.AuxPump.Thick()

    this.SuctionPump1.Providers = this.SeaChestLowSuctionIntakeValve.Content()
      + this.SeaChestHighSuctionIntakeValve.Content()
    this.SuctionPump1.Thick()

    this.SuctionPump2.Providers = this.SeaChestLowSuctionIntakeValve.Content()
      + this.SeaChestHighSuctionIntakeValve.Content()
    this.SuctionPump2.Thick()

    this.SwAvailable = this.AuxPump.Content()
      + this.SuctionPump1.Content()
      + this.SuctionPump2.Content()

    this.FwCoolerDsGen1.CoolingProviders = this.SwAvailable
    this.FwCoolerDsGen1.Thick()
    this.FwCoolerDsGen2.CoolingProviders = this.SwAvailable
    this.FwCoolerDsGen2.Thick()
    this.SteamCondensor.CoolingProviders = this.SwAvailable
    this.SteamCondensor.Thick()
  }
}
