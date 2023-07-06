import React, { KeyboardEvent, UIEvent, useCallback, useEffect, useState } from 'react'

import {
  Breadcrumbs,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import useStyles from './styles'
import { useDebounce } from 'utils/debounce'
import { ValueSetWithHierarchy } from 'services/aphp/cohortCreation/fetchObservation'
import services from 'services/aphp'
import { ObservationDataType } from 'types/requestCriterias'
import { ValueSet } from 'types'

type BiologySearchListItemProps = {
  label: string
  biologyItem: ValueSet
  selectedItems?: ValueSet[] | null
  handleClick: (biologyItem: ValueSet[]) => void
}

const BiologySearchListItem: React.FC<BiologySearchListItemProps> = (props) => {
  const { label, biologyItem, selectedItems, handleClick } = props

  const { classes, cx } = useStyles()

  const isSelected = selectedItems ? !!selectedItems.find((item) => item.code === biologyItem.code) : false

  const handleClickOnList = (biologyItem: ValueSet) => {
    const _selectedItems = selectedItems ? [...selectedItems] : []
    const foundItem = _selectedItems?.find(({ code }) => code === biologyItem.code)
    const isAlreadySelected = foundItem ? _selectedItems?.indexOf(foundItem) : -1
    if (isAlreadySelected === -1) {
      handleClick([..._selectedItems, biologyItem])
    } else {
      _selectedItems.splice(isAlreadySelected, 1)
      handleClick([..._selectedItems])
    }
  }

  return (
    <ListItem className={classes.biologyItem}>
      <ListItemIcon>
        <div
          onClick={() => handleClickOnList(biologyItem)}
          className={cx(classes.indicator, {
            [classes.selectedIndicator]: isSelected
          })}
          style={{ color: '#0063af', cursor: 'pointer' }}
        />
      </ListItemIcon>
      <Tooltip title={label} enterDelay={2500}>
        <Breadcrumbs maxItems={2}>
          {label.split('|').map((_label: string, index: number) => (
            <ListItemText
              key={index}
              onClick={() => handleClickOnList(biologyItem)}
              className={classes.label}
              primary={_label}
            />
          ))}
        </Breadcrumbs>
      </Tooltip>
    </ListItem>
  )
}

type BiologySearchProps = {
  isEdition?: boolean
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
  selectedCriteria: ObservationDataType
  onConfirm: () => void
}

const BiologySearch: React.FC<BiologySearchProps> = (props) => {
  const { isEdition, goBack, onChangeSelectedCriteria, onConfirm, selectedCriteria } = props
  const { classes } = useStyles()

  const [selectedTab, setSelectedTab] = useState<'anabio' | 'loinc'>('anabio')
  const [searchInput, setSearchInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [biologySearchResults, setBiologySearchResults] = useState<{
    anabio: ValueSetWithHierarchy[]
    loinc: ValueSetWithHierarchy[]
  }>({
    anabio: [],
    loinc: []
  })
  const [selectedItems, setSelectedItems] = useState<ValueSet[]>([])

  const debouncedSearchItem = useDebounce(500, searchInput)

  const _onSubmit = (event: UIEvent) => {
    event.preventDefault()
    getBiologySearchResults()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    event.key === 'Enter' && !event.shiftKey ? _onSubmit(event) : null
  }

  const _onNext = () => {
    const formattedSelectedItems =
      selectedItems && selectedItems.length > 0
        ? [...(selectedCriteria.code || []), selectedItems.map((v) => ({ id: v.code, label: v.display }))].flat()
        : [...(selectedCriteria.code || [])]

    onChangeSelectedCriteria(formattedSelectedItems)
    onConfirm()
  }

  const getBiologySearchResults = useCallback(async () => {
    if (debouncedSearchItem && debouncedSearchItem.length >= 2) {
      try {
        setLoading(true)
        const biologySearchResults = await services.cohortCreation.fetchBiologySearch(debouncedSearchItem)

        setBiologySearchResults(
          biologySearchResults ?? {
            loinc: [],
            anabio: []
          }
        )
        setLoading(false)
      } catch (error) {
        console.error('Erreur lors de la recherche avec Concept Map', error)
        setBiologySearchResults({
          loinc: [],
          anabio: []
        })
        setLoading(false)
      }
    } else if (debouncedSearchItem === '') {
      setBiologySearchResults({
        loinc: [],
        anabio: []
      })
    }
  }, [debouncedSearchItem])

  useEffect(() => {
    getBiologySearchResults()
  }, [getBiologySearchResults])

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère de biologie</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de biologie</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        <Grid item container xs={12} alignItems="center" className={classes.searchBar}>
          <InputBase
            placeholder="Recherche dans les collections de biologie"
            className={classes.input}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={onKeyDown}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchInput('')}>{searchInput && <ClearIcon />}</IconButton>
              </InputAdornment>
            }
          />

          <IconButton type="submit" aria-label="search" onClick={_onSubmit}>
            <SearchIcon fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>

        <Grid container item>
          <Tabs value={selectedTab} onChange={(event, value) => setSelectedTab(value)} indicatorColor="secondary">
            <Tab
              label={`ANABIO (${biologySearchResults.anabio.length ?? 0})`}
              value="anabio"
              component={Link}
              style={{ minWidth: 160 }}
            />
            <Tab
              label={`LOINC (${biologySearchResults.loinc.length ?? 0})`}
              value="loinc"
              component={Link}
              style={{ minWidth: 160 }}
            />
          </Tabs>
        </Grid>

        {loading ? (
          <Grid container direction="column" justifyContent="center" alignItems="center">
            <CircularProgress size={50} />
          </Grid>
        ) : (
          <List className={classes.drawerContentContainer}>
            {selectedTab === 'anabio' &&
              biologySearchResults.anabio.length > 0 &&
              biologySearchResults.anabio.map((anabioItem, index) => {
                const label = anabioItem.hierarchyDisplay
                return (
                  <BiologySearchListItem
                    key={index}
                    label={label}
                    selectedItems={selectedItems}
                    handleClick={setSelectedItems}
                    biologyItem={anabioItem}
                  />
                )
              })}

            {selectedTab === 'loinc' &&
              biologySearchResults.loinc.length > 0 &&
              biologySearchResults.loinc.map((loincItem, index) => {
                const label = `${loincItem.code} - ${loincItem.display}`

                return (
                  <BiologySearchListItem
                    key={index}
                    label={label}
                    selectedItems={selectedItems}
                    handleClick={setSelectedItems}
                    biologyItem={loincItem}
                  />
                )
              })}
          </List>
        )}
      </Grid>

      <Grid className={classes.criteriaActionContainer}>
        <Button onClick={() => _onNext()} type="submit" form="biology-search" color="primary" variant="contained">
          Suivant
        </Button>
      </Grid>
    </Grid>
  )
}

export default BiologySearch
