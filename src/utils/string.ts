export const capitalizeFirstLetter = (str: string) => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
