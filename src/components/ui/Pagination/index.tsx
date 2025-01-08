import React, { useEffect, useState, useContext } from 'react'
import { Box, FormLabel, Grid, PaginationItem } from '@mui/material'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import { PaginationInput, StyledButton, StyledPagination } from './styles'
import { useAppDispatch } from 'state'
import { showDialog } from 'state/warningDialog'
import { AppConfig } from 'config'

type PaginationProps = {
  currentPage: number
  count: number
  onPageChange: (page: number) => void
  smallSize?: boolean
  centered?: boolean
  color?: string
}

export const Pagination = ({
  currentPage,
  count,
  onPageChange,
  smallSize,
  centered = false,
  color = '#5BC5F2'
}: PaginationProps) => {
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
            message: `La sélection est limitée à ${config.core.pagination.limit} pages. Merci d'affiner votre recherche à l'aide des filtres à votre disposition.`
          })
        )
      }
    } else {
      dispatch(
        showDialog({
          isOpen: true,
          message: 'Veuillez entrer un numéro de page valide.'
        })
      )
    }
  }

  return (
    <Grid
      container
      direction={smallSize ? 'column' : 'row'}
      justifyContent={centered ? 'center' : 'flex-end'}
      alignItems="center"
      xs={11}
    >
      <StyledPagination
        elemColor={color}
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
      <Box display="flex" justifyContent={smallSize ? 'center' : 'flex-end'} alignItems="center">
        <FormLabel>Aller à la page</FormLabel>
        <PaginationInput
          elemColor={color}
          currentvalue={goToPage}
          onChangeCurrentValue={(newValue) => setGoToPage(newValue)}
          onKeyDown={handleKeyDown}
        />
        <StyledButton onClick={submitPageChange} elemColor={color}>
          <ArrowCircleRightIcon />
        </StyledButton>
      </Box>
    </Grid>
  )
}
