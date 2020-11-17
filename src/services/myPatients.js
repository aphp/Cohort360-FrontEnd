import api from './api'
import { CONTEXT } from '../constants'

export const fetchMyPatients = async () => {
  if (CONTEXT === 'aphp') {
    const [myPatientsResp, myPatientsEncounters, docsResp] = await Promise.all([
      api.get(
        '/Patient?facet=gender&pivotFacet=age_gender,deceased_gender&size=20&_elements=gender,name,birthDate,deceasedBoolean,identifier,extension'
      ),
      api.get(
        '/Encounter?pivotFacet=start-date_start-date-month_gender&facet=class&type=VISIT&size=0'
      ),
      api.get(
        '/Composition?size=20&_sort=-date&status=final&_elements=status,type,subject,encounter,date,title'
      )
    ])

    return {
      patientsTotal: myPatientsResp.data.total,
      patientsList: myPatientsResp.data.entry
        ? await getLastEncounter(
            myPatientsResp.data.entry.map((e) => e.resource)
          )
        : 0,
      patientsFacets: myPatientsResp.data.meta.extension,
      encountersFacets: myPatientsEncounters.data.meta.extension,
      totalDocs: docsResp.data.total,
      docsList: docsResp.data.entry
        ? await getInfos(docsResp.data.entry.map((e) => e.resource))
        : 0
      // wordcloudData: docsResp.data.meta.extension
    }
  }
}

export const getInfos = async (documents) => {
  const docsComplets = await getPatientInfos(documents).then(
    async (docs) => await getEncounterInfos(docs)
  )

  return docsComplets
}

export const getLastEncounter = async (patients) => {
  if (!patients) {
    return []
  }

  const cohortPatients = patients

  const encounters = await Promise.all(
    cohortPatients.map((patient) =>
      api.get(
        `/Encounter?patient=${patient.id}&_sort=-start-date&size=1&_elements=subject,serviceProvider&type=VISIT`
      )
    )
  )

  const encountersVisits = encounters
    .map((encounter) => getApiResponseResources(encounter))
    .filter((encounter) => {
      if (encounter) {
        return encounter.length > 0
      }
    })

  for (const patient of cohortPatients) {
    for (const encounter of encountersVisits) {
      if (patient.id === encounter?.[0].subject?.reference?.substring(8)) {
        patient.lastEncounter = encounter?.[0].serviceProvider?.display
        break
      } else {
        patient.lastEncounter = 'Non renseigné'
      }
    }
  }

  return cohortPatients
}

function getApiResponseResources(response) {
  if (
    !response ||
    !(response && response.data) ||
    response.data.resourceType === 'OperationOutcome'
  )
    return undefined

  return response.data.entry
    ? response.data.entry.map((r) => r.resource).filter((r) => undefined !== r)
    : []
}

const getEncounterInfos = async (documents) => {
  if (!documents) {
    return
  }

  var listeEncounterIds = documents
    .map((e) => e.encounter.display.substring(10))
    .join()

  let itemsProcessed = 0

  const encounters = await api.get(
    `/Encounter?_id=${listeEncounterIds}&type=VISIT&_elements=status,serviceProvider,identifier`
  )

  if (!encounters.data.entry) {
    return
  }

  var listeEncounters = encounters.data.entry.map((e) => e.resource)

  for (var i = 0; i < documents.length; i++) {
    itemsProcessed++

    for (var j = 0; j < listeEncounters.length; j++) {
      if (
        documents[i].encounter.display.substring(10) === listeEncounters[j].id
      ) {
        documents[i].encounterStatus = listeEncounters[j].status

        if (!listeEncounters[j].serviceProvider) {
          documents[i].serviceProvider = 'Non renseigné'
        } else {
          documents[i].serviceProvider =
            listeEncounters[j].serviceProvider.display
        }

        if (!listeEncounters[j].identifier) {
          documents[i].NDA = 'Inconnu'
        } else {
          for (var k = 0; k < listeEncounters[j].identifier.length; k++) {
            if (
              listeEncounters[j].identifier[k].type.coding[0].code === 'NDA'
            ) {
              documents[i].NDA = listeEncounters[j].identifier[k].value
            }
          }
        }
      }
    }

    if (itemsProcessed === documents.length) {
      return documents
    }
  }
}

const getPatientInfos = async (documents) => {
  if (!documents) {
    return
  }

  let itemsProcessed = 0

  var listePatientsIds = documents
    .map((e) => e.subject.display.substring(8))
    .join()

  const patients = await api.get(
    `/Patient?_id=${listePatientsIds}&_elements=extension,id,identifier`
  )

  var listePatients = patients.data.entry.map((e) => e.resource)

  for (var i = 0; i < documents.length; i++) {
    itemsProcessed++

    for (var j = 0; j < listePatients.length; j++) {
      documents[i].deidentified = listePatients[j].extension[0].valueBoolean

      if (documents[i].subject.display.substring(8) === listePatients[j].id) {
        documents[i].idPatient = listePatients[j].id

        if (!listePatients[j].identifier) {
          documents[i].IPP = 'Inconnu'
        } else {
          for (var k = 0; k < listePatients[j].identifier.length; k++) {
            if (listePatients[j].identifier[k].type.coding[0].code === 'IPP') {
              documents[i].IPP = listePatients[j].identifier[k].value
            }
          }
        }
      }
    }

    if (itemsProcessed === documents.length) {
      return documents
    }
  }
}
