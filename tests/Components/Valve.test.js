const Valve = require('../../src/Components/Valve')

describe('Valve init', () => {
  test('Valve starts closed, without output', () => {
    const name = 'Test valve'
    const valve = new Valve(name)
    expect(valve.isOpen).toBeFalsy()
    expect(valve.Content()).toBe(0)
    expect(valve.Name).toBe(name)
  })
  test('Valve with input starts closed, without output', () => {
    const valveWithInput = new Valve()
    expect(valveWithInput.isOpen).toBeFalsy()
    expect(valveWithInput.Content()).toBe(0)
  })
})

describe('Valve open', () => {
  test('Open valve has content', () => {
    const sourceContent = 12345.6
    const testValve = new Valve()
    testValve.Source = { Content: () => sourceContent }

    testValve.Open()
    expect(testValve.Content()).toBe(sourceContent)
    expect(testValve.isOpen).toBeTruthy()
  })
  test('Open valve has output and delivers feedback', () => {
    const sourceContent = 458
    const answer = 'test feedback closing valve'
    let cbFlag = false
    const cbOpening = (feedback) => {
      expect(feedback).toBe(answer)
      cbFlag = true
    }

    const testValve = new Valve()
    testValve.cbNowOpen = cbOpening(answer)
    testValve.Source = { Content: () => sourceContent }

    testValve.Open()
    expect(testValve.Content()).toBe(sourceContent)
    expect(cbFlag).toBeTruthy()
  })
})

describe('Valve closed after was open', () => {
  test('Closed a previous opened valve = no output', () => {
    const input = 7892
    const testValve = new Valve()
    testValve.Source = { Content: () => input }
    testValve.Open()
    testValve.Close()
    expect(testValve.Content()).toBe(0)
  })
  test('Closed a previous opened valve  = output and provides feedback', () => {
    const input = 7892
    let cbFlag = false
    const answer = 'test feedback opening valve'
    const cbOpening = (feedback) => {
      // console.debug('opening cb')
      expect(feedback).toBe(answer)
      cbFlag = true
    }

    const testValve = new Valve()
    testValve.Source = { Content: () => input }
    testValve.cbNowOpen = cbOpening(answer)
    testValve.Open()
    testValve.Close()
    expect(testValve.Content()).toBe(0)
    expect(cbFlag).toBeTruthy()
  })
})
describe('Toggle valve', () => {
  test('toggle closed -> open', () => {
    const valve = new Valve()
    valve.Toggle()
    expect(valve.isOpen).toBeTruthy()
  })
  test('toggle open -> closed', () => {
    const valve = new Valve()
    valve.Open()
    valve.Toggle()
    expect(valve.isOpen).toBeFalsy()
  })
})
