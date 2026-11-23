import { describe, it, expect, vi } from 'vitest'
import { getLabelFromCode } from 'utils/valueSets'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import { Hierarchy } from 'types/hierarchy'

vi.mock('config', () => {
  const vs = (name: string) => ({
    url: `https://test/ValueSet/${name}`,
    codeSystemUrls: [`https://test/CodeSystem/${name}`]
  })
  return {
    getConfig: () => ({
      core: { valueSets: {} },
      features: {
        medication: { valueSets: { medicationAtc: vs('atc'), medicationUcd: vs('ucd') } },
        observation: { valueSets: { biologyHierarchyAnabio: vs('anabio'), biologyHierarchyLoinc: vs('loinc') } },
        procedure: { valueSets: { procedureHierarchy: vs('ccam') } },
        condition: { valueSets: { conditionHierarchy: vs('cim10') } },
        claim: { valueSets: { claimHierarchy: vs('ghm') } }
      }
    })
  }
})

vi.mock('services/aphp/serviceValueSets', () => ({
  HIERARCHY_ROOT: '*',
  getChildrenFromCodes: vi.fn()
}))

const anabioItem = (id: string, label: string): Hierarchy<any> => ({
  id,
  label,
  system: 'https://test/CodeSystem/anabio',
  above_levels_ids: '',
  inferior_levels_ids: ''
})

describe('RG3797 - affichage ANABIO <code> - <libellé>', () => {
  it('recompose le code et le libellé renvoyés séparément par ISD', () => {
    expect(getLabelFromCode(anabioItem('1046265', 'PARASITOLOGIE - ANTIPALUDOGRAMME'))).toBe(
      '1046265 - PARASITOLOGIE - ANTIPALUDOGRAMME'
    )
  })

  it("n'affiche le code qu'une seule fois", () => {
    const label = getLabelFromCode(anabioItem('1046265', 'PARASITOLOGIE - ANTIPALUDOGRAMME'))
    expect(label.split('1046265')).toHaveLength(2)
  })

  it('applique le format via le valueSetUrl (éléments dépliés)', () => {
    const item = { ...anabioItem('523321', 'ALLERGIE'), system: undefined, valueSetUrl: 'https://test/ValueSet/anabio' }
    expect(getLabelFromCode(item as Hierarchy<any>)).toBe('523321 - ALLERGIE')
  })

  it("n'affiche pas de code sur la ligne « Toute la hiérarchie »", () => {
    expect(getLabelFromCode(anabioItem(HIERARCHY_ROOT, 'Toute la hiérarchie'))).toBe('Toute la hiérarchie')
  })
})
