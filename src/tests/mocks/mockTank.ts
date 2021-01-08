import { iTank } from "../../Components/Tank"

export default class mockTank implements iTank {
  Name: string
  Inside: number
  Volume: number
  Adding: boolean
  Removing: boolean
  AddEachStep: number
  RemoveEachStep: number
  cbFull: () => void
  cbAdded: (added: number) => void
  cbRemoved: (removed: number) => void
  AlarmSystem?: any
  LowLevelAlarmCode: number
  LowLevelAlarm: number
  EmptyAlarmCode: number

  constructor(Name: string, Volume: number, StartContent = 0.0) {
    this.Name = Name
    this.Inside = StartContent
    this.Volume = Volume

    // flags are needed to remember when tank is full/empty that
    // was filling/removing to resume after tank is no longer full/empty
    this.Adding = false
    this.Removing = false

    this.AddEachStep = 0.0
    this.RemoveEachStep = 0.0

    this.cbFull = () => { }
    this.cbAdded = () => { }
    this.cbRemoved = () => { }

    this.AlarmSystem = null
    this.LowLevelAlarmCode = 0
    this.LowLevelAlarm = 0
    this.EmptyAlarmCode = 0
  }
  Add() {
    this.Inside += this.AddEachStep
  }

  Remove() {
    this.Inside -= this.RemoveEachStep
  }
  CheckAlarmLevels() { }

  get Content() { return this.Inside }
  Thick = () => { }
}