import React from 'react'
import { getCCAM, getCIM10, getGHM } from '../../../services/patientService'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PatientPMSI from './PatientPMSI'
import '@testing-library/jest-dom/extend-expect'

jest.mock('../../../services/patientService')

describe('PatientPMSI', () => {
  beforeAll(() => {
    getCIM10.mockResolvedValue([
      {
        nda: '46657832',
        codingDate: '2019-01-09',
        code: 'Z098',
        label: 'Libellé CIM10',
        type: 1,
        unit: 'Hôpital de Bicêtre'
      }
    ])
    getCCAM.mockResolvedValue([
      {
        nda: '46657832',
        codingDate: '2019-01-09',
        code: 'Z098',
        label: 'Libellé CCAM',
        type: 1,
        unit: 'Hôpital de Bicêtre'
      }
    ])
    getGHM.mockResolvedValue([
      {
        nda: '46657832',
        codingDate: '2019-01-09',
        code: 'Z098',
        label: 'Libellé GHM',
        type: 1,
        unit: 'Hôpital de Bicêtre'
      }
    ])
  })

  beforeEach(async () => {
    render(<PatientPMSI patientId="1" />)

    // Wait for data to be displayed
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(4))
  })

  it('should display CIM10 tab by default', () => {
    const cim10Tab = screen.getAllByRole('tab')[0]
    expect(cim10Tab).toHaveAttribute('aria-selected', 'true')

    expect(screen.getByRole('cell', { name: 'Libellé CIM10' })).toBeTruthy()

    expect(getCIM10).toHaveBeenCalledTimes(1)
    expect(getCIM10).toHaveBeenCalledWith('1')
    expect(getCCAM).not.toHaveBeenCalled()
    expect(getGHM).not.toHaveBeenCalled()
  })

  it('should display CCAM tab', async () => {
    const ccamTab = screen.getAllByRole('tab')[1]
    fireEvent.click(ccamTab)

    // Wait for data to be displayed
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(4))

    expect(ccamTab).toHaveAttribute('aria-selected', 'true')

    expect(screen.getByRole('cell', { name: 'Libellé CCAM' })).toBeTruthy()

    expect(getCIM10).toHaveBeenCalledTimes(1)
    expect(getCCAM).toHaveBeenCalledTimes(1)
    expect(getCCAM).toHaveBeenCalledWith('1')
    expect(getGHM).not.toHaveBeenCalled()
  })

  it('should display GHM tab', async () => {
    const ghmTab = screen.getAllByRole('tab')[2]
    fireEvent.click(ghmTab)

    // Wait for data to be displayed
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(4))

    expect(ghmTab).toHaveAttribute('aria-selected', 'true')

    expect(screen.getByRole('cell', { name: 'Libellé GHM' })).toBeTruthy()

    expect(getCIM10).toHaveBeenCalledTimes(1)
    expect(getCCAM).not.toHaveBeenCalled()
    expect(getGHM).toHaveBeenCalledTimes(1)
    expect(getGHM).toHaveBeenCalledWith('1')
  })
})
