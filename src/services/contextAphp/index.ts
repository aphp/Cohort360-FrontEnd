import servicesCohorts, { IServicesCohorts } from './servicesCohorts'
import servicePatients, { IServicesPatients } from './servicePatients'

interface IServiceAphp {
  cohorts: IServicesCohorts
  patients: IServicesPatients
}

const serviceAphp: IServiceAphp = {
  cohorts: servicesCohorts,
  patients: servicePatients
}

export default serviceAphp
