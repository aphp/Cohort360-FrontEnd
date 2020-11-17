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
  criteria: CriteriaItemType[]
  selectedCriteria: SelectedCriteriaType[]
  onChangeSelectedCriteria: (item: SelectedCriteriaType[]) => void
}

const CriteriaCard: React.FC<CriteriaCardProps> = (props) => {
  const { criteria, selectedCriteria, onChangeSelectedCriteria } = props

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
    if (!_selectedCriteria || !_selectedCriteria.years) return <></>
    let content = <></>
    const startDate = _selectedCriteria.start_occurrence
      ? moment(_selectedCriteria.start_occurrence, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
      : ''
    const endDate = _selectedCriteria.end_occurrence
      ? moment(_selectedCriteria.end_occurrence, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
      : ''

    switch (_selectedCriteria.type) {
      case 'ghm':
        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>GHM</span>,
            </Typography>
            <Typography>
              {startDate
                ? endDate
                  ? `Entre le ${startDate} et le ${endDate},`
                  : `Après le ${startDate},`
                : endDate
                ? `Avant le ${endDate},`
                : ''}
            </Typography>
            <Typography>
              GHM sélectionné :
              {_selectedCriteria.code
                ? `"${_selectedCriteria.code['GHM CODE']} - ${_selectedCriteria.code['LONG DESCRIPTION']}"`
                : '""'}
            </Typography>
          </>
        )
        break
      case 'ccam':
        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Actes CCAM</span>,
            </Typography>
            <Typography>
              {startDate
                ? endDate
                  ? `Entre le ${startDate} et le ${endDate},`
                  : `Après le ${startDate},`
                : endDate
                ? `Avant le ${endDate},`
                : ''}
            </Typography>
            <Typography>
              Acte CCAM sélectionné :
              {_selectedCriteria.code
                ? `"${_selectedCriteria.code['CCAM CODE']} - ${_selectedCriteria.code['LONG DESCRIPTION']}"`
                : '""'}
            </Typography>
          </>
        )
        break
      case 'diagnostics':
        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Diagnostics CIM10</span>,
            </Typography>
            <Typography>
              Diagnostic CIM sélectionné :
              {_selectedCriteria.code
                ? `"${_selectedCriteria.code['DIAGNOSIS CODE']} - ${_selectedCriteria.code['LONG DESCRIPTION']}"`
                : '""'}
            </Typography>
          </>
        )
        break
      case 'Patient': {
        console.log('_selectedCriteria', _selectedCriteria)
        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Démographie Patient</span>,
            </Typography>
            <Typography>Genre sélectionné :</Typography>
            {_selectedCriteria.gender?.map(({ display }) => (
              <Typography key={display}>{display}</Typography>
            ))}
            <Typography>Status vital :</Typography>
            {_selectedCriteria.vitalStatus?.map(({ display }) => (
              <Typography key={display}>{display}</Typography>
            ))}
            <Typography>
              {_selectedCriteria.years && _selectedCriteria.years[0] !== _selectedCriteria.years[1]
                ? `Fourchette d'âge comprise entre ${_selectedCriteria.years[0]} et ${_selectedCriteria.years[1]} ans ${
                    _selectedCriteria.years[1] === 100 ? 'ou plus.' : '.'
                  }`
                : `Age sélectionné: ${_selectedCriteria.years[0]} ans ${
                    _selectedCriteria.years[0] === 100 ? 'ou plus.' : '.'
                  }`}
            </Typography>
          </>
        )
        break
      }
      case 'documents_cliniques': {
        const docTypes = {
          '55188-7': 'Tout type de documents',
          '11336-5': "Comptes rendus d'hospitalisation",
          '57833-6': 'Ordonnances'
        }
        content = (
          <>
            <Typography>
              Dans <span className={classes.criteriaType}>Document médical</span>,
            </Typography>
            <Typography>
              Recherche textuelle "{_selectedCriteria.search}" dans {docTypes[_selectedCriteria.doc ?? '55188-7']}
            </Typography>
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
        ))}

      <div className={classes.root}>
        <Button className={classes.addButton} onClick={_addSelectedCriteria} variant="contained" color="primary">
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
