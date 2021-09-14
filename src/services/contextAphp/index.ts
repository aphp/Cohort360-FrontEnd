import servicesCohorts, { IServicesCohorts } from './servicesCohorts'
import servicePatients, { IServicePatients } from './servicePatients'

interface IServiceAphp {
  cohorts: IServicesCohorts
  patients: IServicePatients
}

const serviceAphp: IServiceAphp = {
  cohorts: servicesCohorts,
  patients: servicePatients
}

export default serviceAphp
