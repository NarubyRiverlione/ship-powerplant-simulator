const Simulator = require('../src/Simulator')
const {
  CstFuelSys, CstChanges, CstLubSys, CstAirSys, CstPowerSys, CStCoolantSys
} = require('../src/Cst')
let simulator
beforeEach(() => {
  simulator = new Simulator()
  //  workaround to give DsGen1  cooling,
  //  Don't test Generator here, test simulator
  simulator.PowerSys.DsGen1.HasCooling = true
})

describe('Simulator running tests', () => {
  test('Not running after init', () => {
    expect(simulator.Running).toBeNull()
  })
  test('Running after start', done => {
    simulator.Start()
    expect(simulator.Running).not.toBeNull()
    setTimeout(() => {
      // wait for 1 thick
      simulator.Stop()
      done()
    }, CstChanges.Interval)
  })
  test('Not running after stop', () => {
    simulator.Start()
    simulator.Stop()
    expect(simulator.Running).toBeNull()
  })
  test('Stop a not running simulator (no crash :)', () => {
    simulator.Stop()
    expect(simulator.Running).toBeNull()
  })
})

describe('Fuel sys via simulator start', () => {
  test('Fill diesel storage tank from shore', () => {
    simulator.FuelSys.DsShoreValve.Open()
    simulator.FuelSys.DsStorage.IntakeValve.Open()
    simulator.Thick()
    simulator.Thick()
    expect(simulator.FuelSys.DsStorage.Tank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep * 2)
  })
})

