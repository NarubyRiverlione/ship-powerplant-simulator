import { makeAutoObservable } from 'mobx'
import { CstChanges, CstStartConditions } from './Cst'
import PowerSystem from './Systems/PowerSystem'
import FuelSystem from './Systems/FuelSystem'
import AirSystem from './Systems/AirSystem'
import CoolingSystem from './Systems/CoolingSystem'
import LubricationSystem from './Systems/LubricationSystem'
import AlarmSystem from './Systems/AlarmSystem'
import SteamSystem from './Systems/SteamSystem'
import * as StartCondition from './Startups'
import CstTxt from './CstTxt'

const { SimulationTxt: { StartConditionsTxt } } = CstTxt

export default class Simulator {
  Running?: NodeJS.Timeout // ref setInterval
  AlarmSys!: AlarmSystem
  FuelSys!: FuelSystem
  LubSys!: LubricationSystem
  AirSys!: AirSystem
  PowerSys!: PowerSystem
  CoolingSys!: CoolingSystem
  SteamSys!: SteamSystem

  constructor() {
    this.Reset()
    makeAutoObservable(this)
  }
  Reset() {
    this.AlarmSys = new AlarmSystem()
    this.FuelSys = new FuelSystem(this.AlarmSys)
    this.LubSys = new LubricationSystem(this.AlarmSys)
    this.CoolingSys = new CoolingSystem()
    this.AirSys = new AirSystem(this.CoolingSys.StartAirCooler)

    this.PowerSys = new PowerSystem(
      this.FuelSys.DsService.OutletValve,
      this.LubSys.Storage.OutletValve,
      this.AirSys.EmergencyReceiver.OutletValve,
      this.CoolingSys.DsGenLubCooler
    )

    this.SteamSys = new SteamSystem(this.PowerSys.MainBus1, this.FuelSys.DsService)

    this.AirSys.EmergencyCompressor.Bus = this.PowerSys.EmergencyBus
    this.AirSys.StartAirCompressor.Bus = this.PowerSys.MainBus1

    this.CoolingSys.SuctionPump1.Bus = this.PowerSys.MainBus1
    this.CoolingSys.SuctionPump2.Bus = this.PowerSys.MainBus1
    this.CoolingSys.AuxPump.Bus = this.PowerSys.EmergencyBus

    this.Running = undefined
  }

  Thick() {
    this.PowerSys.Thick()
    this.LubSys.Thick()
    this.AirSys.Thick()
    this.CoolingSys.Thick()
    this.SteamSys.Thick()
    this.FuelSys.Thick()  //must be evaluated last to consume fuel form other systems
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
  SetStartConditions(condition: string) {
    switch (condition) {
      case CstStartConditions.SetFuelTanksFull:
        StartCondition.SetFuelTanksFull(this)
        break
      case CstStartConditions.SetLubTanksFull:
        StartCondition.SetLubTanksFull(this)
        break
      case CstStartConditions.SetEmergencyStartAir:
        StartCondition.SetEmergencyStartAir(this)
        break
      case CstStartConditions.SetEmergencyPower:
        StartCondition.SetEmergencyPower(this)
        break
      case CstStartConditions.SetSeawaterCoolingAuxRunning:
        StartCondition.SetSeawaterCoolingAuxRunning(this)
        break
      case CstStartConditions.SetFreshwaterCooling:
        StartCondition.SetFreshwaterCooling(this)
        break
      case CstStartConditions.RunningDsGen1:
        StartCondition.RunningDsGen1(this)
        break
      default:
        throw new Error(StartConditionsTxt.Undefined + condition)
    }
  }
  GetStartConditions() {
    return StartConditionsTxt
  }
}
