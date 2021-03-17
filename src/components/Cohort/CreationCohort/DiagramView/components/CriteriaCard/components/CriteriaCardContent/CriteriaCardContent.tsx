import React, { Fragment, useState, useEffect, useRef } from 'react'
import moment from 'moment'

import Chip from '@material-ui/core/Chip'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'

import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import { useAppSelector } from 'state'
import { SelectedCriteriaType } from 'types'

import useStyles from './styles'

type CriteriaCardContentProps = {
  currentCriteria: SelectedCriteriaType
}

const CriteriaCardContent: React.FC<CriteriaCardContentProps> = ({ currentCriteria }) => {
  const _displayCardContent = (_currentCriteria: SelectedCriteriaType) => {
    if (!_currentCriteria) return []
    let content: any[] = []

    const reducer = (accumulator: any, currentValue: any) =>
      accumulator ? `${accumulator} - ${currentValue}` : currentValue ? currentValue : accumulator

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
        content = [
          _currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{_currentCriteria?.code?.map((code) => code.id).reduce(reducer)}</Typography>}
            />
          ),
          +_currentCriteria?.occurrence !== 1 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>{`Nombre d'occurrence: ${_currentCriteria.occurrenceComparator} ${_currentCriteria.occurrence}`}</Typography>
              }
            />
          ),
          (startDate || endDate) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>
                  {startDate
                    ? endDate
                      ? `Entre le ${startDate} et le ${endDate}`
                      : `Après le ${startDate},`
                    : endDate
                    ? `Avant le ${endDate}`
                    : ''}
                </Typography>
              }
            />
          )
        ]
        break
      }

      case 'Procedure': {
        content = [
          _currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{_currentCriteria?.code?.map((code) => code.id).reduce(reducer)}</Typography>}
            />
          ),
          +_currentCriteria?.occurrence !== 1 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>{`Nombre d'occurrence: ${_currentCriteria.occurrenceComparator} ${_currentCriteria.occurrence}`}</Typography>
              }
            />
          ),
          (startDate || endDate) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>
                  {startDate
                    ? endDate
                      ? `Entre le ${startDate} et le ${endDate}`
                      : `Après le ${startDate},`
                    : endDate
                    ? `Avant le ${endDate}`
                    : ''}
                </Typography>
              }
            />
          )
        ]
        break
      }

      case 'Condition': {
        content = [
          _currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{_currentCriteria?.code?.map((code) => code.id).reduce(reducer)}</Typography>}
            />
          ),
          _currentCriteria && _currentCriteria?.diagnosticType && _currentCriteria?.diagnosticType.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography noWrap>
                  {_currentCriteria?.diagnosticType?.map((code) => code.id).reduce(reducer)}
                </Typography>
              }
            />
          ),
          +_currentCriteria?.occurrence !== 1 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>{`Nombre d'occurrence: ${_currentCriteria.occurrenceComparator} ${_currentCriteria.occurrence}`}</Typography>
              }
            />
          ),
          (startDate || endDate) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>
                  {startDate
                    ? endDate
                      ? `Entre le ${startDate} et le ${endDate}`
                      : `Après le ${startDate},`
                    : endDate
                    ? `Avant le ${endDate}`
                    : ''}
                </Typography>
              }
            />
          )
        ]
        break
      }

      case 'Patient': {
        const ageType: any = _currentCriteria.ageType ? _currentCriteria.ageType.id : 'year'
        let ageUnit: 'an(s)' | 'mois' | 'jour(s)' = 'an(s)'
        if (ageType === 'month') ageUnit = 'mois'
        else if (ageType === 'day') ageUnit = 'jour(s)'

        const displaySelectedGender = (genders: { id: string; label: string }[]) => {
          let currentGender: string[] = []
          for (const gender of genders) {
            const selectedGenderData =
              data?.gender && data?.gender !== 'loading'
                ? data.gender.find((ghmElement: any) => ghmElement && ghmElement.id === gender.id)
                : null
            currentGender = selectedGenderData ? [...currentGender, selectedGenderData.label] : currentGender
          }
          return currentGender && currentGender.length > 0 ? currentGender.reduce(reducer) : ''
        }
        const displaySelectedVitalStatus = (vitalStatus: { id: string; label: string }[]) => {
          let currentStatus: string[] = []
          for (const _vitalStatus of vitalStatus) {
            const selectedGenderData =
              data?.status && data?.status !== 'loading'
                ? data.status.find((statusElement: any) => statusElement && statusElement.id === _vitalStatus.id)
                : null
            currentStatus = selectedGenderData ? [...currentStatus, selectedGenderData.label] : currentStatus
          }
          return currentStatus && currentStatus.length > 0 ? currentStatus.reduce(reducer) : ''
        }

        content = [
          _currentCriteria && _currentCriteria.gender && _currentCriteria?.gender?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{displaySelectedGender(_currentCriteria?.gender)}</Typography>}
            />
          ),
          _currentCriteria && _currentCriteria.vitalStatus && _currentCriteria?.vitalStatus?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{displaySelectedVitalStatus(_currentCriteria?.vitalStatus)}</Typography>}
            />
          ),
          ((!!_currentCriteria.years && _currentCriteria.years[0] === _currentCriteria.years[1]) ||
            ageUnit !== 'an(s)') && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography noWrap>
                  {`
                    ${_currentCriteria.years?.[0]} ${ageUnit}
                      ${_currentCriteria.years?.[0] === 130 ? ' ou plus' : ''}
                  `}
                </Typography>
              }
            />
          ),
          !!_currentCriteria.years &&
            _currentCriteria.years[0] !== _currentCriteria.years[1] &&
            (_currentCriteria.years[0] !== 0 || _currentCriteria.years[1] !== 130) && (
              <Chip
                className={classes.criteriaChip}
                label={
                  <Typography noWrap>
                    {`Entre ${_currentCriteria.years[0]} et ${_currentCriteria.years[1]} ${ageUnit}
                    ${_currentCriteria.years[1] === 130 ? ' ou plus' : ''}`}
                  </Typography>
                }
              />
            )
        ]
        break
      }

      case 'Composition': {
        const displaySelectedDocType = (docTypes: { id: string; label: string }[]) => {
          let currentDocTypes: string[] = []
          for (const docType of docTypes) {
            const selectedGenderData =
              data?.docTypes && data?.docTypes !== 'loading'
                ? data.docTypes.find((typeElement: any) => typeElement && typeElement.id === docType.id)
                : null
            currentDocTypes = selectedGenderData ? [...currentDocTypes, selectedGenderData.label] : currentDocTypes
          }
          return currentDocTypes && currentDocTypes.length > 0 ? currentDocTypes.reduce(reducer) : ''
        }

        content = [
          _currentCriteria.search && <Chip className={classes.criteriaChip} label={`"${_currentCriteria.search}"`} />,
          _currentCriteria && _currentCriteria.docType && _currentCriteria?.docType?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{displaySelectedDocType(_currentCriteria?.docType)}</Typography>}
            />
          ),
          +_currentCriteria?.occurrence !== 1 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>{`Nombre d'occurrence: ${_currentCriteria.occurrenceComparator} ${_currentCriteria.occurrence}`}</Typography>
              }
            />
          ),
          (startDate || endDate) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>
                  {startDate
                    ? endDate
                      ? `Entre le ${startDate} et le ${endDate}`
                      : `Après le ${startDate},`
                    : endDate
                    ? `Avant le ${endDate}`
                    : ''}
                </Typography>
              }
            />
          )
        ]
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

        content = [
          _currentCriteria.years && _currentCriteria.years[0] === _currentCriteria.years[1] && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography noWrap>
                  {`${_currentCriteria.years?.[0]} ${ageUnit}
                    ${_currentCriteria.years?.[0] === 130 ? ' ou plus' : ''}`}
                </Typography>
              }
            />
          ),
          (ageUnit !== 'an(s)' ||
            (_currentCriteria.years &&
              _currentCriteria.years[0] !== _currentCriteria.years[1] &&
              (_currentCriteria.years[0] !== 0 || _currentCriteria.years[1] !== 130))) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography noWrap>
                  {`Entre ${_currentCriteria.years[0]} et ${_currentCriteria.years[1]} ${ageUnit}
                    ${_currentCriteria.years[1] === 130 ? ' ou plus' : ''}`}
                </Typography>
              }
            />
          ),
          _currentCriteria.duration && _currentCriteria.duration[0] === _currentCriteria.duration[1] && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography noWrap>
                  {`Prise en charge : ${_currentCriteria.duration?.[0]} ${durationUnit}
                  ${_currentCriteria.duration?.[0] === 100 ? ' ou plus' : ''}`}
                </Typography>
              }
            />
          ),
          (durationUnit !== 'jour(s)' ||
            (_currentCriteria.duration &&
              _currentCriteria.duration[0] !== _currentCriteria.duration[1] &&
              (_currentCriteria.duration[0] !== 0 || _currentCriteria.duration[1] !== 100))) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography noWrap>
                  {`Prise en charge : ${_currentCriteria.duration[0]} et ${_currentCriteria.duration[1]}
                    ${durationUnit}
                    ${_currentCriteria.duration[1] === 100 ? ' ou plus' : ''}`}
                </Typography>
              }
            />
          ),
          selectedAdmissionMode && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{`Mode d'admission: ${selectedAdmissionMode.label}`}</Typography>}
            />
          ),
          selectedEntryMode && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{`Mode d'entrée : ${selectedEntryMode.label}`}</Typography>}
            />
          ),
          selectedExitMode && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{`Mode de sortie : ${selectedExitMode.label}`}</Typography>}
            />
          ),
          selectedFileStatus && (
            <Chip
              className={classes.criteriaChip}
              label={<Typography noWrap>{`Statut dossier : ${selectedFileStatus.label}`}</Typography>}
            />
          )
        ]
        break
      }
      default:
        break
    }

    content = content.filter((c) => c) // Filter null element
    return content
  }

  const classes = useStyles()

  const criteria = useAppSelector((state) => state.cohortCreation.criteria)

  const criteriaContents = _displayCardContent(currentCriteria)

  const containerRef = useRef(null)
  const elementsRef = useRef(criteriaContents.map(() => React.createRef()))

  const [refresh, setRefresh] = useState(false)
  const [hasCollapse, needCollapse] = useState(false)
  const [openCollapse, setOpenCollapse] = useState(false)

  const checkIfCardNeedCollapse = () => {
    setRefresh(true)
    const element = elementsRef.current
    if (elementsRef.current.length === 0) return
    // @ts-ignore
    const elemWidth = element ? element.map((e) => e?.current?.offsetWidth ?? 0) : [0, 0]
    const maxWidth = elemWidth.reduce((a, b) => a + b)
    // @ts-ignore
    const containerWidth = containerRef ? containerRef?.current?.offsetWidth : 0
    needCollapse(maxWidth > containerWidth)
  }

  useEffect(() => {
    function handleResize() {
      checkIfCardNeedCollapse()
    }
    window.addEventListener('resize', handleResize)
  })

  useEffect(() => {
    checkIfCardNeedCollapse()
  }, [elementsRef, refresh])

  return (
    <div ref={containerRef} style={{ height: openCollapse ? '' : 40 }} className={`toto ${classes.cardContent}`}>
      {criteriaContents &&
        criteriaContents.map((criteriaContent, index) => (
          <Fragment key={index}>
            {/* @ts-ignore */}
            <div key={index} ref={elementsRef.current[index]}>
              {criteriaContent}
            </div>
            {hasCollapse && (
              <IconButton onClick={() => setOpenCollapse(!openCollapse)} className={classes.chevronIcon} size="small">
                {openCollapse ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            )}
          </Fragment>
        ))}
    </div>
  )
}

export default CriteriaCardContent
