const { CstBoundaries } = require('../Cst')
const Generator = require('../Components/Generator')
const Breaker = require('../Components/Breaker')
const PowerBus = require('../Components/PowerBus')

module.exports = class PowerSystem {
  constructor() {
    this.ShoreBreaker = new Breaker('Shore breaker')
    this.ShoreBreaker.Providers = CstBoundaries.PowerSys.Shore
    this.ShoreBreaker.RatedFor = CstBoundaries.PowerSys.Shore + 2000 // todo use case?

    this.MainBreaker1 = new Breaker('Main bus 1 breaker')
    this.MainBus1 = new PowerBus('Main bus 1')
    this.Providers = 0
  }

  ConnectShore() {
    this.ShoreBreaker.Close(
      this.Providers += this.ShoreBreaker.Providers
    )
  }

  DisconnectShore() {
    this.ShoreBreaker.Open()
    this.Providers -= this.ShoreBreaker.Providers
  }

  Thick() {
    this.MainBreaker1.Providers = this.Providers
    this.MainBreaker1.Thick()

    this.MainBus1.Providers = this.MainBreaker1.isOpen ? 0 : this.MainBreaker1.Providers
    this.MainBus1.Thick()
  }
}
