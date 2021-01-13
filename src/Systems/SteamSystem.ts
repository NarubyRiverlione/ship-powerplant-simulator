import { makeAutoObservable } from 'mobx'
import TankWithValves from "../Components/TankWithValves";
import Tank from "../Components/Tank";
import Item from "../Components/Item";
import Valve from "../Components/Valve";
import Pump from "../Components/ElectricPump";
import PowerBus from "../Components/PowerBus";
import Boiler from "../Components/Boiler";
import { CstChanges, CstFuelSys, CstSteamSys } from '../Cst'
import CstTxt from '../CstTxt'
const { SteamSysTxt } = CstTxt

/* 
Fuel diagram
  BOILER  -<- Fuel Intake Valve  ==<== Fuel Pump   
                                          |
                                          | ==<== Fuel intake valve
                                                   |
                                                    |==<== (fuelSourceValve = Diesel Service Outlet Valve)  
Water diagram
 BOILER   -<- Water Intake Valve ==<== Feed Water Pump 
                                        |==<== Feed Water Supply Outlet Valve 
                                        |
                                        |-<- Feed Water Supply Tank 
                                              |             |-<- Feed Water Inlet Valve -<- (Feed water Make up)
                                        Drain valve                                     
*/

export default class SteamSystem {
  FeedWaterSupply: TankWithValves
  FeedWaterPump: Pump
  Boiler: Boiler
  FuelPump: Pump
  FuelSourceValve: Valve
  FuelSourceTank: Tank

  constructor(mainBus1: PowerBus, fuelSource: Valve, fuelSourceTank: Tank) {
    //#region Feed Water
    const FeedWaterMakeup = new Tank('dummy feed water makeup tank', 1e6, 1e6)
    const FeedWaterMakeUpValve = new Valve('dummy feed water makeup valve, always open', FeedWaterMakeup)
    FeedWaterMakeUpValve.Open()
    this.FeedWaterSupply = new TankWithValves(SteamSysTxt.FeedWaterSupply, CstSteamSys.FeedWaterSupply.TankVolume, 0, FeedWaterMakeUpValve)
    this.FeedWaterSupply.Tank.AddEachStep = CstSteamSys.FeedWaterSupply.TankAddStep

    this.FeedWaterPump = new Pump(SteamSysTxt.FeedWaterPump, mainBus1, CstSteamSys.FeedWaterPump)
    //#endregion
    this.FuelSourceTank = fuelSourceTank
    this.FuelSourceValve = new Valve(SteamSysTxt.FuelSourceValve, fuelSource)
    this.FuelPump = new Pump(SteamSysTxt.FuelPump, mainBus1, CstSteamSys.FuelPump)
    this.Boiler = new Boiler(SteamSysTxt.Boiler.Name, this.FeedWaterPump,
      this.FuelPump, fuelSourceTank)

    makeAutoObservable(this)
  }

  Thick() {

    this.FeedWaterPump.Providers = this.FeedWaterSupply.OutletValve.Content
    this.FeedWaterPump.Thick()

    this.FeedWaterSupply.Tank.RemoveEachStep = 0

    if (this.FeedWaterPump.Content !== 0
      && this.Boiler.WaterIntakeValve.isOpen) {
      // remove from feed water storage to fill boiler
      this.FeedWaterSupply.Tank.AmountRemovers -= 1
      this.FeedWaterSupply.Tank.RemoveEachStep = CstSteamSys.FeedWaterPump
    }
    if (this.FeedWaterSupply.DrainValve.isOpen) {
      // (also) draining
      this.FeedWaterSupply.Tank.AmountRemovers -= 1
      this.FeedWaterSupply.Tank.RemoveEachStep += CstChanges.DrainStep
    }
    this.FeedWaterSupply.Thick()

    const fuelSourceOutlet = this.FuelSourceValve.Source as Valve
    const fuelSource = fuelSourceOutlet.Source as Tank
    this.FuelPump.Providers = fuelSource.Content
    this.FuelPump.Thick()

    this.Boiler.Thick()
  }
}