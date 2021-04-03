
import { CstAirSys, CstCoolantSys, CstFuelSys, CstLubSys, CstPowerSys } from "./Cst"
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
  const { CoolingSys } = sim
  const { SeaChestLowSuctionIntakeValve, AuxPump, OverboardDumpValve } = CoolingSys
  SetEmergencyPower(sim)
  OverboardDumpValve.Open()
  SeaChestLowSuctionIntakeValve.Open()
  sim.Thick()
  AuxPump.Start()
}
export const SetFreshwaterCooling = (sim: Simulator) => {
  const { CoolingSys: { FwExpandTank } } = sim
  FwExpandTank.Inside = CstCoolantSys.FwExpandTank.TankVolume
  SetSeawaterCoolingAuxRunning(sim)
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
