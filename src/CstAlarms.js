const AlarmCode = {
  LowDsStorageTank: 1,
  EmptyDsStorageTank: 2,
  LowDsServiceTank: 3,
  EmptyDsServiceTank: 4,
  LowLubStorageTank: 5,
  EmptyLubStorageTank: 6
}

const AlarmDescription = {
  [AlarmCode.LowDsStorageTank]: 'Diesel storage tank level is low',
  [AlarmCode.EmptyDsStorageTank]: 'Diesel storage tank is empty',
  [AlarmCode.LowDsServiceTank]: 'Diesel service tank level is low',
  [AlarmCode.EmptyDsServiceTank]: 'Diesel service tank is empty',
  [AlarmCode.LowLubStorageTank]: 'Lubrication storage tank level is low',
  [AlarmCode.EmptyLubStorageTank]: 'Lubrication storage  tank is empty'
}

const AlarmLevel = {
  FuelSys: {
    LowDsStorage: 25,
    LowDsService: 25
  },
  LubSys: {
    LowStorage: 25
  }
}
module.exports = { AlarmCode, AlarmDescription, AlarmLevel }
