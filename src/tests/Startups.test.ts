import *  as Starts from '../Startups'
import Simulator from '../Simulator'
import { CstAirSys, CstCoolantSys, CstFuelSys, CstLubSys, CstPowerSys } from '../Cst'

let sim: Simulator

beforeEach(() => {
  sim = new Simulator()
})

describe('Starts', () => {
  test('Full fuel tanks , diesel available via open service outlet valves', () => {
    Starts.SetFuelTanksFull(sim)
    sim.Thick()
    const { FuelSys } = sim
    expect(FuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume)
    expect(FuelSys.DsService.OutletValve.Content).toBe(CstFuelSys.DsServiceTank.TankVolume)
  })
  test('Full Lub tank available via open outlet valve', () => {
    Starts.SetLubTanksFull(sim)
    sim.Thick()
    expect(sim.LubSys.Storage.OutletValve.Content).toBe(CstLubSys.StorageTank.TankVolume)
  })
  test('Emergency power via emergency generator', () => {
    Starts.SetEmergencyPower(sim)
    sim.Thick()
    const { PowerSys: { EmergencyBus, EmergencyGen } } = sim
    expect(EmergencyBus.Content).toBe(CstPowerSys.Voltage)
  })
  test('Emergency start air available via open outlet valve', () => {
    Starts.SetEmergencyStartAir(sim)
    sim.Thick()
    expect(sim.AirSys.EmergencyReceiver.OutletValve.Content).toBe(CstAirSys.EmergencyReceiver.TankPressure)
  })
  test('Sea water cooling available via Aux pump', () => {
    Starts.SetSeawaterCoolingAuxRunning(sim)
    sim.Thick()
    const { CoolingSys: { FwCoolerDsGen1, FwCoolerDsGen2 } } = sim
    expect(FwCoolerDsGen1.hasCooling).toBeTruthy()
    expect(FwCoolerDsGen2.hasCooling).toBeTruthy()
  })
  test('Fresh water cooling available', () => {
    Starts.SetFreshwaterCooling(sim)
    sim.Thick()
    const { CoolingSys: { DsGen1LubCooler, DsGen2LubCooler } } = sim
    expect(DsGen1LubCooler.isCooling).toBeTruthy()
    expect(DsGen2LubCooler.hasCooling).toBeTruthy()
  })
  test('Diesel generator 1 running', () => {
    Starts.RunningDsGen1(sim)
    sim.Thick()
    const { PowerSys: { MainBus1 } } = sim
    expect(MainBus1.Content).toBe(CstPowerSys.Voltage)
  })
})