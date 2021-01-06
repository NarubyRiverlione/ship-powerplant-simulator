"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TankWithValves_1 = __importDefault(require("../../Components/TankWithValves"));
const Valve_1 = __importDefault(require("../../Components/Valve"));
const Tank_1 = __importDefault(require("../../Components/Tank"));
const Cst_1 = require("../../Cst");
let tankV;
const Volume = 315689746;
const StartContent = 66599;
const dummySource = new Tank_1.default('dummy source tank', 1000, 887);
const dummySourceValve = new Valve_1.default('test dummy source valve', dummySource);
beforeEach(() => {
    tankV = new TankWithValves_1.default('test tank', Volume, StartContent, dummySourceValve);
});
describe('Init', () => {
    test('volume & start content', () => {
        expect(tankV.Tank.Content).toBe(StartContent);
        expect(tankV.Tank.Volume).toBe(Volume);
    });
    test('Intake & outlet valves are closed', () => {
        expect(tankV.IntakeValve.isOpen).toBeFalsy();
        expect(tankV.OutletValve.isOpen).toBeFalsy();
    });
    // test('Intake source', () => {
    //   //  expect(tankV.IntakeValve.Source).toBe(dummySourceValve)
    //   expect(tankV.IntakeValve.Content).toBe(dummySource.Inside)
    // })
    test('outlet source', () => {
        expect(tankV.OutletValve.Source).toEqual(tankV.Tank);
        expect(tankV.OutletValve.Source.Content).toBe(StartContent);
    });
    test('Drain valve is closed', () => {
        expect(tankV.DrainValve.isOpen).toBeFalsy();
    });
});
describe('Intake valve', () => {
    test('intake & source valves are closed --> no filling', () => {
        expect(dummySourceValve.isOpen).toBeFalsy();
        expect(tankV.Tank.Adding).toBeFalsy();
    });
    test('open intake, closed source --> no filling', () => {
        tankV.IntakeValve.Open();
        expect(tankV.IntakeValve.isOpen).toBeTruthy();
        expect(tankV.Tank.Adding).toBeFalsy();
    });
    test('closed intake, open source --> no filling', () => {
        dummySourceValve.Open();
        expect(tankV.IntakeValve.isOpen).toBeFalsy();
        expect(tankV.Tank.Adding).toBeFalsy();
    });
    test('both intake and source valves are open --> filling', () => {
        dummySourceValve.isOpen = true;
        tankV.IntakeValve.Open();
        expect(tankV.IntakeValve.isOpen).toBeTruthy();
        expect(tankV.Tank.Adding).toBeTruthy();
    });
    test('re-open intake valve after both where closed --> no filling', () => {
        dummySourceValve.isOpen = true;
        tankV.IntakeValve.Open();
        expect(tankV.Tank.Adding).toBeTruthy();
        tankV.IntakeValve.Close();
        expect(tankV.IntakeValve.isOpen).toBeFalsy();
        expect(tankV.Tank.Adding).toBeFalsy();
    });
    /*
    cannot test as there is no 'Thick' in a valve
     and dummy source valve has no logic to control adding in tank
    test('re-open source valve after both where closed --> no filling', () => {
      dummySourceValve.isOpen = true
      tankV.IntakeValve.Open()
      expect(tankV.Tank.Adding).toBeTruthy()
      dummySourceValve.isOpen = false
  
      expect(tankV.Tank.Adding).toBeFalsy()
    })
    */
});
describe('Outlet valve', () => {
    test('full tank and open outlet = valve has tank content', () => {
        tankV.Tank.Inside = StartContent;
        tankV.OutletValve.Open();
        tankV.Thick();
        expect(tankV.OutletValve.Content).toBe(StartContent);
    });
    test('full tank and re-close  outlet = valve has no content', () => {
        tankV.Tank.Inside = StartContent;
        tankV.OutletValve.Open();
        tankV.Thick();
        tankV.OutletValve.Close();
        tankV.Thick();
        expect(tankV.OutletValve.Content).toBe(0);
    });
    test('open outlet, empty tank, then add tank content = outlet has tank content', () => {
        tankV.Tank.Inside = 0;
        tankV.OutletValve.Open();
        tankV.Thick();
        expect(tankV.OutletValve.Content).toBe(0);
        tankV.Tank.Inside = StartContent;
        tankV.Thick();
        expect(tankV.OutletValve.Content).toBe(StartContent);
    });
});
describe('Drain valve', () => {
    test('open drain valve = remove from tank', () => {
        const startContent = 1435;
        const drainTarget = new Tank_1.default('test drain tank', 1000);
        tankV.Tank.Inside = startContent;
        tankV.DrainTarget = drainTarget;
        tankV.DrainValve.Open();
        tankV.Thick();
        expect(tankV.Tank.Content).toBe(startContent - Cst_1.CstChanges.DrainStep);
        expect(drainTarget.AddEachStep).toBe(Cst_1.CstChanges.DrainStep);
        expect(drainTarget.Adding).toBeTruthy();
    });
    test('closing previous open drain valve = stop remove from tank', () => {
        const startContent = 563;
        tankV.Tank.Inside = startContent;
        tankV.DrainValve.Open();
        tankV.Thick();
        tankV.DrainValve.Close();
        expect(tankV.Tank.Content).toBe(startContent - Cst_1.CstChanges.DrainStep);
    });
});
describe('Drain & outlet combo', () => {
    test('first  drain  then outlet open', () => {
        const removeViaOutlet = 5;
        tankV.OutletValve.cbNowOpen = () => {
            tankV.Tank.RemoveEachStep += removeViaOutlet;
            tankV.Tank.Removing = true;
        };
        tankV.DrainValve.Open();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(Cst_1.CstChanges.DrainStep);
        tankV.OutletValve.Open();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(removeViaOutlet + Cst_1.CstChanges.DrainStep);
    });
    test('drain + outlet open, close drain', () => {
        const removeViaOutlet = 5;
        tankV.OutletValve.cbNowOpen = () => {
            tankV.Tank.RemoveEachStep += removeViaOutlet;
            tankV.Tank.Removing = true;
        };
        tankV.DrainValve.Open();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(Cst_1.CstChanges.DrainStep);
        tankV.OutletValve.Open();
        tankV.Thick();
        tankV.DrainValve.Close();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(removeViaOutlet);
    });
    test('drain + outlet open, close outlet', () => {
        const removeViaOutlet = 5;
        tankV.OutletValve.cbNowOpen = () => {
            tankV.Tank.RemoveEachStep += removeViaOutlet;
            tankV.Tank.Removing = true;
        };
        tankV.OutletValve.cbNowClosed = () => {
            tankV.Tank.RemoveEachStep -= removeViaOutlet;
            tankV.Tank.Removing = tankV.DrainValve.isOpen;
        };
        tankV.DrainValve.Open();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(Cst_1.CstChanges.DrainStep);
        tankV.OutletValve.Open();
        tankV.Thick();
        tankV.OutletValve.Close();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(Cst_1.CstChanges.DrainStep);
    });
    test('drain + outlet open, close first outlet then drain', () => {
        const removeViaOutlet = 5;
        tankV.OutletValve.cbNowOpen = () => {
            tankV.Tank.RemoveEachStep += removeViaOutlet;
            tankV.Tank.Removing = true;
        };
        tankV.OutletValve.cbNowClosed = () => {
            tankV.Tank.RemoveEachStep -= removeViaOutlet;
            tankV.Tank.Removing = tankV.DrainValve.isOpen;
        };
        tankV.DrainValve.Open();
        tankV.Thick();
        tankV.OutletValve.Open();
        tankV.Thick();
        tankV.OutletValve.Close();
        tankV.Thick();
        tankV.DrainValve.Close();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(0);
    });
    test('drain + outlet open, close first drain then outlet', () => {
        const removeViaOutlet = 5;
        tankV.OutletValve.cbNowOpen = () => {
            tankV.Tank.RemoveEachStep += removeViaOutlet;
            tankV.Tank.Removing = true;
        };
        tankV.OutletValve.cbNowClosed = () => {
            tankV.Tank.RemoveEachStep -= removeViaOutlet;
            tankV.Tank.Removing = tankV.DrainValve.isOpen;
        };
        tankV.DrainValve.Open();
        tankV.Thick();
        tankV.OutletValve.Open();
        tankV.Thick();
        tankV.DrainValve.Close();
        tankV.Thick();
        tankV.OutletValve.Close();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(0);
    });
    test('first outlet then drain open', () => {
        const removeViaOutlet = 5;
        tankV.OutletValve.cbNowOpen = () => {
            tankV.Tank.RemoveEachStep += removeViaOutlet;
            tankV.Tank.Removing = true;
        };
        tankV.OutletValve.Open();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(removeViaOutlet);
        tankV.DrainValve.Open();
        tankV.Thick();
        expect(tankV.Tank.RemoveEachStep).toBe(removeViaOutlet + Cst_1.CstChanges.DrainStep);
    });
});
