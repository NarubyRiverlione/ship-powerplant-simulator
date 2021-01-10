import { makeAutoObservable } from 'mobx'
import TankWithValves from "../Components/TankWithValves";
import Tank from "../Components/Tank";
import Item from "../Components/Item";
import Valve from "../Components/Valve";
import Pump from "../Components/ElectricPump";
import PowerBus from "../Components/PowerBus";
import Boiler from "../Components/Boiler";
import { CstSteamSys } from '../Cst'
import CstTxt from '../CstTxt'
const { SteamSysTxt } = CstTxt



export default class SteamSystem {
  FeedWaterSupply: TankWithValves
  FeedWaterPump: Pump
  Boiler: Boiler

  constructor(mainBus1: PowerBus, fuelSource: Item) {
    //#region Feed Water
    const FeedWaterMakeup = new Tank('dummy feed water makeup tank', 1e6, 1e6)
    const FeedWaterMakeUpValve = new Valve('dummy feed water makeup valve, always open', FeedWaterMakeup)
    FeedWaterMakeUpValve.Open()
    this.FeedWaterSupply = new TankWithValves(SteamSysTxt.FeedWaterSupply, CstSteamSys.FeedWaterSupply.TankVolume, 0, FeedWaterMakeUpValve)
    this.FeedWaterSupply.Tank.AddEachStep = CstSteamSys.FeedWaterSupply.TankAddStep

    this.FeedWaterPump = new Pump(SteamSysTxt.FeedWaterPump, mainBus1, CstSteamSys.FeedWaterPump)
    //#endregion

    //#region Boiler

    this.Boiler = new Boiler(SteamSysTxt.Boiler.Name, this.FeedWaterPump, fuelSource)
    //#endregion
    makeAutoObservable(this)
  }

  Thick() {
    this.FeedWaterSupply.Thick()

    this.FeedWaterPump.Providers = this.FeedWaterSupply.OutletValve.Content
    this.FeedWaterPump.Thick()

    this.Boiler.Thick()
  }
}