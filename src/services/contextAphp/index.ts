import servicesCohorts, { IServicesCohorts } from './servicesCohorts'
import servicePatients, { IServicesPatients } from './servicePatients'
import servicePerimeters, { IServicesPerimeters } from './servicePerimeters'
import servicePractitioner, { IServicesPractitioner } from './servicePractitioner'
import serviceProjects, { IServicesProjects } from './serviceProjects'

export interface IServiceAphp {
  cohorts: IServicesCohorts
  patients: IServicesPatients
  perimeters: IServicesPerimeters
  practitioner: IServicesPractitioner
  projects: IServicesProjects
}

const serviceAphp: IServiceAphp = {
  cohorts: servicesCohorts,
  patients: servicePatients,
  perimeters: servicePerimeters,
  practitioner: servicePractitioner,
  projects: serviceProjects
}

export default serviceAphp
