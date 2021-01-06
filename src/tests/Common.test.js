const { CheckCircuit } = require('../Common')

describe('circuit checks', () => {
  test('no circuit = nok', () => {
    expect(CheckCircuit()).toBeFalsy()
  })
  test('empty circuit = nok', () => {
    const testCircuit = []
    expect(CheckCircuit(testCircuit)).toBeFalsy()
  })
  test('Circuit with 1 close dummy valve = circuit nok', () => {
    const testCircuit = []
    const dummyValve = { isOpen: false }
    testCircuit.push(dummyValve)
    expect(testCircuit.length).toBe(1)
    expect(CheckCircuit(testCircuit)).toBeFalsy()
  })
  test('Circuit with 1 open dummy valve = circuit ok', () => {
    const testCircuit = []
    const dummyValve = { isOpen: true }
    testCircuit.push(dummyValve)
    expect(testCircuit.length).toBe(1)
    expect(CheckCircuit(testCircuit)).toBeTruthy()
  })
  test('Circuit with 1 close & 1 open valve = circuit nok', () => {
    const testCircuit = []
    const dummyValve1 = { isOpen: false }
    testCircuit.push(dummyValve1)
    const dummyValve2 = { isOpen: true }
    testCircuit.push(dummyValve2)
    expect(testCircuit.length).toBe(2)
    expect(CheckCircuit(testCircuit)).toBeFalsy()
  })
  test('Circuit with 1 open & 1 close valve = circuit nok', () => {
    const testCircuit = []
    const dummyValve1 = { isOpen: true }
    testCircuit.push(dummyValve1)
    const dummyValve2 = { isOpen: false }
    testCircuit.push(dummyValve2)
    expect(testCircuit.length).toBe(2)
    expect(CheckCircuit(testCircuit)).toBeFalsy()
  })
  test('Circuit with 2 open valves = circuit ok', () => {
    const testCircuit = []
    const dummyValve1 = { isOpen: true }
    testCircuit.push(dummyValve1)
    const dummyValve2 = { isOpen: true }
    testCircuit.push(dummyValve2)
    expect(testCircuit.length).toBe(2)
    expect(CheckCircuit(testCircuit)).toBeTruthy()
  })
})
