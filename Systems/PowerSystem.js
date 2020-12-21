const { CstBoundaries } = require('../Cst')
const Generator = require('../Components/Generator')
const Breaker = require('../Components/Breaker')
const PowerBus = require('../Components/PowerBus')
const { PowerSys: CstPower } = CstBoundaries
/*
                Shore -->-- ShoreBreaker -->|               |-<--- Emergency generator
==== PROVIDERS  =============================================
                        |
                   MainBreaker1
                        |
                        |
                    MainBus1
                        |

*/
module.exports = class PowerSystem {
  constructor() {
    this.Providers = 0 // sum of all providers, can be connected to main busses
    // #region Shore power
    this.ShoreBreaker = new Breaker('Shore breaker')
    this.ShoreBreaker.Providers = CstPower.Shore
    this.ShoreBreaker.RatedFor = CstPower.Shore + 2000 // todo use case?
    // #endregion
    // #region Mainbus & breaker
    this.MainBreaker1 = new Breaker('Main bus 1 breaker')
    this.MainBus1 = new PowerBus('Main bus 1')
    // #endregion
    // #region Emergence Generator
    this.EmergencyBus = new PowerBus('Emergency bus')
    this.EmergencyGen = new Generator('Emergency generator', CstPower.EmergencyBus.RatedFor)
    // emergency generator doesn't need cooling nor lubrication
    this.EmergencyGen.HasCooling = true; this.EmergencyGen.HasLubrication = true
    // TODO emergency generator needs fuel ?
    this.EmergencyGen.HasFuel = true
    // #endregion
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
    // already connected to Shore and start emergency generator --> generator trips
    if (!this.ShoreBreaker.isOpen && this.EmergencyGen.isRunning) this.EmergencyGen.Stop()

    /* Also recalculate Providers form zero  */
    // emergency generator connect to Providers
    this.Providers = this.EmergencyGen.isRunning ? CstPower.EmergencyBus.RatedFor : 0
    // shore connects to Providers
    this.Providers += this.ShoreBreaker.isOpen ? 0 : CstPower.Shore
    // emergency bus takes from shore or emergency generator
    // TODO takes also for diesel generator(s)
    this.EmergencyBus.Providers = this.Providers
    this.EmergencyBus.Thick()

    //  main breaker is connected to Provides
    this.MainBreaker1.Providers = this.Providers
    this.MainBreaker1.Thick() // check if main breaker is tripped
    // main bus is connected to main breaker
    this.MainBus1.Providers = this.MainBreaker1.isOpen ? 0 : this.MainBreaker1.Providers
    this.MainBus1.Thick() // check if mainBus has voltage
  }
}
