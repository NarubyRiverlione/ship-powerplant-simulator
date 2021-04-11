import { action, makeObservable, observable } from 'mobx'
import AlarmSystem from '../Systems/AlarmSystem'
import Item from "./Item"

export interface iTank extends Item {
  Name: string
  Inside: number
  Volume: number
  Adding: boolean
  AmountRemovers: number
  AddEachStep: number
  RemoveEachStep: number
  cbFull: () => void
  cbAdded: (added: number) => void
  cbRemoved: (removed: number) => void
  AlarmSystem?: AlarmSystem
  LowLevelAlarmCode: number
  LowLevelAlarm: number
  EmptyAlarmCode: number
}

export default class Tank implements iTank {
  Name: string
  Inside: number
  Volume: number
  Adding: boolean
  AmountRemovers: number
  AddEachStep: number
  RemoveEachStep: number
  cbFull: () => void
  cbAdded: (added: number) => void
  cbRemoved: (removed: number) => void
  AlarmSystem?: AlarmSystem
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
    this.AmountRemovers = 0

    this.AddEachStep = 0.0
    this.RemoveEachStep = 0.0

    this.cbFull = () => { }
    this.cbAdded = () => { }
    this.cbRemoved = () => { }

    this.AlarmSystem = undefined
    this.LowLevelAlarmCode = 0
    this.LowLevelAlarm = 0
    this.EmptyAlarmCode = 0

    makeObservable(this, {
      Inside: observable,
      Volume: observable,
      Name: observable,
      Adding: observable,
      AmountRemovers: observable,
      AddEachStep: observable,
      RemoveEachStep: observable,
      Add: action,
      Remove: action,
      Thick: action
    })
  }
  get Removing() { return this.AmountRemovers !== 0 }
  get Content() {
    return this.Inside
  }

  Add() {
    if (this.Inside === this.Volume) {
      // already full, prevent calling cbFull multiple times
      return
    }
    if (this.AddEachStep + this.Inside < this.Volume) {
      this.Inside += this.AddEachStep
      this.cbAdded(this.AddEachStep)
    } else {
      // prevent overfill
      this.Inside = this.Volume
      this.cbFull()
    }
  }

  Remove() {
    if (this.Inside - this.RemoveEachStep > 0) {
      this.Inside -= this.RemoveEachStep
      this.cbRemoved(this.RemoveEachStep)
    } else { this.Inside = 0.0 }
  }

  CheckAlarmLevels() {
    if (!this.AlarmSystem) return
    const AlarmSys = this.AlarmSystem as AlarmSystem // null/undefiled safe
    // Low Level alarm
    if (this.LowLevelAlarmCode !== 0) {
      // Raise if content below LowLevelAlarm
      if (this.Content < this.LowLevelAlarm) {
        AlarmSys.AddAlarm(this.LowLevelAlarmCode)
      }
      // cancel alarm is previous raised and now above LowLevelAlarm
      if (AlarmSys.AlarmExist(this.LowLevelAlarmCode) && this.Content >= this.LowLevelAlarm) {
        AlarmSys.RemoveAlarm(this.LowLevelAlarmCode)
      }
    }

    // Empty alarm
    if (this.EmptyAlarmCode !== 0) {
      // Raise if tank is empty
      if (this.Content === 0) {
        AlarmSys.AddAlarm(this.EmptyAlarmCode)
      }
      // cancel alarm is previous raised and tank is no longer empty
      if (AlarmSys.AlarmExist(this.EmptyAlarmCode) && this.Content !== 0) {
        AlarmSys.RemoveAlarm(this.EmptyAlarmCode)
      }
    }
  }

  Thick() {
    if (this.Adding) this.Add()
    if (this.Removing) this.Remove()
    this.CheckAlarmLevels()

    /* istanbul ignore if  */
    if (this.RemoveEachStep < 0) {
      console.warn(`Tank:${this.Name} had a negative RemoveEachStep :${this.RemoveEachStep}`)
      debugger
    }
    /* istanbul ignore if  */
    if (this.RemoveEachStep === undefined || Number.isNaN(this.RemoveEachStep)) {
      console.warn(`Tank:${this.Name} RemoveEachStep is not a number : ${this.RemoveEachStep}`)
      //  this.RemoveEachStep = 0
    }
    /* istanbul ignore if  */
    if (this.AddEachStep < 0) {
      console.warn(`Tank:${this.Name} had a negative AddEachStep: ${this.AddEachStep} `)
      //  this.AddEachStep = 0
    }

    if (this.Inside === undefined || Number.isNaN(this.Inside)) {
      console.warn(`Tank ${this.Name} contents is not a number: ${this.Inside}`)
    }
  }
}
