import React, { createContext, PropsWithChildren, ReactNode, useEffect, useState } from 'react'
import { Root } from 'react-dom/client'
import * as R from 'ramda'
import { CONFIG_URL } from 'constants.js'
import { LabelObject } from 'types/searchCriterias'
import { birthStatusData, booleanFieldsData, booleanOpenChoiceFieldsData, vmeData } from 'data/questionnaire_data'
import { DeepPartial } from 'redux'

type ValueSetConfig = {
  url: string
  title?: string
  data?: LabelObject[]
}

type FeatureConfig = {
  enabled: boolean
}

export type ResourceFeatureConfig = FeatureConfig & {
  fhir: {
    searchParams: string[]
  }
}

type ResourceWithValuesetsFeatureConfig<ValueSetEnum> = ResourceFeatureConfig & {
  valueSets: {
    [K in keyof ValueSetEnum]: ValueSetConfig
  }
}

export type AppConfig = {
  labels: {
    exploration: string
  }
  features: {
    cohort: FeatureConfig & {
      shortCohortLimit: number
      identifyingFields: string[]
    }
    patient: ResourceWithValuesetsFeatureConfig<{ demographicGender: ValueSetConfig }> & {
      textSearch: boolean
      useAgeParams: boolean
      patientIdentifierExtensionCode?: { system: string; code: string }
    }
    encounter: ResourceFeatureConfig & {
      useNDA: boolean
    }
    diagnosticReport: FeatureConfig & {
      useStudyParam: boolean
    }
    export: FeatureConfig & {
      exportLinesLimit: number
      exportTables: string
    }
    observation: ResourceWithValuesetsFeatureConfig<{
      biologyHierarchyAnabio: ValueSetConfig
      biologyHierarchyLoinc: ValueSetConfig
    }> & { useObservationValueRestriction: boolean; useObservationDefaultValidated: boolean }
    medication: ResourceWithValuesetsFeatureConfig<{
      medicationAdministrations: ValueSetConfig
      medicationAtc: ValueSetConfig
      medicationAtcOrbis: ValueSetConfig
      medicationPrescriptionTypes: ValueSetConfig
      medicationUcd: ValueSetConfig
    }>
    condition: ResourceWithValuesetsFeatureConfig<{
      conditionHierarchy: ValueSetConfig
      conditionStatus: ValueSetConfig
    }> & {
      extensions: {
        orbisStatus?: string
      }
    }
    procedure: ResourceWithValuesetsFeatureConfig<{ procedureHierarchy: ValueSetConfig }>
    documentReference: ResourceFeatureConfig & {
      useDocStatus: boolean
    }
    claim: ResourceWithValuesetsFeatureConfig<{ claimHierarchy: ValueSetConfig }>
    imaging: ResourceWithValuesetsFeatureConfig<{ imagingModalities: ValueSetConfig }> & {
      extensions: {
        imagingStudyUidUrl: string
        seriesProtocolUrl?: string
      }
    }
    questionnaires: ResourceWithValuesetsFeatureConfig<{
      analgesieType: ValueSetConfig
      birthDeliveryWay: ValueSetConfig
      cSectionModality: ValueSetConfig
      childBirthMode: ValueSetConfig
      hospitReason: ValueSetConfig
      chirurgicalGesture: ValueSetConfig
      conditionPerineum: ValueSetConfig
      exitDiagnostic: ValueSetConfig
      exitFeedingMode: ValueSetConfig
      exitPlaceType: ValueSetConfig
      feedingType: ValueSetConfig
      imgIndication: ValueSetConfig
      instrumentType: ValueSetConfig
      laborOrCesareanEntry: ValueSetConfig
      maternalRisks: ValueSetConfig
      maturationModality: ValueSetConfig
      maturationReason: ValueSetConfig
      obstetricalGestureDuringLabor: ValueSetConfig
      pathologyDuringLabor: ValueSetConfig
      pregnancyMode: ValueSetConfig
      presentationAtDelivery: ValueSetConfig
      risksOrComplicationsOfPregnancy: ValueSetConfig
      risksRelatedToObstetricHistory: ValueSetConfig
      booleanOpenChoiceFields: ValueSetConfig
      booleanFields: ValueSetConfig
      vme: ValueSetConfig
      birthStatus: ValueSetConfig
    }> & {
      defaultFilterFormNames?: string[]
    }
    locationMap: ResourceFeatureConfig & {
      extensions: {
        locationShapeUrl?: string
        locationCount?: string
      }
      minZoom?: number
    }
    feasibilityReport: FeatureConfig
    contact: FeatureConfig
  }
  core: {
    fhir: {
      facetsExtensions: boolean
      filterActive: boolean
      useSource: boolean
      totalCount: boolean
      selectedCodeOnly: boolean
      textSearch: boolean
      valuesetExpansion: boolean
    }
    pagination: {
      limit: number
    }
    perimeterSourceTypeHierarchy: string[]
    codeSystems: {
      docStatus: string
    }
    valueSets: {
      demographicGender: ValueSetConfig
      encounterAdmission: ValueSetConfig
      encounterAdmissionMode: ValueSetConfig
      encounterDestination: ValueSetConfig
      encounterEntryMode: ValueSetConfig
      encounterExitMode: ValueSetConfig
      encounterExitType: ValueSetConfig
      encounterFileStatus: ValueSetConfig
      encounterProvenance: ValueSetConfig
      encounterSejourType: ValueSetConfig
      encounterStatus: ValueSetConfig
      encounterVisitType: ValueSetConfig
    }
    extensions: {
      codeHierarchy?: string
      conceptMapHierarchy?: string
      patientLastEnconterUrl?: string
      patientTotalAgeDaysExtensionUrl?: string
      patientTotalAgeMonthsExtensionUrl?: string
      statTotal?: string
      statTotalUnique?: string
    }
  }
  system: {
    wsProtocol: string
    fhirUrl: string
    backendUrl: string
    datamodelUrl: string
    oidc?: {
      issuer: string
      redirectUri: string
      scope: string
      clientId: string
      responseType: string
      state: string
    }
    codeDisplayJWT: string
    sessionTimeout: number
    refreshTokenInterval: number
    jToolUsers: string[]
    userTrackingBlacklist: string[]
    mailSupport?: string
    urlDoc?: string
  }
}

