import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExplorationFilters from 'components/ExplorationBoard/Filters'
import { SourceType } from 'types/scope'

vi.mock('components/ui/Inputs/CalendarRange', () => ({
  default: ({ label }: { label: string }) => <div>{label}</div>
}))

const renderFilters = (filters: object, sourceType?: SourceType) =>
  render(
    <ExplorationFilters
      filters={filters as never}
      infos={{ sourceType } as never}
      onChange={vi.fn()}
      onError={vi.fn()}
      hasChanged={vi.fn()}
    />
  )

describe('ExplorationFilters - dates (BC3.3 #3283)', () => {
  it('libelle la date "Date de prélèvement" et propose la Date de validation en Biologie', () => {
    renderFilters({ durationRange: [null, null], validationDateRange: [null, null] }, SourceType.BIOLOGY)
    expect(screen.getByText('Date de prélèvement :')).toBeInTheDocument()
    expect(screen.getByText('Date de validation :')).toBeInTheDocument()
    expect(screen.queryByText('Date :')).not.toBeInTheDocument()
  })

  it('garde le libellé "Date :" et pas de Date de validation dans les autres onglets', () => {
    renderFilters({ durationRange: [null, null] })
    expect(screen.getByText('Date :')).toBeInTheDocument()
    expect(screen.queryByText('Date de validation :')).not.toBeInTheDocument()
  })
})
