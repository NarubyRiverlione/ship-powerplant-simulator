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
*/
/* eslint-enable max-len */


export default class CoolingSeaWaterSystem {
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
    this.FwCoolerDsGen = new Cooler(CoolantSysTxt.FwCoolerDsGen)
    this.FwCoolerStartAir = new Cooler(CoolantSysTxt.FwCoolerStartAir)
    this.SteamCondensor = new Cooler(CoolantSysTxt.SteamCondensor)
    // #endregion
    // #region Over board dump valve
    this.OverboardDumpValve = new Valve(CoolantSysTxt.OverboardDumpValve, this.SwAvailable)
    // this.OverboardDumpValve.cbNowOpen = () => {
    //   this.FwCoolerDsGen.CoolCircuitComplete = true
    //   this.FwCoolerStartAir.CoolCircuitComplete = true
    //   this.SteamCondensor.CoolCircuitComplete = true
    // }
    this.OverboardDumpValve.cbNowClosed = () => {
      this.FwCoolerDsGen.CoolCircuitComplete = false
      this.FwCoolerStartAir.CoolCircuitComplete = false
      this.SteamCondensor.CoolCircuitComplete = false
    }
    // #endregion
    makeAutoObservable(this)
  }

  CheckCoolCircuit() {
    return (this.SeaChestHighSuctionIntakeValve.isOpen || this.SeaChestLowSuctionIntakeValve.isOpen) && this.OverboardDumpValve.isOpen
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


    this.FwCoolerDsGen.CoolCircuitComplete = this.CheckCoolCircuit() &&
      (this.AuxPump.isRunning || this.SuctionPump1.isRunning || this.SuctionPump2.isRunning)

    this.FwCoolerStartAir.CoolCircuitComplete = this.CheckCoolCircuit() &&
      (this.SuctionPump1.isRunning || this.SuctionPump2.isRunning)

    this.SteamCondensor.CoolCircuitComplete = this.CheckCoolCircuit() &&
      (this.SuctionPump1.isRunning || this.SuctionPump2.isRunning)

  }
}
