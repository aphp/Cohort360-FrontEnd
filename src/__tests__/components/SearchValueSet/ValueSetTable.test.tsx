import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { LoadingStatus } from 'types'
import { Hierarchy, HierarchyInfo, SearchMode, SelectedStatus } from 'types/hierarchy'
import { FhirItem } from 'types/valueSet'

vi.mock('utils/valueSets', () => ({
  getLabelFromCode: (code: { label: string }) => code.label,
  isDisplayedWithCode: () => false
}))

vi.mock('components/ui/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />
}))

import ValueSetTable from 'components/SearchValueSet/ValueSetTable'

const mkNode = (overrides: Partial<Hierarchy<FhirItem>> = {}): Hierarchy<FhirItem> => ({
  id: 'code1',
  label: 'Code 1',
  system: 'https://terminology.hl7.org/CodeSystem/test',
  above_levels_ids: '',
  inferior_levels_ids: '',
  statTotal: 10,
  statTotalUnique: 5,
  ...overrides
})

const mkHierarchy = (overrides: Partial<HierarchyInfo<FhirItem>> = {}): HierarchyInfo<FhirItem> => ({
  tree: [mkNode()],
  count: 100,
  page: 1,
  system: 'https://terminology.hl7.org/CodeSystem/test',
  ...overrides
})

const renderTable = (props: Partial<React.ComponentProps<typeof ValueSetTable>> = {}) =>
  render(
    <ValueSetTable
      hierarchy={mkHierarchy()}
      selectAllStatus={SelectedStatus.NOT_SELECTED}
      loading={{ expand: LoadingStatus.SUCCESS, list: LoadingStatus.SUCCESS }}
      mode={SearchMode.EXPLORATION}
      onExpand={vi.fn()}
      onSelect={vi.fn()}
      onSelectAll={vi.fn()}
      onChangePage={vi.fn()}
      {...props}
    />
  )

describe('ValueSetTable - loadingMode', () => {
  it('list mode: shows the result-count header and pagination, no expand arrow', () => {
    renderTable({ loadingMode: 'list' })

    expect(screen.getByText('100 résultat(s)')).toBeInTheDocument()
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.queryByTestId('KeyboardArrowRightIcon')).not.toBeInTheDocument()
  })

  it('expand mode: shows the expand arrow, no list header nor pagination', () => {
    renderTable({ loadingMode: 'expand' })

    expect(screen.getByTestId('KeyboardArrowRightIcon')).toBeInTheDocument()
    expect(screen.queryByText('100 résultat(s)')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('undefined loadingMode behaves like list mode (no expand arrow)', () => {
    renderTable({ loadingMode: undefined })

    expect(screen.getByText('100 résultat(s)')).toBeInTheDocument()
    expect(screen.queryByTestId('KeyboardArrowRightIcon')).not.toBeInTheDocument()
  })

  it('expand mode: clicking the arrow triggers onExpand and renders sub-items', () => {
    const onExpand = vi.fn()
    const parent = mkNode({ id: 'parent', label: 'Parent', subItems: [mkNode({ id: 'child', label: 'Child' })] })
    renderTable({
      loadingMode: 'expand',
      onExpand,
      // expand still fetching so internalLoading resolves and sub-items can render
      loading: { expand: LoadingStatus.FETCHING, list: LoadingStatus.SUCCESS },
      hierarchy: mkHierarchy({ tree: [parent] })
    })

    fireEvent.click(screen.getByTestId('KeyboardArrowRightIcon'))

    expect(onExpand).toHaveBeenCalledWith(parent)
  })

  it('research/list mode: sorting headers call onSort with toggled order', () => {
    const onSort = vi.fn()
    renderTable({ loadingMode: 'list', mode: SearchMode.RESEARCH, onSort })

    const nbPatients = screen.getByText('Nb Patients')
    fireEvent.click(nbPatients)
    expect(onSort).toHaveBeenCalledWith({ field: 'statTotalUnique', order: 'desc' })

    // Clicking the same field again toggles the order
    fireEvent.click(nbPatients)
    expect(onSort).toHaveBeenLastCalledWith({ field: 'statTotalUnique', order: 'asc' })
  })

  it('research mode: selecting all calls onSelect with the non-disabled nodes', () => {
    const onSelect = vi.fn()
    const node = mkNode()
    renderTable({
      loadingMode: 'list',
      mode: SearchMode.RESEARCH,
      onSelect,
      hierarchy: mkHierarchy({ tree: [node] })
    })

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(onSelect).toHaveBeenCalledWith([node], true, SearchMode.RESEARCH)
  })
})
