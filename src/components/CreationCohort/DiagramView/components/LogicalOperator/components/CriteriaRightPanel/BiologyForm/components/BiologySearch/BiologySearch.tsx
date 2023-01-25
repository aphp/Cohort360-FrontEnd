import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

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

type BiologySearchListItemProps = {
  label: string
  biologyItem: any
  selectedItems?: any[] | null
  handleClick: (biologyItem: any) => void
}

const BiologySearchListItem: React.FC<BiologySearchListItemProps> = (props) => {
  const { label, biologyItem, selectedItems, handleClick } = props

  const classes = useStyles()

  const isSelected = selectedItems
    ? selectedItems.find((item) => item.target[0].code === biologyItem.target[0].code)
    : false

  const handleClickOnList = (biologyItem: any) => {
    const _selectedItems = selectedItems ? [...selectedItems] : []
    const foundItem = _selectedItems?.find(({ target }) => target[0].code === biologyItem.target[0].code)
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
          className={clsx(classes.indicator, {
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
  criteria: any
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
  selectedCriteria: any
}

const BiologySearch: React.FC<BiologySearchProps> = (props) => {
  const { isEdition, criteria, goBack, onChangeSelectedCriteria, selectedCriteria } = props
  const classes = useStyles()

  const [selectedTab, setSelectedTab] = useState<'anabio' | 'loinc'>('anabio')
  const [searchInput, setSearchInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [biologySearchResults, setBiologySearchResults] = useState<{ anabio: any[]; loinc: any[] }>({
    anabio: [],
    loinc: []
  })
  const [selectedItems, setSelectedItems] = useState<[]>([])

  const debouncedSearchItem = useDebounce(500, searchInput)

  const onKeyDown = async (e: any) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault()
      getBiologySearchResults()
    }
  }

  const _onSubmit = () => {
    // ici, conversion des data en BiologyListType
    const formattedData = selectedItems?.map((item: any) => {
      if (item.code === item.target[0].code) {
        return {
          id: item.code,
          label: item.display
        }
      } else {
        return {
          id: item.target[0].code,
          label: item.target[0].display
        }
      }
    })

    const formattedSelectedItems =
      formattedData && formattedData.length > 0
        ? [...selectedCriteria.code, formattedData].flat()
        : [...selectedCriteria.code]

    onChangeSelectedCriteria(formattedSelectedItems)
  }

  const getBiologySearchResults = async () => {
    if (debouncedSearchItem && debouncedSearchItem.length >= 2) {
      try {
        setLoading(true)
        const biologySearchResults = await criteria.fetch.fetchBiologySearch(debouncedSearchItem)

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
  }

  useEffect(() => {
    getBiologySearchResults()
  }, [debouncedSearchItem])

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack} size="large">
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
                <IconButton onClick={() => setSearchInput('')} size="large">
                  {searchInput && <ClearIcon />}
                </IconButton>
              </InputAdornment>
            }
          />

          <IconButton type="submit" aria-label="search" onClick={onKeyDown} size="large">
            <SearchIcon fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>

        <Grid container item>
          <Tabs value={selectedTab} onChange={(event, value) => setSelectedTab(value)} textColor="primary">
            <Tab label={`ANABIO (${biologySearchResults.anabio.length ?? 0})`} value="anabio" component={Link} />
            <Tab label={`LOINC (${biologySearchResults.loinc.length ?? 0})`} value="loinc" component={Link} />
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
                const label = anabioItem?.target?.[0].display

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
                const loincObject = loincItem?.target?.[0]
                const label = `${loincObject?.code} - ${loincObject?.display}`

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
        {!isEdition && (
          <Button onClick={goBack} color="primary" variant="outlined">
            Annuler
          </Button>
        )}
        <Button onClick={_onSubmit} type="submit" form="biology-form" color="primary" variant="contained">
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default BiologySearch
