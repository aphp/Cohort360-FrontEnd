import { describe, it, expect } from 'vitest'
import {
  getGenderRepartitionMapAphp,
  getGenderRepartitionMap,
  getEncounterRepartitionMapAphp,
  getEncounterRepartitionMap,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMapAphp,
  getVisitRepartitionMap,
  getGenderRepartitionSimpleData
} from 'utils/graphUtils'
import { Encounter, Extension, Patient } from 'fhir/r4'

describe('graphUtils.getGenderRepartitionMap (patients)', () => {
  it('compte vivants et décédés par genre', () => {
    const patients: Patient[] = [
      { resourceType: 'Patient', gender: 'male' },
      { resourceType: 'Patient', gender: 'female', deceasedDateTime: '2020-01-01' },
      { resourceType: 'Patient' } // gender absent -> unknown
    ]
    const result = getGenderRepartitionMap(patients)
    expect(result.male.alive).toBe(1)
    expect(result.female.deceased).toBe(1)
    expect(result.unknown.alive).toBe(1)
  })
})

describe('graphUtils.getGenderRepartitionMapAphp (facet FHIR)', () => {
  it('répartit les valeurs par genre selon le statut décédé', () => {
    const facet: Extension[] = [
      {
        url: 'root',
        extension: [
          { url: 'true' },
          {
            url: 'gender.display',
            extension: [
              { url: 'female', valueDecimal: 5 },
              { url: 'male', valueDecimal: 3 }
            ]
          }
        ]
      },
      {
        url: 'root',
        extension: [
          { url: 'false' },
          {
            url: 'gender.display',
            extension: [{ url: 'male', valueDecimal: 7 }]
          }
        ]
      }
    ]
    const result = getGenderRepartitionMapAphp(facet)
    expect(result.female.deceased).toBe(5)
    expect(result.male.deceased).toBe(3)
    expect(result.male.alive).toBe(7)
  })

  it('retourne une carte à zéro pour un facet vide', () => {
    const result = getGenderRepartitionMapAphp(undefined)
    expect(result.male.alive).toBe(0)
    expect(result.female.deceased).toBe(0)
  })
})

describe('graphUtils.getEncounterRepartitionMapAphp', () => {
  it('mappe les types de visite avec label et couleur', () => {
    const extension: Extension[] = [
      { url: 'x', extension: [{ url: 'urg', valueDecimal: 12 }] },
      { url: 'y', extension: [{ url: 'inconnu', valueDecimal: 4 }] }
    ]
    const result = getEncounterRepartitionMapAphp(extension)
    expect(result[0]).toMatchObject({ label: 'Urgence', value: 12 })
    expect(result[1]).toMatchObject({ label: 'Autres visites', value: 4 })
  })
})

describe('graphUtils.getEncounterRepartitionMap (encounters)', () => {
  it('agrège par code de classe', () => {
    const encounters: Encounter[] = [
      { resourceType: 'Encounter', status: 'finished', class: { code: 'A' } },
      { resourceType: 'Encounter', status: 'finished', class: { code: 'A' } },
      { resourceType: 'Encounter', status: 'finished', class: { code: 'B' } }
    ]
    const result = getEncounterRepartitionMap(encounters)
    const a = result.find((d) => d.label === 'A')
    const b = result.find((d) => d.label === 'B')
    expect(a?.value).toBe(2)
    expect(b?.value).toBe(1)
  })
})

describe('graphUtils.getAgeRepartitionMapAphp', () => {
  it('construit la pyramide des âges à partir du facet', () => {
    const facet: Extension[] = [
      {
        url: 'root',
        extension: [
          { url: '24' }, // 24 mois => 2 ans
          {
            url: 'gender.display',
            extension: [
              { url: 'female', valueDecimal: 2 },
              { url: 'male', valueDecimal: 3 }
            ]
          }
        ]
      }
    ]
    const result = getAgeRepartitionMapAphp(facet)
    // à l'index 2 (2 ans) on retrouve les valeurs
    expect(result[2].female).toBe(2)
    expect(result[2].male).toBe(3)
  })

  it('retourne un tableau vide pour un facet vide', () => {
    expect(getAgeRepartitionMapAphp(undefined)).toEqual([])
  })
})

describe('graphUtils.getVisitRepartitionMapAphp', () => {
  it('agrège les visites par mois et genre', () => {
    const facet: Extension[] = [
      { url: 'root', extension: [{ url: 'year-1-female', valueDecimal: 4 }] }
    ]
    const result = getVisitRepartitionMapAphp(facet)
    // mois index 1 => Janvier (selon getStringMonthAphp)
    expect(result.Janvier.female).toBe(4)
    expect(result.Janvier.femaleCount).toBe(1)
  })
})

describe('graphUtils.getVisitRepartitionMap (patients + encounters)', () => {
  it('compte les visites par mois selon le genre du patient', () => {
    const patients: Patient[] = [{ resourceType: 'Patient', id: 'p1', gender: 'male' }]
    const encounters: Encounter[] = [
      {
        resourceType: 'Encounter',
        status: 'finished',
        class: { code: 'A' },
        subject: { reference: 'Patient/p1' },
        period: { start: '2020-03-15' }
      }
    ]
    const result = getVisitRepartitionMap(patients, encounters)
    expect(result.Mars.male).toBe(1)
  })
})

describe('graphUtils.getGenderRepartitionSimpleData', () => {
  it('retourne undefined pour une carte absente', () => {
    expect(getGenderRepartitionSimpleData(undefined)).toEqual({ vitalStatusData: undefined, genderData: undefined })
  })

  it('agrège les totaux vivant/décédé et par genre', () => {
    const map = {
      female: { deceased: 1, alive: 2 },
      male: { deceased: 3, alive: 4 },
      other: { deceased: 0, alive: 0 },
      unknown: { deceased: 0, alive: 1 }
    }
    const result = getGenderRepartitionSimpleData(map)
    const alive = result.vitalStatusData?.find((d) => d.value === 7)
    expect(alive).toBeDefined() // 2+4+0+1
    expect(result.genderData).toBeDefined()
  })
})
