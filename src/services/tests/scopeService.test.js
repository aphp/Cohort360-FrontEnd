import * as scopeService from '../scopeService'
import api from '../api'

jest.mock('../api')

describe('scopeService', () => {
  it('should get all items', async () => {
    const expectedResult = [
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
    api.get.mockResolvedValue({ data: expectedResult })

    const items = await scopeService.getScopeItems()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenCalledWith('/scope')
    expect(items).toBe(expectedResult)
  })
})
