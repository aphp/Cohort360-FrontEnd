import { describe, it, expect, beforeEach, vi } from 'vitest'

// callApi construit des paramètres de requête FHIR/backend. On mocke la couche
// HTTP (fhirSearch, apiFhir, apiBackend, apiDatamodel) et on vérifie les
// ressources ciblées et quelques paramètres clés.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fhirSearch = vi.fn((..._args: any[]) => Promise.resolve({ data: { resourceType: 'Bundle', total: 0 } }))

vi.mock('../../services/apiFhir', () => ({
  default: { get: vi.fn(async () => ({ data: {} })) },
  fhirSearch: (...args: any[]) => fhirSearch(...args)
}))

vi.mock('services/apiDatamodel', () => ({ default: { get: vi.fn(async () => ({ data: {} })) } }))

vi.mock('../../services/apiBackend', () => ({
  default: { get: vi.fn(async () => ({ data: {} })), post: vi.fn(async () => ({ data: {} })) }
}))

vi.mock('config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('config')>()
  return { ...actual }
})

import {
  fetchPatient,
  fetchEncounter,
  fetchProcedure,
  fetchCondition,
  fetchClaim,
  fetchObservation,
  fetchMedicationRequest,
  fetchMedicationAdministration,
  fetchImaging,
  fetchDocumentReference,
  fetchBinary,
  fetchForms
} from 'services/aphp/callApi'

const optionsOf = () => fhirSearch.mock.calls[fhirSearch.mock.calls.length - 1][1] as string[]
const resourceOf = () => fhirSearch.mock.calls[fhirSearch.mock.calls.length - 1][0] as string

beforeEach(() => {
  vi.clearAllMocks()
  fhirSearch.mockResolvedValue({ data: { resourceType: 'Bundle', total: 0 } } as never)
})

describe('callApi.fetchPatient', () => {
  it('cible la ressource Patient et encode genre/texte/statut vital', async () => {
    await fetchPatient({
      size: 10,
      gender: 'f',
      _text: 'Dupont',
      searchBy: 'family' as never,
      deceased: true,
      _list: ['g1', 'g1']
    })
    expect(resourceOf()).toBe('Patient')
    const opts = optionsOf().join('&')
    expect(opts).toContain('gender=f')
    expect(opts).toContain('family=Dupont')
  })

  it('gère les bornes de date d’anniversaire (identifié)', async () => {
    await fetchPatient({ minBirthdate: 100, maxBirthdate: 200, deidentified: false })
    const opts = optionsOf().join('&')
    expect(opts).toMatch(/ge100/)
    expect(opts).toMatch(/le200/)
  })
})

describe('callApi.fetchEncounter', () => {
  it('cible Encounter', async () => {
    await fetchEncounter({ size: 0, _list: ['g1'], patient: 'p1' })
    expect(resourceOf()).toBe('Encounter')
  })
})

describe('callApi.fetchProcedure / fetchCondition / fetchClaim', () => {
  it('fetchProcedure cible Procedure', async () => {
    await fetchProcedure({ size: 0, _list: ['g1'], subject: 'p1' })
    expect(resourceOf()).toBe('Procedure')
  })
  it('fetchCondition cible Condition', async () => {
    await fetchCondition({ size: 0, _list: ['g1'] })
    expect(resourceOf()).toBe('Condition')
  })
  it('fetchClaim cible Claim', async () => {
    await fetchClaim({ size: 0, _list: ['g1'] })
    expect(resourceOf()).toBe('Claim')
  })
})

describe('callApi.fetchObservation', () => {
  it('cible Observation', async () => {
    await fetchObservation({ size: 0, _list: ['g1'], rowStatus: true })
    expect(resourceOf()).toBe('Observation')
  })
})

describe('callApi.fetchMedicationRequest / fetchMedicationAdministration', () => {
  it('fetchMedicationRequest cible MedicationRequest', async () => {
    await fetchMedicationRequest({ size: 0, _list: ['g1'], minDate: null, maxDate: null })
    expect(resourceOf()).toBe('MedicationRequest')
  })
  it('fetchMedicationAdministration cible MedicationAdministration', async () => {
    await fetchMedicationAdministration({ size: 0, _list: ['g1'], minDate: null, maxDate: null })
    expect(resourceOf()).toBe('MedicationAdministration')
  })
})

describe('callApi.fetchImaging', () => {
  it('cible ImagingStudy', async () => {
    await fetchImaging({ size: 0, _list: ['g1'] })
    expect(resourceOf()).toBe('ImagingStudy')
  })
})

