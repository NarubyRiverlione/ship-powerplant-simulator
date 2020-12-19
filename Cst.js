const CstServerIP = '0.0.0.0'
const CstServerPort = 9090

const CstService = {
  Air: 'air',
  Power: 'power',
  Fuel: 'fuel',
  Help: 'help',
  Coolant: 'coolant',
  Simulation: 'sim'
}

const CstActions = {
  Status: 'status',
  Reset: 'reset',
  Shore: 'shore',
  DsGen1: 'dsgen1',
  DsStorageTank: 'dsstorgetank',
  DsServiceTank: 'dsservicetank',
  DsShoreIntakeValve: 'dsshoreintakevalve',
  DsStorageOutletValve: 'dsstorageoutletvalve',
  DsServiceInletValve: 'dsserviceinletvalve'
}

const CstCmd = {
  Start: 'start',
  Stop: 'stop',
  Info: 'info',
  Connect: 'connect',
  Disconnect: 'disconnect',
  Open: 'open',
  Close: 'close'
}

const CstTxt = {
  HelpTxt: `
  Control the engine via the 'station' 'action' 'command'
      * Stations *        * Actions *             * Commands *
      ${CstService.Simulation}    ${CstActions.Status}    ${CstCmd.Info} 
      ${CstService.Simulation}    ${CstActions.Status}    ${CstCmd.Start} 
      ${CstService.Simulation}    ${CstActions.Status}    ${CstCmd.Stop} 
    
      ${CstService.Fuel}    ${CstActions.DieselTank}    ${CstCmd.Info}
      ${CstService.Fuel}    ${CstActions.DieselIntakeValve}    ${CstCmd.Info}
      ${CstService.Fuel}    ${CstActions.DieselIntakeValve}    ${CstCmd.Open}
      ${CstService.Fuel}    ${CstActions.DieselIntakeValve}    ${CstCmd.Close}
      General action for all stations: ${CstActions.Info}  
      `,
  UnknownTxt: {
    Service: 'Unknown station',
    Action: 'Unknown action',
    Cmd: 'Unknown command',
    UseHelp: 'use \'cli  help\' for more information'
  },

  SimulationTxt: {
    Stopped: 'Simulation not running',
    Started: 'Simulation is running'
  },
  PowerTxt: {
    Connected: 'connected',
    Disconnected: 'disconnected',
    Running: 'running',
    NotRunning: 'not running'
  },
  FuelSysTxt: {
    DsStorageTank: 'Diesel storage tank',
    DsServiceTank: 'Diesel service tank',
    DsShoreFillValve: 'Diesel shore fill valve',
    DsStorageOutletValve: 'Diesel storage outlet valve',
    DsServiceIntakeValve: 'Diesel service intake valve'
  }
}

const CstBoundaries = {
  Power: { Max: 440, Min: 0 }
}

const CstChanges = {
  Interval: 1000
}

const CstFuelSys = {
  ShoreVolume: 1000000,
  DsStorageTank: {
    TankVolume: 2500,
    TankAddStep: 50
    //  TankRemoveStep: 10
  },
  DsServiceTank: {
    TankVolume: 1000,
    TankAddStep: 10
    //   TankRemoveStep: 1
  }

}

module.exports = {
  CstCmd,
  CstService,
  CstServerIP,
  CstServerPort,
  CstBoundaries,
  CstChanges,
  CstActions,
  CstTxt,
  CstFuelSys
}
