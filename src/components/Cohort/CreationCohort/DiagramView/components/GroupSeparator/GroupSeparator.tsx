import React from 'react'
import { Typography } from '@material-ui/core'

import useStyles from './style'

type GroupSeparatorProps = {
  groupType?: 'andGroup' | 'orGroup' | 'NamongM'
}

const getGroupTypeLabel = (groupType: 'andGroup' | 'orGroup' | 'NamongM') => {
  switch (groupType) {
    case 'andGroup':
      return 'AND'

    case 'orGroup':
      return 'OR'

    case 'NamongM':
      return 'N among M'

    default:
      break
  }

  return ''
}

const GroupSeparator: React.FC<GroupSeparatorProps> = ({ groupType = 'andGroup' }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <div className={classes.separator}>
        <Typography>{getGroupTypeLabel(groupType)}</Typography>
      </div>
    </div>
  )
}

export default GroupSeparator