describe('callApi.fetchDocumentReference', () => {
  it('cible DocumentReference', async () => {
    await fetchDocumentReference({ size: 0, _list: ['g1'], _text: 'note' })
    expect(resourceOf()).toBe('DocumentReference')
  })
})

describe('callApi.fetchBinary', () => {
  it('cible Binary', async () => {
    await fetchBinary({ _id: 'b1' })
    expect(resourceOf()).toBe('Binary')
  })
})

describe('callApi.fetchForms', () => {
  it('cible QuestionnaireResponse', async () => {
    await fetchForms({ size: 0, _list: ['g1'] })
    expect(resourceOf()).toBe('QuestionnaireResponse')
  })
})

describe('callApi - branches de filtres avancées', () => {
  it('fetchProcedure encode code, source, dates, executiveUnits et encounterStatus', async () => {
    await fetchProcedure({
      size: 0,
      _list: ['g1'],
      code: 'sys|A',
      source: ['ORBIS'],
      minDate: '2020-01-01',
      maxDate: '2020-12-31',
      executiveUnits: ['u1', 'u2'],
      'encounter-identifier': 'nda1',
      encounterStatus: ['finished'],
      _text: 'txt'
    } as never)
    expect(resourceOf()).toBe('Procedure')
    expect(fhirSearch).toHaveBeenCalled()
  })

  it('fetchCondition encode type de diagnostic et dates', async () => {
    await fetchCondition({
      size: 0,
      _list: ['g1'],
      code: 'sys|B',
      type: ['dp', 'dr'],
      'min-recorded-date': '2020-01-01',
      'max-recorded-date': '2020-12-31',
      executiveUnits: ['u1'],
      encounterStatus: ['arrived']
    } as never)
    expect(resourceOf()).toBe('Condition')
  })

  it('fetchObservation encode code, dates et rowStatus', async () => {
    await fetchObservation({
      size: 0,
      _list: ['g1'],
      code: 'sys|C',
      minDate: '2020-01-01',
      maxDate: '2020-12-31',
      rowStatus: true,
      executiveUnits: ['u1'],
      encounterStatus: ['finished']
    } as never)
    expect(resourceOf()).toBe('Observation')
  })

  it('fetchMedicationRequest encode type de prescription et dates', async () => {
    await fetchMedicationRequest({
      size: 0,
      _list: ['g1'],
      code: 'sys|D',
      type: ['type1'],
      minDate: '2020-01-01',
      maxDate: '2020-12-31',
      executiveUnits: ['u1'],
      encounterStatus: ['finished']
    } as never)
    expect(resourceOf()).toBe('MedicationRequest')
  })

  it('fetchMedicationAdministration encode voie d’administration', async () => {
    await fetchMedicationAdministration({
      size: 0,
      _list: ['g1'],
      code: 'sys|E',
      route: ['IV'],
      minDate: '2020-01-01',
      maxDate: '2020-12-31',
      executiveUnits: ['u1'],
      encounterStatus: ['finished']
    } as never)
    expect(resourceOf()).toBe('MedicationAdministration')
  })

  it('fetchImaging encode modalités et dates', async () => {
    await fetchImaging({
      size: 0,
      _list: ['g1'],
      modalities: ['CT', 'MR'],
      minDate: '2020-01-01',
      maxDate: '2020-12-31',
      executiveUnits: ['u1'],
      encounterStatus: ['finished'],
      _text: 'scan'
    } as never)
    expect(resourceOf()).toBe('ImagingStudy')
  })

  it('fetchDocumentReference encode docStatuses, type, ipp et dates', async () => {
    await fetchDocumentReference({
      size: 0,
      _list: ['g1'],
      docStatuses: ['final'],
      type: 'CR-BILFONC',
      'patient-identifier': 'ipp1',
      'encounter-identifier': 'nda1',
      minDate: '2020-01-01',
      maxDate: '2020-12-31',
      executiveUnits: ['u1'],
      encounterStatus: ['finished'],
      _text: 'note'
    } as never)
    expect(resourceOf()).toBe('DocumentReference')
  })

  it('fetchClaim encode diagnosis et dates de création', async () => {
    await fetchClaim({
      size: 0,
      _list: ['g1'],
      diagnosis: 'sys|F',
      minCreated: '2020-01-01',
      maxCreated: '2020-12-31',
      executiveUnits: ['u1'],
      encounterStatus: ['finished']
    } as never)
    expect(resourceOf()).toBe('Claim')
  })
})
