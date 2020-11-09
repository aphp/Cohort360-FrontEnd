import React from 'react'
import { render, screen } from '@testing-library/react'
import PatientInfo from './PatientInfo'

describe('PatientInfo', () => {
  it('should display age and IPP', () => {
    render(<PatientInfo age={42} ipp={'1234'} />)
    expect(screen.getByText('42 ans')).toBeTruthy()
    expect(screen.getByText('IPP : 1234')).toBeTruthy()
  })
})
