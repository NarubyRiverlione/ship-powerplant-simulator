const { makeObservable, action } = require('mobx')
const TankWithValves = require('../Components/TankWithValves')
const Valve = require('../Components/Valve')

const { CstFuelSys, CstTxt } = require('../Cst')
const { FuelSysTxt } = CstTxt
/*
Shore Valve --> (intake valve) DsStorage (outlet valve) --> (intake valve) DsService (outlet valve)
                                (drain)                                     (drain)
*/
module.exports = class FuelSystem {
  constructor() {
    makeObservable(this, { Thick: action })
    // #region Intake valve from shore to diesel storage tank
    this.DsShoreValve = new Valve(FuelSysTxt.DsShoreFillValve)
    this.DsShoreValve.Source = { Content: () => CstFuelSys.ShoreVolume }
    // if both shore and storage intake valves are open --> filling
    this.DsShoreValve.cbNowOpen = () => {
      if (this.DsStorage.IntakeValve.isOpen) this.DsStorage.Tank.Adding = true
    }
    this.DsShoreValve.cbNowClosed = () => {
      this.DsStorage.Tank.Adding = false
    }
    // #endregion

    // #region Diesel storage tank,
    // filled from shore via the intake valve, outlet valve to service intake valve
    this.DsStorage = new TankWithValves(FuelSysTxt.DsStorageTank,
      CstFuelSys.DsStorageTank.TankVolume, 0, this.DsShoreValve)
    // fixed fill rate from shore
    this.DsStorage.Tank.AddEachStep = CstFuelSys.DsStorageTank.TankAddStep

    //  Outlet valve and service intake valve are open --> removing
    this.DsStorage.OutletValve.cbNowOpen = () => {
      // only transfer from storage to service tank
      // if this outlet and service inlet valve are both is open
      if (this.DsService.IntakeValve.isOpen) {
        this.DsStorage.Tank.Removing = true
        this.DsService.Tank.Adding = true
      }
    }
    // #endregion

    // #region Diesel service tank,
    // filled from the storage outlet valve
    this.DsService = new TankWithValves(FuelSysTxt.DsServiceTank,
      CstFuelSys.DsServiceTank.TankVolume, 0, this.DsStorage.OutletValve)

    this.DsService.Tank.cbFull = () => {
      this.DsStorage.Tank.RemoveEachStep = 0 // -= CstFuelSys.DsServiceTank.TankAddStep
    }
    this.DsService.Tank.cbAdded = (added) => {
      // storage tank is Ratio bigger then service tank
      this.DsStorage.Tank.RemoveEachStep = added / CstFuelSys.RatioStorageServiceTanks
    }

    // as both outlet valves and service intake valve needs to be closed to transfer
    // and this outlet  is now open --> stop transfer
    this.DsStorage.OutletValve.cbNowClosed = () => {
      this.DsStorage.Tank.Removing = false
      this.DsService.Tank.Adding = false
    }
    // #endregion
  }

  Thick() {
    this.DsStorage.Tank.RemoveEachStep = 0

    this.DsService.Tank.AddEachStep = (this.DsStorage.Tank.Content() === 0)
      // stop filling service tank if storage is empty
      ? 0
      // restart filling service  tank if storage isn't empty
      : CstFuelSys.DsServiceTank.TankAddStep

    // service tank needs first to Thick to detect full
    // -> stop from removing from storage
    this.DsService.Thick()
    this.DsStorage.Thick()
  }
}
