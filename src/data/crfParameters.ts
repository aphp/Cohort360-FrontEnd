export type CrfParameter = {
  officialName: string
  customName: string
  attr_type: 'identifying' | 'quasiidentifying' | 'insensitive' | 'sensitive'
  anonymize: boolean
  hierarchy_type?: string
  type?: 'text'
}
export const CRF_ATTRIBUTES: CrfParameter[] = [
  {
    officialName: 'Identifier',
    customName: 'Identifier',
    attr_type: 'identifying',
    anonymize: true
  },
  {
    officialName: 'First name',
    customName: 'First name',
    attr_type: 'identifying',
    anonymize: true
  },
  {
    officialName: 'Last name',
    customName: 'Last name',
    attr_type: 'identifying',
    anonymize: true
  },
  {
    officialName: 'Birthdate',
    customName: 'Birthdate',
    attr_type: 'quasiidentifying',
    hierarchy_type: 'date',
    anonymize: false
  },
  {
    officialName: 'Postal code',
    customName: 'Postal code',
    attr_type: 'quasiidentifying',
    hierarchy_type: 'redaction',
    anonymize: false
  },
  {
    officialName: 'Gender',
    customName: 'Gender',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Height',
    customName: 'Height',
    attr_type: 'quasiidentifying',
    hierarchy_type: 'interval',
    anonymize: false
  },
  {
    officialName: 'Weight',
    customName: 'Weight',
    attr_type: 'quasiidentifying',
    hierarchy_type: 'interval',
    anonymize: false
  },
  {
    officialName: 'Albumin',
    customName: 'Albumin',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Creatinin',
    customName: 'Creatinin',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Glucose',
    customName: 'Glucose',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Bilirubin',
    customName: 'Bilirubin',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Magnesium',
    customName: 'Magnesium',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Sodium',
    customName: 'Sodium',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'Potassium',
    customName: 'Potassium',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'ALAT',
    customName: 'ALAT',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'ASAT',
    customName: 'ASAT',
    attr_type: 'insensitive',
    anonymize: false
  },
  {
    officialName: 'ICD-9 Diagnosis',
    customName: 'ICD-9 Diagnosis',
    attr_type: 'sensitive',
    anonymize: false
  },
  {
    officialName: 'Medication',
    customName: 'Medication',
    attr_type: 'sensitive',
    type: 'text',
    anonymize: false
  }
  // NOTE : Keep it for later
  // {
  //   officialName: 'Specific diagnostic code',
  //   customName: 'Specific diagnostic code',
  //   attr_type: 'sensitive',
  //   type: 'text',
  //   anonymize: true
  // },
  // {
  //   officialName: 'Specific diagnostic text',
  //   customName: 'Specific diagnostic text',
  //   attr_type: 'sensitive',
  //   type: 'text',
  //   anonymize: true
  // }
]
