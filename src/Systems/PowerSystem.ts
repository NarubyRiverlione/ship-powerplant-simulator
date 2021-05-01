import { makeAutoObservable } from 'mobx'

import { CstPowerSys, CstDsFuelSys } from '../Cst'
import CstTxt from '../CstTxt'
import Generator from '../Components/Generator'
import DieselGenerator from '../Components/DieselGenerator'
import Breaker from '../Components/Breaker'
import PowerBus from '../Components/PowerBus'
import { ValveInterface } from '../Components/Valve'
import Cooler from '../Components/Cooler'
import Tank from '../Components/Tank'

const { PowerTxt } = CstTxt
/*
** Switchboard **
Diesel generator -->  Breaker DsGen
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
-- (Emergency start air receiver) -->-- Start air intake valve (mim start up)
-- (Lubrication service tank) ------>-- Lubrication intake valve -->-- Slump (min level)
-- (Lubrication cooler DsGen 1) ---->--
*/
export default class PowerSystem {
  Providers: number
  ShoreBreaker: Breaker
  MainBreaker1: Breaker
  MainBus1: PowerBus
  EmergencyBus: PowerBus
  EmergencyGen: Generator
  DsGen: DieselGenerator
  DsGenBreaker: Breaker

  constructor(DsGen1FuelValve: ValveInterface,
    DsGenLubValve: ValveInterface,
    DsGenAirValve: ValveInterface,
    LubCooler: Cooler) {
    this.Providers = 0 // sum of all providers, can be connected to main busses
    //  Shore power
    // TODO use case rated for in breaker?
    this.ShoreBreaker = new Breaker(PowerTxt.ShoreBreaker, CstPowerSys.Shore + 2000)
    this.ShoreBreaker.Providers = CstPowerSys.Shore

    // Mainbus & breaker
    this.MainBreaker1 = new Breaker(PowerTxt.MainBreaker1)
    this.MainBus1 = new PowerBus(PowerTxt.MainBus1)

    //  Emergency Generator
    this.EmergencyBus = new PowerBus(PowerTxt.EmergencyBus)
    // TODO emergency generator needs fuel ?
    const dummyEmergencyFuel = new Tank('dummy emergency fuel', 1e6, 1e6)
    this.EmergencyGen = new Generator(PowerTxt.EmergencyGen, CstPowerSys.EmergencyGen.RatedFor, dummyEmergencyFuel)
    // emergency generator doesn't need cooling nor lubrication
    this.EmergencyGen.HasCooling = true; this.EmergencyGen.HasLubrication = true
    this.EmergencyGen.HasFuel = true

    // Diesel Generator
    this.DsGen = new DieselGenerator(PowerTxt.DieselGen,
      CstPowerSys.DsGen.RatedFor, DsGen1FuelValve, DsGenLubValve, DsGenAirValve, LubCooler)
    this.DsGen.FuelConsumption = CstDsFuelSys.DieselGenerator.Consumption.Diesel
    this.DsGenBreaker = new Breaker(PowerTxt.DsGenBreaker)

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
    if (this.DsGen.isRunning && !this.DsGenBreaker.isOpen && this.EmergencyGen.isRunning) this.EmergencyGen.Stop()
    // DsGen is stopped and generator breaker is closed --> trip generator breaker
    if (!this.DsGen.isRunning && !this.DsGenBreaker.isOpen) this.DsGenBreaker.Open()
    // DsGen is stopped, without Shore power and main breaker is closed --> trip main breaker
    if (!this.DsGen.isRunning && this.ShoreBreaker.isOpen && !this.MainBreaker1.isOpen) this.MainBreaker1.Open()

    // Check generators
    this.EmergencyGen.Thick()
    this.DsGen.Thick()

    // #region Providers
    this.Providers = 0
    // shore connects to Providers
    this.Providers += this.ShoreBreaker.isOpen ? 0 : CstPowerSys.Shore
    // breaker diesel generator 1 connect to Providers
    this.Providers += this.DsGenBreaker.isOpen ? 0 : this.DsGen.Output

    // emergency bus takes from shore or emergency generator or diesel gen
    this.EmergencyBus.Providers = 0
    this.EmergencyBus.Providers += this.EmergencyGen.isRunning ? this.EmergencyGen.Output : 0
    this.EmergencyBus.Providers += this.ShoreBreaker.isOpen ? 0 : CstPowerSys.Shore
    this.EmergencyBus.Providers += this.DsGenBreaker.isOpen ? 0 : this.DsGen.Output

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
