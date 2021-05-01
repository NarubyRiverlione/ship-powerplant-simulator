import PowerSystem from './Systems/PowerSystem'
import DieselFuelSystem from './Systems/DieselFuelSystem'
import HeavyFuelSystem from './Systems/HeavyFuelSystem'
import AirSystem from './Systems/AirSystem'
import CoolingFreshWaterSystem from './Systems/CoolingFreshWaterSystem'
import CoolingSeaWaterSystem from './Systems/CoolingSeaWaterSystem'
import LubricationSystem from './Systems/LubricationSystem'
import AlarmSystem from './Systems/AlarmSystem'
import SteamSystem from './Systems/SteamSystem'

export interface Sim {
  Running?: NodeJS.Timeout;
  AlarmSys: AlarmSystem;
  DsFuelSys: DieselFuelSystem;
  HfFuelSys: HeavyFuelSystem;
  LubSys: LubricationSystem;
  AirSys: AirSystem;
  PowerSys: PowerSystem;
  CoolingSeaWaterSys: CoolingSeaWaterSystem;
  CoolingFreshWaterSys: CoolingFreshWaterSystem;
  SteamSys: SteamSystem;
  Thick: () => void
}
