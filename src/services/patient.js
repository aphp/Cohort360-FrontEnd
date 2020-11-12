import api from './api'
import { CONTEXT } from '../constants'

export const fetchPatient = async (patientId) => {
  if (CONTEXT === 'arkhn') {
    const procedureResponse = await api.get(
      `/Procedure?subject.reference=Patient/${patientId}`
    )
    const encounterResponse = await api.get(
      `/Encounter?subject.reference=Patient/${patientId}`
    )
    const patientResponse = await api.get(`/Patient?id=${patientId}`)
    const diagnosticReportResponse = await api.get(
      `/DiagnosticReport?subject.reference=Patient/${patientId}`
    )
    const labObservationResponse = await api.get(
      `/Observation?subject.reference=Patient/${patientId}&category.coding.code=laboratory`
    )
    const groupResponse = await api.get(
      `/Group?member.entity.reference=Patient/${patientId}`
    )

    const documentsResponse = await api.get(
      `/DocumentReference?subject.reference=Patient/${patientId}`
    )

    return {
      consult: procedureResponse.data.entry.map((e) => e.resource),
      hospit: encounterResponse.data.entry.map((e) => e.resource),
      diagnostic: diagnosticReportResponse.data.entry.map((e) => e.resource),
      documents: documentsResponse.data.entry
        .map((e) => e.resource)
        .map((r) => {
          if (r.resource_type !== 'OperationOutcome') {
            const tmp = {
              id: r.identifier ? r.identifier[0].value : 'unknown',
              date: r.date,
              type: r.type.coding[0].code,
              content: r.content,
              description: r.description,
              docStatus: r.status,
              securityLabel: r.securityLabel
            }
            return tmp
          } else {
            return 0
          }
        }),
      patient: {
        ...patientResponse.data.entry[0].resource,
        lastEncounter: encounterResponse.data.entry[0].resource,
        lastProcedure: procedureResponse.data.entry[0].resource,
        mainDiagnosis: diagnosticReportResponse.data.entry[0].resource,
        labResults: labObservationResponse.data.entry,
        inclusion: groupResponse.data.entry[0].resource.resourceType === 'Group'
      }
    }
  } else if (CONTEXT === 'aphp') {
    const patientResponse = await api.get(`/Patient/${patientId}`)
    const procedureResponse = await api.get(
      `/Procedure?patient=${patientId}&_sort=-date&size=20`
    )
    const encounterResponse = await api.get(
      `/Encounter?patient=${patientId}&type=VISIT&status=arrived,triaged,in-progress,onleave,finished,unknown&_sort=-start-date`
    )
    const diagnosticResponse = await api.get(
      `/Condition?patient=${patientId}&_sort=-recorded-date&size=20`
    )
    const ghmResponse = await api.get(
      `/Claim?patient=${patientId}&_sort=-created&size=20`
    )
    const documentsResponse = await api.get(
      `/Composition?patient=${patientId}&size=20&_sort=-date`
    )

    return {
      consult: await fillNDAAndServiceProvider(procedureResponse.data),
      hospit: encounterResponse.data.entry
        ? encounterResponse.data.entry.map((e) => e.resource)
        : 0,
      diagnostic: await fillNDAAndServiceProvider(diagnosticResponse.data),
      ghm: await fillNDAAndServiceProvider(ghmResponse.data),
      documents: documentsResponse.data.entry
        ? await fillNDAAndServiceProviderDocs(
            documentsResponse.data.entry.map((e) => e.resource)
          )
        : 0,
      documentsTotal: documentsResponse.data.total,
      patient: {
        ...patientResponse.data,
        lastEncounter: encounterResponse.data.entry
          ? encounterResponse.data.entry[0].resource
          : 0,
        lastProcedure: procedureResponse.data.entry
          ? procedureResponse.data.entry[0]
          : 0,
        lastGhm: ghmResponse.data.entry ? ghmResponse.data.entry[0] : 0,
        mainDiagnosis: diagnosticResponse.data.entry
          ? diagnosticResponse.data.entry.filter((diagnostic) => {
              if (diagnostic.extension) {
                return diagnostic.extension[0].valueString === 'dp'
              }
            })
          : 0,
        associatedDiagnosis: diagnosticResponse.data.entry
          ? diagnosticResponse.data.entry.filter((diagnostic) => {
              if (diagnostic.extension) {
                return diagnostic.extension[0].valueString === 'das'
              }
            })
          : 0
      }
    }
  }
}

