import Simulator from '../Simulator'
import { CstAirSys, CstCoolantSys, CstDsFuelSys, CstLubSys, CstPowerSys, CstStartConditions, CstSteamSys } from '../Cst'
import CstTxt from '../CstTxt'

let sim: Simulator

beforeEach(() => {
  sim = new Simulator()
})

describe('Get available start conditions', () => {
  test('List of available conditions', () => {
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
      expect(error.message).toBe(`Unknown startcondition : '${tryCondition}'`)
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
    const { DsFuelSys: FuelSys } = sim
    expect(FuelSys.DsStorage.Tank.Content).toBe(CstDsFuelSys.DsStorageTank.TankVolume)
    expect(FuelSys.DsService.OutletValve.Content).toBe(CstDsFuelSys.DsServiceTank.TankVolume)
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
    const { PowerSys: { MainBus1, DsGen }, DsFuelSys: { DsService } } = sim
    sim.SetStartConditions(CstStartConditions.RunningDsGen1)
    expect(DsService.Tank.Content).toBeCloseTo(CstDsFuelSys.DsServiceTank.TankVolume - CstDsFuelSys.DieselGenerator.Consumption.Diesel)
    expect(DsGen.isRunning).toBeTruthy()
    sim.Thick()
    expect(MainBus1.Content).toBe(CstPowerSys.Voltage)
    // startup already did a Thick so breakers could be closed
    // so consumption is here on step 2
    expect(DsService.Tank.Content).toBeCloseTo(CstDsFuelSys.DsServiceTank.TankVolume - CstDsFuelSys.DieselGenerator.Consumption.Diesel * 2)

    sim.Thick()
    // so consumption is here on step 3
    expect(DsService.Tank.Content).toBeCloseTo(CstDsFuelSys.DsServiceTank.TankVolume - CstDsFuelSys.DieselGenerator.Consumption.Diesel * 3)

  })
  test('Seawater suction pump 1 running , Aux pump stopped ', () => {
    const { CoolingSeaWaterSys } = sim
    sim.SetStartConditions(CstStartConditions.SeaWaterCoolingSupplyPump1Running)
    expect(CoolingSeaWaterSys.SuctionPump1.isRunning).toBeTruthy()
    expect(CoolingSeaWaterSys.AuxPump.isRunning).toBeFalsy()
  })
  test('Boiler has steam', () => {
    const { SteamSys: { Boiler }, DsFuelSys: { DsService }, PowerSys: { DsGen } } = sim
    sim.SetStartConditions(CstStartConditions.BoilerOperational)
    sim.Thick()
    expect(Boiler.HasFlame).toBeTruthy()
    expect(Boiler.AutoFlame).toBeTruthy()
    expect(Boiler.Temperature).toBe(CstSteamSys.Boiler.OperatingTemp + CstSteamSys.Boiler.TempAddStep)
    expect(Boiler.Pressure).toBeCloseTo(CstSteamSys.Boiler.OperatingPressure, 0)
    // DsGen in running and Boiler has flame ==> diesel consumption 
    expect(DsGen.isRunning).toBeTruthy()
    // startup already did a 4 Thick so this is consumption step 5
    expect(DsService.Tank.Content).toBeCloseTo(CstDsFuelSys.DsServiceTank.TankVolume -
      CstDsFuelSys.DieselGenerator.Consumption.Diesel * 5
      - CstDsFuelSys.SteamBoiler.Consumption.Diesel
      , 1 // percision for test
    )

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
  test('Diesel purification running', () => {
    const { DsFuelSys: { DsPurification, DsService } } = sim
    sim.SetStartConditions(CstStartConditions.DsFuelPurificationRunning)
    sim.Thick()
    expect(DsPurification.isRunning).toBeTruthy()
    expect(DsService.IntakeValve.Content).toBe(CstDsFuelSys.Purification.Volume)
  })
})