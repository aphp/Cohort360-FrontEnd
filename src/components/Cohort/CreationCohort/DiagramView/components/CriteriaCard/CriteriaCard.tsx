import React, { useState } from 'react'
import moment from 'moment'

import { Button, Card, CardHeader, CardContent, IconButton, Typography } from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'

import CriteriaRightPanel from './components/CriteriaRightPanel'

import { CriteriaItemType, SelectedCriteriaType } from 'types'
import useStyles from './styles'

type CriteriaCardProps = {
  actionLoading: boolean
  criteria: CriteriaItemType[]
  selectedCriteria: SelectedCriteriaType[]
  onChangeSelectedCriteria: (item: SelectedCriteriaType[]) => void
}

const CriteriaCard: React.FC<CriteriaCardProps> = (props) => {
  const { actionLoading, criteria, selectedCriteria, onChangeSelectedCriteria } = props

  const classes = useStyles()
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
    onChangeSelectedCriteria(savedSelectedCriteria)
  }

  const _onChangeSelectedCriteria = (newSelectedCriteria: SelectedCriteriaType) => {
    let savedSelectedCriteria = [...selectedCriteria]
    if (indexCriteria !== null) {
      savedSelectedCriteria[indexCriteria] = newSelectedCriteria
    } else {
      savedSelectedCriteria = [...savedSelectedCriteria, newSelectedCriteria]
    }
    onChangeSelectedCriteria(savedSelectedCriteria)
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
        const selectedGhmData = data?.ghmData
          ? data.ghmData.find((ghmElement: any) => ghmElement && ghmElement.id === _selectedCriteria.code?.id)
          : null

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>GHM</span>,
            </Typography>
            <Typography>{selectedGhmData ? `GHM sélectionné : "${selectedGhmData.label}"` : ''}</Typography>
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
        const selectedccamData = data?.ccamData
          ? data.ccamData.find((ccamElement: any) => ccamElement && ccamElement.id === _selectedCriteria?.code?.id)
          : null

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Actes CCAM</span>,
            </Typography>
            <Typography>{selectedccamData ? `Acte CCAM sélectionné : "${selectedccamData.label}"` : ''}.</Typography>
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
        const selectedCode = data?.cim10Diagnostic
          ? data.cim10Diagnostic.find(
              (cim10Diagnostic: any) => cim10Diagnostic && cim10Diagnostic.id === _selectedCriteria?.code?.id
            )
          : null
        const selectedDiagnostic = data?.diagnosticTypes
          ? data.diagnosticTypes.find(
              (diagnosticType: any) => diagnosticType && diagnosticType.id === _selectedCriteria?.diagnosticType?.id
            )
          : null

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Diagnostics CIM10</span>,
            </Typography>
            <Typography>{selectedCode ? `Diagnostic CIM sélectionné : "${selectedCode.label}."` : ''}</Typography>
            <Typography>
              {selectedDiagnostic && `Type de diagnostic recherché : "${selectedDiagnostic.label}."`}
            </Typography>
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
        const selectedGender = data?.gender
          ? data.gender.find((gender: any) => gender && gender.id === _selectedCriteria?.gender?.id)
          : null
        const selectedVitalStatus = data?.status
          ? data.status.find((status: any) => status && status.id === _selectedCriteria?.vitalStatus?.id)
          : null

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Démographie Patient</span>,
            </Typography>
            {selectedGender && <Typography>Genre sélectionné : {selectedGender.label}.</Typography>}
            {selectedVitalStatus && <Typography>Statut vital : {selectedVitalStatus.label}.</Typography>}

            {!!_selectedCriteria.years && _selectedCriteria.years[0] === _selectedCriteria.years[1] && (
              <Typography>
                Âge sélectionné: {_selectedCriteria.years?.[0]} ans
                {_selectedCriteria.years?.[0] === 100 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {!!_selectedCriteria.years &&
              _selectedCriteria.years[0] !== _selectedCriteria.years[1] &&
              (_selectedCriteria.years[0] !== 0 || _selectedCriteria.years[1] !== 100) && (
                <Typography>
                  Fourchette d'âge comprise entre {_selectedCriteria.years[0]} et {_selectedCriteria.years[1]} ans
                  {_selectedCriteria.years[1] === 100 ? ' ou plus.' : '.'}
                </Typography>
              )}
          </>
        )
        break
      }

      case 'Composition': {
        const docTypes = {
          '55188-7': 'Tout type de documents',
          '11336-5': "Comptes rendus d'hospitalisation",
          '57833-6': 'Ordonnances'
        }
        const selectedDocType =
          docTypes[_selectedCriteria && _selectedCriteria.docType ? _selectedCriteria.docType.id : '55188-7']

        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Document médical</span>,
            </Typography>
            <Typography>Recherche textuelle "{_selectedCriteria.search}"</Typography>
            <Typography>Dans {selectedDocType}.</Typography>
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
                {_selectedCriteria.years?.[0] === 100 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {_selectedCriteria.years &&
              _selectedCriteria.years[0] !== _selectedCriteria.years[1] &&
              (_selectedCriteria.years[0] !== 0 || _selectedCriteria.years[1] !== 100) && (
                <Typography>
                  Âge au moment de la prise en charge : entre {_selectedCriteria.years[0]} et{' '}
                  {_selectedCriteria.years[1]} {ageUnit}
                  {_selectedCriteria.years[1] === 100 ? ' ou plus.' : '.'}
                </Typography>
              )}
            {_selectedCriteria.duration && _selectedCriteria.duration[0] === _selectedCriteria.duration[1] && (
              <Typography>
                Durée de la prise en charge : {_selectedCriteria.duration?.[0]} jour(s)
                {_selectedCriteria.duration?.[0] === 100 ? ' ou plus.' : '.'}
              </Typography>
            )}
            {_selectedCriteria.duration &&
              _selectedCriteria.duration[0] !== _selectedCriteria.duration[1] &&
              (_selectedCriteria.duration[0] !== 0 || _selectedCriteria.duration[1] !== 100) && (
                <Typography>
                  Durée de la prise en charge : {_selectedCriteria.duration[0]} et {_selectedCriteria.duration[1]}{' '}
                  jour(s)
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
          <>
            {/* <div className={classes.root}>
              <Button
                disabled={actionLoading}
                className={classes.addButton}
                onClick={_addSelectedCriteria}
                variant="contained"
                color="primary"
              >
                <AddIcon />
              </Button>
            </div> */}
            <div className={classes.root} key={`C${index}`}>
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
          </>
        ))}

      <div className={classes.root}>
        <Button
          disabled={actionLoading}
          className={classes.addButton}
          onClick={_addSelectedCriteria}
          variant="contained"
          color="primary"
        >
          <AddIcon />
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
