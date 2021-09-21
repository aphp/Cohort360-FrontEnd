import { CONTEXT } from './../constants'
import servicesAphp, { IServiceAphp } from 'services/contextAphp'
import servicesArkhn, { IServiceArkhn } from 'services/contextArkhn'

let services: IServiceAphp | IServiceArkhn = servicesAphp
switch (CONTEXT) {
  case 'aphp':
    services = servicesAphp
    break
  case 'arkhn':
    services = servicesArkhn
    break
  default:
    break
}

export default services
