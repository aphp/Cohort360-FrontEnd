import React, { useEffect, useState } from 'react'
import clsx from 'clsx'

import {
  Breadcrumbs,
  Button,
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
  TextField,
  Tooltip,
  Typography
} from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import useStyles from './styles'
import { useAppSelector } from 'state'
import { checkIfIndeterminated } from 'utils/pmsi'
import { BiologyListType } from 'state/biology'
import { setSelectedCriteria } from 'state/cohortCreation'
import PatientSearchBar from 'components/Inputs/PatientSearchBar/PatientSearchBar'

type BiologySearchListItemProps = {
  label: string
  biologyItem: any
  selectedItems?: any[] | null
  // handleClick: (biologyItem: { id: string; label: string }[] | null) => void
  handleClick: (biologyItem: any) => void
}

const BiologySearchListItem: React.FC<BiologySearchListItemProps> = (props) => {
  const { label, biologyItem, selectedItems, handleClick } = props
  // const { id, label, subItems } = biologyItem

  const classes = useStyles()

  // const biologyState = useAppSelector((state) => state.biology || {})
  // const biologyHierarchy = biologyState.list

  // const isSelected = selectedItems ? selectedItems.find(({ code }) => code === biologyItem.target[0].code) : false
  const isSelected = selectedItems
    ? selectedItems.find((item) => item.target[0].code === biologyItem.target[0].code)
    : false
  // const isSelected = selectedItems ? selectedItems.code === biologyItem.code : false
  const isIndeterminated = checkIfIndeterminated(biologyItem, selectedItems)

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
            [classes.selectedIndicator]: isSelected,
            [classes.indeterminateIndicator]: isIndeterminated
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
        {/* <ListItemText onClick={() => handleClickOnList(biologyItem)} className={classes.label} primary={label} /> */}
      </Tooltip>
    </ListItem>
  )
}

type BiologySearchProps = {
  isEdition?: boolean
  criteria: any
  goBack: (data: any) => void
  // onChangeValue:
  onChangeSelectedCriteria: (data: any) => void
}

const BiologySearch: React.FC<BiologySearchProps> = (props) => {
  const { isEdition, criteria, goBack, onChangeSelectedCriteria } = props
  const classes = useStyles()

  const [selectedTab, setSelectedTab] = useState<'anabio' | 'loinc'>('anabio')
  const [searchInput, setSearchInput] = useState<string>('')
  const [biologySearchResults, setBiologySearchResults] = useState<{ anabio: any[]; loinc: any[] }>({
    anabio: [],
    loinc: []
  })
  // TODO: mettre le bon type vvvv
  // TODO: mettre la bonne valeur par défaut vvvv
  // TODO: d'où sort setSelectedCriteria?
  const [selectedItems, setSelectedItems] = useState<any>(isEdition ? setSelectedCriteria.code : [])

  const onKeyDown = async (e: any) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault()
      getBiologySearchResults()
    }
  }

  // TODO: vvvv super important, prendre de biology hierarchy
  const _onSubmit = () => {
    // ici convertir les data en BiologyListType
    console.log('selectedItems', selectedItems)
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
    console.log('formattedData', formattedData)
    // if (selectedCriteria?.code?.length === 0) {
    //   return setError(true)
    // }
    onChangeSelectedCriteria(formattedData)
  }

  const getBiologySearchResults = async () => {
    if (searchInput.length >= 3) {
      try {
        const biologySearchResults = await criteria.fetch.fetchBiologySearch(searchInput)

        setBiologySearchResults(
          biologySearchResults ?? {
            loinc: [],
            anabio: []
          }
        )
      } catch (error) {
        console.error('Erreur lors de la recherche avec Concept Map', error)
        setBiologySearchResults({
          loinc: [],
          anabio: []
        })
      }
    }
  }

  console.log('biologySearchResults', biologySearchResults)

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
        {/* TODO: remplacer par InputSearchDocumentSimple */}
        <Grid item container xs={12} alignItems="center" className={classes.searchBar}>
          <InputBase
            placeholder="Recherche dans les collections de biologie"
            className={classes.input}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={onKeyDown}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                // onClick={handleClearInput}
                >
                  {searchInput && <ClearIcon />}
                </IconButton>
              </InputAdornment>
            }
          />

          <IconButton
            type="submit"
            aria-label="search"
            // onClick={onSearchPatient}
            onClick={onKeyDown}
          >
            <SearchIcon fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>

        <Grid container item>
          <Tabs value={selectedTab} onChange={(event, value) => setSelectedTab(value)} textColor="primary">
            <Tab label={`ANABIO (${biologySearchResults.anabio.length ?? 0})`} value="anabio" component={Link} />
            <Tab label={`LOINC (${biologySearchResults.loinc.length ?? 0})`} value="loinc" component={Link} />
          </Tabs>
        </Grid>

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
