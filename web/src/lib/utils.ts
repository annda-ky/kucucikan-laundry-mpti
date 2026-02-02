export function formatDisplayUnit(value: number, unit: string) {
  if (unit === "ml" && value >= 1000) {
    const val = value / 1000;
    return `${val % 1 === 0 ? val : val.toFixed(2)} Liter`;
  }
  if (unit === "gr" && value >= 1000) {
    const val = value / 1000;
    return `${val % 1 === 0 ? val : val.toFixed(2)} Kg`;
  }
  return `${value} ${unit}`;
}
