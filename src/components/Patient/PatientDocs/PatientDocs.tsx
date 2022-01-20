import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useDispatch } from 'react-redux'

import { Button, Chip, Grid, Typography } from '@material-ui/core'
import { Alert, Pagination } from '@material-ui/lab'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import InputSearchDocumentSimple from 'components/Inputs/InputSearchDocument/components/InputSearchDocumentSimple'
import InputSearchDocumentRegex from 'components/Inputs/InputSearchDocument/components/InputSearchDocumentRegex'
import InputSearchDocumentButton from 'components/Inputs/InputSearchDocument/components/InputSearchDocumentButton'

import DocumentFilters from '../../Filters/DocumentFilters/DocumentFilters'
import DocumentList from '../../Cohort/Documents/DocumentList/DocumentList'

import { useAppSelector } from 'state'
import { fetchDocuments } from 'state/patient'

import { docTypes } from 'assets/docTypes.json'

import useStyles from './styles'

type PatientDocsProps = {
  groupId?: string
}
const PatientDocs: React.FC<PatientDocsProps> = ({ groupId }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const loading = patient?.documents?.loading ?? false
  const totalDocs = patient?.documents?.count ?? 0
  const totalAllDoc = patient?.documents?.total ?? 0

  const patientDocumentsState = patient?.documents?.list ?? []

  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<{
    nda: string
    selectedDocTypes: any[]
    startDate: string | null
    endDate: string | null
  }>({
    nda: '',
    selectedDocTypes: [],
    startDate: null,
    endDate: null
  })

  const [searchInput, setSearchInput] = useState('date')
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const [searchMode, setSearchMode] = useState(false)
  const [open, setOpen] = useState(false)

  const [inputMode, setInputMode] = useState<'simple' | 'regex' | 'extend'>('simple')

  const documentLines = 20 // Number of desired lines in the document array

  const displayingSelectedDocType: any[] = (() => {
    let displayingSelectedDocTypes: any[] = []
    const allTypes = docTypes.map((docType: any) => docType.type)

    for (const selectedDocType of filters.selectedDocTypes) {
      const numberOfElementFromGroup = (allTypes.filter((type) => type === selectedDocType.type) || []).length
      const numberOfElementSelected = (
        filters.selectedDocTypes.filter((selectedDoc) => selectedDoc.type === selectedDocType.type) || []
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
    return displayingSelectedDocTypes.filter((item, index, array) => array.indexOf(item) === index)
  })()

  const fetchDocumentsList = async (page: number, input = searchInput) => {
    const selectedDocTypesCodes = filters.selectedDocTypes.map((docType) => docType.code)

    if (inputMode === 'regex') input = `/${input}/`

    dispatch(
      fetchDocuments({
        groupId,
        options: {
          page,
          sort: {
            by: sortBy,
            direction: sortDirection
          },
          filters: {
            ...filters,
            searchInput: input,
            selectedDocTypes: selectedDocTypesCodes
          }
        }
      })
    )

    setSearchMode(!!searchInput)
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value || 1)
    fetchDocumentsList(value || 1)
  }

  useEffect(() => {
    handleChangePage()
  }, [filters.nda, filters.selectedDocTypes, filters.startDate, filters.endDate, sortBy, sortDirection]) // eslint-disable-line

  const onChangeOptions = (key: string, value: any) => {
    setFilters((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleDeleteChip = (filterName: string, value?: string) => {
    switch (filterName) {
      case 'nda':
        onChangeOptions(
          filterName,
          filters.nda
            .split(',')
            .filter((item: string) => item !== value)
            .join()
        )
        break
      case 'selectedDocTypes': {
        const typesName = docTypes
          .map((docType: any) => docType.type)
          .filter((item, index, array) => array.indexOf(item) === index)
        const isGroupItem = typesName.find((typeName) => typeName === value)

        if (!isGroupItem) {
          onChangeOptions(
            filterName,
            filters.selectedDocTypes.filter((item) => item.label !== value)
          )
        } else {
          onChangeOptions(
            filterName,
            filters.selectedDocTypes.filter((item) => item.type !== value)
          )
        }
        break
      }
      case 'startDate':
        onChangeOptions(filterName, null)
        break
      case 'endDate':
        onChangeOptions(filterName, null)
        break
    }
  }

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <Grid container justify="space-between" alignItems="center">
        <Typography variant="button">
          {totalDocs} / {totalAllDoc} document(s)
        </Typography>
        <Grid container direction="row" alignItems="center" className={classes.filterAndSort}>
          <div className={classes.documentButtons}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<FilterList height="15px" fill="#FFF" />}
              className={classes.searchButton}
              onClick={() => setOpen(true)}
            >
              Filtrer
            </Button>

            <InputSearchDocumentButton currentMode={inputMode} onChangeMode={setInputMode} />
          </div>
        </Grid>
      </Grid>

      {inputMode === 'simple' && (
        <InputSearchDocumentSimple
          defaultSearchInput={searchInput}
          setDefaultSearchInput={(newSearchInput: string) => setSearchInput(newSearchInput)}
          onSearchDocument={(newInputText: string) => fetchDocumentsList(1, newInputText)}
        />
      )}

      {inputMode === 'regex' && (
        <InputSearchDocumentRegex
          defaultSearchInput={searchInput}
          setDefaultSearchInput={(newSearchInput: string) => setSearchInput(newSearchInput)}
          onSearchDocument={(newInputText: string) => fetchDocumentsList(1, newInputText)}
        />
      )}

      <Grid>
        {filters.nda !== '' &&
          filters.nda
            .split(',')
            .map((value) => (
              <Chip
                className={classes.chips}
                key={value}
                label={value}
                onDelete={() => handleDeleteChip('nda', value)}
                color="primary"
                variant="outlined"
              />
            ))}
        {displayingSelectedDocType.length > 0 &&
          displayingSelectedDocType.map((docType) => (
            <Chip
              className={classes.chips}
              key={docType.code}
              label={docType.label}
              onDelete={() => handleDeleteChip('selectedDocTypes', docType.label)}
              color="primary"
              variant="outlined"
            />
          ))}
        {filters.startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('startDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {filters.endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('endDate')}
            color="primary"
            variant="outlined"
          />
        )}
      </Grid>

      <Alert severity="info" style={{ backgroundColor: 'transparent' }}>
        Attention : La recherche est pseudonymisée pour la prévisualisation des documents. Vous pouvez donc trouver des
        incohérences entre les informations de votre patient et celles du document prévisualisé.
      </Alert>

      <DocumentList
        groupId={groupId}
        loading={loading}
        documents={patientDocumentsState}
        searchMode={searchMode}
        deidentified={false}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        sortDirection={sortDirection}
        onChangeSortDirection={setSortDirection}
      />

      <Pagination
        className={classes.pagination}
        count={Math.ceil(totalDocs / documentLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />

      <DocumentFilters
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
        nda={filters.nda}
        onChangeNda={(nda: string) => onChangeOptions('nda', nda)}
        selectedDocTypes={filters.selectedDocTypes}
        onChangeSelectedDocTypes={(selectedDocTypes: string[]) => onChangeOptions('selectedDocTypes', selectedDocTypes)}
        startDate={filters.startDate}
        onChangeStartDate={(startDate: string | null) => onChangeOptions('startDate', startDate)}
        endDate={filters.endDate}
        onChangeEndDate={(endDate: string | null) => onChangeOptions('endDate', endDate)}
        deidentified={false}
      />
    </Grid>
  )
}

export default PatientDocs
