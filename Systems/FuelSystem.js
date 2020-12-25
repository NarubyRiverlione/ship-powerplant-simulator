const { makeObservable, action } = require('mobx')
const Tank = require('../Components/Tank')
const Valve = require('../Components/Valve')

const { CstFuelSys, CstTxt } = require('../Cst')
const { FuelSysTxt } = CstTxt

module.exports = class FuelSystem {
  constructor() {
    makeObservable(this, { Thick: action })
    // #region Diesel storage tank, filled from shore via the intake valve
    this.DieselTank = new Tank(FuelSysTxt.DsStorageTank, CstFuelSys.DsStorageTank.TankVolume)
    this.DieselTank.AddEachStep = CstFuelSys.DsStorageTank.TankAddStep
    // #endregion

    // #region Diesel service tank, filled from the storage line via the service intake valve
    this.DsServiceTank = new Tank(FuelSysTxt.DsServiceTank, CstFuelSys.DsServiceTank.TankVolume)
    this.DsServiceTank.cbFull = () => {
      this.DieselTank.RemoveEachStep = 0 // -= CstFuelSys.DsServiceTank.TankAddStep
    }
    this.DsServiceTank.cbAdded = (added) => {
      this.DieselTank.RemoveEachStep = added
    }
    // #endregion

    // #region Intake valve from shore to diesel storage tank
    this.DieselShoreFillValve = new Valve(FuelSysTxt.DsShoreFillValve)
    this.DieselShoreFillValve.Source = { Content: () => CstFuelSys.ShoreVolume }
    this.DieselShoreFillValve.cbNowOpen = () => {
      this.DieselTank.Adding = true
    }
    this.DieselShoreFillValve.cbNowClosed = () => {
      this.DieselTank.Adding = false
    }
    // #endregion

    // #region Outlet valve from diesel storage tank to storage line
    this.DsStorageOutletValve = new Valve(FuelSysTxt.DsStorageOutletValve)
    this.DsStorageOutletValve.Source = this.DieselTank
    this.DsStorageOutletValve.cbNowOpen = () => {
      // only transfer from storage to service tank
      // if this outlet and service inlet valve are both is open
      if (this.DsServiceIntakeValve.isOpen) {
        this.DieselTank.Removing = true
        this.DsServiceTank.Adding = true
        // this.DieselTank.RemoveEachStep += CstFuelSys.DsServiceTank.TankAddStep
      }
    }
    // as both outlet valves and service intake valve needs to be closed to transfer
    // and this outlet  is now open --> stop transfer
    this.DsStorageOutletValve.cbNowClosed = () => {
      this.DieselTank.Removing = false
      this.DsServiceTank.Adding = false
      // if (this.DsServiceIntakeValve.isOpen) {
      //   // stop removing form storage if serviceIntake is also closed
      //   // may be other target are also draining the storage
      //   this.DieselTank.RemoveEachStep -= CstFuelSys.DsServiceTank.TankAddStep
      // }
    }
    // #endregion

    // #region Intake service valve
    this.DsServiceIntakeValve = new Valve(FuelSysTxt.DsServiceIntakeValve)
    this.DsServiceIntakeValve.Source = this.DsStorageOutletValve
    this.DsServiceIntakeValve.cbNowOpen = () => {
      // only transfer from storage to service tank
      // if the outlet storage and this service inlet valve are both open
      if (this.DsStorageOutletValve.isOpen) {
        this.DieselTank.Removing = true
        this.DsServiceTank.Adding = true
        // add removing from storage, may bee other target are also draining the storage
        //  this.DieselTank.RemoveEachStep += CstFuelSys.DsServiceTank.TankAddStep
      }
    }
    // as both outlet valves and service intake valve needs to be closed to transfer
    // and this inlet  is now open --> stop transfer
    this.DsServiceIntakeValve.cbNowClosed = () => {
      this.DieselTank.Removing = false
      this.DsServiceTank.Adding = false
      // if (this.DsStorageOutletValve.isOpen) {
      //   // stop removing from storage if DsOutlet is also closed,
      //   //  may be other target are also draining the storage.
      //    this.DieselTank.RemoveEachStep -= CstFuelSys.DsServiceTank.TankAddStep
      // }
    }

    // #endregion

    // #region Outlet service valve
    this.DsServiceOutletValve = new Valve(FuelSysTxt.DsServiceOutletValve)
    this.DsServiceOutletValve.Source = this.DsServiceTank
    // #endregion
  }

  Thick() {
    this.DieselTank.RemoveEachStep = 0

    this.DsServiceTank.AddEachStep = (this.DieselTank.Content() === 0)
      // stop filling service tank if storage is empty
      ? 0
      // restart filling service  tank if storage isn't empty
      : CstFuelSys.DsServiceTank.TankAddStep

    // service tank needs first to Thick to detect full
    // -> stop from removing from storage
    this.DsServiceTank.Thick()
    this.DieselTank.Thick()
  }
}
