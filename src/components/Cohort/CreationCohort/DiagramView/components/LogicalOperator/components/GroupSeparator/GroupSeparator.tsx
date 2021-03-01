import React from 'react'
import { Typography } from '@material-ui/core'

import useStyles from './style'

type GroupSeparatorProps = {
  groupType?: 'andGroup' | 'orGroup' | 'NamongM'
  n?: number
  m?: number
}

const getGroupTypeLabel = (groupType: 'andGroup' | 'orGroup' | 'NamongM', n?: number, m?: number) => {
  switch (groupType) {
    case 'andGroup':
      return 'AND'

    case 'orGroup':
      return 'OR'

    case 'NamongM':
      return `${n ?? 'N'} among ${m ?? 'M'}`

    default:
      break
  }

  return ''
}

const GroupSeparator: React.FC<GroupSeparatorProps> = ({ groupType = 'andGroup', n, m }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <div className={classes.separator}>
        <Typography>{getGroupTypeLabel(groupType, n, m)}</Typography>
      </div>
    </div>
  )
}

export default GroupSeparator
