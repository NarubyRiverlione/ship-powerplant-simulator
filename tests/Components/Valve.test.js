const Valve = require('../../Components/Valve')

let valve
beforeEach(() => {
  valve = new Valve()
})

describe('Valve init', () => {
  test('Valve starts open, without output', () => {
    expect(valve.isOpen).toBeTruthy()
    expect(valve.Content()).toBe(0)
  })
  test('Valve with input starts open, without output', () => {
    const valveWithInput = new Valve()
    expect(valveWithInput.isOpen).toBeTruthy()
    expect(valveWithInput.Content()).toBe(0)
  })
  test('Valve status', () => {
    const testValve = new Valve()
    const name = 'Test valve'
    testValve.Name = name
    expect(testValve.Status()).toEqual({ status: true, statusMessage: `${name} is open` })
  })
})

describe('Valve close', () => {
  test('Closed valve has no content', () => {
    const sourceContent = 12345.6
    const testValve = new Valve()
    testValve.Source = {}
    testValve.Source.Content = () => sourceContent
    const name = 'Test valve'
    testValve.Name = name
    testValve.Close()
    expect(testValve.Content()).toBe(sourceContent)
    expect(testValve.Status()).toEqual({ status: false, statusMessage: `${name} is closed` })
  })
  test('Closed valve has output and delivers feedback', () => {
    const sourceContent = 458
    const answer = 'test feedback closing valve'
    let cbFlag = false
    const cbClosing = (feedback) => {
      // console.debug('closing cb')
      expect(feedback).toBe(answer)
      cbFlag = true
    }

    const testValve = new Valve({}, null, cbClosing(answer))
    testValve.Source.Content = () => sourceContent

    testValve.Close()
    expect(testValve.Content()).toBe(sourceContent)
    expect(cbFlag).toBeTruthy()
  })
})

describe('Valve open after closed', () => {
  test('Open en previous closed valve has no output', () => {
    const input = 7892
    const testValve = new Valve({ Content: input })
    testValve.Close()
    testValve.Open()
    expect(valve.Content()).toBe(0)
  })
  test('Open en previous closed valve has no output and provides feedback', () => {
    const input = 7892
    let cbFlag = false
    const answer = 'test feedback opening valve'
    const cbOpening = (feedback) => {
      // console.debug('opening cb')
      expect(feedback).toBe(answer)
      cbFlag = true
    }

    const testValve = new Valve({ Content: input }, cbOpening(answer))
    testValve.Close()
    testValve.Open()
    expect(valve.Content()).toBe(0)
    expect(cbFlag).toBeTruthy()
  })
})
