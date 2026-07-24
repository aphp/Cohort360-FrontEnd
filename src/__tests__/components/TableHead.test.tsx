import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TableHead, { renderTableHeadCellContent } from 'components/ui/Table/TableHead'
import { Column } from 'types/table'
import { Direction, Order } from 'types/searchCriterias'

const renderInTable = (ui: React.ReactElement) =>
  render(
    <table>
      <thead>{ui}</thead>
    </table>
  )

describe('ui/Table/TableHead', () => {
  it('rend les en-têtes de colonnes', () => {
    const columns: Column[] = [{ label: 'Nom' }, { label: 'Date' }]
    renderInTable(<TableHead columns={columns} />)
    expect(screen.getByText('Nom')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('rend une case à cocher pour une colonne checkbox', () => {
    const columns: Column[] = [
      { label: '', isCheckbox: true, checkboxProps: { isChecked: false, isIndeterminate: false, onSelectAll: vi.fn() } }
    ]
    renderInTable(<TableHead columns={columns} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('rend un label de tri cliquable et notifie onSort', () => {
    const onSort = vi.fn()
    const columns: Column[] = [{ label: 'Nom', code: Order.FAMILY }]
    renderInTable(
      <TableHead columns={columns} orderBy={{ orderBy: Order.FAMILY, orderDirection: Direction.ASC }} onSort={onSort} />
    )
    fireEvent.click(screen.getByText('Nom'))
    expect(onSort).toHaveBeenCalled()
  })
})

describe('renderTableHeadCellContent', () => {
  it('rend un tooltip avec icône info', () => {
    const content = renderTableHeadCellContent({ label: 'Info', tooltip: 'Aide' })
    renderInTable(<tr><th>{content}</th></tr>)
    expect(screen.getByText('Info')).toBeInTheDocument()
    expect(screen.getByTestId('InfoIcon')).toBeInTheDocument()
  })

  it('rend un simple label quand aucune option', () => {
    const content = renderTableHeadCellContent({ label: 'Simple' })
    renderInTable(<tr><th>{content}</th></tr>)
    expect(screen.getByText('Simple')).toBeInTheDocument()
  })
})
