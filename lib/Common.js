"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CheckCircuit = (circuit) => {
    if (!circuit || circuit.length === 0)
        return false;
    const circuitComplete = circuit.reduce((acc, recent) => recent.isOpen && acc, true);
    return circuitComplete;
};
exports.default = CheckCircuit;