describe('Diesel generator', () => {
  describe('Fuel from diesel service tank', () => {
    test('open service outlet valve & DsGen intake valve = has fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsService } } = simulator

      DsService.Tank.Inside = CstFuelSys.DsServiceTank.TankVolume

      //  expect(DsGen1.FuelIntakeValve.Source).toEqual(DsService.OutletValve)

      DsService.OutletValve.Open()
      expect(DsService.OutletValve.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)

      DsGen1.FuelIntakeValve.Open()
      expect(DsGen1.FuelIntakeValve.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)

      simulator.Thick()
      expect(DsGen1.HasFuel).toBeTruthy()
    })
    test('closed service outlet valve & open  DsGen intake valve = no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsService } } = simulator

      DsService.Tank.Inside = CstFuelSys.DsServiceTank.TankVolume
      expect(DsService.OutletValve.isOpen).toBeFalsy()
      expect(DsService.OutletValve.Content()).toBe(0)

      DsGen1.FuelIntakeValve.Open()
      expect(DsGen1.FuelIntakeValve.Content()).toBe(0)

      simulator.Thick()
      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('open service outlet valve & closed DsGen intake valve = no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsService } } = simulator

      DsService.Tank.Inside = CstFuelSys.DsServiceTank.TankVolume

      DsService.OutletValve.Open()
      expect(DsService.OutletValve.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)

      expect(DsGen1.FuelIntakeValve.isOpen).toBeFalsy()
      expect(DsGen1.FuelIntakeValve.Content()).toBe(0)

      simulator.Thick()
      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('close service outlet valve after both valves where open = no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsService } } = simulator

      DsService.Tank.Inside = CstFuelSys.DsServiceTank.TankVolume
      DsService.OutletValve.Open()
      DsGen1.FuelIntakeValve.Open()
      simulator.Thick()

      DsService.OutletValve.Close()
      simulator.Thick()

      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('close generator intake valve after both valves where open = no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsService } } = simulator

      DsService.Tank.Inside = CstFuelSys.DsServiceTank.TankVolume
      DsService.OutletValve.Open()
      DsGen1.FuelIntakeValve.Open()
      simulator.Thick()

      DsGen1.FuelIntakeValve.Close()
      simulator.Thick()

      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('both valves are open but service tank is empty = generator has no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsService } } = simulator
      expect(DsService.Tank.Content()).toBe(0)

      DsService.OutletValve.Open()
      expect(DsService.OutletValve.Content()).toBe(0)

      DsGen1.FuelIntakeValve.Open()
      expect(DsGen1.FuelIntakeValve.Content()).toBe(0)

      simulator.Thick()
      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('Running generator consumes fuel from service tank', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsService } } = simulator
      const { LubSys: { Storage: LubStorage } } = simulator
      const { AirSys: { EmergencyReceiver } } = simulator

      DsService.Tank.Inside = CstFuelSys.DsServiceTank.TankVolume
      DsService.OutletValve.Open()
      DsGen1.FuelIntakeValve.Open()
      simulator.Thick()
      expect(DsGen1.HasFuel).toBeTruthy()

      LubStorage.Tank.Inside = CstLubSys.StorageTank.TankVolume
      LubStorage.OutletValve.Open()
      DsGen1.LubIntakeValve.Open()
      simulator.Thick()
      expect(DsGen1.HasLubrication).toBeTruthy()

      EmergencyReceiver.Tank.Inside = CstAirSys.EmergencyReceiver.TankPressure
      EmergencyReceiver.OutletValve.Open()
      DsGen1.AirIntakeValve.Open()
      simulator.Thick()

      DsGen1.Start()
      simulator.Thick()
      expect(DsGen1.isRunning).toBeTruthy()

      expect(DsGen1.FuelConsumption).toBe(CstFuelSys.DieselGenerator.Consumption)

      expect(DsGen1.FuelProvider).toEqual(DsService.Tank)
      expect(DsGen1.FuelProvider.Removing).toBeTruthy()
      expect(DsService.Tank.Removing).toBeTruthy()
      expect(DsService.Tank.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)

      expect(DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume
        - CstFuelSys.DieselGenerator.Consumption)

      simulator.Thick()
      expect(DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume
        - CstFuelSys.DieselGenerator.Consumption * 2)

      simulator.Thick()
      expect(DsService.Tank.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume
        - CstFuelSys.DieselGenerator.Consumption * 3)
    })
  })
  describe('full startup diesel generator, startup power via emergency generator', () => {
    test('with full diesel service tank and lubrication storage tank', () => {
      const { PowerSys: { DsGen1, EmergencyGen, EmergencyBus } } = simulator
      const { FuelSys: { DsService } } = simulator
      const { LubSys: { Storage: LubStorage } } = simulator
      const { AirSys: { EmergencyReceiver, EmergencyCompressor, EmergencyOutletValve } } = simulator
      // Fuel (fake full diesel service tank)
      DsService.Tank.Inside = CstFuelSys.DsServiceTank.TankVolume
      DsService.OutletValve.Open()
      DsGen1.FuelIntakeValve.Open()
      simulator.Thick()
      expect(DsGen1.HasFuel).toBeTruthy()
      // Lubrication (fake full lub storage tank)
      LubStorage.Tank.Inside = CstLubSys.StorageTank.TankVolume
      LubStorage.OutletValve.Open()
      DsGen1.LubIntakeValve.Open()
      simulator.Thick()
      expect(DsGen1.HasLubrication).toBeTruthy()
      // startup emergency generator
      EmergencyGen.Start()
      simulator.Thick()
      expect(EmergencyBus.Voltage).toBe(CstPowerSys.Voltage)
      // startup emergency start air compressor
      EmergencyOutletValve.Open()
      EmergencyReceiver.IntakeValve.Open()
      EmergencyCompressor.Start()
      simulator.Thick()
      expect(EmergencyReceiver.Tank.Content()).toBe(CstAirSys.EmergencyCompressor.AddStep)
      // wait until enough pressure in the emergency receiver to start the diesel generator
      do {
        simulator.Thick()
      } while (EmergencyReceiver.Tank.Content() < CstAirSys.DieselGenerator.MinPressure)
      // connect start air
      EmergencyReceiver.OutletValve.Open()
      DsGen1.AirIntakeValve.Open()
      simulator.Thick()

      // startup diesel generator 1
      DsGen1.Start()
      simulator.Thick()
      expect(DsGen1.isRunning).toBeTruthy()
    })
  })
})

describe('Sea water system', () => {
  test('Aux pump runs on emergency bus with a suction valve open = aux pump has content', () => {
    const { PowerSys: { EmergencyGen, EmergencyBus } } = simulator
    const { SeaWaterCoolingSys: { SeaChestLowSuctionIntakeValve, AuxPump } } = simulator
    EmergencyGen.Start()
    simulator.Thick()
    expect(EmergencyBus.Voltage).toBe(CstPowerSys.Voltage)

    SeaChestLowSuctionIntakeValve.Open()
    AuxPump.Start()
    simulator.Thick()
    expect(AuxPump.isRunning).toBeTruthy()
    expect(AuxPump.Providers).toBe(CStCoolantSys.SeaChest)
    expect(AuxPump.Content()).toBe(CStCoolantSys.AuxSuctionPump)
  })
})
