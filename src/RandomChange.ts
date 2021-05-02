const RandomChange = (randomize: boolean, baseChange: number, randomFactor: number): number => {
  if (!randomize) return baseChange
  const min = baseChange - randomFactor
  const max = baseChange + randomFactor
  const randomChange = Math.random() * (max - min) + min
  return randomChange
}

export default RandomChange
