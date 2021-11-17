import React from 'react'
import useStyles from './styles'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Title from '../../Title'

export default function TutorialsCard() {
  const classes = useStyles()
  return (
    <>
      <Title>Actualités</Title>
      <Divider className={classes.divider} />
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelle mise en production de fonctionnalités !</b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        La fonctionnalité d'<b>export est disponible</b> pour les utilisateurs avec un accès périmètre équipe de soins !
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Un tutoriel vous expliquant la démarche à suivre pour demander un export est disponible dans l'encart dédié.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Les <b>données de prescription et d'administration des médicaments ORBIS</b> ont été intégrées dans Cohort360.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Vous pouvez créer des cohortes de patients à partir de critères de médicaments, explorer ces données et exporter
        au format OMOP si vous avez accès à l'export csv.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        N'hésitez pas à nous faire vos retours via le formulaire de contact en bas à gauche du menu latéral.
      </Typography>
      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>
    </>
  )
}
