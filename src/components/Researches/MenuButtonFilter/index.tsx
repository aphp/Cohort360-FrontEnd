import React, { useState } from 'react'

import { Box, Menu } from '@mui/material'
import Button from 'components/ui/Button'
import DatePicker from '../DatePicker'
import DateRangeIcon from '@mui/icons-material/DateRange'

import useStyles from './styles'
import { DATE_ERROR_MESSAGES, formatDate, isEndBeforeStart } from 'utils/dates'

type MenuButtonFilterProps = {
  startDate: string | null
  onChangeStartDate: (newStartDate: string | null) => void
  endDate: string | null
  onChangeEndDate: (newEndDate: string | null) => void
}

const MenuButtonFilter = (props: MenuButtonFilterProps) => {
  const { startDate, onChangeStartDate, endDate, onChangeEndDate } = props
  const { classes } = useStyles()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [innerStartDate, setInnerStartDate] = useState(startDate)
  const [innerEndDate, setInnerEndDate] = useState(endDate)
  const [isStartIncomplete, setIsStartIncomplete] = useState(false)
  const [isEndIncomplete, setIsEndIncomplete] = useState(false)

  const endBeforeStart = isEndBeforeStart(innerStartDate, innerEndDate)
  const isError = endBeforeStart || isStartIncomplete || isEndIncomplete

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
        <DatePicker
          buttonLabel="À partir du :"
          defaultValue={innerStartDate}
          onChangeValue={setInnerStartDate}
          onIncomplete={setIsStartIncomplete}
        />
        <DatePicker
          buttonLabel="Jusqu'au :"
          defaultValue={innerEndDate}
          error={endBeforeStart ? DATE_ERROR_MESSAGES.endBeforeStart : undefined}
          onChangeValue={setInnerEndDate}
          onIncomplete={setIsEndIncomplete}
        />
        <Box style={{ padding: '8px 12px' }}>
          <Button onClick={onConfirm} disabled={isError} small>
            Appliquer
          </Button>
        </Box>
      </Menu>
    </>
  )
}

export default MenuButtonFilter
