import Appliance from "./Appliance";
import PowerBus from "./PowerBus";
import Valve from "./Valve";

export default class PurificationUnit extends Appliance {
  SourceValve: Valve

  constructor(name: string, powerbus: PowerBus, sourceValve: Valve) {
    super(name, powerbus)
    this.SourceValve = sourceValve
  }

  get Content() { return this.isRunning ? this.SourceValve.Content : 0 }

}