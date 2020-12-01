import React from 'react'
import { getScopeItems } from '../../services/scopeService'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Scope from './Scope'
import { getByRole } from '@testing-library/dom'
import '@testing-library/jest-dom/extend-expect'

jest.mock('../../services/scopeService')

const mockData = [
  {
    id: 1,
    name: 'Item',
    patientsNb: 12
  },
  {
    id: 2,
    name: 'Subitem',
    patientsNb: 2,
    parent: 1
  }
]

describe('Scope', () => {
  beforeAll(() => getScopeItems.mockResolvedValue(mockData))

  beforeEach(async () => {
    render(<Scope />)
    await screen.findAllByRole('row') // Wait for the rows to be loaded
  })

  it('should fetch data', () => {
    expect(getScopeItems).toHaveBeenCalledTimes(1)
  })

  it('should display parent item', () => {
    expect(screen.getByRole('cell', { name: 'Item' })).toBeTruthy()
  })

  it('should not display child item by default', () => {
    expect(screen.queryByRole('cell', { name: 'Subitem' })).toBeNull()
  })

  it('should display child item when clicking expand button', async () => {
    const expandButton = getByRole(screen.getAllByRole('cell')[0], 'button')
    fireEvent.click(expandButton)
    await expect(screen.findByRole('cell', { name: 'Subitem' })).resolves.toBeTruthy()
  })

  it('should disable validate and cancel buttons when no items are selected', () => {
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeDisabled()
  })

  it('should enable validate and cancel buttons when some items are selected', () => {
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(firstRowCheckbox)
    expect(screen.getByRole('button', { name: 'Valider' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeEnabled()
  })

  it('should clear selection when cancel button is clicked', () => {
    const firstRowCheckbox = screen.getAllByRole('checkbox')[1]
    const cancelButton = screen.getByRole('button', { name: 'Annuler' })

    fireEvent.click(firstRowCheckbox)
    fireEvent.click(cancelButton)

    waitFor(() => expect(firstRowCheckbox).not.toBeChecked())
  })
})