export const fillNDAAndServiceProviderDocs = async (docs) => {
  if (!docs) {
    return
  }

  var listeEncounterIds = docs.map((e) => e.encounter.display.substring(10))

  var noDuplicatesList = [...new Set(listeEncounterIds)].join()

  let itemsProcessed = 0

  const encounters = await api.get(`/Encounter?_id=${noDuplicatesList}&type=VISIT`)
  if (!encounters.data.entry) {
    return
  }

  var listeEncounters = encounters.data.entry.map((e) => e.resource)

  for (var i = 0; i < docs.length; i++) {
    itemsProcessed++

    for (var j = 0; j < listeEncounters.length; j++) {
      const docEncounterId = docs[i].encounter.display.substring(10)
      if (docEncounterId === listeEncounters[j].id) {
        docs[i].encounterStatus = listeEncounters[j].status
        if (!listeEncounters[j].serviceProvider) {
          docs[i].serviceProvider = 'Non renseigné'
        } else {
          docs[i].serviceProvider = listeEncounters[j].serviceProvider.display
        }
        // if (this.getView().getModel().getProperty('/deidentified')) {
        //   docs[i].resource.idVisite = listeEncounters[j].resource.id
        // } else
        if (listeEncounters[j].identifier) {
          for (var k = 0; k < listeEncounters[j].identifier.length; k++) {
            if (
              listeEncounters[j].identifier[k].type.coding[0].code === 'NDA'
            ) {
              docs[i].NDA = listeEncounters[j].identifier[k].value
            }
          }
        } else {
          docs[i].NDA = '--'
        }
      }
    }

    if (itemsProcessed === docs.length) {
      return docs
    }
  }
}

export const fillNDAAndServiceProvider = async (pmsi) => {
  if (!pmsi.total) {
    return []
  }

  var pmsiEntries = pmsi.entry.map((e) => e.resource)
  var listeEncounterIds = pmsiEntries.map((e) =>
    e.resourceType === 'Claim'
      ? e.item[0].encounter[0].reference.substring(10)
      : e.encounter.reference.substring(10)
  )

  var noDuplicatesList = [...new Set(listeEncounterIds)].join()

  let itemsProcessed = 0

  const encounters = await api.get(`/Encounter?_id=${noDuplicatesList}&type=VISIT`)

  if (!encounters.data.entry) {
    return
  }

  var listeEncounters = encounters.data.entry.map((e) => e.resource)

  for (var i = 0; i < pmsiEntries.length; i++) {
    itemsProcessed++

    for (var j = 0; j < listeEncounters.length; j++) {
      const pmsiEncounterId =
        pmsiEntries[i].resourceType === 'Claim'
          ? pmsiEntries[i].item[0].encounter[0].reference.substring(10)
          : pmsiEntries[i].encounter.reference.substring(10)
      if (pmsiEncounterId === listeEncounters[j].id) {
        if (!listeEncounters[j].serviceProvider) {
          pmsiEntries[i].serviceProvider = 'Non renseigné'
        } else {
          pmsiEntries[i].serviceProvider =
            listeEncounters[j].serviceProvider.display
        }
        // if (this.getView().getModel().getProperty('/deidentified')) {
        //   pmsiEntries[i].resource.idVisite = listeEncounters[j].resource.id
        // } else
        if (listeEncounters[j].identifier) {
          for (var k = 0; k < listeEncounters[j].identifier.length; k++) {
            if (
              listeEncounters[j].identifier[k].type.coding[0].code === 'NDA'
            ) {
              pmsiEntries[i].NDA = listeEncounters[j].identifier[k].value
            }
          }
        } else {
          pmsiEntries[i].NDA = '--'
        }
      }
    }

    if (itemsProcessed === pmsiEntries.length) {
      pmsi.entry = pmsiEntries
      return pmsi
    }
  }
}

export const fetchPMSI = async (
  page,
  patientId,
  selectedTab,
  searchInput,
  nda,
  code
) => {
  if (CONTEXT === 'aphp') {
    let resource = ''
    let search = ''
    let dateName = ''
    let ndaFilter = ''
    let codeName = ''
    let codeFilter = ''

    switch (selectedTab) {
      case 'CIM10':
        resource = '/Condition'
        dateName = '-recorded-date'
        codeName = 'code'
        break
      case 'CCAM':
        resource = '/Procedure'
        dateName = '-date'
        codeName = 'code'
        break
      case 'GHM':
        resource = '/Claim'
        dateName = '-created'
        codeName = 'diagnosis'
        break
      default:
        resource = '/Condition'
        dateName = '-recorded-date'
        codeName = 'code'
    }

    if (searchInput) {
      search = `&_text=${searchInput}`
    }

    if (nda !== '') {
      ndaFilter = `&encounter.identifier=${nda}`
    }

    if (code !== '') {
      codeFilter = `&${codeName}=${code}`
    }

    const pmsiResp = await api.get(
      `${resource}?patient=${patientId}&_sort=${dateName}&size=20&offset=${
        (page - 1) * 20
      }${search}${ndaFilter}${codeFilter}`
    )

    return {
      pmsiData: pmsiResp.data.entry
        ? await fillNDAAndServiceProvider(pmsiResp.data)
        : 0,
      pmsiTotal: pmsiResp.data.total
    }
  }
}

export const fetchDocuments = async (
  page,
  patientId,
  searchInput,
  selectedDocTypes,
  nda
) => {
  if (CONTEXT === 'aphp') {
    let search = ''
    let docTypesFilter = ''
    let ndaFilter = ''

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
      `/Composition?patient=${patientId}&_sort=-date&size=20&offset=${
        page ? (page - 1) * 20 : 0
      }${search}${docTypesFilter}${ndaFilter}`
    )

    if (!docsList.data.total) {
      return null
    } else {
      return {
        docsTotal: docsList.data.total,
        docsList: docsList.data.entry
          ? await fillNDAAndServiceProviderDocs(
              docsList.data.entry.map((e) => e.resource)
            )
          : 0
      }
    }
  }
}
