import { action, makeAutoObservable, makeObservable, observable } from 'mobx'
import AlarmSystem from '../Systems/AlarmSystem'
import Item from "./Item"

export interface iTank extends Item {
  Name: string
  Inside: number
  Volume: number
  AddThisStep: number
  RemoveThisStep: number
}

export default class Tank implements iTank {
  readonly Name: string
  Inside: number
  readonly Volume: number
  AddThisStep: number
  RemoveThisStep: number
  ReadoutConsumption: number
  AlarmSystem?: AlarmSystem
  LowLevelAlarmCode: number
  LowLevelAlarm: number
  EmptyAlarmCode: number


  constructor(Name: string, Volume: number, StartContent = 0.0) {
    this.Name = Name
    this.Inside = StartContent
    this.Volume = Volume

    this.AddThisStep = 0.0
    this.RemoveThisStep = 0.0
    this.ReadoutConsumption = 0.0

    this.AlarmSystem = undefined
    this.LowLevelAlarmCode = 0
    this.LowLevelAlarm = 0
    this.EmptyAlarmCode = 0


    // Tank is Super class for Handpump and can't use makeAutoObservable
    makeObservable(this, {
      Inside: observable,
      Volume: observable,
      Name: observable,
      AddThisStep: observable,
      RemoveThisStep: observable,
      Add: action,
      Remove: action,
      Thick: action
    })
  }
  get Content() {
    return this.Inside
  }

  Add() {
    if (this.AddThisStep + this.Inside < this.Volume) {
      this.Inside += this.AddThisStep
    } else {
      // prevent overfill
      this.AddThisStep = 0
      this.Inside = this.Volume
    }
  }

  Remove() {
    if (this.Inside - this.RemoveThisStep > 0) {
      this.Inside -= this.RemoveThisStep
      this.ReadoutConsumption = this.RemoveThisStep
    } else {
      this.ReadoutConsumption = this.Inside
      this.Inside = 0.0
    }
    // save amount thats be remove als readout consumption
    // reset RemoveThisStep so each step multiple systems can add there consumption 
    this.RemoveThisStep = 0
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
    if (this.RemoveThisStep < 0) {
      console.warn(`Tank:${this.Name} had a negative RemoveThisStep :${this.RemoveThisStep}`)
      debugger
    }
    /* istanbul ignore if  */
    if (this.RemoveThisStep === undefined || Number.isNaN(this.RemoveThisStep)) {
      console.warn(`Tank:${this.Name} RemoveThisStep is not a number : ${this.RemoveThisStep}`)
      //  this.RemoveThisStep = 0
    }
    /* istanbul ignore if  */
    if (this.AddThisStep < 0) {
      console.warn(`Tank:${this.Name} had a negative AddThisStep: ${this.AddThisStep} `)
      //  this.AddThisStep = 0
    }
    /* istanbul ignore if  */
    if (this.Inside === undefined || Number.isNaN(this.Inside)) {
      console.warn(`Tank ${this.Name} contents is not a number: ${this.Inside}`)
    }
  }
}
