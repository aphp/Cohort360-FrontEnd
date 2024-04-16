export type FetchScopeOptions = {
  ids?: string
  cohortIds?: string
  practitionerId?: string
  search?: string
  page?: number
  limit?: number
  sourceType?: SourceType
}

export enum SourceValue {
  APHP = 'AP-HP',
  GH = 'Groupe hospitalier (GH)',
  GHU = 'GHU',
  HOPITAL = 'Hôpital',
  POLE = 'Pôle/DMU',
  UF = 'Unité Fonctionnelle (UF)'
}

export enum SourceType {
  BIOLOGY,
  CCAM,
  CIM10,
  GHM,
  MEDICATION,
  DOCUMENT,
  SUPPORTED,
  IMAGING,
  FORM_RESPONSE,
  MATERNITY,
  APHP,
  ALL
}

export enum Rights {
  EXPIRED = 'expired'
}
