import Valve, { iValve } from './Valve'
import TankWithValves from './TankWithValves'
import { CstChanges, CstSteamSys } from '../Cst'
import { computed, makeObservable } from 'mobx'

export default class HeatedTankWithValves extends TankWithValves {
  SteamIntakeValve: iValve
  Temperature: number
  SetpointTemp: number
  MinSteam: number
  HeatingStep: number

  constructor(tankName: string, volume: number, startContent: number,
    sourceValve: iValve, mainSteamValve: iValve) {
    super(tankName, volume, startContent, sourceValve)
    this.SteamIntakeValve = new Valve(`${tankName} - Steam intake valve`, mainSteamValve)
    this.Temperature = 25
    this.SetpointTemp = this.Temperature
    this.MinSteam = CstSteamSys.Boiler.OperatingPressure
    this.HeatingStep = 0

    makeObservable(this, {
      HasSteam: computed,
      IsAtSetpoint: computed
    })

  }

  get HasSteam() { return this.SteamIntakeValve.Content >= this.MinSteam }
  get IsAtSetpoint() { return this.Temperature === this.SetpointTemp }

  Thick() {
    super.Thick()
    // steam heats up until setpoint is reached
    if (this.HasSteam && this.Temperature < this.SetpointTemp) { this.Temperature += this.HeatingStep }
    // without steam cool down until global start temp
    if (!this.HasSteam && this.Temperature > CstChanges.StartTemp) { this.Temperature -= this.HeatingStep }
  }

}