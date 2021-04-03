import { makeAutoObservable } from 'mobx'
import { CstCoolantSys, CstChanges } from '../Cst'
import CstTxt from '../CstTxt'
const { CoolantSysTxt } = CstTxt

import Tank from '../Components/Tank'
import Valve from '../Components/Valve'
import Pump from '../Components/ElectricPump'
import Cooler from '../Components/Cooler'
import PowerBus from '../Components/PowerBus'

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
|->- Fresh water Start Air cooler->-|
|                                             |
|-<- Fresh water Diesel generator Lubrication cooler -<-|

*/
/* eslint-enable max-len */


export default class CoolingSystem {
  // Sea water cools the Fresh water coolers
  FwCoolerDsGen: Cooler
  FwCoolerStartAir: Cooler
  SteamCondensor: Cooler

  SeaChestLowSuctionIntakeValve: Valve
  SeaChestHighSuctionIntakeValve: Valve
  AuxPump: Pump
  SuctionPump1: Pump
  SuctionPump2: Pump
  OverboardDumpValve: Valve
  SwAvailable: Tank // virtual tank that combines the possible outputs of AuxPump, SuctionPump 1 & 2

  FwExpandTank: Tank
  FwIntakeValve: Valve
  FwDrainValve: Valve

  // Fresh water coolers cools a system
  DsGenLubCooler: Cooler
  StartAirCooler: Cooler

  constructor(mainBus = new PowerBus('dummy mainBus'), emergencyBus = new PowerBus('dummy emergency power bus')) {
    this.SwAvailable = new Tank('virtual tank that combines the possible outputs of AuxPump, SuctionPump 1 & 2', 1e6, 0)
    const SeaChest = new Tank('Sea water chest', 1e6, 1e6)
    // #region Sea chests suction valves
    this.SeaChestLowSuctionIntakeValve = new Valve(CoolantSysTxt.LowSuctionIntakeValve, SeaChest)
    this.SeaChestHighSuctionIntakeValve = new Valve(CoolantSysTxt.HighSuctionIntakeValve, SeaChest)
    // #endregion
    // #region (aux) SuctionPumps
    this.AuxPump = new Pump(CoolantSysTxt.AuxSuctionPump, emergencyBus, CstCoolantSys.AuxSuctionPump)
    this.SuctionPump1 = new Pump(CoolantSysTxt.SuctionPump1, mainBus, CstCoolantSys.SuctionPumps)
    this.SuctionPump2 = new Pump(CoolantSysTxt.SuctionPump2, mainBus, CstCoolantSys.SuctionPumps)
    // #endregion
    // #region primair FW circuit
    this.FwCoolerDsGen = new Cooler(CoolantSysTxt.FwCoolerDsGen, CstCoolantSys.FwCoolerDsGen.coolingRate)
    this.FwCoolerStartAir = new Cooler(CoolantSysTxt.FwCoolerStartAir, CstCoolantSys.FwCoolerStartAir.coolingRate)
    this.SteamCondensor = new Cooler(CoolantSysTxt.SteamCondensor, CstCoolantSys.SteamCondensor.coolingRate)
    // #endregion
    // #region Over board dump valve
    this.OverboardDumpValve = new Valve(CoolantSysTxt.OverboardDumpValve, this.SwAvailable)
    this.OverboardDumpValve.cbNowOpen = () => {
      this.FwCoolerDsGen.CoolingCircuitComplete = true
      this.FwCoolerStartAir.CoolingCircuitComplete = true
      this.SteamCondensor.CoolingCircuitComplete = true
    }
    this.OverboardDumpValve.cbNowClosed = () => {
      this.FwCoolerDsGen.CoolingCircuitComplete = false
      this.FwCoolerStartAir.CoolingCircuitComplete = false
      this.SteamCondensor.CoolingCircuitComplete = false
    }
    // #endregion
    // #region FW Expand tank
    this.FwExpandTank = new Tank(CoolantSysTxt.FwExpandTank, CstCoolantSys.FwExpandTank.TankVolume)
    this.FwExpandTank.AddEachStep = CstCoolantSys.FwExpandTank.TankAddStep
    this.FwExpandTank.RemoveEachStep = CstChanges.DrainStep

    const FwMakeUp = new Tank('Fresh water make up', 1e6, 1e6)
    this.FwIntakeValve = new Valve(CoolantSysTxt.FwIntakeValve, FwMakeUp)
    this.FwIntakeValve.cbNowOpen = () => {
      this.FwExpandTank.Adding = true
    }
    this.FwIntakeValve.cbNowClosed = () => {
      this.FwExpandTank.Adding = false
    }
    this.FwDrainValve = new Valve(CoolantSysTxt.FwDrainValve, this.FwExpandTank)
    this.FwDrainValve.cbNowOpen = () => {
      this.FwExpandTank.AmountRemovers += 1
    }
    this.FwDrainValve.cbNowClosed = () => {
      this.FwExpandTank.AmountRemovers -= 1
    }
    // #endregion
    // #region DsGen  Lubrication cooler (secundaire FW circuit)
    this.DsGenLubCooler = new Cooler(CoolantSysTxt.DsGenLubCooler, CstCoolantSys.DsGenLubCooler.coolingRate)
    this.DsGenLubCooler.CoolingCircuitComplete = true // TODO check if no Fw outlet valve is needed
    // TODO set (via Simulator Thick?): if DsGen 1 slump has lub,circulation valve is open, (filter  is selected)
    this.DsGenLubCooler.HotCircuitComplete = true
    // #endregion
    // #region Start air cooler (secundaire FW circuit)
    this.StartAirCooler = new Cooler(CoolantSysTxt.StartAirCooler, CstCoolantSys.StartAirCooler.coolingRate)
    this.StartAirCooler.CoolingCircuitComplete = true // TODO check if no Fw outlet valve is needed
    // TODO set (via Simulator Thick?): if DsGen 1 slump has lub,circulation valve is open, (filter  is selected)
    this.StartAirCooler.HotCircuitComplete = true
    // #endregion
    makeAutoObservable(this)
  }

