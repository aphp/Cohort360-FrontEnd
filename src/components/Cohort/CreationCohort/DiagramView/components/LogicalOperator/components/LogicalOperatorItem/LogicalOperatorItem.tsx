import React, { useState } from 'react'

import { Typography } from '@material-ui/core'

import useStyles from './styles'

type LogicalOperatorItemProps = {
  itemId: number
}

const LogicalOperatorItem: React.FC<LogicalOperatorItemProps> = ({ itemId }) => {
  const classes = useStyles()

  const isMainOperator = itemId === 0

  const [isOpen, setOpen] = useState<boolean>(false)

  return (
    <>
      {isMainOperator ? (
        <Typography variant="h5" className={classes.mainLogicalOperator}>
          ET
        </Typography>
      ) : (
        <Typography onClick={() => setOpen(!isOpen)} variant="h5" className={classes.logicalOperator}>
          ET
        </Typography>
      )}
    </>
  )
}

export default LogicalOperatorItem
