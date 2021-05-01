import { computed, makeObservable } from 'mobx'
import Appliance from './Appliance'
import PowerBus from '../PowerBus'
import Valve, { ValveInterface } from '../Valve'
import Tank from '../Tank'
import { CstDsFuelSys } from '../../Cst'
import CstTxt from '../../CstTxt'

const { PurificationTxt } = CstTxt

// FIXME first instantiate purification unit with dummy main steam valve
// as the Steam Sys is later instantiate in Simulator than the FuelSys
const dummySteamMainValve = new Valve('dummy main steam valve', new Tank('dummy steam source', 0, 0))

export default class PurificationUnit extends Appliance {
  IntakeValve: ValveInterface

  SteamIntakeValve: ValveInterface

  constructor(name: string, rate: number, sourceValve: ValveInterface,
    powerbus = new PowerBus('dummy powerbus')) {
    super(name, powerbus, rate)

    this.IntakeValve = new Valve(PurificationTxt.IntakeValve, sourceValve)
    this.SteamIntakeValve = new Valve(PurificationTxt.SteamIntakeValve, dummySteamMainValve)

    makeObservable(this, {
      HasSteam: computed,
    })
  }

  get HasSteam() { return this.SteamIntakeValve.Content >= CstDsFuelSys.Purification.SteamNeeded }

  Thick() {
    // cannot run without intake
    this.isRunning = this.isRunning && this.IntakeValve.Content > 0
    // cannot run without enough steam
    this.isRunning = this.isRunning && this.HasSteam
    super.Thick()
  }
}
