import servicesCohorts, { IServiceCohorts } from './serviceCohorts'
import servicesCohortCreation, { IServiceCohortCreation } from './serviceCohortCreation'
import servicesContact, { IServiceContact } from './serviceContact'
import servicePatients, { IServicePatients } from './servicePatients'
import servicePerimeters, { IServicePerimeters } from './servicePerimeters'
import servicePractitioner, { IServicePractitioner } from './servicePractitioner'
import serviceProjects, { IServiceProjects } from './serviceProjects'

export interface IServiceArkhn {
  cohorts: IServiceCohorts
  cohortCreation: IServiceCohortCreation
  contact: IServiceContact
  patients: IServicePatients
  perimeters: IServicePerimeters
  practitioner: IServicePractitioner
  projects: IServiceProjects
}

const serviceArkhn: IServiceArkhn = {
  cohorts: servicesCohorts,
  cohortCreation: servicesCohortCreation,
  contact: servicesContact,
  patients: servicePatients,
  perimeters: servicePerimeters,
  practitioner: servicePractitioner,
  projects: serviceProjects
}

export default serviceArkhn
