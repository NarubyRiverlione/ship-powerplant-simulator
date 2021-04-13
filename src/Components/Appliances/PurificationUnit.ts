import Appliance from "./Appliance";
import PowerBus from "../PowerBus";
import Valve from "../Valve";
import Tank from "../Tank";
import { CstFuelSys } from "../../Cst";
import CstTxt from '../../CstTxt'

const { PurificationTxt } = CstTxt

const dummySteamMainValve = new Valve('dummy main steam valve', new Tank('dummy steam source', 0, 0))

export default class PurificationUnit extends Appliance {
  IntakeValve: Valve
  SteamIntakeValve: Valve


  constructor(name: string, rate: number, sourceValve: Valve,
    powerbus = new PowerBus('dummy powerbus'),
    steamSourceValve = dummySteamMainValve
  ) {
    super(name, powerbus, rate)

    this.IntakeValve = new Valve(PurificationTxt.IntakeValve, sourceValve)
    this.SteamIntakeValve = new Valve(PurificationTxt.SteamIntakeValve, steamSourceValve)
  }
  get HasSteam() { return this.SteamIntakeValve.Content >= CstFuelSys.Purification.SteamNeeded }

  Thick() {
    // cannot run without intake
    this.isRunning = this.isRunning && this.IntakeValve.Content > 0
    // cannot run without enough steam
    this.isRunning = this.isRunning && this.HasSteam
    super.Thick()
  }

}