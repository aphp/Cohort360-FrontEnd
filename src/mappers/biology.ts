export const formatValueRange = (value?: string | number, valueUnit?: string): string => {
  if (value) {
    return `${value} ${valueUnit ?? ''}`
  }
  return '_'
}
