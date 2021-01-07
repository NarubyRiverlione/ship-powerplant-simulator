import Valve from '../../Components/Valve'
import Tank from '../../Components/Tank'

const name = 'Test valve'
const sourceContent = 12
const source = new Tank('dummy source', 100, sourceContent)

let valve: Valve
beforeEach(() => {
  valve = new Valve(name, source)
})

describe('Valve init', () => {
  test('Valve starts closed, without output', () => {
    expect(valve.isOpen).toBeFalsy()
    expect(valve.Content).toBe(0)
    expect(valve.Name).toBe(name)
  })
  test('Valve with input starts closed, without output', () => {
    expect(valve.isOpen).toBeFalsy()
    expect(valve.Content).toBe(0)
  })
})

describe('Valve open', () => {
  test('Open valve has content', () => {
    valve.Open()
    expect(valve.Content).toBe(sourceContent)
    expect(valve.isOpen).toBeTruthy()
  })
  test('Open valve has output and delivers feedback', () => {
    let cbFlag = false
    const cbOpening = () => {
      cbFlag = true
    }

    valve.cbNowOpen = cbOpening
    valve.Open()
    expect(valve.Content).toBe(sourceContent)
    expect(cbFlag).toBeTruthy()
  })
})

describe('Valve closed after was open', () => {
  test('Closed a previous opened valve = no output', () => {
    valve.Open()
    valve.Close()
    expect(valve.Content).toBe(0)
  })
  test('Closed a previous opened valve  = output and provides feedback', () => {
    let cbFlag = false
    const cbOpening = () => {
      cbFlag = true
    }

    valve.cbNowOpen = cbOpening
    valve.Open()
    valve.Close()
    expect(valve.Content).toBe(0)
    expect(cbFlag).toBeTruthy()
  })
})
describe('Toggle valve', () => {
  test('toggle closed -> open', () => {
    valve.Toggle()
    expect(valve.isOpen).toBeTruthy()
  })
  test('toggle open -> closed', () => {
    valve.Open()
    valve.Toggle()
    expect(valve.isOpen).toBeFalsy()
  })
})
