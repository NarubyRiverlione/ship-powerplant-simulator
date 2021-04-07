import Simulator from '../Simulator'
import { CstAirSys, CstFuelSys, CstLubSys, CstPowerSys, CstStartConditions } from '../Cst'
import CstTxt from '../CstTxt'

let sim: Simulator

beforeEach(() => {
  sim = new Simulator()
})

describe('Get available start conditions', () => {
  test('List of conditions', () => {
    const conditions = sim.GetStartConditions()
    expect(conditions).toBe(CstTxt.SimulationTxt.StartConditionsTxt)
  })
})
describe('Use start conditions', () => {
  test('Undefined start condition', () => {
    const tryCondition = 'Undefined'
    try {
      sim.SetStartConditions(tryCondition)
    }
    catch (error) {
      expect(error.message).toBe(CstTxt.SimulationTxt.StartConditionsTxt.Undefined + tryCondition)
    }
  })

  test('Full fuel tanks , diesel available via open service outlet valves', () => {
    sim.SetStartConditions(CstStartConditions.SetFuelTanksFull)
    sim.Thick()
    const { FuelSys } = sim
    expect(FuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.TankVolume)
    expect(FuelSys.DsService.OutletValve.Content).toBe(CstFuelSys.DsServiceTank.TankVolume)
  })
  test('Full Lub tank available via open outlet valve', () => {
    sim.SetStartConditions(CstStartConditions.SetLubTanksFull)
    sim.Thick()
    expect(sim.LubSys.Storage.OutletValve.Content).toBe(CstLubSys.StorageTank.TankVolume)
  })
  test('Emergency power via emergency generator', () => {
    sim.SetStartConditions(CstStartConditions.SetEmergencyPower)
    sim.Thick()
    const { PowerSys: { EmergencyBus, EmergencyGen } } = sim
    expect(EmergencyBus.Content).toBe(CstPowerSys.Voltage)
  })
  test('Emergency start air available via open outlet valve', () => {
    sim.SetStartConditions(CstStartConditions.SetEmergencyStartAir)
    sim.Thick()
    expect(sim.AirSys.EmergencyReceiver.OutletValve.Content).toBe(CstAirSys.EmergencyReceiver.TankPressure)
  })
  test('Sea water cooling available via Aux pump', () => {
    sim.SetStartConditions(CstStartConditions.SetSeawaterCoolingAuxRunning)
    sim.Thick()
    const { CoolingFreshWaterSys: { FwCoolerDsGen, FwCoolerStartAir } } = sim
    expect(FwCoolerDsGen.CoolCircuitComplete).toBeTruthy()
    expect(FwCoolerStartAir.CoolCircuitComplete).toBeFalsy()
  })
  test('Fresh water cooling available', () => {
    sim.SetStartConditions(CstStartConditions.SetFreshwaterCooling)
    sim.Thick()
    const { CoolingFreshWaterSys: { DsGenLubCooler, FwCoolerDsGen } } = sim
    expect(FwCoolerDsGen.IsCooling).toBeTruthy()
    expect(DsGenLubCooler.CoolCircuitComplete).toBeTruthy()

  })
  test('Diesel generator 1 running', () => {
    sim.SetStartConditions(CstStartConditions.RunningDsGen1)
    sim.Thick()
    const { PowerSys: { MainBus1, DsGen } } = sim
    expect(DsGen.isRunning).toBeTruthy()
    expect(DsGen.isRunning).toBeTruthy()
    expect(DsGen.isRunning).toBeTruthy()
    expect(MainBus1.Content).toBe(CstPowerSys.Voltage)
  })
})