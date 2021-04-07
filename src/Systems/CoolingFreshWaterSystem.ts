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
** Fresh water cooling circuits**
Fresh water Expand tank
|
|->- Fresh water Start Air cooler->-|
|                                             |
|-<- Fresh water Diesel generator Lubrication cooler -<-|

*/
/* eslint-enable max-len */


export default class CoolingFreshWaterSystem {
  // Sea water cools the Fresh water coolers
  FwCoolerDsGen: Cooler
  FwCoolerStartAir: Cooler

  FwExpandTank: Tank
  FwIntakeValve: Valve
  FwDrainValve: Valve

  // Fresh water coolers cools a system
  DsGenLubCooler: Cooler
  StartAirCooler: Cooler

  constructor(
    _FwCoolerDsGen: Cooler,
    _FwCoolerStartAir: Cooler,
    mainBus = new PowerBus('dummy mainBus'),
    emergencyBus = new PowerBus('dummy emergency power bus'),
  ) {
    this.FwCoolerDsGen = _FwCoolerDsGen
    this.FwCoolerStartAir = _FwCoolerStartAir

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
    // DsGen Lubrication cooler (secundaire FW circuit)
    this.DsGenLubCooler = new Cooler(CoolantSysTxt.DsGenLubCooler)

    // Start air cooler (secundaire FW circuit)
    this.StartAirCooler = new Cooler(CoolantSysTxt.StartAirCooler)
    this.StartAirCooler.HotCircuitComplete = true

    // TODO pump between FW dsgen cooler and Ds gen Lub cooler via emergency bus

    // TODO pump between FW start air cooler and Start air cooler via main bus

    makeAutoObservable(this)
  }

  Thick() {
    this.FwExpandTank.Thick()

    // FW Ds Gen needs enough fresh water in hot circuit to be cooling
    this.FwCoolerDsGen.HotCircuitComplete = this.FwExpandTank.Content > CstCoolantSys.FwExpandTank.MinForCooling
    // Lub DsGen cooler cool circuit is ok if  FW cooler ds gen is cooling
    this.DsGenLubCooler.CoolCircuitComplete = this.FwCoolerDsGen.IsCooling

    // FW Start air Gen needs enough fresh water in hot circuit to be cooling
    this.FwCoolerStartAir.HotCircuitComplete = this.FwExpandTank.Content > CstCoolantSys.FwExpandTank.MinForCooling
    // Lub Start air cooler cool circuit is ok if  FW cooler start air is cooling
    this.StartAirCooler.CoolCircuitComplete = this.FwCoolerStartAir.IsCooling
  }
}
