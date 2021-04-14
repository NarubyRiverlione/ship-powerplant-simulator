import Simulator from '../Simulator'
import { CstAirSys, CstCoolantSys, CstFuelSys, CstLubSys, CstPowerSys, CstStartConditions, CstSteamSys } from '../Cst'
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
  test('Cold & dark', () => {
    sim.SetStartConditions(CstStartConditions.ColdAndDark)
    sim.Thick()
    const { PowerSys } = sim
    expect(PowerSys.EmergencyBus.Content).toBe(0)
    expect(PowerSys.MainBus1.Content).toBe(0)
  })
  test('Full fuel tanks , diesel available via open service outlet valves', () => {
    sim.SetStartConditions(CstStartConditions.SetFuelTanksFull)
    sim.Thick()
    const { FuelSys } = sim
    expect(FuelSys.DsStorage.Tank.Content).toBe(CstFuelSys.DsStorageTank.IntakeValveVolume)
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
    const { CoolingFreshWaterSys: { DsGenLubCooler, FwCoolerDsGen, FwPumpDsGen, FwExpandTank } } = sim
    expect(FwPumpDsGen.CheckPower).toBeTruthy()
    expect(FwPumpDsGen.Providers).toBe(CstCoolantSys.FwExpandTank.TankVolume)
    expect(FwPumpDsGen.isRunning).toBeTruthy()
    expect(FwCoolerDsGen.IsCooling).toBeTruthy()
    expect(DsGenLubCooler.CoolCircuitComplete).toBeTruthy()

  })
  test('Diesel generator 1 running', () => {
    sim.SetStartConditions(CstStartConditions.RunningDsGen1)
    sim.Thick()
    const { PowerSys: { MainBus1, DsGen } } = sim
    expect(DsGen.isRunning).toBeTruthy()
    expect(MainBus1.Content).toBe(CstPowerSys.Voltage)
  })
  test('Seawater suction pump 1 running , Aux pump stopped ', () => {
    const { CoolingSeaWaterSys } = sim
    sim.SetStartConditions(CstStartConditions.SeaWaterCoolingSupplyPump1Running)
    expect(CoolingSeaWaterSys.SuctionPump1.isRunning).toBeTruthy()
    expect(CoolingSeaWaterSys.AuxPump.isRunning).toBeFalsy()
  })
  test('Boiler has steam', () => {
    const { SteamSys: { Boiler } } = sim
    sim.SetStartConditions(CstStartConditions.BoilerOperational)
    sim.Thick()
    expect(Boiler.HasFlame).toBeTruthy()
    expect(Boiler.AutoFlame).toBeTruthy()
    expect(Boiler.Temperature).toBe(CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.TempAddStep)
    expect(Boiler.Pressure).toBeCloseTo(CstSteamSys.Boiler.OperatingPressure, 0)
  })
  test('Boiler delivers steam', () => {
    const { SteamSys: { SteamCondensor, MainSteamValve } } = sim
    sim.SetStartConditions(CstStartConditions.BoilerDeliversSteam)
    sim.Thick()
    expect(MainSteamValve.isOpen).toBeTruthy()
    expect(MainSteamValve.Content).not.toBe(0)
    expect(SteamCondensor.HotCircuitComplete).toBeTruthy()
    expect(SteamCondensor.CoolCircuitComplete).toBeTruthy()
  })
})