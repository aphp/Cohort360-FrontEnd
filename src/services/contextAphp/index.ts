import servicesCohorts, { IServicesCohorts } from './servicesCohorts'
import servicePatients, { IServicesPatients } from './servicePatients'
import servicePerimeters, { IServicesPerimeters } from './servicePerimeters'

interface IServiceAphp {
  cohorts: IServicesCohorts
  patients: IServicesPatients
  perimeters: IServicesPerimeters
}

const serviceAphp: IServiceAphp = {
  cohorts: servicesCohorts,
  patients: servicePatients,
  perimeters: servicePerimeters
}

export default serviceAphp
