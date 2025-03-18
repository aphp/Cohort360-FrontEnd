import React, { useState } from 'react'

import { Box, Menu } from '@mui/material'
import Button from 'components/ui/Button'
import DatePicker from '../DatePicker'
import DateRangeIcon from '@mui/icons-material/DateRange'

import useStyles from './styles'
import { formatDate } from 'utils/formatDate'

type MenuButtonFilterProps = {
  startDate: string | null
  onChangeStartDate: (newStartDate: string | null) => void
  endDate: string | null
  onChangeEndDate: (newEndDate: string | null) => void
}

const MenuButtonFilter: React.FC<MenuButtonFilterProps> = ({
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate
}) => {
  const { classes } = useStyles()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [innerStartDate, setInnerStartDate] = useState(startDate)
  const [innerEndDate, setInnerEndDate] = useState(endDate)

  const getLabel = (startDate: string | null, endDate: string | null) => {
    if (startDate && endDate) {
      return `Du ${formatDate(startDate)} au ${formatDate(endDate)}`
    } else if (startDate) {
      return `À partir du ${formatDate(startDate)}`
    } else if (endDate) {
      return `Jusqu'au ${formatDate(endDate)}`
    } else {
      return 'Toutes les dates'
    }
  }

  const onConfirm = () => {
    onChangeStartDate(innerStartDate)
    onChangeEndDate(innerEndDate)
    setAnchorEl(null)
  }

  return (
    <>
      <Button startIcon={<DateRangeIcon />} onClick={(e) => setAnchorEl(e.currentTarget)} width="fit-content" small>
        {getLabel(startDate, endDate)}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} className={classes.dateFilterMenu}>
        <DatePicker buttonLabel="À partir du :" value={innerStartDate} onChangeValue={setInnerStartDate} />
        <DatePicker buttonLabel="Jusqu'au :" value={innerEndDate} onChangeValue={setInnerEndDate} />
        <Box style={{ padding: '8px 12px' }}>
          <Button onClick={onConfirm} small>
            Appliquer
          </Button>
        </Box>
      </Menu>
    </>
  )
}

export default MenuButtonFilter
