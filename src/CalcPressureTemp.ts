
const Pressure_mmHG_Bar = 750.06

// Antoine_pressure mmHG = 10^[A - (B / (C + temperature °C))]
const AntoinePressure = {
  BelowBoiling: {
    A: 8.07131, B: 1730.63, C: 233.426,
  },
  AboveBoiling: {
    A: 8.14019, B: 1810.94, C: 244.485,
  },
}

const Formula = (Antione: { A: number, B: number, C: number }, Temp: number): number =>
  Math.pow(10, (Antione.A - (Antione.B / (Antione.C + Temp))))

export const Pressure_mmHG_to_Bar = (pressure: number): number => pressure / Pressure_mmHG_Bar

// return pressure in bar
const CalcPressureViaTemp = (Temp: number): number => {
  const pressure_mmHG = Temp <= 100.0
    ? Formula(AntoinePressure.BelowBoiling, Temp)
    : Formula(AntoinePressure.AboveBoiling, Temp)
  return Pressure_mmHG_to_Bar(pressure_mmHG)
}

export default CalcPressureViaTemp