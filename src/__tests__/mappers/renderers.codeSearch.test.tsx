import React from 'react'
import { render } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { updateConfig } from 'config'

const CCAM = 'https://aphp.fr/ig/fhir/core/CodeSystem/CCAMDescriptiveVerAPHP'

const declensions = [
  { id: 'JQGA004...01', label: 'Activite 1', system: CCAM },
  { id: 'JQGA004...04', label: 'Activite 4', system: CCAM },
  { id: 'JQGA004-1201', label: 'Accouchement unique', system: CCAM }
]

vi.mock('state', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ valueSets: { cache: { [CCAM]: declensions }, entities: {} } })
}))

vi.mock('state/valueSets', () => ({ selectValueSetCodes: () => [] }))

vi.mock('components/SearchValueSet/ValueSetField', () => ({
  default: ({ value }: { value: { id: string }[] }) => <div data-testid="field">{value.map((c) => c.id).join(',')}</div>
}))

import FORM_ITEM_RENDERER from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CriteriaForm/mappers/renderers'

describe('FORM_ITEM_RENDERER.codeSearch', () => {
  beforeAll(() => {
    updateConfig({ features: { procedure: { valueSets: { procedureHierarchy: { url: CCAM } } } } })
  })

  const renderCodeSearch = (value: { id: string; system: string }[], updateData = vi.fn()) => {
    const CodeSearch = FORM_ITEM_RENDERER.codeSearch as unknown as React.FC<Record<string, unknown>>
    return render(
      <CodeSearch
        value={value}
        updateData={updateData}
        setError={vi.fn()}
        definition={{ valueSetsInfo: [{ url: CCAM }], label: '' }}
        disabled={false}
      />
    )
  }

  it('displays every declension of a stored wildcard code', () => {
    const { getByTestId } = renderCodeSearch([{ id: 'JQGA004*', system: CCAM }])

    const shown = getByTestId('field').textContent ?? ''
    expect(shown).toContain('JQGA004...01')
    expect(shown).toContain('JQGA004...04')
    expect(shown).toContain('JQGA004-1201')
    expect(shown).toContain('JQGA004*')
  })

  it('leaves an already segmented code alone', () => {
    const { getByTestId } = renderCodeSearch([{ id: 'JQGA004...01', system: CCAM }])

    expect(getByTestId('field').textContent).toBe('JQGA004...01')
  })
})
