import { Patient } from 'fhir/r4'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { PatientsResponse } from 'types/patient'
import { VitalStatusLabel } from 'types/requestCriterias'
import { CellType, ColumnKey, Row, Table } from 'types/table'
import { getAge } from 'utils/age'
import { capitalizeFirstLetter } from 'utils/capitalize'

export const useDataToTable = (data: PatientsResponse, deidentified: boolean) => {
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })

  useEffect(() => map(data), [data])

  const mapPatientsToRows = (patients: Patient[]) => {
    const rows: Row[] = []
    patients.forEach((patient) => {
      const row: Row = [
        {
          id: `${patient.id}-gender`,
          value: patient.gender?.toLocaleUpperCase(),
          type: CellType.ICON,
          key: ColumnKey.GENDER
        },
        {
          id: `${patient.id}-name`,
          value: deidentified ? 'Prénom' : patient.name?.[0].given?.[0] ? capitalizeFirstLetter(patient.name?.[0].given?.[0]) : 'Non renseigné',
          type: CellType.TEXT,
          key: ColumnKey.NAME
        },
        {
          id: `${patient.id}-lastname`,
          value: deidentified
            ? 'Nom'
            : patient.name
                ?.map((e) => {
                  if (e.use === 'official') {
                    return e.family ?? 'Non renseigné'
                  }
                  if (e.use === 'maiden') {
                    return `(${patient.gender === 'female' ? 'née' : 'né'} : ${e.family})`
                  }
                })
                .join(' ') ?? 'Non renseigné',
          type: CellType.TEXT,
          key: ColumnKey.LASTNAME
        },
        {
          id: `${patient.id}-birthdate`,
          value: deidentified
            ? getAge(patient)
            : `${moment(patient.birthDate).format('DD/MM/YYYY') ?? 'Non renseigné'}<br/>(${getAge(patient)})`,
          type: CellType.TEXT,
          key: ColumnKey.BIRTHDATE
        },
        {
          id: `${patient.id}-lastEncounter`,
          value: patient.extension?.[3]?.valueReference?.display ?? '',
          type: CellType.TEXT,
          key: ColumnKey.LAST_ENCOUNTER
        },
        {
          id: `${patient.id}-vitalStatus`,
          value:
            patient.deceasedBoolean || patient.deceasedDateTime ? VitalStatusLabel.DECEASED : VitalStatusLabel.ALIVE,
          type: CellType.CHIP,
          key: ColumnKey.VITAL_STATUS
        },
        {
          id: `${patient.id}-ipp`,
          value: deidentified
            ? patient.id
            : patient.identifier?.find((identifier) => identifier.type?.coding?.[0].code === 'IPP')?.value ??
              patient.identifier?.[0].value ??
              'IPP inconnnu',
          type: CellType.TEXT,
          key: ColumnKey.IPP
        }
      ]
      rows.push(row)
    })
    return rows
  }

  const map = (data: PatientsResponse) => {
    if (data?.originalPatients) {
      const table = {
        rows: mapPatientsToRows(data.originalPatients),
        columns: []
      }
      setTableData(table)
    }
  }

  return {
    tableData
  }
}
