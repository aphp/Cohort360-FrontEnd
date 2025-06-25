export enum CohortsType {
  FAVORITE = 'FAVORITE',
  NOT_FAVORITE = 'NOT_FAVORITE'
}

export enum CohortsTypeLabel {
  FAVORITE = 'Cohortes favorites',
  NOT_FAVORITE = 'Cohortes non favorites'
}

export enum ResearchesTableLabels {
  COHORT_NAME = 'nom de la cohorte',
  SAMPLE_NAME = 'nom de l’échantillon',
  REQUEST_NAME = 'nom de la requête',
  PARENT_PROJECT = 'projet parent',
  PARENT_REQUEST = 'requête parent',
  PARENT_COHORT = 'cohorte parent',
  TOTAL_PERCENTAGE = 'pourcentage du total',
  STATUS = 'statut',
  PATIENT_TOTAL = 'nb de patients',
  APHP_TOTAL = 'estimation du nb de patients ap-hp',
  CREATED_AT = 'date de création',
  MODIFIED_AT = 'date de modification',
  SAMPLES = 'échantillons',
  COHORTS = 'nb de cohortes'
}

export enum SubItemType {
  SAMPLES = 'échantillon',
  COHORTS = 'cohorte'
}

export enum ExplorationsSearchParams {
  DIRECTION = 'direction',
  END_DATE = 'endDate',
  FAVORITE = 'favorite',
  MAX_PATIENTS = 'maxPatients',
  MIN_PATIENTS = 'minPatients',
  ORDER_BY = 'orderBy',
  PAGE = 'page',
  SEARCH_INPUT = 'searchInput',
  START_DATE = 'startDate',
  STATUS = 'status'
}
