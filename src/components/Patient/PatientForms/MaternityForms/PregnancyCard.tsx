import React, { useState } from 'react'
import { Card, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, Typography, styled } from '@mui/material'
import { getDataFromForm } from 'utils/formUtils'
import { pregnancyForm } from 'data/pregnancyData'
import moment from 'moment'
import { ExpandMore as ExpandMoreIcon, PregnantWoman } from '@mui/icons-material'
import PregnancyFormDetails from '../PregnancyFormDetails'
import { CohortQuestionnaireResponse } from 'types'

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

interface PregnancyCardProps {
  form: CohortQuestionnaireResponse
}

const PregnancyCard: React.FC<PregnancyCardProps> = ({ form }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card style={{ margin: '10px 0' }}>
      <CardHeader
        action={
          <ExpandMore expand={expanded} onClick={() => setExpanded(!expanded)}>
            <ExpandMoreIcon />
          </ExpandMore>
        }
        avatar={<PregnantWoman />}
        title={getDataFromForm(form, pregnancyForm.pregnancyType)}
        subheader={`Début de grossesse : ${moment(getDataFromForm(form, pregnancyForm.pregnancyStartDate)).format(
          'DD/MM/YYYY'
        )}`}
      />
      <CardContent>
        <Typography variant="body2" component="p">
          Unité exécutrice : {form.serviceProvider}
        </Typography>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <PregnancyFormDetails pregnancyFormData={form} onClose={() => console.log('first')} />
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default PregnancyCard
