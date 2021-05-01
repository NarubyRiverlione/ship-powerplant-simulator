import CalcPressureViaTemp from '../CalcPressureTemp'

describe('Calculate water pressure at given temperature', () => {
  test('0°C = no pressure', () => {
    const temp = 0
    expect(CalcPressureViaTemp(temp)).toBeLessThan(0.01)
  })
  test('at boiling 100°C = close to 1 bar', () => {
    const temp = 100
    expect(CalcPressureViaTemp(temp)).toBeCloseTo(1.01)
  })
  test('at 200°C = close to 15.5 bar', () => {
    const temp = 200
    expect(CalcPressureViaTemp(temp)).toBeCloseTo(15.52)
  })
})
