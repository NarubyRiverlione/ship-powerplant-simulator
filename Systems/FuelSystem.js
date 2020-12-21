const Tank = require('../Components/Tank')
const Valve = require('../Components/Valve')

const { CstFuelSys, CstTxt } = require('../Cst')
const { FuelSysTxt } = CstTxt

module.exports = class FuelSystem {
  constructor() {
    // #region Diesel storage tank, filled from shore via the intake valve
    this.DieselTank = new Tank(FuelSysTxt.DsStorageTank, CstFuelSys.DsStorageTank.TankVolume)
    this.DieselTank.Name = FuelSysTxt.DsStorage
    this.DieselTank.AddEachStep = CstFuelSys.DsStorageTank.TankAddStep
    // #endregion

    // #region Diesel service tank, filled from the storage line via the service intake valve
    this.DsServiceTank = new Tank(FuelSysTxt.DsStorageTank, CstFuelSys.DsServiceTank.TankVolume)
    this.DsServiceTank.Name = FuelSysTxt.DsServiceTank
    this.DsServiceTank.cbFull = () => { this.DieselTank.RemoveEachStep -= CstFuelSys.DsServiceTank.TankAddStep }
    // #endregion

    // #region Intake valve from shore to diesel storage tank
    this.DieselShoreFillValve = new Valve({ Content: CstFuelSys.ShoreVolume })
    this.DieselShoreFillValve.Name = FuelSysTxt.DsShoreFillValve
    this.DieselShoreFillValve.cbNowClosed = () => {
      this.DieselTank.Adding = true
    }
    this.DieselShoreFillValve.cbNowOpen = () => {
      this.DieselTank.Adding = false
    }
    // #endregion

    // #region Outlet valve from diesel storage tank to storage line
    this.DsStorageOutletValve = new Valve(this.DieselTank)
    this.DsStorageOutletValve.Name = FuelSysTxt.DsStorageOutletValve
    this.DsStorageOutletValve.cbNowClosed = () => {
      // only transfer from storage to service tank
      // if this outlet and service inlet valve are both is closed
      if (!this.DsServiceIntakeValve.isOpen) {
        this.DieselTank.Removing = true
        this.DsServiceTank.Adding = true
        this.DieselTank.RemoveEachStep += CstFuelSys.DsServiceTank.TankAddStep
      }
    }
    // as both outlet valves and service intake valve needs to be open to transfer
    // and this outlet  is now closing --> stop transfer
    this.DsStorageOutletValve.cbNowOpen = () => {
      this.DieselTank.Removing = false
      this.DsServiceTank.Adding = false
      // stop removing form storage may bee other target are also draining the storage
      this.DieselTank.RemoveEachStep -= CstFuelSys.DsServiceTank.TankAddStep
    }
    // #endregion

    // #region Intake service valve
    this.DsServiceIntakeValve = new Valve(this.DsStorageOutletValve)
    this.DsServiceIntakeValve.Name = FuelSysTxt.DsServiceIntakeValve
    this.DsServiceIntakeValve.cbNowClosed = () => {
      // only transfer from storage to service tank
      // if the outlet storage and this service inlet valve are both closed
      if (!this.DsStorageOutletValve.isOpen) {
        this.DieselTank.Removing = true
        this.DsServiceTank.Adding = true
        // add removing from storage, may bee other target are also draining the storage
        this.DieselTank.RemoveEachStep += CstFuelSys.DsServiceTank.TankAddStep
      }
    }
    // as both outlet valves and service intake valve needs to be open to transfer
    // and this inlet  is now closing --> stop transfer
    this.DsServiceIntakeValve.cbNowOpen = () => {
      this.DieselTank.Removing = false
      this.DsServiceTank.Adding = false
      // stop removing form storage, may bee other target are also draining the storage
      this.DieselTank.RemoveEachStep -= CstFuelSys.DsServiceTank.TankAddStep
    }
    // #endregion
  }

  Thick() {
    this.DsServiceTank.AddEachStep = (this.DieselTank.Content() === 0)
      // stop filling service tank if storage is empty
      ? 0
      // restart filling service  tank if storage isn't empty
      : CstFuelSys.DsServiceTank.TankAddStep

    this.DieselTank.Thick()
    this.DsServiceTank.Thick()
  }
}
