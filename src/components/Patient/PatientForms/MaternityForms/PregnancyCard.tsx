import React, { useState } from 'react'
import { Card, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, Typography, styled } from '@mui/material'
import { getDataFromForm } from 'utils/formUtils'
import { pregnancyForm } from 'data/pregnancyData'
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
    <Card style={{ margin: '10px 0', border: '1px solid #ED6D91' }}>
      <CardHeader
        action={
          <ExpandMore expand={expanded} onClick={() => setExpanded(!expanded)}>
            <ExpandMoreIcon />
          </ExpandMore>
        }
        avatar={<PregnantWoman />}
        title={
          getDataFromForm(form, pregnancyForm.pregnancyType) ?? getDataFromForm(form, pregnancyForm.twinPregnancyType)
        }
        subheader={`Début de grossesse : ${getDataFromForm(form, pregnancyForm.pregnancyStartDate)}`}
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
