import { CONTEXT } from './../constants'
import servicesAphp, { IServiceAphp } from './aphp'

let services: IServiceAphp = servicesAphp
switch (CONTEXT) {
  case 'aphp':
    services = servicesAphp
    break
  default:
    break
}

export default services
