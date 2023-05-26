export default function (number: number): string {
  const _number: string = number?.toString().split('').reverse().join('')
  let result = ''
  for (let i = _number?.length - 1; i >= 0; i--) {
    if (i !== 0 && i % 3 === 0) {
      result += _number[i] + ' '
    } else {
      result += _number[i]
    }
  }
  return result
}
