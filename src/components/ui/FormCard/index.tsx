import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Grid,
  IconButton,
  IconButtonProps,
  Typography,
  styled
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import Lines from '../Lines'
import { Line } from 'types/table'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}))

interface FormCardsProps {
  cardColor: string
  title: string
  chipsInfo: string[]
  formDetails: Line[]
  avatar: React.ReactNode
}

const FormCards: React.FC<FormCardsProps> = ({ cardColor, title, chipsInfo, formDetails, avatar }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      style={{
        margin: '10px 16px',
        borderLeft: `4px solid ${cardColor}`
      }}
    >
      <CardHeader
        action={
          <ExpandMore expand={expanded} onClick={() => setExpanded(!expanded)}>
            <ExpandMoreIcon htmlColor={cardColor} />
          </ExpandMore>
        }
        avatar={avatar}
        title={<Typography variant="h6">{title}</Typography>}
        subheader={
          <Grid container style={{ marginBottom: 4 }}>
            {chipsInfo.map((chip, index) => (
              <Chip
                key={index}
                variant="outlined"
                size="small"
                label={chip}
                style={{ marginRight: 4, fontSize: 12, color: '#868686', fontWeight: 600 }}
              />
            ))}
          </Grid>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent style={{ padding: '8px 0 0' }}>
          <Lines value={formDetails} />
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default FormCards
