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
const CstServerIP = '0.0.0.0'
const CstServerPort = 9090

const CstHelpTxt = `
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
    `

const CstUnknownTxt = {
  Service: 'Unknown station',
  Action: 'Unknown action',
  Cmd: 'Unknown command',
  UseHelp: 'use \'cli  help\' for more information'
}

module.exports = {
  CstUnknownTxt,
  CstHelpTxt,
  CstServerIP,
  CstServerPort,
  CstCmd,
  CstActions,
  CstService
}
