export const mapParamsToNetworkParams = (params: string[]) => {
  let url = ''
  params.forEach((item, index) => {
    url += index === 0 ? `?${item}` : `&${item}`
  })
  return url
}
