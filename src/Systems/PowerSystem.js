const { makeAutoObservable } = require('mobx')

const { CstPowerSys, CstFuelSys } = require('../Cst')
const Generator = require('../Components/Generator')
const DieselGenerator = require('../Components/DieselGenerator')
const Breaker = require('../Components/Breaker')
const PowerBus = require('../Components/PowerBus')

/*
** Switchboard **
Diesel generator 1 -->  Breaker DsGen 1
                                  |         ShoreBreaker <-- Shore
                                  |                |       |-<--- Emergency generator
==== PROVIDERS  ============================================
                        |                     | (switch)
                   MainBreaker1               |
                        |                   Emergency Bus
                        |
                    MainBus1
                        |

** Diesel generator 1 **
-- (Diesel service tank) ----------->-- Diesel oil intake valve
-- (Emergency start air receiver) -->-- Start air intake valve
-- (Lubrication service tank) ------>-- Lubrication intake valve
-- (Lubrication cooler DsGen 1) ---->--
*/
module.exports = class PowerSystem {
  constructor(DsGen1FuelValve, DsGen1LubValve, DsGen1AirValve, LubCooler) {
    this.Providers = 0 // sum of all providers, can be connected to main busses
    //  Shore power
    this.ShoreBreaker = new Breaker('Shore breaker')
    this.ShoreBreaker.Providers = CstPowerSys.Shore
    this.ShoreBreaker.RatedFor = CstPowerSys.Shore + 2000 // TODO use case rated for in breaker?

    // Mainbus & breaker
    this.MainBreaker1 = new Breaker('Main bus 1 breaker')
    this.MainBus1 = new PowerBus('Main bus 1')

    //  Emergency Generator
    this.EmergencyBus = new PowerBus('Emergency bus')
    this.EmergencyGen = new Generator('Emergency generator', CstPowerSys.EmergencyGen.RatedFor)
    // emergency generator doesn't need cooling nor lubrication
    this.EmergencyGen.HasCooling = true; this.EmergencyGen.HasLubrication = true
    // TODO emergency generator needs fuel ?
    this.EmergencyGen.HasFuel = true

    // Diesel Generator 1
    this.DsGen1 = new DieselGenerator('Diesel generator 1',
      CstPowerSys.DsGen1.RatedFor, DsGen1FuelValve, DsGen1LubValve, DsGen1AirValve, LubCooler)
    this.DsGen1.FuelConsumption = CstFuelSys.DieselGenerator.Consumption
    this.DsGenBreaker1 = new Breaker('Breaker diesel generator 1 ')

    makeAutoObservable(this)
  }

  ConnectShore() {
    this.ShoreBreaker.Close()
    this.Providers += this.ShoreBreaker.Providers
    // if connected to shore, stop emergency generators
    this.EmergencyGen.Stop()
  }

  DisconnectShore() {
    this.ShoreBreaker.Open()
    this.Providers -= this.ShoreBreaker.Providers
  }

  Thick() {
    // already connected to Shore  and start emergency generator --> emergency generator trips
    if (!this.ShoreBreaker.isOpen && this.EmergencyGen.isRunning) this.EmergencyGen.Stop()
    // DsGen is running and breaker is closed and start emergency generator --> emergency generator trips
    if (this.DsGen1.isRunning && !this.DsGenBreaker1.isOpen && this.EmergencyGen.isRunning) this.EmergencyGen.Stop()
    // DsGen is stopped --> trip generator breaker
    if (!this.DsGen1.isRunning && !this.DsGenBreaker1.isOpen) this.DsGenBreaker1.Open()

    // Check generators
    this.EmergencyGen.Thick()
    this.DsGen1.Thick()

    // #region Providers
    /* Also recalculate Providers form zero  */
    // emergency generator connect to Providers
    this.Providers = this.EmergencyGen.isRunning ? this.EmergencyGen.Output : 0
    // shore connects to Providers
    this.Providers += this.ShoreBreaker.isOpen ? 0 : CstPowerSys.Shore
    // breaker diesel generator 1 connect to Providers
    this.Providers += this.DsGenBreaker1.isOpen ? 0 : this.DsGen1.Output
    // emergency bus takes from shore or emergency generator
    // TODO takes also for diesel generator(s)
    this.EmergencyBus.Providers = this.Providers
    this.EmergencyBus.Thick()
    // #endregion

    //  main breaker is connected to Provides
    this.MainBreaker1.Providers = this.Providers
    this.MainBreaker1.Thick() // check if main breaker is tripped
    // main bus is connected to main breaker
    this.MainBus1.Providers = this.MainBreaker1.isOpen ? 0 : this.MainBreaker1.Providers
    this.MainBus1.Thick() // check if mainBus has voltage
  }
}
