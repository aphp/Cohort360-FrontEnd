import api from './api'
import { getInfos, getLastEncounter } from './myPatients'
import { CONTEXT } from '../constants'

export const fetchPerimetersInfos = async (perimetersIds) => {
  if (CONTEXT === 'aphp') {
    const [perimetersResp, patientsResp, encountersResp, docsResp] = await Promise.all([
      api.get(`/Group?_id=${perimetersIds}`),
      api.get(
        `/Patient?facet=gender&pivotFacet=age_gender,deceased_gender&_list=${perimetersIds}&size=20`
      ),
      api.get(
        `/Encounter?pivotFacet=start-date_start-date-month_gender&facet=class&_list=${perimetersIds}&size=0`
      ),
      api.get(
        `/Composition?_list=${perimetersIds}&size=20&_sort=-date`
      )
    ])

    return {
      totalPatients: patientsResp.data.total,
      perimetersInfos: perimetersResp.data.entry
        ? perimetersResp.data.entry.map((e) => e.resource)
        : 0,
      patientsList: patientsResp.data.entry
        ? await getLastEncounter(patientsResp.data.entry.map((e) => e.resource))
        : 0,
      patientsFacets: patientsResp.data.meta.extension,
      encountersFacets: encountersResp.data.meta.extension,
      totalDocs: docsResp.data.total,
      docsList: docsResp.data.entry
        ? await getInfos(docsResp.data.entry.map((e) => e.resource))
        : 0
      // wordcloudData: docsResp.data.meta.extension
    }
  }
}
