import RandomChange from '../RandomChange'

const baseChange = 10
const randomFactor = 1.5

describe('Randomize change', () => {
  it('Do not random', () => {
    const result = RandomChange(false, baseChange, randomFactor)
    expect(result).toBe(baseChange)
  })
  it('do randomize', () => {
    const result = RandomChange(true, baseChange, randomFactor)
    expect(result).toBeGreaterThanOrEqual(baseChange - randomFactor)
    expect(result).toBeLessThanOrEqual(baseChange + randomFactor)
  })
})
