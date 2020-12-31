const { makeAutoObservable } = require('mobx')
const { CStCoolantSys, CstTxt } = require('../Cst')
const { CoolantSysTxt } = CstTxt

const Tank = require('../Components/Tank')
const Valve = require('../Components/Valve')
const Pump = require('../Components/ElectricPump')
const Cooler = require('../Components/Cooler')
const SeaChest = { Content: () => CStCoolantSys.SeaChest }
const FwMakeUp = { Content: () => CStCoolantSys.FwMakeUp }

/*
** Sea water cooling circuit **
                                         |- Suction pump 1 (main bus) --|     |- Fresh water cooler Diesel generator 1 (aux capable) ->-|
Sea chest high  - suction Valve ->-|     |- Suction pump 2 (main bus) --|==>==|- Fresh water cooler Diesel generator 2 (aux capable) ->-|==>== over board dump valve
                                   |==>==|- Aux pump (emergency bus)----|     |- Steam condensor (cannot work not on aux pump) ------->-|
Sea chest low  - suction valve -> -|

** Fresh water cooling circuits**
                                                    Fresh water Expand tank
                                                    |
      |->- Fresh water cooler Diesel generator 1 ->-|
      |                                             |
      |-<- Lubrication cooler diesel generator 1 -<-|

*/
module.exports = class CoolingSys {
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

    this.FwExpandTank = new Tank(CoolantSysTxt.FwExpandTank, CStCoolantSys.FwExpandTank.TankVolume)
    this.FwExpandTank.AddEachStep = CStCoolantSys.FwExpandTank.TankAddStep

    this.FwIntakeValve = new Valve(CoolantSysTxt.FwIntakeValve)
    this.FwIntakeValve.Source = FwMakeUp
    this.FwIntakeValve.cbNowOpen = () => {
      this.FwExpandTank.Adding = true
    }
    this.FwIntakeValve.cbNowClosed = () => {
      this.FwExpandTank.Adding = false
    }

    this.DsGenLubCooler = new Cooler(CoolantSysTxt.DsGenLubCooler, CStCoolantSys.DsGenLubCooler.coolingRate)
    this.DsGenLubCooler.CoolingCircuitComplete = true // TODO check if no Fw outlet valve is needed
    // TODO set (via Simulator Thick?): if DsGen 1 slump has lub,circulation valve is open, (filter  is selected)
    this.DsGenLubCooler.HotCircuitComplete = true
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
    this.FwCoolerDsGen1.HotCircuitComplete = this.DsGenLubCooler.hasCooling
    this.FwCoolerDsGen1.Thick()
    this.FwCoolerDsGen2.CoolingProviders = this.SwAvailable
    this.FwCoolerDsGen2.Thick()
    this.SteamCondensor.CoolingProviders = this.SwAvailable
    this.SteamCondensor.Thick()

    this.FwExpandTank.Thick()

    this.DsGenLubCooler.CoolingProviders = this.FwExpandTank.Content()

    // hot side of Fw DsGen 1 cooler is complete  if Lub cooler has cooling (has fresh water)
    this.DsGenLubCooler.isCooling = this.DsGenLubCooler.isCooling && this.FwCoolerDsGen1.hasCooling
    this.DsGenLubCooler.Thick()
  }
}
