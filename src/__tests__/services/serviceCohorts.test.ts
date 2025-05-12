import { describe, it, expect, vi } from 'vitest'
import services from 'services/aphp'
import { fetchForms } from 'services/aphp/callApi'
import { Direction, FormNames, Order } from 'types/searchCriterias'

vi.mock('services/aphp/callApi', () => ({
  fetchForms: vi.fn().mockResolvedValue({
    data: {
      resourceType: 'Bundle',
      total: 1,
      entry: [
        {
          resource: {
            id: 1,
            subject: 'Patient/2',
            authored: '2024-06-13T22:00:00+00:00'
          }
        }
      ]
    }
  }),
  fetchPatient: vi.fn().mockResolvedValue({
    data: {
      resourceType: 'Patient',
      total: 1,
      entry: [{ resource: { id: 1 } }]
    }
  })
}))
vi.mock('utils/fillElement.ts', () => ({
  getResourceInfos: vi.fn().mockResolvedValue([
    {
      resourceType: 'QuestionnaireResponse',
      id: 1
    }
  ])
}))

// describe('services.cohorts.fetchFormsList', () => {
//   it('should call fetchForms with the correct parameters', async () => {
//     const options = {
//       page: 1,
//       searchCriterias: {
//         searchInput: '',
//         orderBy: { orderBy: Order.AUTHORED, orderDirection: Direction.DESC },
//         filters: {
//           ipp: '800000000000000',
//           formName: [FormNames.PREGNANCY],
//           executiveUnits: [],
//           encounterStatus: [{ id: 'entered-in-error', label: 'Entered in error' }],
//           startDate: null,
//           endDate: null
//         }
//       }
//     }
//     const groupId = '10500'

//     const result = await services.cohorts.fetchFormsList(options, groupId)

//     expect(fetchForms).toBeCalledWith({
//       _list: ['10500'],
//       size: 20,
//       offset: 0,
//       order: 'authored',
//       orderDirection: 'desc',
//       ipp: '800000000000000',
//       executiveUnits: [],
//       encounterStatus: ['entered-in-error'],
//       formName: FormNames.PREGNANCY,
//       uniqueFacet: ['subject']
//     })

//     expect(result).toEqual({
//       total: 1,
//       totalAllResults: 1,
//       totalPatients: 0,
//       totalAllPatients: 0,
//       list: [{ id: 1, resourceType: 'QuestionnaireResponse' }]
//     })
//   })
// })
