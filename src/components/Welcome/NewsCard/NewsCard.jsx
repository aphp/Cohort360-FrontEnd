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
        <b>Nouvelles fonctionnalités</b> - 15/12/2021
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        <b>• Potentiel d'inclusion AP-HP</b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Lors de la création d'une cohorte, une option peut être activée pour demander une estimation du nombre de
        patients inclus si les critères étaient appliqués à toute l'AP-HP.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        <b>• Mise à jour d'une requête</b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Vous pouvez retourner sur une ancienne requête pour mettre à jour l'estimation du nombre de patients inclus. Le
        delta (différence de nombre de patients entre la date d'exécution de la requête et la date du jour) est mis en
        avant.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        <b>• Option Ouvrir dans Nouvelle Requête</b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Le menu de création d'une nouvelle requête permet d'ouvrir une requête anciennement sauvegardée.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        <b>• Nombre de patients dans les Documents cliniques</b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Sur l'onglet Documents cliniques, le nombre de patients qui possèdent des documents est affiché et se met à jour
        en fonction de la recherche textuelle et des filtres choisis.
      </Typography>
      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>

      <Divider className={classes.divider} style={{ marginTop: 16, marginBottom: 16 }} />

      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelle mise en production de fonctionnalités !</b> - 04/11/2021
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
