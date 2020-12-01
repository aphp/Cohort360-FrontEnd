import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'

const data = [
  {
    id: PatientGenderKind._male,
    value: 'Homme',
    fhir: 'male'
  },
  {
    id: PatientGenderKind._female,
    value: 'Femme',
    fhir: 'female'
  },
  {
    id: PatientGenderKind._other,
    value: 'Autre',
    fhir: 'other'
  },
  {
    id: PatientGenderKind._unknown,
    value: 'Tous'
  }
]

export default data