  Thick() {
    this.AuxPump.Providers = this.SeaChestLowSuctionIntakeValve.Content
      + this.SeaChestHighSuctionIntakeValve.Content
    this.AuxPump.Thick()

    this.SuctionPump1.Providers = this.SeaChestLowSuctionIntakeValve.Content
      + this.SeaChestHighSuctionIntakeValve.Content
    this.SuctionPump1.Thick()

    this.SuctionPump2.Providers = this.SeaChestLowSuctionIntakeValve.Content
      + this.SeaChestHighSuctionIntakeValve.Content
    this.SuctionPump2.Thick()

    this.SwAvailable.Inside = this.AuxPump.Content
      + this.SuctionPump1.Content
      + this.SuctionPump2.Content

    this.OverboardDumpValve.Source = this.SwAvailable

    this.FwCoolerDsGen.CoolingProviders = this.SwAvailable.Inside
    this.FwCoolerDsGen.HotCircuitComplete = this.DsGenLubCooler.hasCooling
    this.FwCoolerDsGen.Thick()

    this.FwCoolerStartAir.CoolingProviders = this.SwAvailable.Inside
    this.FwCoolerStartAir.HotCircuitComplete = this.StartAirCooler.hasCooling
    this.FwCoolerStartAir.Thick()

    this.SteamCondensor.CoolingProviders = this.SwAvailable.Inside
    this.SteamCondensor.Thick()

    this.FwExpandTank.Thick()

    // hot side of Fw DsGen 1 cooler is complete  if Lub cooler has cooling (has fresh water)
    this.DsGenLubCooler.CoolingProviders = this.FwExpandTank.Content
    this.DsGenLubCooler.isCooling = this.DsGenLubCooler.isCooling && this.FwCoolerDsGen.hasCooling
    this.DsGenLubCooler.Thick()
    this.FwCoolerDsGen.HotCircuitComplete = this.DsGenLubCooler.hasCooling

    // hot side of Fw DsGen 2 cooler is complete  if Lub cooler has cooling (has fresh water)
    this.StartAirCooler.CoolingProviders = this.FwExpandTank.Content
    this.StartAirCooler.isCooling = this.StartAirCooler.isCooling && this.FwCoolerStartAir.hasCooling
    this.StartAirCooler.Thick()
    this.FwCoolerStartAir.HotCircuitComplete = this.StartAirCooler.hasCooling
  }
}
