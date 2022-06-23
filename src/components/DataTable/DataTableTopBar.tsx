import React, { useState, useEffect } from 'react'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputBase from '@mui/material/InputBase'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import ClearIcon from '@mui/icons-material/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import InputSearchDocumentButton from 'components/Inputs/InputSearchDocument/components/InputSearchDocumentButton'
import InputSearchDocumentSimple from 'components/Inputs/InputSearchDocument/components/InputSearchDocumentSimple'
import InputSearchDocumentRegex from 'components/Inputs/InputSearchDocument/components/InputSearchDocumentRegex'

import {
  SearchByTypes,
  DTTB_TabsType as TabsType,
  DTTB_ResultsType as ResultsType,
  DTTB_SearchBarType as SearchBarType,
  DTTB_ButtonType as ButtonType
} from 'types'

import displayDigit from 'utils/displayDigit'

import useStyles from './styles'
import { ODD_REGEX } from '../../constants'

type DataTableTopBarProps = {
  tabs?: TabsType
  results?: ResultsType | ResultsType[]
  searchBar?: SearchBarType
  buttons?: ButtonType[]
}
const DataTableTopBar: React.FC<DataTableTopBarProps> = ({ tabs, results, searchBar, buttons }) => {
  const classes = useStyles()

  const [search, setSearch] = useState(searchBar?.value ?? '')
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [inputMode, setDefaultInputMode] = useState<'simple' | 'regex'>('simple')

  const onSearch = (newInput = search) => {
    if (searchBar && searchBar.onSearch && typeof searchBar.onSearch === 'function') {
      if (newInput && inputMode === 'regex') {
        newInput = newInput.replace(/[/"]/g, function (m) {
          switch (m) {
            case '/':
              return '\\/'
            case '"':
              return '\\"'
          }
          return m
        })
        newInput = `/(.)*${newInput}(.)*/`
      }
      searchBar.onSearch(newInput, searchBy)
    }
  }

  const handleChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    setSearchBy(event.target.value as SearchByTypes)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch()
    }
  }

  useEffect(() => {
    setSearch(searchBar?.value ?? '')
  }, [searchBar, searchBar && searchBar?.value])

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="flex-end" style={{ marginBlock: 8 }}>
        {tabs && tabs?.list?.length > 0 && (
          <Grid id="DTTB_tabs" item>
            <Tabs
              classes={{
                root: classes.tabsContainer,
                indicator: classes.indicator
              }}
              value={tabs.value}
              onChange={tabs?.onChange}
            >
              {tabs.list.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  value={tab.value}
                  icon={tab.icon}
                  wrapped={tab.wrapped ?? false}
                  classes={{ selected: classes.selected }}
                  className={classes.tabTitle}
                />
              ))}
            </Tabs>
          </Grid>
        )}
        {results && (
          <Grid id="DTTB_result" item container direction="column" style={{ width: 'fit-content' }}>
            {Array.isArray(results) && results.length > 0 ? (
              <>
                {results.map((result, index) => (
                  <Typography key={index} variant="button">
                    {displayDigit(result.nb ?? 0)} / {displayDigit(result.total ?? 0)} {result.label}
                  </Typography>
                ))}
              </>
            ) : (
              <Typography variant="button">
                {/* @ts-ignore */}
                {displayDigit(results.nb ?? 0)} / {displayDigit(results.total ?? 0)} {results.label}
              </Typography>
            )}
          </Grid>
        )}

        {((searchBar && searchBar.type !== 'document') || (buttons && buttons?.length > 0)) && (
          <Grid container item direction="row" alignItems="center" style={{ width: 'fit-content' }} wrap="nowrap">
            {searchBar && searchBar.type !== 'document' && (
              <Grid id="DTTB_search" container alignItems="center" direction="row" wrap="nowrap">
                {searchBar.type === 'patient' && (
                  <Select value={searchBy} onChange={handleChangeSelect} className={classes.select}>
                    <MenuItem value={SearchByTypes.text}>Tous les champs</MenuItem>
                    <MenuItem value={SearchByTypes.family}>Nom</MenuItem>
                    <MenuItem value={SearchByTypes.given}>Prénom</MenuItem>
                    <MenuItem value={SearchByTypes.identifier}>IPP</MenuItem>
                  </Select>
                )}
                <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
                  <InputBase
                    placeholder="Rechercher"
                    className={classes.input}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={onKeyDown}
                    endAdornment={
                      <InputAdornment position="end">
                        {search && (
                          <IconButton onClick={() => setSearch('')}>
                            <ClearIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    }
                  />
                  <IconButton type="submit" aria-label="search" onClick={() => onSearch()}>
                    <SearchIcon fill="#ED6D91" height="15px" />
                  </IconButton>
                </Grid>
              </Grid>
            )}

            {((buttons && buttons?.length > 0) || (searchBar && searchBar.type === 'document')) && (
              <Grid id="DTTB_btn">
                {buttons &&
                  buttons?.length > 0 &&
                  buttons.map((button, index) => (
                    <Button
                      key={index}
                      variant="contained"
                      disableElevation
                      startIcon={button.icon}
                      className={classes.searchButton}
                      onClick={button.onClick}
                    >
                      {button.label}
                    </Button>
                  ))}

                {searchBar && searchBar.type === 'document' && !!ODD_REGEX && (
                  <InputSearchDocumentButton currentMode={inputMode} onChangeMode={setDefaultInputMode} />
                )}
              </Grid>
            )}
          </Grid>
        )}
      </Grid>

      {searchBar && searchBar.type === 'document' && inputMode === 'simple' && (
        <InputSearchDocumentSimple
          defaultSearchInput={search}
          setDefaultSearchInput={(newSearchInput: string) => setSearch(newSearchInput)}
          onSearchDocument={(newInputText: string) => onSearch(newInputText)}
        />
      )}

      {searchBar && searchBar.type === 'document' && inputMode === 'regex' && (
        <InputSearchDocumentRegex
          defaultSearchInput={search}
          setDefaultSearchInput={(newSearchInput: string) => setSearch(newSearchInput)}
          onSearchDocument={(newInputText: string) => onSearch(newInputText)}
        />
      )}
    </>
  )
}

export default DataTableTopBar
