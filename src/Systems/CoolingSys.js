const { makeAutoObservable } = require('mobx')
const { CstCoolantSys, CstTxt, CstChanges } = require('../Cst')
const { CoolantSysTxt } = CstTxt

const Tank = require('../Components/Tank')
const Valve = require('../Components/Valve')
const Pump = require('../Components/ElectricPump')
const Cooler = require('../Components/Cooler')
const SeaChest = { Content: () => CstCoolantSys.SeaChest }
const FwMakeUp = { Content: () => CstCoolantSys.FwMakeUp }
/* eslint-disable max-len */
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
/* eslint-enable max-len */

module.exports = class CoolingSys {
  constructor(mainBus, emergencyBus) {
    this.SwAvailable = 0
    // #region Sea chests suction valves
    this.SeaChestLowSuctionIntakeValve = new Valve(CoolantSysTxt.LowSuctionIntakeValve)
    this.SeaChestLowSuctionIntakeValve.Source = SeaChest
    this.SeaChestHighSuctionIntakeValve = new Valve(CoolantSysTxt.HighSuctionIntakeValve)
    this.SeaChestHighSuctionIntakeValve.Source = SeaChest
    // #endregion
    // #region (aux) SuctionPumps
    this.AuxPump = new Pump(CoolantSysTxt.AuxSuctionPump, emergencyBus, CstCoolantSys.AuxSuctionPump)
    this.SuctionPump1 = new Pump(CoolantSysTxt.SuctionPump1, mainBus, CstCoolantSys.SuctionPumps)
    this.SuctionPump2 = new Pump(CoolantSysTxt.SuctionPump2, mainBus, CstCoolantSys.SuctionPumps)
    // #endregion
    // #region primair FW circuit
    this.FwCoolerDsGen1 = new Cooler(CoolantSysTxt.FwCoolerDsGen1, CstCoolantSys.FwCoolerDsGen1.coolingRate)
    this.FwCoolerDsGen2 = new Cooler(CoolantSysTxt.FwCoolerDsGen2, CstCoolantSys.FwCoolerDsGen2.coolingRate)
    this.SteamCondensor = new Cooler(CoolantSysTxt.SteamCondensor, CstCoolantSys.SteamCondensor.coolingRate)
    // #endregion
    // #region Over board dump valve
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
    // #endregion
    // #region FW Expand tank
    this.FwExpandTank = new Tank(CoolantSysTxt.FwExpandTank, CstCoolantSys.FwExpandTank.TankVolume)
    this.FwExpandTank.AddEachStep = CstCoolantSys.FwExpandTank.TankAddStep
    this.FwExpandTank.RemoveEachStep = CstChanges.DrainStep

    this.FwIntakeValve = new Valve(CoolantSysTxt.FwIntakeValve)
    this.FwIntakeValve.Source = FwMakeUp
    this.FwIntakeValve.cbNowOpen = () => {
      this.FwExpandTank.Adding = true
    }
    this.FwIntakeValve.cbNowClosed = () => {
      this.FwExpandTank.Adding = false
    }
    this.FwDrainValve = new Valve(CoolantSysTxt.FwDrainValve)
    this.FwDrainValve.Source = this.FwExpandTank
    this.FwDrainValve.cbNowOpen = () => {
      this.FwExpandTank.Removing = true
    }
    this.FwDrainValve.cbNowClosed = () => {
      this.FwExpandTank.Removing = false
    }
    // #endregion
    // #region DsGen 1 Lubrication cooler (secundaire FW circuit)
    this.DsGen1LubCooler = new Cooler(CoolantSysTxt.DsGenLubCooler, CstCoolantSys.DsGenLubCooler.coolingRate)
    this.DsGen1LubCooler.CoolingCircuitComplete = true // TODO check if no Fw outlet valve is needed
    // TODO set (via Simulator Thick?): if DsGen 1 slump has lub,circulation valve is open, (filter  is selected)
    this.DsGen1LubCooler.HotCircuitComplete = true
    // #endregion
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
    this.FwCoolerDsGen1.HotCircuitComplete = this.DsGen1LubCooler.hasCooling
    this.FwCoolerDsGen1.Thick()

    this.FwCoolerDsGen2.CoolingProviders = this.SwAvailable
    this.FwCoolerDsGen2.Thick()

    this.SteamCondensor.CoolingProviders = this.SwAvailable
    this.SteamCondensor.Thick()

    this.FwExpandTank.Thick()

    this.DsGen1LubCooler.CoolingProviders = this.FwExpandTank.Content()

    // hot side of Fw DsGen 1 cooler is complete  if Lub cooler has cooling (has fresh water)
    this.DsGen1LubCooler.isCooling = this.DsGen1LubCooler.isCooling && this.FwCoolerDsGen1.hasCooling
    this.DsGen1LubCooler.Thick()
  }
}
