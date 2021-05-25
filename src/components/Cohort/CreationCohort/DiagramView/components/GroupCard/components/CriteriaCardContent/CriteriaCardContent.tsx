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
          return <Typography>{selectedGhmData ? selectedGhmData.label : ''}</Typography>
        }

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>GHM</span>,
            </Typography>
            {_currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 ? (
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
          return <Typography>{selectedCcamData ? selectedCcamData.label : ''}.</Typography>
        }

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Actes CCAM</span>,
            </Typography>
            {_currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 ? (
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
              ? data.cim10Diagnostic.find((cimElement: any) => cimElement && cimElement.id === currentCIM10.id)
              : null
          return <Typography>{selectedCimData ? selectedCimData.label : ''}</Typography>
        }

        const displaySelectedCimType = (diagnosticType: { id: string; label: string }) => {
          const selectedCimData =
            data?.diagnosticTypes && data?.diagnosticTypes !== 'loading'
              ? data.diagnosticTypes.find((type: any) => type && type.id === diagnosticType.id)
              : null
          return <Typography>{selectedCimData ? selectedCimData.label : ''}</Typography>
        }

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Diagnostics</span>,
            </Typography>
            {_currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 && (
              <>
                <Typography>Diagnostic sélectionné :</Typography>
                {_currentCriteria?.code?.map((code) => displaySelectedCIM10(code))}
              </>
            )}
            {_currentCriteria && _currentCriteria?.diagnosticType && _currentCriteria?.diagnosticType.length > 0 && (
              <>
                <Typography>Type de diagnostic recherché :</Typography>
                {_currentCriteria?.diagnosticType?.map((diagnosticType) => displaySelectedCimType(diagnosticType))}
              </>
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

      case 'Patient': {
        const ageType: any = _currentCriteria.ageType ? _currentCriteria.ageType.id : 'year'
        let ageUnit = 'an(s)'
        if (ageType === 'month') ageUnit = 'mois'
        else if (ageType === 'day') ageUnit = 'jour(s)'

        const displaySelectedGender = (gender: { id: string; label: string }) => {
          const selectedCimData =
            data?.gender && data?.gender !== 'loading'
              ? data.gender.find((ghmElement: any) => ghmElement && ghmElement.id === gender.id)
              : null
          return <Typography>{selectedCimData ? selectedCimData.label : ''}</Typography>
        }
        const displaySelectedVitalStatus = (vitalStatus: { id: string; label: string }) => {
          const selectedCimData =
            data?.status && data?.status !== 'loading'
              ? data.status.find((ghmElement: any) => ghmElement && ghmElement.id === vitalStatus.id)
              : null
          return <Typography>{selectedCimData ? selectedCimData.label : ''}</Typography>
        }

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Démographie Patient</span>,
            </Typography>
            {_currentCriteria && _currentCriteria.gender && _currentCriteria?.gender?.length > 0 && (
              <Typography>
                Genre sélectionné :{_currentCriteria?.gender?.map((gender) => displaySelectedGender(gender))}
              </Typography>
            )}
            {_currentCriteria && _currentCriteria.vitalStatus && _currentCriteria?.vitalStatus?.length > 0 && (
              <Typography>
                Statut vital :
                {_currentCriteria?.vitalStatus?.map((vitalStatus) => displaySelectedVitalStatus(vitalStatus))}
              </Typography>
            )}

            {!!_currentCriteria.years && _currentCriteria.years[0] === _currentCriteria.years[1] && (
              <Typography>
                Âge sélectionné: {_currentCriteria.years?.[0]} {ageUnit}
                {_currentCriteria.years?.[0] === 130 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {!!_currentCriteria.years &&
              _currentCriteria.years[0] !== _currentCriteria.years[1] &&
              (_currentCriteria.years[0] !== 0 || _currentCriteria.years[1] !== 130) && (
                <Typography>
                  Fourchette d'âge comprise entre {_currentCriteria.years[0]} et {_currentCriteria.years[1]} {ageUnit}
                  {_currentCriteria.years[1] === 130 ? ' ou plus.' : '.'}
                </Typography>
              )}
          </>
        )
        break
      }

      case 'Composition': {
        const displaySelectedDocType = (docType: { id: string; label: string }) => {
          const selectedCimData =
            data?.docTypes && data?.docTypes !== 'loading'
              ? data.docTypes.find((ghmElement: any) => ghmElement && ghmElement.id === docType.id)
              : null
          return <Typography>{selectedCimData ? selectedCimData.label : ''}</Typography>
        }

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Document médical</span>,
            </Typography>
            {_currentCriteria.search && <Typography>Recherche textuelle "{_currentCriteria.search}"</Typography>}

            {_currentCriteria && _currentCriteria.docType && _currentCriteria?.docType?.length > 0 && (
              <Typography>
                Dans
                {_currentCriteria?.docType?.map((docType) => displaySelectedDocType(docType))}
              </Typography>
            )}
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

        const durationType: any = _currentCriteria.durationType ? _currentCriteria.durationType.id : 'year'
        let durationUnit = 'an(s)'
        if (durationType === 'month') durationUnit = 'mois'
        else if (durationType === 'day') durationUnit = 'jour(s)'

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
                Durée de la prise en charge : {_currentCriteria.duration?.[0]} {durationUnit}
                {_currentCriteria.duration?.[0] === 100 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {_currentCriteria.duration &&
              _currentCriteria.duration[0] !== _currentCriteria.duration[1] &&
              (_currentCriteria.duration[0] !== 0 || _currentCriteria.duration[1] !== 100) && (
                <Typography>
                  Durée de la prise en charge : {_currentCriteria.duration[0]} et {_currentCriteria.duration[1]}{' '}
                  {durationUnit}
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
