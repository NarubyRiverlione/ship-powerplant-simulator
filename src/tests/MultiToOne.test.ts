import MultiInputs from '../Components/MultiToOne'
import MockTank from './mocks/MockTank'

let multiToOne: MultiInputs
const dummySourceTank = new MockTank('dummy source tank', 100, 100)

beforeEach(() => {
  multiToOne = new MultiInputs('test multi to one', dummySourceTank)
})
describe('Init', () => {
  test('no content', () => {
    expect(multiToOne.Content).toBe(0)
  })
})

describe('adding', () => {
  test('adding all inputs', () => {
    const content1 = 100
    const content2 = 34
    const tank1 = new MockTank('tank 1', 100, content1)
    const tank2 = new MockTank('tank 2', 100, content2)

    multiToOne.Inputs.push(tank1)
    multiToOne.Inputs.push(tank2)
    expect(multiToOne.Content).toBe(content1 + content2)
  })
})
