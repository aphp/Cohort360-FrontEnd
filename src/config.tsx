import React, { createContext, ReactNode } from 'react'
import { Root } from 'react-dom/client'
import * as R from 'ramda'
import { CONFIG_URL } from 'constants.js'
import { LabelObject } from 'types/searchCriterias'
import { birthStatusData, booleanFieldsData, booleanOpenChoiceFieldsData, vmeData } from 'data/questionnaire_data'

type ValueSetConfig = {
  url: string
  title?: string
  data?: LabelObject[]
}

export type AppConfig = {
  labels: {
    exploration: string
  }
  features: {
    cohort: {
      enabled: boolean
      shortCohortLimit: number
    }
    diagnosticReport: {
      enabled: boolean
      useStudyParam: boolean
    }
    export: {
      enabled: boolean
      exportLinesLimit: number
      exportTables: string
    }
    observation: {
      enabled: boolean
      valueSets: {
        biologyHierarchyAnabio: ValueSetConfig
        biologyHierarchyLoinc: ValueSetConfig
      }
    }
    medication: {
      enabled: boolean
      valueSets: {
        medicationAdministrations: ValueSetConfig
        medicationAtc: ValueSetConfig
        medicationAtcOrbis: ValueSetConfig
        medicationPrescriptionTypes: ValueSetConfig
        medicationUcd: ValueSetConfig
      }
    }
    condition: {
      enabled: boolean
      valueSets: {
        conditionHierarchy: ValueSetConfig
        conditionStatus: ValueSetConfig
      }
      extensions: {
        orbisStatus?: string
      }
    }
    procedure: {
      enabled: boolean
      valueSets: {
        procedureHierarchy: ValueSetConfig
      }
    }
    documentReference: {
      enabled: boolean
    }
    claim: {
      enabled: boolean
      valueSets: {
        claimHierarchy: ValueSetConfig
      }
    }
    imaging: {
      enabled: boolean
      valueSets: {
        imagingModalities: ValueSetConfig
      }
      extensions: {
        imagingStudyUidUrl: string
        seriesProtocolUrl?: string
      }
    }
    questionnaires: {
      enabled: boolean
      valueSets: {
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
      }
    }
    locationMap: {
      enabled: boolean
      extensions: {
        locationShapeUrl?: string
        locationCount?: string
      }
    }
    feasibilityReport: {
      enabled: boolean
    }
    contact: {
      enabled: boolean
    }
  }
  core: {
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
  }
}

let config: AppConfig = {
  labels: {
    exploration: 'Exploration'
  },
  core: {
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
    extensions: {}
  },
  features: {
    cohort: {
      enabled: true,
      shortCohortLimit: 2000
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
      valueSets: {
        biologyHierarchyAnabio: { url: '', title: 'ANABIO' },
        biologyHierarchyLoinc: { url: '', title: 'LOINC' }
      }
    },
    medication: {
      enabled: true,
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
      valueSets: {
        procedureHierarchy: { url: '' }
      }
    },
    documentReference: {
      enabled: true
    },
    claim: {
      enabled: true,
      valueSets: {
        claimHierarchy: { url: '' }
      }
    },
    imaging: {
      enabled: true,
      valueSets: {
        imagingModalities: { url: '' }
      },
      extensions: {
        imagingStudyUidUrl: ''
      }
    },
    questionnaires: {
      enabled: false,
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

export const initConfig = async (root: Root, app: () => ReactNode) => {
  const initApp = (fetchedConfig: AppConfig) => {
    config = R.mergeDeepRight(config, fetchedConfig)
    updateHooks.forEach((hook) => hook(config))
    root.render(<AppConfig.Provider value={config}>{app()}</AppConfig.Provider>)
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
