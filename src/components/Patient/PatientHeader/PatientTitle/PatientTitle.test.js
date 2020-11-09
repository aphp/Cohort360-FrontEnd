import React from 'react'
import PatientTitle from './PatientTitle'
import { fireEvent, render, screen } from '@testing-library/react'

describe('PatientTitle', () => {
  beforeEach(() => render(<PatientTitle firstName="John" lastName="Smith" />))

  it('should display first name and last name', () => {
    expect(screen.getByText('John Smith')).toBeTruthy()
  })

  it('should not open the menu by default', () => {
    expect(screen.queryByRole('menu')).toBeNull()
    expect(screen.queryByRole('menuitem')).toBeNull()
  })

  it('should open the menu and display its items', () => {
    const menuButton = screen.getAllByRole('button')[1]
    fireEvent.click(menuButton)
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(screen.getAllByRole('menuitem')).toHaveLength(2)
    expect(screen.getByRole('menuitem', { name: 'Inclure dans une cohorte' })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: "Exclure d'une cohorte" })).toBeTruthy()
  })
})
