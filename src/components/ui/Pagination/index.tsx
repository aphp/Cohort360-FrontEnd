import React, { useEffect, useState } from 'react'
import { Box, FormLabel, Grid, IconButton } from '@mui/material'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import { PaginationInput, StyledPagination } from './styles'

type PaginationProps = {
  currentPage: number
  count: number
  onPageChange: (page: number) => void
  smallSize?: boolean
}

export const Pagination = ({ currentPage, count, onPageChange, smallSize }: PaginationProps) => {
  const [goToPage, setGoToPage] = useState('')

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setGoToPage(value.toString())
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
      onPageChange(pageNum)
    } else {
      alert('Veuillez entrer un numéro de page valide.')
    }
  }

  return (
    <Grid container direction={smallSize ? 'column' : 'row'} justifyContent="flex-end" alignItems="center" xs={11}>
      <StyledPagination role="search" shape="circular" count={count} page={currentPage} onChange={handlePageChange} />
      <Box display="flex" justifyContent={smallSize ? 'center' : 'flex-end'} alignItems="center">
        <FormLabel>Aller à la page</FormLabel>
        <PaginationInput
          currentValue={goToPage}
          onChangeCurrentValue={(newValue) => setGoToPage(newValue)}
          onKeyDown={handleKeyDown}
        />
        <IconButton style={{ padding: 0 }} onClick={submitPageChange}>
          <ArrowCircleRightIcon />
        </IconButton>
      </Box>
    </Grid>
  )
}
