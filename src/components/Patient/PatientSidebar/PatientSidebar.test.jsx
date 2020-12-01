import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import PatientSidebar from './PatientSidebar'

describe('PatientSidebar', () => {
  const closeCallback = jest.fn()

  beforeEach(() => render(<PatientSidebar open onClose={closeCallback} />))

  it('should display all items by default', () => {
    expect(screen.getByText('Pierre Dupont')).toBeTruthy()
    expect(screen.getByText('Jean Dupont')).toBeTruthy()
  })

  it('should not display clear button by default', () => {
    expect(screen.queryByLabelText('Effacer')).toBeNull()
  })

  it('should filter items on search input', () => {
    fireEvent.change(screen.getByPlaceholderText('Rechercher'), {
      target: { value: 'pi' }
    })
    expect(screen.queryByText('Pierre Dupont')).toBeTruthy()
    expect(screen.queryByText('Jean Dupont')).toBeNull()
  })

  it('should clear search input', () => {
    fireEvent.change(screen.getByPlaceholderText('Rechercher'), {
      target: { value: 'pi' }
    })
    fireEvent.click(screen.getByLabelText('Effacer'))
    expect(screen.getByText('Pierre Dupont')).toBeTruthy()
    expect(screen.getByText('Jean Dupont')).toBeTruthy()
  })

  it('should close sidebar', () => {
    fireEvent.click(screen.getByLabelText('Fermer'))
    expect(closeCallback).toHaveBeenCalledTimes(1)
  })
})
