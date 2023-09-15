import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import ScopeTreeChipsets from '../../../components/ScopeTree/ScopeTreeChipsets/ScopeTreeChipsets'
import { ScopeTreeRow } from '../../../types'
import { vi } from 'vitest'

describe('ScopeTreeChipsets', () => {
  test('renders selected items', () => {
    const selectedItems: ScopeTreeRow[] = [
      {
        id: '1',
        name: 'Item 1',
        quantity: 1,
        subItems: []
      },
      {
        id: '2',
        name: 'Item 2',
        quantity: 2,
        subItems: []
      }
    ]
    const onDelete = vi.fn()
    const { getByText } = render(<ScopeTreeChipsets selectedItems={selectedItems} onDelete={onDelete} />)
    expect(getByText('Item 1')).toBeInTheDocument()
    expect(getByText('Item 2')).toBeInTheDocument()
  })

  it('should call onDelete when a chip is deleted', () => {
    const selectedItems: ScopeTreeRow[] = [
      {
        id: '1',
        name: 'Item 1',
        quantity: 1,
        subItems: []
      }
    ]

    const onDelete = vi.fn()

    const { getByTestId } = render(<ScopeTreeChipsets selectedItems={selectedItems} onDelete={onDelete} />)

    fireEvent.click(getByTestId('CancelIcon'))

    expect(onDelete).toHaveBeenCalledWith(selectedItems[0])
  })
})
