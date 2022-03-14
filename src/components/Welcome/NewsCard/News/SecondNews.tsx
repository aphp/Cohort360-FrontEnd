import React from 'react'

import Typography from '@material-ui/core/Typography'

const FirstNews = () => {
  return (
    <>
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelles fonctionnalités</b> - 12/2021
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
    </>
  )
}

export default FirstNews
