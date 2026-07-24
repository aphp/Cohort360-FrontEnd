import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TableRow from 'components/ui/Table/TableRow'
import { CellType, Row } from 'types/table'
import { ChipStatus } from 'components/ui/StatusChip'
import { GenderStatus } from 'types/searchCriterias'
import SearchIcon from 'assets/icones/search.svg?react'

// On mocke DocumentViewer (dépendances PDF lourdes) pour isoler le rendu de la ligne.
vi.mock('components/DocumentViewer/DocumentViewer', () => ({
  default: () => <div data-testid="doc-viewer" />
}))

const renderRow = (row: Row) =>
  render(
    <table>
      <tbody>
        <TableRow row={row} />
      </tbody>
    </table>
  )

describe('ui/Table/TableRow - rendu des types de cellule', () => {
  it('rend une cellule TEXT et PARAGRAPHS', () => {
    const row = [
      { id: 't1', value: 'Bonjour', type: CellType.TEXT },
      { id: 'p1', value: [{ text: 'Ligne 1' }, { text: 'Ligne 2' }], type: CellType.PARAGRAPHS }
    ] as Row
    renderRow(row)
    expect(screen.getByText('Bonjour')).toBeInTheDocument()
    expect(screen.getByText('Ligne 1')).toBeInTheDocument()
  })

  it('rend une cellule CHECKBOX et déclenche onClick', () => {
    const onClick = vi.fn()
    const row = [{ id: 'c1', value: { isChecked: false, onClick }, type: CellType.CHECKBOX }] as Row
    renderRow(row)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onClick).toHaveBeenCalled()
  })

  it('rend une cellule FAV_ICON et déclenche onClick', () => {
    const onClick = vi.fn()
    const row = [
      { id: 'f1', value: { isFavorite: true, disabled: false, onClick }, type: CellType.FAV_ICON }
    ] as Row
    const { container } = renderRow(row)
    const btn = container.querySelector('button')
    fireEvent.click(btn!)
    expect(onClick).toHaveBeenCalled()
  })

  it('rend une cellule ACTIONS avec icône et tooltip', () => {
    const onClick = vi.fn()
    const row = [
      {
        id: 'a1',
        value: [{ title: 'Éditer', icon: SearchIcon, onClick, testId: 'edit-action' }],
        type: CellType.ACTIONS
      }
    ] as Row
    renderRow(row)
    expect(screen.getByTestId('edit-action')).toBeInTheDocument()
  })

  it('rend une cellule STATUS_CHIP', () => {
    const row = [
      { id: 's1', value: { label: 'Terminé', status: ChipStatus.VALID }, type: CellType.STATUS_CHIP }
    ] as Row
    renderRow(row)
    expect(screen.getByText('Terminé')).toBeInTheDocument()
  })

  it('rend une cellule LINK et ouvre l’URL au clic', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const row = [{ id: 'l1', value: { label: 'IPP 123', url: '/patients/1' }, type: CellType.LINK }] as Row
    renderRow(row)
    expect(screen.getByText('IPP 123')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(openSpy).toHaveBeenCalledWith('/patients/1')
    openSpy.mockRestore()
  })

  it('rend une cellule GENDER_ICON', () => {
    const row = [{ id: 'g1', value: GenderStatus.MALE, type: CellType.GENDER_ICON }] as Row
    const { container } = renderRow(row)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('masque une cellule isHidden', () => {
    const row = [{ id: 'h1', value: 'caché', type: CellType.TEXT, isHidden: true }] as Row
    renderRow(row)
    expect(screen.queryByText('caché')).not.toBeInTheDocument()
  })

  it('rend une cellule DOCUMENT_VIEWER (mockée)', () => {
    const row = [
      { id: 'dv1', value: { id: 'doc-1', deidentified: false }, type: CellType.DOCUMENT_VIEWER }
    ] as Row
    renderRow(row)
    // le bouton d'ouverture est présent
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('rend une cellule MODAL et ouvre le modal au clic', () => {
    const row = [{ id: 'm1', value: [{ text: 'commentaire' }], type: CellType.MODAL }] as Row
    renderRow(row)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Commentaires')).toBeInTheDocument()
  })

  it('rend une cellule SUBARRAY avec bouton d’expansion et bascule', () => {
    const row = [
      {
        id: 'sa1',
        value: { columns: [{ label: 'Col' }], rows: [] },
        type: CellType.SUBARRAY
      }
    ] as Row
    renderRow(row)
    const expandBtn = screen.getByLabelText('expand row')
    expect(screen.getByTestId('KeyboardArrowDownIcon')).toBeInTheDocument()
    fireEvent.click(expandBtn)
    expect(screen.getByTestId('KeyboardArrowUpIcon')).toBeInTheDocument()
  })
})
