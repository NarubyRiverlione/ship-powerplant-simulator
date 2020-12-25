const Simulator = require('../Simulator')
const { CstFuelSys, CstChanges } = require('../Cst')
let simulator
beforeEach(() => {
  simulator = new Simulator()
  //  workaround to give DsGen1  cooling, lubrication.
  //  Don't test Generator here, test simulator
  simulator.PowerSys.DsGen1.HasCooling = true
  simulator.PowerSys.DsGen1.HasLubrication = true
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
    simulator.FuelSys.DieselShoreFillValve.Open()
    simulator.Thick()
    simulator.Thick()
    expect(simulator.FuelSys.DieselTank.Content()).toBe(CstFuelSys.DsStorageTank.TankAddStep * 2)
  })
})

describe('Diesel generator', () => {
  describe('Fuel from diesel service tank', () => {
    test('open service outlet valve and DsGen intake valve = has fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsServiceOutletValve, DsServiceTank } } = simulator

      DsServiceTank.Inside = CstFuelSys.DsServiceTank.TankVolume

      //  expect(DsGen1.FuelIntakeValve.Source).toEqual(DsServiceOutletValve)

      DsServiceOutletValve.Open()
      expect(DsServiceOutletValve.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)

      DsGen1.FuelIntakeValve.Open()
      expect(DsGen1.FuelIntakeValve.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)

      simulator.Thick()
      expect(DsGen1.HasFuel).toBeTruthy()
    })
    test('closed service outlet valve + open  DsGen intake valve = no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsServiceOutletValve, DsServiceTank } } = simulator

      DsServiceTank.Inside = CstFuelSys.DsServiceTank.TankVolume
      expect(DsServiceOutletValve.isOpen).toBeFalsy()
      expect(DsServiceOutletValve.Content()).toBe(0)

      DsGen1.FuelIntakeValve.Open()
      expect(DsGen1.FuelIntakeValve.Content()).toBe(0)

      simulator.Thick()
      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('open service outlet valve +closed DsGen intake valve = no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsServiceOutletValve, DsServiceTank } } = simulator

      DsServiceTank.Inside = CstFuelSys.DsServiceTank.TankVolume

      DsServiceOutletValve.Open()
      expect(DsServiceOutletValve.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume)

      expect(DsGen1.FuelIntakeValve.isOpen).toBeFalsy()
      expect(DsGen1.FuelIntakeValve.Content()).toBe(0)

      simulator.Thick()
      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('close service outlet valve after both valves where open = no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsServiceOutletValve, DsServiceTank } } = simulator

      DsServiceTank.Inside = CstFuelSys.DsServiceTank.TankVolume
      DsServiceOutletValve.Open()
      DsGen1.FuelIntakeValve.Open()
      simulator.Thick()

      DsServiceOutletValve.Close()
      simulator.Thick()

      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('close generator intake valve after both valves where open = no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsServiceOutletValve, DsServiceTank } } = simulator

      DsServiceTank.Inside = CstFuelSys.DsServiceTank.TankVolume
      DsServiceOutletValve.Open()
      DsGen1.FuelIntakeValve.Open()
      simulator.Thick()

      DsGen1.FuelIntakeValve.Close()
      simulator.Thick()

      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test('both valves are open but service tank is empty = generator has no fuel', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsServiceOutletValve, DsServiceTank } } = simulator
      expect(DsServiceTank.Content()).toBe(0)

      DsServiceOutletValve.Open()
      expect(DsServiceOutletValve.Content()).toBe(0)

      DsGen1.FuelIntakeValve.Open()
      expect(DsGen1.FuelIntakeValve.Content()).toBe(0)

      simulator.Thick()
      expect(DsGen1.HasFuel).toBeFalsy()
    })
    test.only('Running generator consumes fuel from service tank', () => {
      const { PowerSys: { DsGen1 } } = simulator
      const { FuelSys: { DsServiceOutletValve, DsServiceTank } } = simulator

      DsServiceTank.Inside = CstFuelSys.DsServiceTank.TankVolume
      DsServiceOutletValve.Open()
      DsGen1.FuelIntakeValve.Open()
      simulator.Thick()
      DsGen1.Start()
      simulator.Thick()
      expect(DsGen1.HasFuel).toBeTruthy()
      expect(DsGen1.isRunning).toBeTruthy()

      expect(DsGen1.FuelConsumption).toBe(CstFuelSys.DieselGenerator.Consumption)
      expect(DsGen1.FuelProvider).toEqual(DsServiceTank)
      // expect(DsGen1.FuelIntakeValve.Source).toEqual(DsServiceOutletValve)
      expect(DsServiceTank.RemoveEachStep).toBe(CstFuelSys.DieselGenerator.Consumption)
      expect(DsServiceTank.Content()).toBe(CstFuelSys.DsServiceTank.TankVolume - CstFuelSys.DieselGenerator.Consumption)
    })
  })
})
