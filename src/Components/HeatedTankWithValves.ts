import Valve, { ValveInterface } from './Valve'
import TankWithValves from './TankWithValves'
import { CstChanges, CstSteamSys } from '../Constants/Cst'

export default class HeatedTankWithValves extends TankWithValves {
  SteamIntakeValve: ValveInterface
  Temperature: number
  SetpointTemp: number
  MinSteam: number
  HeatingStep: number
  OutletVolume: number

  constructor(tankName: string, volume: number, startContent: number,
    sourceValve: ValveInterface, mainSteamValve: ValveInterface, outletVolume: number, randomize = false) {
    super(tankName, volume, startContent, sourceValve, randomize)
    this.SteamIntakeValve = new Valve(`${tankName} - Steam intake valve`, mainSteamValve)
    this.Temperature = 25
    this.SetpointTemp = this.Temperature
    this.MinSteam = CstSteamSys.Boiler.OperatingPressure - 0.5 // prevent oscillation form boiler flame on / out
    this.HeatingStep = 0
    this.OutletVolume = outletVolume // remember te set volume as it's change via the setpoint (see Thick)
  }

  get HasSteam() { return this.SteamIntakeValve.Content >= this.MinSteam }

  get IsAtSetpoint() { return this.Temperature === this.SetpointTemp }

  Thick() {
    super.Thick()
    // steam heats up until setpoint is reached
    if (this.HasSteam && this.Content !== 0
      && this.Temperature < this.SetpointTemp) { this.Temperature += this.HeatingStep }
    // without steam cool down until global start temp
    if (!this.HasSteam && this.Temperature > CstChanges.StartTemp) { this.Temperature -= this.HeatingStep }

    // when not at setpoint, even an open outlet valve has no content, simulated by setting volume to zero
    this.OutletValve.Volume = !this.IsAtSetpoint ? 0 : this.OutletVolume
    if (!this.IsAtSetpoint && this.OutletValve.isOpen) this.OutletValve.Close()
  }
}
