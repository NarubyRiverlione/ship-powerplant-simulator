const { makeAutoObservable } = require('mobx')

const { CstChanges } = require('./Cst')
const PowerSystem = require('./Systems/PowerSystem')
const FuelSystem = require('./Systems/FuelSystem')
const AirSystem = require('./Systems/AirSystem')
const CoolingSystem = require('./Systems/CoolingSys')
const LubricationSystem = require('./Systems/LubricationSystem')

module.exports = class Simulator {
  constructor() {
    this.Reset()
    this.Running = null
    makeAutoObservable(this)
  }

  Reset() {
    this.Running = null // ref setInterval
    this.FuelSys = new FuelSystem()
    this.LubSys = new LubricationSystem()
    this.AirSys = new AirSystem()
    this.PowerSys = new PowerSystem(
      this.FuelSys.DsService.OutletValve,
      this.LubSys.Storage.OutletValve,
      this.AirSys.EmergencyReceiver.OutletValve
    )
    this.AirSys.EmergencyCompressor.Bus = this.PowerSys.EmergencyBus
    this.CoolingSys = new CoolingSystem(this.PowerSys.MainBus1, this.PowerSys.EmergencyBus)
    this.PowerSys.DsGen1.LubCooler = this.CoolingSys.DsGenLubCooler
  }

  Thick() {
    this.PowerSys.Thick()
    this.FuelSys.Thick()
    this.LubSys.Thick()
    this.AirSys.Thick()
    this.CoolingSys.Thick()
  }

  Start() {
    this.Running = setInterval(() => {
      this.Thick()
    }, CstChanges.Interval)
  }

  Stop() {
    if (this.Running) {
      clearInterval(this.Running)
      this.Running = null
    }
  }
}
