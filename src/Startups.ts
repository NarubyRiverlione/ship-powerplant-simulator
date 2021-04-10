
import { CstAirSys, CstCoolantSys, CstFuelSys, CstLubSys, CstPowerSys, CstSteamSys } from "./Cst"
import Simulator from "./Simulator"

export const SetFuelTanksFull = (sim: Simulator) => {
  const { FuelSys } = sim
  FuelSys.DsService.Tank.Inside = CstFuelSys.DsServiceTank.TankVolume
  FuelSys.DsService.OutletValve.Open()
  FuelSys.DsStorage.Tank.Inside = CstFuelSys.DsStorageTank.TankVolume
}
export const SetLubTanksFull = (sim: Simulator) => {
  const { LubSys } = sim
  LubSys.Storage.Tank.Inside = CstLubSys.StorageTank.TankVolume
  LubSys.Storage.OutletValve.Open()
}
export const SetEmergencyStartAir = (sim: Simulator) => {
  const { AirSys } = sim
  AirSys.EmergencyReceiver.Tank.Inside = CstAirSys.EmergencyReceiver.TankPressure
  AirSys.EmergencyReceiver.OutletValve.Open()
}
export const SetEmergencyPower = (sim: Simulator) => {
  const { PowerSys: { EmergencyGen } } = sim
  EmergencyGen.Start()
}
export const SetSeawaterCoolingAuxRunning = (sim: Simulator) => {
  const { CoolingSeaWaterSys } = sim
  const { SeaChestLowSuctionIntakeValve, AuxPump, OverboardDumpValve } = CoolingSeaWaterSys
  SetEmergencyPower(sim)
  OverboardDumpValve.Open()
  SeaChestLowSuctionIntakeValve.Open()
  sim.Thick()
  AuxPump.Start()
}
export const SetFreshwaterCooling = (sim: Simulator) => {
  const { CoolingFreshWaterSys: { FwExpandTank, FwPumpDsGen } } = sim
  SetEmergencyPower(sim)
  SetSeawaterCoolingAuxRunning(sim)
  FwExpandTank.Inside = CstCoolantSys.FwExpandTank.TankVolume
  FwPumpDsGen.Start()
  sim.Thick()
}
export const RunningDsGen1 = (sim: Simulator) => {
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
export const SeaWaterCoolingSupplyPump1Running = (sim: Simulator) => {
  RunningDsGen1(sim)
  sim.Thick()
  const { CoolingSeaWaterSys } = sim
  CoolingSeaWaterSys.SuctionPump1.Start()
  sim.Thick()
  CoolingSeaWaterSys.AuxPump.Stop()
  sim.Thick()
}
export const BoilerOperational = (sim: Simulator) => {
  RunningDsGen1(sim)
  sim.Thick()
  const { SteamSys, FuelSys } = sim
  const { FeedWaterSupply, FuelPump, FuelSourceValve, Boiler } = SteamSys
  const { FuelIntakeValve } = Boiler
  FeedWaterSupply.Tank.Inside = CstSteamSys.FeedWaterSupply.TankVolume
  Boiler.WaterTank.Inside = CstSteamSys.Boiler.MinWaterLvlForFlame
  FuelSys.DsService.OutletValve.Open()
  FuelSourceValve.Open()
  FuelIntakeValve.Open()
  FuelPump.Start()
  sim.Thick()
  Boiler.Ignite()
  Boiler.Temperature = CstSteamSys.Boiler.OperatingTemp
  Boiler.AutoFlame = true
}
export const BoilerDeliversSteam = (sim: Simulator) => {
  BoilerOperational(sim)
  SeaWaterCoolingSupplyPump1Running(sim)
  sim.Thick()
  const { SteamSys } = sim
  const { MainSteamValve } = SteamSys
  MainSteamValve.Open()
}
