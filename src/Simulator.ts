import { makeAutoObservable } from 'mobx'
import { CstChanges, CstStartConditions } from './Cst'
import PowerSystem from './Systems/PowerSystem'
import DieselFuelSystem from './Systems/DieselFuelSystem'
import HeavyFuelSystem from './Systems/HeavyFuelSystem'
import AirSystem from './Systems/AirSystem'
import CoolingFreshWaterSystem from './Systems/CoolingFreshWaterSystem'
import CoolingSeaWaterSystem from './Systems/CoolingSeaWaterSystem'
import LubricationSystem from './Systems/LubricationSystem'
import AlarmSystem from './Systems/AlarmSystem'
import SteamSystem from './Systems/SteamSystem'
import * as StartCondition from './Startups'
import CstTxt from './CstTxt'

const { SimulationTxt: { StartConditionsTxt } } = CstTxt

export default class Simulator {
  Running?: NodeJS.Timeout // ref setInterval
  AlarmSys!: AlarmSystem
  DsFuelSys!: DieselFuelSystem
  HfFuelSys!: HeavyFuelSystem
  LubSys!: LubricationSystem
  AirSys!: AirSystem
  PowerSys!: PowerSystem
  CoolingSeaWaterSys!: CoolingSeaWaterSystem
  CoolingFreshWaterSys!: CoolingFreshWaterSystem
  SteamSys!: SteamSystem

  constructor() {
    this.Reset()
    makeAutoObservable(this)
  }
  Reset() {
    this.AlarmSys = new AlarmSystem()
    this.DsFuelSys = new DieselFuelSystem(this.AlarmSys)

    this.LubSys = new LubricationSystem(this.AlarmSys)
    this.CoolingSeaWaterSys = new CoolingSeaWaterSystem()
    this.CoolingFreshWaterSys = new CoolingFreshWaterSystem(
      this.CoolingSeaWaterSys.FwCoolerDsGen, this.CoolingSeaWaterSys.FwCoolerStartAir
    )

    this.AirSys = new AirSystem(this.CoolingFreshWaterSys.StartAirCooler)

    this.PowerSys = new PowerSystem(
      this.DsFuelSys.DsService.OutletValve,
      this.LubSys.Storage.OutletValve,
      this.AirSys.EmergencyReceiver.OutletValve,
      this.CoolingFreshWaterSys.DsGenLubCooler
    )

    this.SteamSys = new SteamSystem(this.PowerSys.MainBus1, this.DsFuelSys.DsService,
      this.CoolingSeaWaterSys.SteamCondensor)

    this.HfFuelSys = new HeavyFuelSystem(this.SteamSys.MainSteamValve, this.PowerSys.MainBus1)

    this.AirSys.EmergencyCompressor.Bus = this.PowerSys.EmergencyBus
    this.AirSys.StartAirCompressor.Bus = this.PowerSys.MainBus1

    this.CoolingSeaWaterSys.SuctionPump1.Bus = this.PowerSys.MainBus1
    this.CoolingSeaWaterSys.SuctionPump2.Bus = this.PowerSys.MainBus1
    this.CoolingSeaWaterSys.AuxPump.Bus = this.PowerSys.EmergencyBus

    this.CoolingFreshWaterSys.FwPumpDsGen.Bus = this.PowerSys.EmergencyBus
    this.CoolingFreshWaterSys.FwPumpStartAir.Bus = this.PowerSys.MainBus1

    this.DsFuelSys.DsPurification.Bus = this.PowerSys.MainBus1
    this.DsFuelSys.DsPurification.SteamIntakeValve.Source = this.SteamSys.MainSteamValve

    this.Running = undefined
  }

  Thick() {
    this.PowerSys.Thick()
    this.LubSys.Thick()
    this.AirSys.Thick()
    this.CoolingSeaWaterSys.Thick()
    this.CoolingFreshWaterSys.Thick()
    this.SteamSys.Thick()
    this.DsFuelSys.Thick()  //must be evaluated last to consume fuel from other systems
    this.HfFuelSys.Thick()
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
      case CstStartConditions.ColdAndDark:
        this.Reset()
        break
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
      case CstStartConditions.SeaWaterCoolingSupplyPump1Running:
        StartCondition.SeaWaterCoolingSupplyPump1Running(this)
        break
      case CstStartConditions.BoilerOperational:
        StartCondition.BoilerOperational(this)
        break
      case CstStartConditions.BoilerDeliversSteam:
        StartCondition.BoilerDeliversSteam(this)
        break
      case CstStartConditions.DsFuelPurificationRunning:
        StartCondition.DsFuelPurificationRunning(this)
        break
      default:
        throw new Error(`Unknown startcondition : '${condition}'`)
    }
  }
  GetStartConditions() {
    return StartConditionsTxt
  }
}