let config: AppConfig = {
  labels: {
    exploration: 'Exploration'
  },
  core: {
    fhir: {
      facetsExtensions: true,
      filterActive: true,
      totalCount: false,
      useSource: true,
      selectedCodeOnly: true,
      textSearch: true,
      valuesetExpansion: true
    },
    pagination: {
      limit: 1000
    },
    perimeterSourceTypeHierarchy: [],
    codeSystems: {
      docStatus: 'http://hl7.org/fhir/CodeSystem/composition-status'
    },
    valueSets: {
      demographicGender: { url: '' },
      encounterAdmission: { url: '' },
      encounterAdmissionMode: { url: '' },
      encounterDestination: { url: '' },
      encounterEntryMode: { url: '' },
      encounterExitMode: { url: '' },
      encounterExitType: { url: '' },
      encounterFileStatus: { url: '' },
      encounterProvenance: { url: '' },
      encounterSejourType: { url: '' },
      encounterStatus: { url: '' },
      encounterVisitType: { url: '' }
    },
    extensions: {
      statTotal: 'https://terminology.eds.aphp.fr/fhir/StructureDefinition/stat-total',
      statTotalUnique: 'https://terminology.eds.aphp.fr/fhir/StructureDefinition/stat-total-unique'
    }
  },
  features: {
    cohort: {
      enabled: true,
      shortCohortLimit: 2000,
      identifyingFields: [
        'family',
        'given',
        'identifier',
        'age-day',
        'subject.identifier',
        'encounter.identifier',
        'onlyPdfAvailable'
      ]
    },
    patient: {
      enabled: true,
      textSearch: true,
      useAgeParams: false,
      fhir: { searchParams: [] },
      valueSets: { demographicGender: { url: '' } }
    },
    encounter: {
      enabled: true,
      fhir: {
        searchParams: []
      },
      useNDA: true
    },
    diagnosticReport: {
      enabled: false,
      useStudyParam: false
    },
    export: {
      enabled: true,
      exportLinesLimit: 300000,
      exportTables: ''
    },
    observation: {
      enabled: true,
      useObservationValueRestriction: true,
      useObservationDefaultValidated: true,
      fhir: { searchParams: [] },
      valueSets: {
        biologyHierarchyAnabio: { url: '', title: 'ANABIO' },
        biologyHierarchyLoinc: { url: '', title: 'LOINC' }
      }
    },
    medication: {
      enabled: true,
      fhir: { searchParams: [] },
      valueSets: {
        medicationAdministrations: { url: '' },
        medicationAtc: { url: '', title: 'ATC' },
        medicationAtcOrbis: { url: '' },
        medicationPrescriptionTypes: { url: '' },
        medicationUcd: { url: '', title: 'UCD' }
      }
    },
    condition: {
      enabled: true,
      fhir: { searchParams: [] },
      valueSets: {
        conditionHierarchy: { url: '' },
        conditionStatus: { url: '' }
      },
      extensions: {
        orbisStatus: ''
      }
    },
    procedure: {
      enabled: true,
      fhir: { searchParams: [] },
      valueSets: {
        procedureHierarchy: { url: '' }
      }
    },
    documentReference: {
      enabled: true,
      fhir: { searchParams: [] },
      useDocStatus: false
    },
    claim: {
      enabled: true,
      fhir: { searchParams: [] },
      valueSets: {
        claimHierarchy: { url: '' }
      }
    },
    imaging: {
      enabled: true,
      fhir: { searchParams: [] },
      valueSets: {
        imagingModalities: { url: '' }
      },
      extensions: {
        imagingStudyUidUrl: ''
      }
    },
    questionnaires: {
      enabled: false,
      fhir: { searchParams: [] },
      valueSets: {
        analgesieType: { url: '' },
        birthDeliveryWay: { url: '' },
        cSectionModality: { url: '' },
        childBirthMode: { url: '' },
        hospitReason: { url: '' },
        chirurgicalGesture: { url: '' },
        conditionPerineum: { url: '' },
        exitDiagnostic: { url: '' },
        exitFeedingMode: { url: '' },
        exitPlaceType: { url: '' },
        feedingType: { url: '' },
        imgIndication: { url: '' },
        instrumentType: { url: '' },
        laborOrCesareanEntry: { url: '' },
        maternalRisks: { url: '' },
        maturationModality: { url: '' },
        maturationReason: { url: '' },
        obstetricalGestureDuringLabor: { url: '' },
        pathologyDuringLabor: { url: '' },
        pregnancyMode: { url: '' },
        presentationAtDelivery: { url: '' },
        risksOrComplicationsOfPregnancy: { url: '' },
        risksRelatedToObstetricHistory: { url: '' },
        booleanOpenChoiceFields: {
          url: 'booleanOpenChoiceFields',
          data: booleanOpenChoiceFieldsData
        },
        booleanFields: {
          url: 'booleanFields',
          data: booleanFieldsData
        },
        vme: {
          url: 'vme',
          data: vmeData
        },
        birthStatus: {
          url: 'birthStatus',
          data: birthStatusData
        }
      }
    },
    locationMap: {
      enabled: false,
      fhir: { searchParams: [] },
      extensions: {
        locationShapeUrl: 'https://terminology.eds.aphp.fr/fhir/profile/location/extension/shape',
        locationCount: 'https://terminology.eds.aphp.fr/fhir/profile/location/extension/count'
      }
    },
    feasibilityReport: {
      enabled: false
    },
    contact: {
      enabled: false
    }
  },
  system: {
    wsProtocol: 'ws://',
    backendUrl: '/api/back',
    fhirUrl: '/api/fhir',
    datamodelUrl: '/api/datamodel',
    sessionTimeout: 780000,
    refreshTokenInterval: 180000,
    codeDisplayJWT: 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a,Enter',
    jToolUsers: [],
    userTrackingBlacklist: []
  }
}

