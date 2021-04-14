/* istanbul ignore file */

import { iTank } from "../../Components/Tank"

export default class mockTank implements iTank {
  Name: string
  Inside: number
  Volume: number
  AddEachStep: number
  RemoveEachStep: number

  constructor(Name: string, Volume: number, StartContent = 0.0) {
    this.Name = Name
    this.Inside = StartContent
    this.Volume = Volume
    this.AddEachStep = 0.0
    this.RemoveEachStep = 0.0

  }
  Add() {
    this.Inside += this.AddEachStep
  }
  Remove() {
    this.Inside -= this.RemoveEachStep
  }
  CheckAlarmLevels() { }

  get Content() { return this.Inside }
  Thick = () => {
    this.Add()
    this.Remove()
  }
}