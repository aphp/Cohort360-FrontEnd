import { describe, expect, it } from 'vitest'
import { CHIPS_DISPLAY_METHODS } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CriteriaForm/mappers/chipDisplayMapper'

const CCAM = 'https://aphp.fr/ig/fhir/core/CodeSystem/CCAMDescriptiveVerAPHP'

const valueSets = {
  entities: {},
  cache: { [CCAM]: [{ id: '000742.....', label: 'Fermeture de fistule', system: CCAM }] }
} as any

const item = { valueSetsInfo: [{ url: CCAM }] } as any

describe('CHIPS_DISPLAY_METHODS.codeSearch', () => {
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
})
