import React, { useState } from 'react'

import { InputAdornment, Menu, TextField } from '@mui/material'

import DateRangeIcon from '@mui/icons-material/DateRange'
import ClearIcon from '@mui/icons-material/Clear'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import Button from 'components/ui/Button'

type MenuButtonFilterProps = {
  buttonLabel: string
}

// TODO: tout? ^^'

const MenuButtonFilter: React.FC<MenuButtonFilterProps> = ({ buttonLabel }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [date, setDate] = useState<string | null>(null)

  return (
    <>
      <Button startIcon={<DateRangeIcon />} onClick={(e) => setAnchorEl(e.currentTarget)} width="180px">
        {buttonLabel}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} sx={{ padding: 20 }}>
        <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
          <DatePicker
            onChange={(newValue: string | null) => setDate(newValue)}
            value={date}
            renderInput={(params) => <TextField {...params} variant="standard" />}
          >
            <InputAdornment position="start">
              <ClearIcon color="primary" onClick={() => setDate(null)} />{' '}
            </InputAdornment>
          </DatePicker>
        </LocalizationProvider>
      </Menu>
    </>
  )
}

export default MenuButtonFilter
