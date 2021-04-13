import { makeAutoObservable } from 'mobx'
import { CstChanges, CstPowerSys, CstStartConditions } from './Cst'
import PowerSystem from './Systems/PowerSystem'
import FuelSystem from './Systems/FuelSystem'
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
  FuelSys!: FuelSystem
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
    this.FuelSys = new FuelSystem(this.AlarmSys)
    this.LubSys = new LubricationSystem(this.AlarmSys)
    this.CoolingSeaWaterSys = new CoolingSeaWaterSystem()
    this.CoolingFreshWaterSys = new CoolingFreshWaterSystem(
      this.CoolingSeaWaterSys.FwCoolerDsGen, this.CoolingSeaWaterSys.FwCoolerStartAir
    )

    this.AirSys = new AirSystem(this.CoolingFreshWaterSys.StartAirCooler)

    this.PowerSys = new PowerSystem(
      this.FuelSys.DsService.OutletValve,
      this.LubSys.Storage.OutletValve,
      this.AirSys.EmergencyReceiver.OutletValve,
      this.CoolingFreshWaterSys.DsGenLubCooler
    )

    this.SteamSys = new SteamSystem(this.PowerSys.MainBus1, this.FuelSys.DsService,
      this.CoolingSeaWaterSys.SteamCondensor)

    this.AirSys.EmergencyCompressor.Bus = this.PowerSys.EmergencyBus
    this.AirSys.StartAirCompressor.Bus = this.PowerSys.MainBus1

    this.CoolingSeaWaterSys.SuctionPump1.Bus = this.PowerSys.MainBus1
    this.CoolingSeaWaterSys.SuctionPump2.Bus = this.PowerSys.MainBus1
    this.CoolingSeaWaterSys.AuxPump.Bus = this.PowerSys.EmergencyBus

    this.CoolingFreshWaterSys.FwPumpDsGen.Bus = this.PowerSys.EmergencyBus
    this.CoolingFreshWaterSys.FwPumpStartAir.Bus = this.PowerSys.MainBus1

    this.FuelSys.DsPurification.Bus = this.PowerSys.MainBus1
    this.FuelSys.DsPurification.SteamIntakeValve.Source = this.SteamSys.MainSteamValve

    this.Running = undefined
  }

  Thick() {
    this.PowerSys.Thick()
    this.LubSys.Thick()
    this.AirSys.Thick()
    this.CoolingSeaWaterSys.Thick()
    this.CoolingFreshWaterSys.Thick()
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
      default:
        throw new Error(StartConditionsTxt.Undefined + condition)
    }
  }
  GetStartConditions() {
    return StartConditionsTxt
  }
}
