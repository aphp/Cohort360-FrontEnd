import { beforeAll, describe, expect, it } from 'vitest'
import { updateConfig } from 'config'

const CCAM = 'https://aphp.fr/ig/fhir/core/CodeSystem/CCAMDescriptiveVerAPHP'

import { CHIPS_DISPLAY_METHODS } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CriteriaForm/mappers/chipDisplayMapper'

const valueSets = {
  entities: {},
  cache: { [CCAM]: [{ id: '000742.....', label: 'Fermeture de fistule', system: CCAM }] }
} as any

const item = { valueSetsInfo: [{ url: CCAM }] } as any

describe('CHIPS_DISPLAY_METHODS.codeSearch', () => {
  beforeAll(() => {
    updateConfig({ features: { procedure: { valueSets: { procedureHierarchy: { url: CCAM } } } } })
  })

  it('builds a chip when the stored code resolves in cache', () => {
    const chip = CHIPS_DISPLAY_METHODS.codeSearch([{ id: '000742', system: CCAM }] as any, item, valueSets, ['', false])
    expect(chip).toBeTruthy()
  })

  it('does not throw when the code is absent from cache', () => {
    const chip = CHIPS_DISPLAY_METHODS.codeSearch([{ id: 'ZZZ999', system: 'https://other' }] as any, item, valueSets, [
      '',
      false
    ])
    expect(chip).toBeTruthy()
  })

  it('lists every declension of a wildcard code and hides the wildcard itself', () => {
    const segmented = {
      entities: {},
      cache: {
        [CCAM]: [
          { id: 'JQGA004...01', label: 'Cesarienne activite 1', system: CCAM },
          { id: 'JQGA004-1201', label: 'Cesarienne unique', system: CCAM }
        ]
      }
    } as any
    const chip = CHIPS_DISPLAY_METHODS.codeSearch([{ id: 'JQGA004*', system: CCAM }] as any, item, segmented, ['', false])

    expect(JSON.stringify(chip)).toContain('Cesarienne activite 1')
    expect(JSON.stringify(chip)).toContain('Cesarienne unique')
    expect(JSON.stringify(chip)).not.toContain('JQGA004*')
  })
})
