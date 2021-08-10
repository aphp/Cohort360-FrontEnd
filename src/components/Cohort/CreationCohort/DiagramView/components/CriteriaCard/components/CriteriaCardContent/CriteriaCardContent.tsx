import React, { Fragment, useState, useEffect, useRef } from 'react'
import moment from 'moment'

import Chip from '@material-ui/core/Chip'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'

import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import { useAppSelector } from 'state'
import { SelectedCriteriaType } from 'types'

import { docTypes } from 'assets/docTypes.json'

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

    const tooltipReducer = (accumulator: any, currentValue: any) =>
      accumulator ? (
        <>
          {accumulator}
          <br />
          {currentValue}
        </>
      ) : currentValue ? (
        currentValue
      ) : (
        accumulator
      )

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

    let encounterStartDate = null
    let encounterEndDate = null

    if (!(_currentCriteria.type === 'Patient' || _currentCriteria.type === 'Encounter')) {
      startDate = _currentCriteria.startOccurrence
        ? moment(_currentCriteria.startOccurrence, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
        : null

      endDate = _currentCriteria.endOccurrence
        ? moment(_currentCriteria.endOccurrence, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
        : null
    }
    if (!(_currentCriteria.type === 'Patient' || _currentCriteria.type === 'Encounter')) {
      encounterStartDate = _currentCriteria.encounterStartDate
        ? moment(_currentCriteria.encounterStartDate, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
        : null
      encounterEndDate = _currentCriteria.encounterEndDate
        ? moment(_currentCriteria.encounterEndDate, 'YYYY-MM-DD').format('ddd DD MMMM YYYY')
        : null
    }

    switch (_currentCriteria.type) {
      case 'Claim': {
        const displaySelectedCode = (codes: { id: string; label: string }[]) => {
          const customReducer = (accumulator: any, currentValue: any) =>
            accumulator ? (
              <>
                {accumulator}
                <br />
                {currentValue}
              </>
            ) : currentValue ? (
              currentValue
            ) : (
              accumulator
            )

          let currentCode: string[] = []
          for (const code of codes) {
            const selectedCodeData =
              data?.ghmData && data?.ghmData !== 'loading'
                ? data.ghmData.find((codeElement: any) => codeElement && codeElement.id === code.id)
                : null
            currentCode = selectedCodeData ? [...currentCode, selectedCodeData.label] : currentCode
          }
          return currentCode && currentCode.length > 0 ? currentCode.reduce(customReducer) : ''
        }
        content = [
          _currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Tooltip title={displaySelectedCode(_currentCriteria?.code)}>
                  <Typography style={{ maxWidth: 500 }} noWrap>
                    {_currentCriteria?.code?.map((code) => code.id).reduce(reducer)}
                  </Typography>
                </Tooltip>
              }
            />
          ),
          +_currentCriteria?.occurrence !== 1 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>{`Nombre d'occurrence ${_currentCriteria.occurrenceComparator} ${_currentCriteria.occurrence}`}</Typography>
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
                      : `Avant le ${startDate}`
                    : endDate
                    ? `Après le ${endDate}`
                    : ''}
                </Typography>
              }
            />
          ),
          (encounterStartDate || encounterEndDate) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>
                  {encounterStartDate
                    ? encounterEndDate
                      ? `Prise en charge entre le ${encounterStartDate} et le ${encounterEndDate}`
                      : `Prise en charge avant le ${encounterStartDate}`
                    : encounterEndDate
                    ? `Prise en charge après le ${encounterEndDate}`
                    : ''}
                </Typography>
              }
            />
          )
        ]
        break
      }

      case 'Procedure': {
        const displaySelectedCode = (codes: { id: string; label: string }[]) => {
          const customReducer = (accumulator: any, currentValue: any) =>
            accumulator ? (
              <>
                {accumulator}
                <br />
                {currentValue}
              </>
            ) : currentValue ? (
              currentValue
            ) : (
              accumulator
            )

          let currentCode: string[] = []
          for (const code of codes) {
            const selectedCodeData =
              data?.ccamData && data?.ccamData !== 'loading'
                ? data.ccamData.find((codeElement: any) => codeElement && codeElement.id === code.id)
                : null
            currentCode = selectedCodeData ? [...currentCode, selectedCodeData.label] : currentCode
          }
          return currentCode && currentCode.length > 0 ? currentCode.reduce(customReducer) : ''
        }
        content = [
          _currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Tooltip title={displaySelectedCode(_currentCriteria?.code)}>
                  <Typography style={{ maxWidth: 500 }} noWrap>
                    {_currentCriteria?.code?.map((code) => code.id).reduce(reducer)}
                  </Typography>
                </Tooltip>
              }
            />
          ),
          +_currentCriteria?.occurrence !== 1 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>{`Nombre d'occurrence ${_currentCriteria.occurrenceComparator} ${_currentCriteria.occurrence}`}</Typography>
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
                      : `Avant le ${startDate}`
                    : endDate
                    ? `Après le ${endDate}`
                    : ''}
                </Typography>
              }
            />
          ),
          (encounterStartDate || encounterEndDate) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>
                  {encounterStartDate
                    ? encounterEndDate
                      ? `Prise en charge entre le ${encounterStartDate} et le ${encounterEndDate}`
                      : `Prise en charge avant le ${encounterStartDate}`
                    : encounterEndDate
                    ? `Prise en charge après le ${encounterEndDate}`
                    : ''}
                </Typography>
              }
            />
          )
        ]
        break
      }

      case 'Condition': {
        const displaySelectedCode = (codes: { id: string; label: string }[]) => {
          let currentCode: string[] = []
          for (const code of codes) {
            const selectedCodeData =
              data?.cim10Diagnostic && data?.cim10Diagnostic !== 'loading'
                ? data.cim10Diagnostic.find((codeElement: any) => codeElement && codeElement.id === code.id)
                : null
            currentCode = selectedCodeData ? [...currentCode, selectedCodeData.label] : currentCode
          }
          return currentCode && currentCode.length > 0 ? currentCode.reduce(tooltipReducer) : ''
        }
        const displaySelectedDiagTypes = (diagnosticTypes: { id: string; label: string }[]) => {
          let currentStatus: string[] = []
          for (const _diagnosticType of diagnosticTypes) {
            const selectedDiagnosticType =
              data?.diagnosticTypes && data?.diagnosticTypes !== 'loading'
                ? data.diagnosticTypes.find(
                    (diagnosticElement: any) => diagnosticElement && diagnosticElement.id === _diagnosticType.id
                  )
                : null
            currentStatus = selectedDiagnosticType ? [...currentStatus, selectedDiagnosticType.label] : currentStatus
          }
          return currentStatus && currentStatus.length > 0 ? currentStatus.reduce(tooltipReducer) : ''
        }

        content = [
          _currentCriteria && _currentCriteria?.code && _currentCriteria?.code.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Tooltip title={displaySelectedCode(_currentCriteria?.code)}>
                  <Typography style={{ maxWidth: 500 }} noWrap>
                    {_currentCriteria?.code?.map((code) => code.id).reduce(reducer)}
                  </Typography>
                </Tooltip>
              }
            />
          ),
          _currentCriteria && _currentCriteria?.diagnosticType && _currentCriteria?.diagnosticType.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Tooltip title={displaySelectedDiagTypes(_currentCriteria?.diagnosticType)}>
                  <Typography style={{ maxWidth: 500 }} noWrap>
                    {_currentCriteria?.diagnosticType?.map((diagnosticType) => diagnosticType.id).reduce(reducer)}
                  </Typography>
                </Tooltip>
              }
            />
          ),
          +_currentCriteria?.occurrence !== 1 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>{`Nombre d'occurrence ${_currentCriteria.occurrenceComparator} ${_currentCriteria.occurrence}`}</Typography>
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
                      : `Avant le ${startDate}`
                    : endDate
                    ? `Après le ${endDate}`
                    : ''}
                </Typography>
              }
            />
          ),
          (encounterStartDate || encounterEndDate) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>
                  {encounterStartDate
                    ? encounterEndDate
                      ? `Prise en charge entre le ${encounterStartDate} et le ${encounterEndDate}`
                      : `Prise en charge avant le ${encounterStartDate}`
                    : encounterEndDate
                    ? `Prise en charge après le ${encounterEndDate}`
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
                ? data.gender.find((genderElement: any) => genderElement && genderElement.id === gender.id)
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
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {displaySelectedGender(_currentCriteria?.gender)}
                </Typography>
              }
            />
          ),
          _currentCriteria && _currentCriteria.vitalStatus && _currentCriteria?.vitalStatus?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {displaySelectedVitalStatus(_currentCriteria?.vitalStatus)}
                </Typography>
              }
            />
          ),
          !!_currentCriteria.years && _currentCriteria.years[0] === _currentCriteria.years[1] && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
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
            !(_currentCriteria.years[0] === 0 && _currentCriteria.years[1] === 130 && ageUnit === 'an(s)') && (
              <Chip
                className={classes.criteriaChip}
                label={
                  <Typography style={{ maxWidth: 500 }} noWrap>
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
        const displaySelectedDocType = (selectedDocTypes: { id: string; label: string; type?: string }[]) => {
          let displayingSelectedDocTypes: any[] = []
          const allTypes = docTypes.map((docType: any) => docType.type)

          for (const selectedDocType of selectedDocTypes) {
            const numberOfElementFromGroup = (allTypes.filter((type) => type === selectedDocType.type) || []).length
            const numberOfElementSelected = (
              selectedDocTypes.filter((selectedDoc) => selectedDoc.type === selectedDocType.type) || []
            ).length

            if (numberOfElementFromGroup === numberOfElementSelected) {
              const groupIsAlreadyAdded = displayingSelectedDocTypes.find((dsdt) => dsdt.label === selectedDocType.type)
              if (groupIsAlreadyAdded) continue

              displayingSelectedDocTypes = [
                ...displayingSelectedDocTypes,
                { type: selectedDocType.type, label: selectedDocType.type, code: selectedDocType.type }
              ]
            } else {
              displayingSelectedDocTypes = [...displayingSelectedDocTypes, selectedDocType]
            }
          }
          const currentDocTypes = displayingSelectedDocTypes
            .filter((item, index, array) => array.indexOf(item) === index)
            .map(({ label }) => label)
          return currentDocTypes && currentDocTypes.length > 0 ? currentDocTypes.reduce(reducer) : ''
        }

        content = [
          _currentCriteria.search && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Tooltip title={`Contient ${_currentCriteria.search} dans le document`}>
                  <Typography style={{ maxWidth: 500 }} noWrap>
                    {_currentCriteria.search}
                  </Typography>
                </Tooltip>
              }
            />
          ),
          _currentCriteria && _currentCriteria.docType && _currentCriteria?.docType?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {displaySelectedDocType(_currentCriteria?.docType)}
                </Typography>
              }
            />
          ),
          +_currentCriteria?.occurrence !== 1 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>{`Nombre d'occurrence ${_currentCriteria.occurrenceComparator} ${_currentCriteria.occurrence}`}</Typography>
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
                      : `Avant le ${startDate},`
                    : endDate
                    ? `Après le ${endDate}`
                    : ''}
                </Typography>
              }
            />
          ),
          (encounterStartDate || encounterEndDate) && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography>
                  {encounterStartDate
                    ? encounterEndDate
                      ? `Prise en charge entre le ${encounterStartDate} et le ${encounterEndDate}`
                      : `Prise en charge avant le ${encounterStartDate}`
                    : encounterEndDate
                    ? `Prise en charge après le ${encounterEndDate}`
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

        const displaySelectedEntryModes = (entryModes: { id: string; label: string }[]) => {
          let currentEntryModes: string[] = []
          for (const entryMode of entryModes) {
            const selectedEntryModesData =
              data?.entryModes && data?.entryModes !== 'loading'
                ? data.entryModes.find(
                    (entryModeElement: any) => entryModeElement && entryModeElement.id === entryMode.id
                  )
                : null
            currentEntryModes = selectedEntryModesData
              ? [...currentEntryModes, selectedEntryModesData.label]
              : currentEntryModes
          }
          return currentEntryModes && currentEntryModes.length > 0 ? currentEntryModes.reduce(reducer) : ''
        }

        const displaySelectedExitModes = (exitModes: { id: string; label: string }[]) => {
          let currentExitModes: string[] = []
          for (const exitMode of exitModes) {
            const selectedExitModesData =
              data?.exitModes && data?.exitModes !== 'loading'
                ? data.exitModes.find((exitModeElement: any) => exitModeElement && exitModeElement.id === exitMode.id)
                : null
            currentExitModes = selectedExitModesData
              ? [...currentExitModes, selectedExitModesData.label]
              : currentExitModes
          }
          return currentExitModes && currentExitModes.length > 0 ? currentExitModes.reduce(reducer) : ''
        }

        const displaySelectedPriseEnChargeTypes = (priseEnChargeTypes: { id: string; label: string }[]) => {
          let currentPriseEnChargeTypes: string[] = []
          for (const priseEnChargeType of priseEnChargeTypes) {
            const selectedPriseEnChargeTypesData =
              data?.priseEnChargeType && data?.priseEnChargeType !== 'loading'
                ? data.priseEnChargeType.find(
                    (priseEnChargeTypeElement: any) =>
                      priseEnChargeTypeElement && priseEnChargeTypeElement.id === priseEnChargeType.id
                  )
                : null
            currentPriseEnChargeTypes = selectedPriseEnChargeTypesData
              ? [...currentPriseEnChargeTypes, selectedPriseEnChargeTypesData.label]
              : currentPriseEnChargeTypes
          }
          return currentPriseEnChargeTypes && currentPriseEnChargeTypes.length > 0
            ? currentPriseEnChargeTypes.reduce(reducer)
            : ''
        }

        const displaySelectedTypeDeSejours = (typeDeSejours: { id: string; label: string }[]) => {
          let currentTypeDeSejours: string[] = []
          for (const typeDeSejour of typeDeSejours) {
            const selectedTypeDeSejoursData =
              data?.typeDeSejour && data?.typeDeSejour !== 'loading'
                ? data.typeDeSejour.find(
                    (typeDeSejourElement: any) => typeDeSejourElement && typeDeSejourElement.id === typeDeSejour.id
                  )
                : null
            currentTypeDeSejours = selectedTypeDeSejoursData
              ? [...currentTypeDeSejours, selectedTypeDeSejoursData.label]
              : currentTypeDeSejours
          }
          return currentTypeDeSejours && currentTypeDeSejours.length > 0 ? currentTypeDeSejours.reduce(reducer) : ''
        }

        const displaySelectedFileStatus = (fileStatus: { id: string; label: string }[]) => {
          let currentFileStatus: string[] = []
          for (const fileStatu of fileStatus) {
            const selectedFileStatusData =
              data?.fileStatus && data?.fileStatus !== 'loading'
                ? data.fileStatus.find(
                    (fileStatuElement: any) => fileStatuElement && fileStatuElement.id === fileStatu.id
                  )
                : null
            currentFileStatus = selectedFileStatusData
              ? [...currentFileStatus, selectedFileStatusData.label]
              : currentFileStatus
          }
          return currentFileStatus && currentFileStatus.length > 0 ? currentFileStatus.reduce(reducer) : ''
        }

        content = [
          _currentCriteria.years && _currentCriteria.years[0] === _currentCriteria.years[1] && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {`${_currentCriteria.years?.[0]} ${ageUnit}
                    ${_currentCriteria.years?.[0] === 130 ? ' ou plus' : ''}`}
                </Typography>
              }
            />
          ),
          _currentCriteria.years &&
            _currentCriteria.years[0] !== _currentCriteria.years[1] &&
            !(_currentCriteria.years[0] === 0 && _currentCriteria.years[1] === 130 && ageUnit === 'an(s)') && (
              <Chip
                className={classes.criteriaChip}
                label={
                  <Typography style={{ maxWidth: 500 }} noWrap>
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
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {`Prise en charge : ${_currentCriteria.duration?.[0]} ${durationUnit}
                  ${_currentCriteria.duration?.[0] === 100 ? ' ou plus' : ''}`}
                </Typography>
              }
            />
          ),
          _currentCriteria.duration &&
            _currentCriteria.duration[0] !== _currentCriteria.duration[1] &&
            !(
              durationUnit === 'jour(s)' &&
              _currentCriteria.duration[0] === 0 &&
              _currentCriteria.duration[1] === 100
            ) && (
              <Chip
                className={classes.criteriaChip}
                label={
                  <Typography style={{ maxWidth: 500 }} noWrap>
                    {`Prise en charge : ${_currentCriteria.duration[0]} et ${_currentCriteria.duration[1]}
                    ${durationUnit}
                    ${_currentCriteria.duration[1] === 100 ? ' ou plus' : ''}`}
                  </Typography>
                }
              />
            ),
          _currentCriteria && _currentCriteria.entryMode && _currentCriteria?.entryMode?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {displaySelectedEntryModes(_currentCriteria?.entryMode)}
                </Typography>
              }
            />
          ),
          _currentCriteria && _currentCriteria.exitMode && _currentCriteria?.exitMode?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {displaySelectedExitModes(_currentCriteria?.exitMode)}
                </Typography>
              }
            />
          ),
          _currentCriteria && _currentCriteria.priseEnChargeType && _currentCriteria?.priseEnChargeType?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {displaySelectedPriseEnChargeTypes(_currentCriteria?.priseEnChargeType)}
                </Typography>
              }
            />
          ),
          _currentCriteria && _currentCriteria.typeDeSejour && _currentCriteria?.typeDeSejour?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {displaySelectedTypeDeSejours(_currentCriteria?.typeDeSejour)}
                </Typography>
              }
            />
          ),
          _currentCriteria && _currentCriteria.fileStatus && _currentCriteria?.fileStatus?.length > 0 && (
            <Chip
              className={classes.criteriaChip}
              label={
                <Typography style={{ maxWidth: 500 }} noWrap>
                  {displaySelectedFileStatus(_currentCriteria?.fileStatus)}
                </Typography>
              }
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
