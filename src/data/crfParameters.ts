export type CrfParameter = {
  officialName: string
  customName: string
  att_type: 'identifying' | 'quasiidentifying' | 'insensitive' | 'sensitive'
  anonymize: boolean
  hierarchy_type?: string
  type?: 'text'
}
export const CRF_ATTRIBUTES: CrfParameter[] = [
  {
    officialName: 'Identifier',
    customName: 'Identifier',
    att_type: 'identifying',
    anonymize: true
  },
  {
    officialName: 'First name',
    customName: 'First name',
    att_type: 'identifying',
    anonymize: true
  },
  {
    officialName: 'Last name',
    customName: 'Last name',
    att_type: 'identifying',
    anonymize: true
  },
  {
    officialName: 'Date of birth',
    customName: 'Date of birth',
    att_type: 'quasiidentifying',
    hierarchy_type: 'date',
    anonymize: true
  },
  {
    officialName: 'Postal code',
    customName: 'Postal code',
    att_type: 'quasiidentifying',
    hierarchy_type: 'redaction',
    anonymize: true
  },
  {
    officialName: 'Gender',
    customName: 'Gender',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Height',
    customName: 'Height',
    att_type: 'quasiidentifying',
    hierarchy_type: 'interval',
    anonymize: true
  },
  {
    officialName: 'Weight',
    customName: 'Weight',
    att_type: 'quasiidentifying',
    hierarchy_type: 'interval',
    anonymize: true
  },
  {
    officialName: 'Albumin',
    customName: 'Albumin',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Creatinin',
    customName: 'Creatinin',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Glucose',
    customName: 'Glucose',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Bilirubin',
    customName: 'Bilirubin',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Magnesium',
    customName: 'Magnesium',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Sodium',
    customName: 'Sodium',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Potassium',
    customName: 'Potassium',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'ALAT',
    customName: 'ALAT',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'ASAT',
    customName: 'ASAT',
    att_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'General diagnostic',
    customName: 'General diagnostic',
    att_type: 'sensitive',
    anonymize: true
  },
  {
    officialName: 'Medication code',
    customName: 'Medication code',
    att_type: 'sensitive',
    type: 'text',
    anonymize: true
  },
  {
    officialName: 'Medication name',
    customName: 'Medication name',
    att_type: 'sensitive',
    type: 'text',
    anonymize: true
  },
  {
    officialName: 'Specific diagnostic code',
    customName: 'Specific diagnostic code',
    att_type: 'sensitive',
    type: 'text',
    anonymize: true
  },
  {
    officialName: 'Specific diagnostic text',
    customName: 'Specific diagnostic text',
    att_type: 'sensitive',
    type: 'text',
    anonymize: true
  }
]
