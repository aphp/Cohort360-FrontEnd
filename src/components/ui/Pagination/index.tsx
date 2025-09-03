import React, { useEffect, useState, useContext } from 'react'
import { Box, FormLabel, Grid, PaginationItem } from '@mui/material'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import { PaginationInput, StickyContainer, StyledButton, StyledPagination } from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { showDialog } from 'state/warningDialog'
import { AppConfig } from 'config'
import { drawerWidth } from 'components/Routes/LeftSideBar/styles'

type PaginationProps = {
  currentPage: number
  count: number
  onPageChange: (page: number) => void
  sidebarDisplay?: boolean
}

export const Pagination = ({ currentPage, count, onPageChange }: PaginationProps) => {
  const dispatch = useAppDispatch()
  const [goToPage, setGoToPage] = useState('')
  const config = useContext(AppConfig)

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      submitPageChange()
    }
  }

  useEffect(() => {
    setGoToPage('')
  }, [currentPage])

  const submitPageChange = () => {
    const pageNum = parseInt(goToPage, 10)
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= count) {
      if (pageNum <= config.core.pagination.limit) {
        onPageChange(pageNum)
      } else {
        dispatch(
          showDialog({
            isOpen: true,
            message: `La sélection est limitée à ${config.core.pagination.limit} pages. Merci d'affiner votre recherche à l'aide des filtres à votre disposition.`,
            status: 'warning'
          })
        )
      }
    } else {
      dispatch(
        showDialog({
          isOpen: true,
          message: 'Veuillez entrer un numéro de page valide.',
          status: 'warning'
        })
      )
    }
  }
  return (
    <Grid container size={{ xs: 12 }} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <StyledPagination
        role="search"
        shape="circular"
        count={count}
        page={currentPage}
        onChange={handlePageChange}
        renderItem={(item) => {
          const itemsToRender = !(
            item.type === 'last' ||
            item.type === 'end-ellipsis' ||
            (item.page && item.page > config.core.pagination.limit)
          )
          if (count > config.core.pagination.limit) {
            return itemsToRender ? <PaginationItem {...item} /> : null
          } else {
            return <PaginationItem {...item} />
          }
        }}
      />
      <Box display="flex" alignItems="center">
        <FormLabel>Aller à la page</FormLabel>
        <PaginationInput
          value={goToPage}
          onChange={(newValue) => setGoToPage(newValue as string)}
          onKeyDown={handleKeyDown}
        />
        <StyledButton onClick={submitPageChange}>
          <ArrowCircleRightIcon />
        </StyledButton>
      </Box>
    </Grid>
  )
}

export const StickyPagination = ({ currentPage, count, onPageChange, sidebarDisplay = false }: PaginationProps) => {
  const drawerOpen = useAppSelector((state) => state.drawer)
  return (
    <StickyContainer leftPadding={drawerOpen ? drawerWidth : 0} sidebarDisplay={sidebarDisplay}>
      <Pagination currentPage={currentPage} count={count} onPageChange={onPageChange} />
    </StickyContainer>
  )
}

export default Pagination
