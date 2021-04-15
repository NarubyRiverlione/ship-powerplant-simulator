import { makeAutoObservable } from 'mobx'
import TankWithValves from "../Components/TankWithValves";
import Tank from "../Components/Tank";
import Valve from "../Components/Valve";
import Pump from "../Components/Appliances/ElectricPump";
import PowerBus from "../Components/PowerBus";
import Cooler from "../Components/Cooler";
import SteamBoiler from "../Components/SteamBoiler";
import { CstChanges, CstSteamSys } from '../Cst'
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
                                        
Steam diagram
       |--> Safety Release valve 
BOILER |
       |--> Steam Vent valve
       |
       |
       |==>== Main Steam valve ==>==
       |
       |==<== Steam Condensor ==<==
*/

export default class SteamSystem {
  FeedWaterSupply: TankWithValves
  FeedWaterPump: Pump

  FuelPump: Pump
  FuelSource: TankWithValves
  FuelSourceValve: Valve

  Boiler: SteamBoiler
  MainSteamValve: Valve

  SteamCondensor: Cooler

  constructor(mainBus1: PowerBus, fuelSource: TankWithValves, condensor: Cooler) {
    //#region Feed Water
    const FeedWaterMakeup = new Tank('dummy feed water makeup tank', 1e6, 1e6)
    const FeedWaterMakeUpValve = new Valve('dummy feed water makeup valve, always open', FeedWaterMakeup)
    FeedWaterMakeUpValve.Open()
    this.FeedWaterSupply = new TankWithValves(SteamSysTxt.FeedWaterSupply, CstSteamSys.FeedWaterSupply.TankVolume, 0, FeedWaterMakeUpValve)
    this.FeedWaterSupply.IntakeValve.Volume = CstSteamSys.FeedWaterSupply.IntakeValveVolume

    this.FeedWaterPump = new Pump(SteamSysTxt.FeedWaterPump, mainBus1, CstSteamSys.FeedWaterPump)
    //#endregion
    //#region  Fuel
    this.FuelSource = fuelSource
    this.FuelSourceValve = new Valve(SteamSysTxt.FuelSourceValve, fuelSource.OutletValve)
    this.FuelPump = new Pump(SteamSysTxt.FuelPump, mainBus1, CstSteamSys.FuelPump)
    //#endregion

    this.Boiler = new SteamBoiler(SteamSysTxt.Boiler.Name, this.FeedWaterPump,
      this.FuelPump, fuelSource.Tank)

    this.SteamCondensor = condensor

    //#region Main Steam valve
    this.MainSteamValve = new Valve(SteamSysTxt.Boiler.MainSteamValve, this.Boiler)
    this.MainSteamValve.cbNowOpen = () => {
      // condensor has hot side if there is steam flow (open main steam valve)
      this.SteamCondensor.HotCircuitComplete = true
    }
    this.MainSteamValve.cbNowClosed = () => {
      // no steam flow (close main steam valve) = condensor has no hot side
      this.SteamCondensor.HotCircuitComplete = false
    }
    //#endregion

    makeAutoObservable(this)
  }

  Thick() {
    //#region Feed water
    this.FeedWaterPump.Providers = this.FeedWaterSupply.OutletValve.Content
    this.FeedWaterPump.Thick()

    if (this.FeedWaterPump.Content !== 0 && this.Boiler.WaterIntakeValve.isOpen) {
      // remove from feed water storage to fill boiler
      this.FeedWaterSupply.Tank.RemoveThisStep = CstSteamSys.FeedWaterPump
    }

    this.FeedWaterSupply.Thick()

    //#endregion
    //#region  Fuel
    this.FuelPump.Providers = this.FuelSourceValve.Content !== 0
      ? this.FuelPump.Providers = this.FuelSource.Tank.Content
      : 0

    this.FuelPump.Thick()
    //#endregion

    this.Boiler.Thick()

    // cannot open main steam valve below min pressure
    if (this.MainSteamValve.isOpen && this.Boiler.Content < CstSteamSys.MinPressureForMainValve) {
      this.MainSteamValve.Close()
    }

    //  steam flow withou cooling = loss of steam == loss of water
    if (this.MainSteamValve.Content && !this.SteamCondensor.CoolCircuitComplete) {
      this.Boiler.WaterTank.Inside = this.Boiler.WaterTank.Inside - CstSteamSys.Boiler.WaterLossByNotCoolingSteam
    }

  }
}