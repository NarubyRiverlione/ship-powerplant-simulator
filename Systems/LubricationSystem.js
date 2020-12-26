const Valve = require('../Components/Valve')
const Tank = require('../Components/Tank')
const { CstTxt, CstLubSys } = require('../Cst')

const { LubSysTxt } = CstTxt
module.exports = class LubSys {
  constructor() {
    this.LubStorageTank = new Tank(LubSysTxt.LubStorageTank, CstLubSys.LubStorageTank.TankVolume)
    this.LubStorageTank.AddEachStep = CstLubSys.LubStorageTank.TankAddStep

    this.LubShoreIntakeValve = new Valve(LubSysTxt.LubShoreFillValve)
    this.LubShoreIntakeValve.Source = { Content: () => CstLubSys.ShoreVolume }
    this.LubShoreIntakeValve.cbNowOpen = () => {
      this.LubStorageTank.Adding = true
    }
    this.LubShoreIntakeValve.cbNowClosed = () => {
      this.LubStorageTank.Adding = false
    }

    this.LubStorageOutletValve = new Valve(LubSysTxt.LubStorageOutletValve)
    this.LubStorageOutletValve.Source = this.LubStorageTank
  }

  Thick() {
    this.LubStorageTank.Thick()
  }
}
