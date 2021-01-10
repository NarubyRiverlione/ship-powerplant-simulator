import { makeAutoObservable } from 'mobx'

import { CstChanges } from './Cst'
import PowerSystem from './Systems/PowerSystem'
import FuelSystem from './Systems/FuelSystem'
import AirSystem from './Systems/AirSystem'
import CoolingSystem from './Systems/CoolingSystem'
import LubricationSystem from './Systems/LubricationSystem'
import AlarmSystem from './Systems/AlarmSystem'


export default class Simulator {
  Running?: NodeJS.Timeout // ref setInterval
  AlarmSys!: AlarmSystem
  FuelSys!: FuelSystem
  LubSys!: LubricationSystem
  AirSys!: AirSystem
  PowerSys!: PowerSystem
  CoolingSys!: CoolingSystem

  constructor() {
    this.Reset()
    makeAutoObservable(this)
  }
  Reset() {
    this.AlarmSys = new AlarmSystem()
    this.FuelSys = new FuelSystem(this.AlarmSys)
    this.LubSys = new LubricationSystem(this.AlarmSys)
    this.CoolingSys = new CoolingSystem()
    this.AirSys = new AirSystem()

    this.PowerSys = new PowerSystem(
      this.FuelSys.DsService.OutletValve,
      this.LubSys.Storage.OutletValve,
      this.AirSys.EmergencyReceiver.OutletValve,
      this.CoolingSys.DsGen1LubCooler
    )

    this.AirSys.EmergencyCompressor.Bus = this.PowerSys.EmergencyBus
    this.AirSys.StartAirCompressor1.Bus = this.PowerSys.MainBus1

    this.CoolingSys.SuctionPump1.Bus = this.PowerSys.MainBus1
    this.CoolingSys.SuctionPump2.Bus = this.PowerSys.MainBus1
    this.CoolingSys.AuxPump.Bus = this.PowerSys.EmergencyBus

    this.Running = undefined
  }

  Thick() {
    this.PowerSys.Thick()
    this.FuelSys.Thick()
    this.LubSys.Thick()
    this.AirSys.Thick()
    this.CoolingSys.Thick()
  }

  Start() {
    this.Running = setInterval(() => {
      this.Thick()
    }, CstChanges.Interval)
  }

  Stop() {
    if (this.Running) {
      clearInterval(this.Running)
      this.Running = undefined
    }
  }
  Toggle() {
    if (this.Running) this.Stop()
    else this.Start()
  }
}
