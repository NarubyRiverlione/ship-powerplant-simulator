import {
  CstAirSys, CstCoolantSys, CstDsFuelSys, CstLubSys, CstPowerSys, CstSteamSys,
} from './Constants/Cst'
import { Sim } from './Sim'

export const SetFuelTanksFull = (sim: Sim) => {
  const { DsFuelSys } = sim
  DsFuelSys.DsService.Tank.Inside = CstDsFuelSys.DsServiceTank.TankVolume
  DsFuelSys.DsService.OutletValve.Open()
  DsFuelSys.DsStorage.Tank.Inside = CstDsFuelSys.DsStorageTank.TankVolume
}
export const SetLubTanksFull = (sim: Sim) => {
  const { LubSys } = sim
  LubSys.Storage.Tank.Inside = CstLubSys.StorageTank.TankVolume
  LubSys.Storage.OutletValve.Open()
}
export const SetEmergencyStartAir = (sim: Sim) => {
  const { AirSys } = sim
  AirSys.EmergencyReceiver.Tank.Inside = CstAirSys.EmergencyReceiver.TankPressure
  AirSys.EmergencyReceiver.OutletValve.Open()
}
export const SetEmergencyPower = (sim: Sim) => {
  const { PowerSys: { EmergencyGen } } = sim
  EmergencyGen.Start()
}
export const SetSeawaterCoolingAuxRunning = (sim: Sim) => {
  const { CoolingSeaWaterSys } = sim
  const { SeaChestLowSuctionIntakeValve, AuxPump, OverboardDumpValve } = CoolingSeaWaterSys
  SetEmergencyPower(sim)
  OverboardDumpValve.Open()
  SeaChestLowSuctionIntakeValve.Open()
  sim.Thick()
  AuxPump.Start()
}
export const SetFreshwaterCooling = (sim: Sim) => {
  const { CoolingFreshWaterSys: { FwExpandTank, FwPumpDsGen } } = sim
  SetEmergencyPower(sim)
  SetSeawaterCoolingAuxRunning(sim)
  FwExpandTank.Inside = CstCoolantSys.FwExpandTank.TankVolume
  FwPumpDsGen.Start()
  sim.Thick()
}
export const RunningDsGen1 = (sim: Sim) => {
  SetFuelTanksFull(sim)
  SetLubTanksFull(sim)
  SetEmergencyStartAir(sim)
  SetSeawaterCoolingAuxRunning(sim)
  SetFreshwaterCooling(sim)
  const { PowerSys } = sim
  const { DsGen: DsGen1, MainBreaker1, DsGenBreaker: DsGenBreaker1 } = PowerSys

  DsGen1.LubSlump.Inside = CstPowerSys.DsGen.Slump.MinForLubrication
  DsGen1.FuelIntakeValve.Open()
  DsGen1.AirIntakeValve.Open()
  DsGen1.Start()
  sim.Thick()
  DsGenBreaker1.Close()
  MainBreaker1.Close()
}
export const SeaWaterCoolingSupplyPump1Running = (sim: Sim) => {
  RunningDsGen1(sim)
  sim.Thick()
  const { CoolingSeaWaterSys } = sim
  CoolingSeaWaterSys.SuctionPump1.Start()
  // sim.Thick()
  CoolingSeaWaterSys.AuxPump.Stop()
  // sim.Thick()
}
export const BoilerOperational = (sim: Sim) => {
  SeaWaterCoolingSupplyPump1Running(sim)
  sim.Thick()
  const { SteamSys, DsFuelSys } = sim
  const {
    FeedWaterSupply, FuelPump, FuelSourceValve, Boiler,
  } = SteamSys
  const { FuelIntakeValve } = Boiler
  FeedWaterSupply.Tank.Inside = CstSteamSys.FeedWaterSupply.TankVolume
  Boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
  DsFuelSys.DsService.OutletValve.Open()
  FuelSourceValve.Open()
  FuelIntakeValve.Open()
  FuelPump.Start()
  sim.Thick()
  Boiler.Ignite()
  Boiler.Temperature = CstSteamSys.Boiler.OperatingTemp
  Boiler.AutoFlame = true
}
export const BoilerDeliversSteam = (sim: Sim) => {
  BoilerOperational(sim)
  sim.Thick()
  const { SteamSys } = sim
  const { MainSteamValve } = SteamSys
  MainSteamValve.Open()
}
export const DsFuelPurificationRunning = (sim: Sim) => {
  BoilerDeliversSteam(sim)
  const { DsFuelSys: { DsStorage, DsPurification, DsService } } = sim
  DsStorage.OutletValve.Open()
  DsPurification.IntakeValve.Open()
  DsService.IntakeValve.Open()
  DsPurification.SteamIntakeValve.Open()
  sim.Thick()
  DsPurification.Start()
  sim.Thick()
}
