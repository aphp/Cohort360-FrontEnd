import React from 'react'
import PatientDiagnosis from './PatientDiagnosis'
import { render, screen } from '@testing-library/react'

describe('PatientDiagnosis', () => {
  it('should display the list of diagnosis', () => {
    const diagnosis = ['d1', 'd2', 'd3']
    render(<PatientDiagnosis diagnosis={diagnosis} />)
    diagnosis.forEach((item) => expect(screen.getByText(item)).toBeTruthy())
  })
})
