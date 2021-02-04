import React from 'react'
import moment from 'moment'

import Typography from '@material-ui/core/Typography'

import { useAppSelector } from 'state'
import { SelectedCriteriaType } from 'types'

import useStyles from './styles'

type CriteriaCardContentProps = {
  currentCriteria: SelectedCriteriaType
}

const CriteriaCardContent: React.FC<CriteriaCardContentProps> = ({ currentCriteria }) => {
  const classes = useStyles()

  const criteria = useAppSelector((state) => state.cohortCreation.criteria)
  const _displayCardContent = (_currentCriteria: SelectedCriteriaType) => {
    if (!_currentCriteria) return <></>
    let content = <></>

    let _data: any = null
    const _searchDataFromCriteria = (_criteria: any[], type: string) => {
      for (const _criterion of _criteria) {
        if (_criterion.id === type) {
          _data = _criterion.data
        } else if (_criterion.subItems) {
          _data = _data ? _data : _searchDataFromCriteria(_criterion.subItems, type)
        }
      }
      return _data
    }

    const data: any = _searchDataFromCriteria(criteria, _currentCriteria.type)

    // let comparator = ''
    // if (_currentCriteria.comparator) {
    //   switch (_currentCriteria.comparator.id) {
    //     case 'le':
    //       comparator = '<='
    //       break
    //     case 'ge':
    //       comparator = '>='
    //       break
    //     case 'e':
    //       comparator = '='
    //       break
    //     default:
    //       break
    //   }
    // }

    let startDate = null
    let endDate = null

    if (!(_currentCriteria.type === 'Patient' || _currentCriteria.type === 'Encounter')) {
      startDate = _currentCriteria.startOccurrence
        ? moment(_currentCriteria.startOccurrence, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
        : ''

      endDate = _currentCriteria.endOccurrence
        ? moment(_currentCriteria.endOccurrence, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
        : ''
    }

    switch (_currentCriteria.type) {
      case 'Claim': {
        const displaySelectedGHM = (currentGHM: { id: string; label: string }) => {
          const selectedGhmData =
            data?.ghmData && data?.ghmData !== 'loading'
              ? data.ghmData.find((ghmElement: any) => ghmElement && ghmElement.id === currentGHM.id)
              : null
          return <Typography key={currentGHM.id}>{selectedGhmData ? selectedGhmData.label : ''}</Typography>
        }

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>GHM</span>,
            </Typography>
            {_currentCriteria && _currentCriteria?.code ? (
              <>
                <Typography>GHM sélectionné : </Typography>
                {_currentCriteria?.code?.map((code) => displaySelectedGHM(code))}
              </>
            ) : (
              <></>
            )}
            {/* <Typography>
              {_currentCriteria?.encounter ? `Nombre d'occurence: ${comparator} ${_currentCriteria.encounter}` : ''}
            </Typography> */}
            {/* <Typography>
              {startDate
                ? endDate
                  ? `Entre le ${startDate} et le ${endDate},`
                  : `Après le ${startDate},`
                : endDate
                ? `Avant le ${endDate},`
                : ''}
            </Typography> */}
          </>
        )
        break
      }

      case 'Procedure': {
        const displaySelectedCCAM = (currentCCAM: { id: string; label: string }) => {
          const selectedCcamData =
            data?.ccamData && data?.ccamData !== 'loading'
              ? data.ccamData.find((ccamElement: any) => ccamElement && ccamElement.id === currentCCAM.id)
              : null
          return <Typography key={currentCCAM.id}>{selectedCcamData ? selectedCcamData.label : ''}.</Typography>
        }

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Actes CCAM</span>,
            </Typography>
            {_currentCriteria && _currentCriteria?.code ? (
              <>
                <Typography>Acte CCAM sélectionné :</Typography>
                {_currentCriteria?.code?.map((code) => displaySelectedCCAM(code))}
              </>
            ) : (
              <></>
            )}
            {/* <Typography>
              {_currentCriteria?.encounter ? `Nombre d'occurence: ${comparator} ${_currentCriteria.encounter}` : ''}
            </Typography> */}
            {/* <Typography>
              {startDate
                ? endDate
                  ? `Entre le ${startDate} et le ${endDate},`
                  : `Après le ${startDate},`
                : endDate
                ? `Avant le ${endDate},`
                : ''}
            </Typography> */}
          </>
        )
        break
      }

      case 'Condition': {
        const displaySelectedCIM10 = (currentCIM10: { id: string; label: string }) => {
          const selectedCimData =
            data?.cim10Diagnostic && data?.cim10Diagnostic !== 'loading'
              ? data.cim10Diagnostic.find((ghmElement: any) => ghmElement && ghmElement.id === currentCIM10.id)
              : null
          return <Typography key={currentCIM10.id}>{selectedCimData ? selectedCimData.label : ''}</Typography>
        }

        const selectedDiagnostic = data?.diagnosticTypes
          ? data.diagnosticTypes.find(
              (diagnosticType: any) => diagnosticType && diagnosticType.id === _currentCriteria?.diagnosticType?.id
            )
          : null

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Diagnostics CIM10</span>,
            </Typography>
            {_currentCriteria && _currentCriteria?.code ? (
              <>
                <Typography>Diagnostic CIM sélectionné :</Typography>
                {_currentCriteria?.code?.map((code) => displaySelectedCIM10(code))}
              </>
            ) : (
              <></>
            )}
            <Typography>
              {selectedDiagnostic && `Type de diagnostic recherché : "${selectedDiagnostic.label}."`}
            </Typography>
            {/* <Typography>
              {_currentCriteria?.encounter ? `Nombre d'occurence: ${comparator} ${_currentCriteria.encounter}` : ''}
            </Typography> */}
            {/* <Typography>
              {startDate
                ? endDate
                  ? `Entre le ${startDate} et le ${endDate},`
                  : `Après le ${startDate},`
                : endDate
                ? `Avant le ${endDate},`
                : ''}
            </Typography> */}
          </>
        )
        break
      }

      case 'Patient': {
        const selectedGender = data?.gender
          ? data.gender.find((gender: any) => gender && gender.id === _currentCriteria?.gender?.id)
          : null
        const selectedVitalStatus = data?.status
          ? data.status.find((status: any) => status && status.id === _currentCriteria?.vitalStatus?.id)
          : null

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Démographie Patient</span>,
            </Typography>
            {selectedGender && <Typography>Genre sélectionné : {selectedGender.label}.</Typography>}
            {selectedVitalStatus && <Typography>Statut vital : {selectedVitalStatus.label}.</Typography>}

            {!!_currentCriteria.years && _currentCriteria.years[0] === _currentCriteria.years[1] && (
              <Typography>
                Âge sélectionné: {_currentCriteria.years?.[0]} ans
                {_currentCriteria.years?.[0] === 130 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {!!_currentCriteria.years &&
              _currentCriteria.years[0] !== _currentCriteria.years[1] &&
              (_currentCriteria.years[0] !== 0 || _currentCriteria.years[1] !== 130) && (
                <Typography>
                  Fourchette d'âge comprise entre {_currentCriteria.years[0]} et {_currentCriteria.years[1]} ans
                  {_currentCriteria.years[1] === 130 ? ' ou plus.' : '.'}
                </Typography>
              )}
          </>
        )
        break
      }

      case 'Composition': {
        const selectedDocType = data?.docTypes
          ? data?.docTypes.find((docTypes: any) => docTypes && docTypes.id === _currentCriteria?.docType?.id)
          : {}

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Document médical</span>,
            </Typography>
            <Typography>Recherche textuelle "{_currentCriteria.search}"</Typography>
            {selectedDocType && <Typography>Dans {selectedDocType.label}.</Typography>}
            {/* <Typography>
              {_currentCriteria?.encounter ? `Nombre d'occurence: ${comparator} ${_currentCriteria.encounter}` : ''}
            </Typography> */}
            <Typography>
              {startDate
                ? endDate
                  ? `Entre le ${startDate} et le ${endDate},`
                  : `Après le ${startDate},`
                : endDate
                ? `Avant le ${endDate},`
                : ''}
            </Typography>
          </>
        )
        break
      }

      case 'Encounter': {
        const ageType: any = _currentCriteria.ageType ? _currentCriteria.ageType.id : 'year'
        let ageUnit = 'an(s)'
        if (ageType === 'month') ageUnit = 'mois'
        else if (ageType === 'day') ageUnit = 'jour(s)'

        const selectedAdmissionMode = data.admissionModes
          ? data.admissionModes.find((admissionMode: any) => admissionMode.id === _currentCriteria?.admissionMode?.id)
          : null
        const selectedEntryMode = data.entryModes
          ? data.entryModes.find((entryMode: any) => entryMode.id === _currentCriteria?.entryMode?.id)
          : null
        const selectedExitMode = data.exitModes
          ? data.exitModes.find((exitMode: any) => exitMode.id === _currentCriteria?.exitMode?.id)
          : null
        const selectedFileStatus = data.fileStatus
          ? data.fileStatus.find((fileStatus: any) => fileStatus.id === _currentCriteria?.fileStatus?.id)
          : null

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Prise en charge</span>,
            </Typography>
            {_currentCriteria.years && _currentCriteria.years[0] === _currentCriteria.years[1] && (
              <Typography>
                Âge au moment de la prise en charge : {_currentCriteria.years?.[0]} {ageUnit}
                {_currentCriteria.years?.[0] === 130 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {_currentCriteria.years &&
              _currentCriteria.years[0] !== _currentCriteria.years[1] &&
              (_currentCriteria.years[0] !== 0 || _currentCriteria.years[1] !== 130) && (
                <Typography>
                  Âge au moment de la prise en charge : entre {_currentCriteria.years[0]} et {_currentCriteria.years[1]}{' '}
                  {ageUnit}
                  {_currentCriteria.years[1] === 130 ? ' ou plus.' : '.'}
                </Typography>
              )}
            {_currentCriteria.duration && _currentCriteria.duration[0] === _currentCriteria.duration[1] && (
              <Typography>
                Durée de la prise en charge : {_currentCriteria.duration?.[0]} jour(s)
                {_currentCriteria.duration?.[0] === 100 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {_currentCriteria.duration &&
              _currentCriteria.duration[0] !== _currentCriteria.duration[1] &&
              (_currentCriteria.duration[0] !== 0 || _currentCriteria.duration[1] !== 100) && (
                <Typography>
                  Durée de la prise en charge : {_currentCriteria.duration[0]} et {_currentCriteria.duration[1]} jour(s)
                  {_currentCriteria.duration[1] === 100 ? ' ou plus.' : '.'}
                </Typography>
              )}
            {selectedAdmissionMode && <Typography>Mode d'admission : {selectedAdmissionMode.label}.</Typography>}
            {selectedEntryMode && <Typography>Mode d'entrée : {selectedEntryMode.label}.</Typography>}
            {selectedExitMode && <Typography>Mode de sortie : {selectedExitMode.label}.</Typography>}
            {selectedFileStatus && <Typography>Statut dossier : {selectedFileStatus.label}.</Typography>}
          </>
        )
        break
      }
      default:
        break
    }
    return content
  }

  return <div className={classes.cardContent}>{_displayCardContent(currentCriteria)}</div>
}

export default CriteriaCardContent
