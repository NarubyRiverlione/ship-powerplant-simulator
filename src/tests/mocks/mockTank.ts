/* istanbul ignore file */

import { TankInterface } from '../../Components/Tank'

export default class MockTank implements TankInterface {
  Name: string
  Inside: number
  Volume: number
  AddThisStep: number
  RemoveThisStep: number

  constructor(Name: string, Volume: number, StartContent = 0.0) {
    this.Name = Name
    this.Inside = StartContent
    this.Volume = Volume
    this.AddThisStep = 0.0
    this.RemoveThisStep = 0.0
  }

  Add() {
    this.Inside += this.AddThisStep
  }

  Remove() {
    this.Inside -= this.RemoveThisStep
    this.RemoveThisStep = 0
  }

  get Content() { return this.Inside }

  Thick = () => {
    this.Add()
    this.Remove()
  }
}
