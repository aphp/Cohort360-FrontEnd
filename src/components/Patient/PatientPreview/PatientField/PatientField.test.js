import React from 'react'
import PatientField from './PatientField'
import { render, screen } from '@testing-library/react'

describe('PatientField', () => {
  it("should display field's name and value", () => {
    render(<PatientField fieldName="Field 1" fieldValue="1" />)
    expect(screen.getByText('Field 1')).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()
  })
})
