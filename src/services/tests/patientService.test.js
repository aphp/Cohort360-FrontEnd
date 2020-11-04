import * as patientService from '../patientService'
import api from '../api'

jest.mock('../api')

describe('patientService', () => {
  it.skip('should get patient by id', async () => {
    const expectedResult = { id: '1', name: 'John Smith' }
    api.get.mockResolvedValue({ data: expectedResult })

    const patient = await patientService.getPatient(1)
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenCalledWith('/patients/1')
    expect(patient).toBe(expectedResult)
  })
})
