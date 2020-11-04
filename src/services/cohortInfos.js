import api from './api'
import { getInfos, getLastEncounter } from './myPatients'
import { CONTEXT } from '../constants'

export const fetchCohort = async (cohortId) => {
  if (CONTEXT === 'aphp') {
    const [cohortResp, patientsResp, encountersResp, docsResp] = await Promise.all([
      api.get(`/Group?_id=${cohortId}`),
      api.get(
        `/Patient?facet=gender&pivotFacet=age_gender,deceased_gender&_list=${cohortId}&size=20`
      ),
      api.get(
        `/Encounter?pivotFacet=start-date_start-date-month_gender&facet=class&_list=${cohortId}&size=0`
      ),
      api.get(
        `/Composition?_list=${cohortId}&size=20&_sort=-date`
      )
    ])

    return {
      cohortInfos: cohortResp.data.entry
        ? cohortResp.data.entry[0].resource
        : 0,
      totalPatients: patientsResp.data.total,
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

export const fetchPatientList = async (
  page,
  groupId,
  searchBy,
  searchInput,
  gender,
  age,
  vitalStatus,
  includeFacets
) => {
  if (CONTEXT === 'aphp') {
    let searchByGroup = ''
    let search = ''
    let genderFilter = ''
    let ageFilter = ''
    let vitalStatusFilter = ''
    let facets = ''

    if (groupId) {
      searchByGroup = `&_list=${groupId}`
    }

    if (searchInput) {
      if (searchBy) {
        search = `&${searchBy}=${searchInput}`
      } else {
        search = `&_text=${searchInput}`
      }
    }

    if (gender !== 'all') {
      genderFilter = `&gender=${gender}`
    }

    if (age !== [0, 130]) {
      const today = new Date()

      let month = today.getMonth() + 1
      if (month < 10) {
        month = '0' + month
      }

      let day = today.getDate()
      if (day < 10) {
        day = '0' + day
      }

      const date1 = `${today.getFullYear() - age[1]}-${month}-${day}`
      const date2 = `${today.getFullYear() - age[0]}-${month}-${day}`
      ageFilter = `&birthdate=ge${date1}&birthdate=le${date2}`
    }

    if (vitalStatus !== 'all') {
      if (vitalStatus === 'deceased') {
        vitalStatusFilter = '&deceased=true'
      } else if (vitalStatus === 'alive') {
        vitalStatusFilter = '&deceased=false'
      }
    }

    if (includeFacets) {
      facets = 'facet=gender&pivotFacet=age_gender,deceased_gender&'
    }

    const patientsResp = await api.get(
      `/Patient?${facets}size=20&offset=${page ? (page - 1) * 20 : 0
      }${searchByGroup}${search}${genderFilter}${vitalStatusFilter}${ageFilter}`
    )

    return {
      patientsTotal: patientsResp.data.total,
      patientsList: patientsResp.data.entry
        ? await getLastEncounter(patientsResp.data.entry.map((e) => e.resource))
        : 0,
      patientsFacets: patientsResp.data.meta.extension
    }
  }
}

export const fetchDocuments = async (
  page,
  groupId,
  searchInput,
  selectedDocTypes,
  nda
) => {
  if (CONTEXT === 'aphp') {
    let searchByGroup = ''
    let search = ''
    let docTypesFilter = ''
    let ndaFilter = ''

    if (groupId) {
      searchByGroup = `&_list=${groupId}`
    }

    if (searchInput) {
      search = `&_text=${searchInput}`
    }

    if (!selectedDocTypes.includes('all')) {
      docTypesFilter = `&type=${selectedDocTypes.join()}`
    }

    if (nda) {
      ndaFilter = `&encounter.identifier=${nda}`
    }

    const docsList = await api.get(
      `/Composition?size=20&_sort=-date&offset=${page ? (page - 1) * 20 : 0
      }${searchByGroup}${search}${docTypesFilter}${ndaFilter}`
    )

    if (!docsList.data.total) {
      return null
    } else {
      return {
        docsTotal: docsList.data.total,
        docsList: docsList.data.entry
          ? await getInfos(docsList.data.entry.map((e) => e.resource))
          : 0
        // wordcloudData: docsList.data.meta.extension
      }
    }
  }
}
