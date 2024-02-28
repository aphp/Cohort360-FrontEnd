import React, { useState } from 'react'
import { Card, CardContent, CardHeader, Collapse, IconButton, IconButtonProps, Typography, styled } from '@mui/material'
import { getDataFromForm } from 'utils/formUtils'
import { ExpandMore as ExpandMoreIcon, DomainAdd } from '@mui/icons-material'
import { CohortQuestionnaireResponse } from 'types'
import HospitFormDetails from '../HospitFormDetails'
import { hospitForm } from 'data/hospitData'
import moment from 'moment'

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

interface HospitCardProps {
  form: CohortQuestionnaireResponse
}

const HospitCard: React.FC<HospitCardProps> = ({ form }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card style={{ margin: '10px 0', border: '1px solid limegreen' }}>
      <CardHeader
        action={
          <ExpandMore expand={expanded} onClick={() => setExpanded(!expanded)}>
            <ExpandMoreIcon />
          </ExpandMore>
        }
        avatar={<DomainAdd />}
        title={'Hospitalisation'}
        subheader={
          form.item?.find((item) => item.linkId === hospitForm.birthDeliveryStartDate.id)
            ? `Accouchement le ${getDataFromForm(form, hospitForm.birthDeliveryStartDate)}`
            : `Date d'écriture : ${moment(form.authored).format('DD/MM/YYYY')}`
        }
      />
      <CardContent>
        <Typography variant="body2" component="p">
          Unité exécutrice : {form.serviceProvider}
        </Typography>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <HospitFormDetails hospitFormData={form} onClose={() => console.log('coucou')} />
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default HospitCard
