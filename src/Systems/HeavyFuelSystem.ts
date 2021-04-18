import { makeAutoObservable } from 'mobx'
import HeatedTankWithValves from "../Components/HeatedTankWithValves";
import Valve, { iValve } from "../Components/Valve";
import Tank from '../Components/Tank'

import { CstHfFuelSys } from "../Cst";
import CstTxt from '../CstTxt'
import ElectricPump from "../Components/Appliances/ElectricPump";
import PowerBus from "../Components/PowerBus";

const { FuelSysTxt } = CstTxt

export default class HeavyFuelSystem {
  HfShoreValve: Valve
  HfForeBunker: HeatedTankWithValves
  HfAftBunker: HeatedTankWithValves
  HfPortBunker: HeatedTankWithValves
  HfStarboardBunker: HeatedTankWithValves
  HfPump: ElectricPump
  HfPumpOutletValve: iValve
  HfSettelingTank: HeatedTankWithValves

  constructor(mainSteamValve: iValve, mainBus: PowerBus) {
    const dummyShore = new Tank('Shore as tank', 10e6, 10e6)
    this.HfShoreValve = new Valve(FuelSysTxt.HfShoreValve, dummyShore)

    this.HfForeBunker = new HeatedTankWithValves(FuelSysTxt.HfForeBunker, CstHfFuelSys.HfForeBunker.TankVolume,
      0, this.HfShoreValve, mainSteamValve, CstHfFuelSys.HfPumpVolume)
    this.HfForeBunker.IntakeValve.Volume = CstHfFuelSys.HfForeBunker.IntakeValveVolume
    this.HfForeBunker.SetpointTemp = CstHfFuelSys.TempSetpoint
    this.HfForeBunker.HeatingStep = CstHfFuelSys.HeatingStep

    this.HfAftBunker = new HeatedTankWithValves(FuelSysTxt.HfAftBunker, CstHfFuelSys.HfAftBunker.TankVolume,
      0, this.HfShoreValve, mainSteamValve, CstHfFuelSys.HfPumpVolume)
    this.HfAftBunker.IntakeValve.Volume = CstHfFuelSys.HfAftBunker.IntakeValveVolume
    this.HfAftBunker.SetpointTemp = CstHfFuelSys.TempSetpoint
    this.HfAftBunker.HeatingStep = CstHfFuelSys.HeatingStep

    this.HfPortBunker = new HeatedTankWithValves(FuelSysTxt.HfPortBunker, CstHfFuelSys.HfPortBunker.TankVolume,
      0, this.HfShoreValve, mainSteamValve, CstHfFuelSys.HfPumpVolume)
    this.HfPortBunker.IntakeValve.Volume = CstHfFuelSys.HfPortBunker.IntakeValveVolume
    this.HfPortBunker.SetpointTemp = CstHfFuelSys.TempSetpoint
    this.HfPortBunker.HeatingStep = CstHfFuelSys.HeatingStep

    this.HfStarboardBunker = new HeatedTankWithValves(FuelSysTxt.HfStarboardBunker, CstHfFuelSys.HfStarboardBunker.TankVolume,
      0, this.HfShoreValve, mainSteamValve, CstHfFuelSys.HfPumpVolume)
    this.HfStarboardBunker.IntakeValve.Volume = CstHfFuelSys.HfStarboardBunker.IntakeValveVolume
    this.HfStarboardBunker.SetpointTemp = CstHfFuelSys.TempSetpoint
    this.HfStarboardBunker.HeatingStep = CstHfFuelSys.HeatingStep


    this.HfPump = new ElectricPump(FuelSysTxt.HfPump, mainBus, CstHfFuelSys.HfPumpVolume)
    this.HfPumpOutletValve = new Valve(FuelSysTxt.HfPumpOutletValve, this.HfPump)

    this.HfSettelingTank = new HeatedTankWithValves(FuelSysTxt.HfSettelingTank, CstHfFuelSys.HfSettelingTank.TankVolume,
      0, this.HfPumpOutletValve, mainSteamValve, CstHfFuelSys.HfSettelingTank.OutletValveVolume)
    this.HfSettelingTank.IntakeValve.Volume = CstHfFuelSys.HfSettelingTank.IntakeValveVolume
    this.HfSettelingTank.SetpointTemp = CstHfFuelSys.TempSetpoint

    makeAutoObservable(this)
  }


  get HasOutlet() { return this.HfForeBunker.OutletValve.Content !== 0 || this.HfAftBunker.OutletValve.Content !== 0 || this.HfPortBunker.OutletValve.Content !== 0 || this.HfStarboardBunker.OutletValve.Content !== 0 }

  Thick() {
    // first heated tanks to determine if there temperature is at the setpoint to provide content to there outlet valve
    this.HfForeBunker.Thick()
    this.HfAftBunker.Thick()
    this.HfPortBunker.Thick()
    this.HfStarboardBunker.Thick()

    this.HfPump.Providers = this.HfForeBunker.OutletValve.Content + this.HfAftBunker.OutletValve.Content + this.HfPortBunker.OutletValve.Content + this.HfStarboardBunker.OutletValve.Content
    this.HfPump.Thick()

    this.HfSettelingTank.Thick()

    // settling intake valve has only content if circuit is complete
    //  (outlet bunker open + pump running + outlet pump valve open + intake setteling open)

    // RemoveThisStep will only have effect next Thick !
    // don't use Tank.Inside direct as this bypass the empty check

    // FIXME : when more then one bunk outlet is open, all bunk tanks will be transfering the pump volume
    // it should be spread amounts the open tanks

    this.HfForeBunker.Tank.RemoveThisStep = this.HfSettelingTank.Tank.AddThisStep
    this.HfAftBunker.Tank.RemoveThisStep = this.HfSettelingTank.Tank.AddThisStep
    this.HfPortBunker.Tank.RemoveThisStep = this.HfSettelingTank.Tank.AddThisStep
    this.HfStarboardBunker.Tank.RemoveThisStep = this.HfSettelingTank.Tank.AddThisStep


  }


}