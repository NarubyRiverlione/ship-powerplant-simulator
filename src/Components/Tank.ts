import { action, makeObservable, observable } from 'mobx'
import AlarmSystem from '../Systems/AlarmSystem'
import Item from "./Item"

export interface iTank extends Item {
  Name: string
  Inside: number
  Volume: number
  AddEachStep: number
  RemoveEachStep: number
}

export default class Tank implements iTank {
  Name: string
  Inside: number
  Volume: number
  AddEachStep: number
  RemoveEachStep: number
  AlarmSystem?: AlarmSystem
  LowLevelAlarmCode: number
  LowLevelAlarm: number
  EmptyAlarmCode: number


  constructor(Name: string, Volume: number, StartContent = 0.0) {
    this.Name = Name
    this.Inside = StartContent
    this.Volume = Volume

    this.AddEachStep = 0.0
    this.RemoveEachStep = 0.0

    this.AlarmSystem = undefined
    this.LowLevelAlarmCode = 0
    this.LowLevelAlarm = 0
    this.EmptyAlarmCode = 0

    makeObservable(this, {
      Inside: observable,
      Volume: observable,
      Name: observable,
      AddEachStep: observable,
      RemoveEachStep: observable,
      Add: action,
      Remove: action,
      Thick: action
    })
  }
  get Content() {
    return this.Inside
  }

  Add() {
    if (this.AddEachStep + this.Inside < this.Volume) {
      this.Inside += this.AddEachStep
    } else {
      // prevent overfill
      this.AddEachStep = 0 //this.Volume - this.Inside
      this.Inside = this.Volume
    }
  }

  Remove() {
    if (this.Inside - this.RemoveEachStep > 0) {
      this.Inside -= this.RemoveEachStep
      // this.cbRemoved(this.RemoveEachStep)
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
    this.Add()
    this.Remove()
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
    /* istanbul ignore if  */
    if (this.Inside === undefined || Number.isNaN(this.Inside)) {
      console.warn(`Tank ${this.Name} contents is not a number: ${this.Inside}`)
    }
  }
}