export const getConfig = (): Readonly<AppConfig> => {
  return { ...config }
}
export const AppConfig = createContext<AppConfig>(config)

const updateHooks: Array<(appConfig: AppConfig) => void> = []
export const onUpdateConfig = (hook: (newConfig: AppConfig) => void) => {
  updateHooks.push(hook)
}

export const updateConfig = (newConfig: DeepPartial<AppConfig>) => {
  config = R.mergeDeepRight(config, newConfig)
  updateHooks.forEach((hook) => hook(config))
  return config
}

const ConfigWrapper = (props: PropsWithChildren<{ config: AppConfig }>) => {
  const { config, children } = props
  const [appConfig, setAppConfig] = useState<AppConfig>(config)

  useEffect(() => {
    onUpdateConfig((newConfig) => {
      setAppConfig(newConfig)
    })
  }, [])

  return <AppConfig.Provider value={appConfig}>{children}</AppConfig.Provider>
}

export const initConfig = async (root: Root, app: () => ReactNode) => {
  const initApp = (fetchedConfig: AppConfig) => {
    const updatedConfig = updateConfig(fetchedConfig)
    root.render(<ConfigWrapper config={updatedConfig}>{app()}</ConfigWrapper>)
  }
  try {
    const res = await fetch(CONFIG_URL)
    // can potentially fetch other config files and merge them here
    // TODO check type of res.data : eg. https://stackoverflow.com/questions/77848430/axios-typescript-no-error-when-typed-post-returns-different-property-names
    initApp(await res.json())
  } catch (e) {
    console.error('Error while fetching config', e)
    initApp(config)
  }
}
