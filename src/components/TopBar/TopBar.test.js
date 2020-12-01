import React from 'react'
import { render, screen } from '@testing-library/react'
import TopBar from './TopBar'

describe('TopBar', () => {
  it('should display informations', () => {
    render(<TopBar title="Test title" status="Test status" patientsNb={50} access="Test access" />)
    expect(screen.getByRole('heading', { name: 'Test title' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Test status' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '50' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Test access' })).toBeTruthy()
  })

  it('should not display save button by default', () => {
    render(<TopBar />)
    expect(screen.queryByRole('button', { name: 'Enregistrer' })).toBeNull()
  })

  it('should display save button', () => {
    render(<TopBar save />)
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeTruthy()
  })
})
