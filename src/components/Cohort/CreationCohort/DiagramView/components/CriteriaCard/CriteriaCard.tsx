import React, { useState, Fragment } from 'react'
import moment from 'moment'
import { useDispatch } from 'react-redux'

import { Button, Card, CardHeader, CardContent, IconButton, Typography, CircularProgress } from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

import CriteriaRightPanel from './components/CriteriaRightPanel'

import { useAppSelector } from 'state'
import { buildCreationCohort } from 'state/cohortCreation'
import { SelectedCriteriaType } from 'types'

import useStyles from './styles'

const CriteriaCard: React.FC = () => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const criteria = useAppSelector((state) => state.cohortCreation.criteria)
  const { loading = false, selectedCriteria = [] } = useAppSelector<{
    loading: boolean
    selectedCriteria: SelectedCriteriaType[]
  }>((state) => state.cohortCreation.request || {})

  const [indexCriteria, onChangeIndexCriteria] = useState<number | null>(null)
  const [openCriteriaDrawer, onChangeOpenCriteriaDrawer] = useState<boolean>(false)

  const _addSelectedCriteria = () => {
    onChangeIndexCriteria(null)
    onChangeOpenCriteriaDrawer(true)
  }

  const _editSelectedCriteria = (index: number) => {
    onChangeIndexCriteria(index)
    onChangeOpenCriteriaDrawer(true)
  }

  const _deleteSelectedCriteria = (index: number) => {
    const savedSelectedCriteria = [...selectedCriteria]
    savedSelectedCriteria.splice(index, 1)
    dispatch(buildCreationCohort({ selectedCriteria: savedSelectedCriteria }))
  }

  const _onChangeSelectedCriteria = (newSelectedCriteria: SelectedCriteriaType) => {
    let savedSelectedCriteria = [...selectedCriteria]
    if (indexCriteria !== null) {
      savedSelectedCriteria[indexCriteria] = newSelectedCriteria
    } else {
      savedSelectedCriteria = [...savedSelectedCriteria, newSelectedCriteria]
    }
    dispatch(buildCreationCohort({ selectedCriteria: savedSelectedCriteria }))
  }

  const _displayCardContent = (_selectedCriteria: SelectedCriteriaType) => {
    if (!_selectedCriteria) return <></>
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

    const data: any = _searchDataFromCriteria(criteria, _selectedCriteria.type)

    // let comparator = ''
    // if (_selectedCriteria.comparator) {
    //   switch (_selectedCriteria.comparator.id) {
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

    const startDate = _selectedCriteria.startOccurrence
      ? moment(_selectedCriteria.startOccurrence, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
      : ''
    const endDate = _selectedCriteria.endOccurrence
      ? moment(_selectedCriteria.endOccurrence, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
      : ''

    switch (_selectedCriteria.type) {
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
            {_selectedCriteria && _selectedCriteria?.code && _selectedCriteria?.code.length > 0 ? (
              <>
                <Typography>GHM sélectionné : </Typography>
                {_selectedCriteria?.code?.map((code) => displaySelectedGHM(code))}
              </>
            ) : (
              <></>
            )}
            {/* <Typography>
              {_selectedCriteria?.encounter ? `Nombre d'occurence: ${comparator} ${_selectedCriteria.encounter}` : ''}
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
            {_selectedCriteria && _selectedCriteria?.code && _selectedCriteria?.code.length > 0 ? (
              <>
                <Typography>Acte CCAM sélectionné :</Typography>
                {_selectedCriteria?.code?.map((code) => displaySelectedCCAM(code))}
              </>
            ) : (
              <></>
            )}
            {/* <Typography>
              {_selectedCriteria?.encounter ? `Nombre d'occurence: ${comparator} ${_selectedCriteria.encounter}` : ''}
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
              Dans <span className={classes.criteriaType}>Diagnostics CIM10</span>,
            </Typography>
            {_selectedCriteria && _selectedCriteria?.code && _selectedCriteria?.code.length > 0 && (
              <>
                <Typography>Diagnostic CIM sélectionné :</Typography>
                {_selectedCriteria?.code?.map((code) => displaySelectedCIM10(code))}
              </>
            )}
            {_selectedCriteria && _selectedCriteria?.diagnosticType && _selectedCriteria?.diagnosticType.length > 0 && (
              <>
                <Typography>Type de diagnostic recherché :</Typography>
                {_selectedCriteria?.diagnosticType?.map((diagnosticType) => displaySelectedCimType(diagnosticType))}
              </>
            )}
            {/* <Typography>
              {_selectedCriteria?.encounter ? `Nombre d'occurence: ${comparator} ${_selectedCriteria.encounter}` : ''}
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
        const ageType: any = _selectedCriteria.ageType ? _selectedCriteria.ageType.id : 'year'
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
            {_selectedCriteria && _selectedCriteria.gender && _selectedCriteria?.gender?.length > 0 && (
              <Typography>
                Genre sélectionné :{_selectedCriteria?.gender?.map((gender) => displaySelectedGender(gender))}
              </Typography>
            )}
            {_selectedCriteria && _selectedCriteria.vitalStatus && _selectedCriteria?.vitalStatus?.length > 0 && (
              <Typography>
                Statut vital :
                {_selectedCriteria?.vitalStatus?.map((vitalStatus) => displaySelectedVitalStatus(vitalStatus))}
              </Typography>
            )}

            {!!_selectedCriteria.years && _selectedCriteria.years[0] === _selectedCriteria.years[1] && (
              <Typography>
                Âge sélectionné: {_selectedCriteria.years?.[0]} {ageUnit}
                {_selectedCriteria.years?.[0] === 130 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {!!_selectedCriteria.years &&
              _selectedCriteria.years[0] !== _selectedCriteria.years[1] &&
              (_selectedCriteria.years[0] !== 0 || _selectedCriteria.years[1] !== 130) && (
                <Typography>
                  Fourchette d'âge comprise entre {_selectedCriteria.years[0]} et {_selectedCriteria.years[1]} {ageUnit}
                  {_selectedCriteria.years[1] === 130 ? ' ou plus.' : '.'}
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
            {_selectedCriteria.search && <Typography>Recherche textuelle "{_selectedCriteria.search}"</Typography>}

            {_selectedCriteria && _selectedCriteria.docType && _selectedCriteria?.docType?.length > 0 && (
              <Typography>
                Dans
                {_selectedCriteria?.docType?.map((docType) => displaySelectedDocType(docType))}
              </Typography>
            )}
            {/* <Typography>
              {_selectedCriteria?.encounter ? `Nombre d'occurence: ${comparator} ${_selectedCriteria.encounter}` : ''}
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
        const ageType: any = _selectedCriteria.ageType ? _selectedCriteria.ageType.id : 'year'
        let ageUnit = 'an(s)'
        if (ageType === 'month') ageUnit = 'mois'
        else if (ageType === 'day') ageUnit = 'jour(s)'

        const durationType: any = _selectedCriteria.durationType ? _selectedCriteria.durationType.id : 'year'
        let durationUnit = 'an(s)'
        if (durationType === 'month') durationUnit = 'mois'
        else if (durationType === 'day') durationUnit = 'jour(s)'

        const selectedAdmissionMode = data.admissionModes
          ? data.admissionModes.find((admissionMode: any) => admissionMode.id === _selectedCriteria?.admissionMode?.id)
          : null
        const selectedEntryMode = data.entryModes
          ? data.entryModes.find((entryMode: any) => entryMode.id === _selectedCriteria?.entryMode?.id)
          : null
        const selectedExitMode = data.exitModes
          ? data.exitModes.find((exitMode: any) => exitMode.id === _selectedCriteria?.exitMode?.id)
          : null
        const selectedFileStatus = data.fileStatus
          ? data.fileStatus.find((fileStatus: any) => fileStatus.id === _selectedCriteria?.fileStatus?.id)
          : null

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Prise en charge</span>,
            </Typography>
            {_selectedCriteria.years && _selectedCriteria.years[0] === _selectedCriteria.years[1] && (
              <Typography>
                Âge au moment de la prise en charge : {_selectedCriteria.years?.[0]} {ageUnit}
                {_selectedCriteria.years?.[0] === 130 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {_selectedCriteria.years &&
              _selectedCriteria.years[0] !== _selectedCriteria.years[1] &&
              (_selectedCriteria.years[0] !== 0 || _selectedCriteria.years[1] !== 130) && (
                <Typography>
                  Âge au moment de la prise en charge : entre {_selectedCriteria.years[0]} et{' '}
                  {_selectedCriteria.years[1]} {ageUnit}
                  {_selectedCriteria.years[1] === 130 ? ' ou plus.' : '.'}
                </Typography>
              )}
            {_selectedCriteria.duration && _selectedCriteria.duration[0] === _selectedCriteria.duration[1] && (
              <Typography>
                Durée de la prise en charge : {_selectedCriteria.duration?.[0]} {durationUnit}
                {_selectedCriteria.duration?.[0] === 100 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {_selectedCriteria.duration &&
              _selectedCriteria.duration[0] !== _selectedCriteria.duration[1] &&
              (_selectedCriteria.duration[0] !== 0 || _selectedCriteria.duration[1] !== 100) && (
                <Typography>
                  Durée de la prise en charge : {_selectedCriteria.duration[0]} et {_selectedCriteria.duration[1]}{' '}
                  {durationUnit}
                  {_selectedCriteria.duration[1] === 100 ? ' ou plus.' : '.'}
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

  return (
    <>
      {selectedCriteria &&
        selectedCriteria.length > 0 &&
        selectedCriteria.map((_selectedCriteria, index) => (
          <Fragment key={`C${index}`}>
            {/* <div className={classes.root}>
              <Button
                disabled={loading}
                className={classes.addButton}
                onClick={_addSelectedCriteria}
                variant="contained"
                color="primary"
              >
                <AddIcon />
              </Button>
            </div> */}
            <div className={classes.root}>
              <Card className={classes.card}>
                <CardHeader
                  className={classes.cardHeader}
                  action={
                    <>
                      <IconButton
                        size="small"
                        onClick={() => _deleteSelectedCriteria(index)}
                        style={{ color: 'currentcolor' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => _editSelectedCriteria(index)}
                        style={{ color: 'currentcolor' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </>
                  }
                  title={`C${index + 1} - ${_selectedCriteria.title}`}
                />
                <CardContent className={classes.cardContent}>{_displayCardContent(_selectedCriteria)}</CardContent>
              </Card>
            </div>
          </Fragment>
        ))}

      <div className={classes.root}>
        <Button
          disabled={loading}
          className={classes.addButton}
          onClick={_addSelectedCriteria}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress className={classes.loading} /> : <AddIcon />}
        </Button>
      </div>

      <CriteriaRightPanel
        criteria={criteria}
        selectedCriteria={indexCriteria !== null ? selectedCriteria[indexCriteria] : null}
        onChangeSelectedCriteria={_onChangeSelectedCriteria}
        open={openCriteriaDrawer}
        onClose={() => onChangeOpenCriteriaDrawer(false)}
      />
    </>
  )
}

export default CriteriaCard
