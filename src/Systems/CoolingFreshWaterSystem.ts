import { makeAutoObservable } from 'mobx'
import { CstCoolantSys, CstChanges } from '../Cst'
import CstTxt from '../CstTxt'
const { CoolantSysTxt } = CstTxt

import Tank from '../Components/Tank'
import Valve from '../Components/Valve'
import Pump from '../Components/Appliances/ElectricPump'
import Cooler from '../Components/Cooler'
import PowerBus from '../Components/PowerBus'

/* eslint-disable max-len */
/*
** Fresh water cooling circuits**
                                  Fresh water Expand tank
                                      |         |
  |->- Start Air compressor  cooler->-|         |->- Diesel generator Lubrication cooler -<-|
  |                                   |         |                                           |
Pump FW Air cooler (Main bus)         |        Pump Diesel generator cooler (Emergency Bus) |
  |                                   |         |                                           |
  |-<- Fresh water Start Air cooler-<-|         |-<- Fresh water Diesel generator cooler -<-|
              ||                                            ||
              Sea water cooling Systems                     Sea water cooling system       

*/
/* eslint-enable max-len */


export default class CoolingFreshWaterSystem {
  // Sea water cools the Fresh water coolers
  FwCoolerDsGen: Cooler
  FwCoolerStartAir: Cooler
  // Fresh water supply
  FwExpandTank: Tank
  FwIntakeValve: Valve
  FwDrainValve: Valve
  // system coolers
  DsGenLubCooler: Cooler
  StartAirCooler: Cooler
  // Fresh water pumps
  FwPumpDsGen: Pump
  FwPumpStartAir: Pump

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

    //  pump between FW dsgen cooler and Ds gen Lub cooler via emergency bus
    this.FwPumpDsGen = new Pump(CoolantSysTxt.FwPumpDsGen, emergencyBus, CstCoolantSys.FwPumpDsGen)

    //  pump between FW start air cooler and Start air cooler via main bus
    this.FwPumpStartAir = new Pump(CoolantSysTxt.FwCoolerStartAir, mainBus, CstCoolantSys.FwPumpStartAir
    )
    makeAutoObservable(this)
  }

  Thick() {
    this.FwExpandTank.Thick()

    this.FwPumpDsGen.Providers = this.FwExpandTank.Content
    this.FwPumpDsGen.Thick()

    this.FwPumpStartAir.Providers = this.FwExpandTank.Content
    this.FwPumpStartAir.Thick()

    // FW Ds Gen needs pump running and enough fresh water in hot circuit to be cooling
    this.FwCoolerDsGen.HotCircuitComplete = this.FwPumpDsGen.isRunning && this.FwExpandTank.Content > CstCoolantSys.FwExpandTank.MinForCooling
    // Lub DsGen cooler cool circuit is ok if  FW cooler ds gen is cooling
    this.DsGenLubCooler.CoolCircuitComplete = this.FwCoolerDsGen.IsCooling

    // FW Start air Gen needs pump running and enough fresh water in hot circuit to be cooling
    this.FwCoolerStartAir.HotCircuitComplete = this.FwPumpStartAir.isRunning && this.FwExpandTank.Content > CstCoolantSys.FwExpandTank.MinForCooling
    // Lub Start air cooler cool circuit is ok if  FW cooler start air is cooling
    this.StartAirCooler.CoolCircuitComplete = this.FwCoolerStartAir.IsCooling
  }
}
