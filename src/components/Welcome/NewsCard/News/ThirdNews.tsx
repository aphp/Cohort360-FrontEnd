import React from 'react'

import Typography from '@mui/material/Typography'

const FirstNews = () => {
  return (
    <>
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelles fonctionnalités</b> - 02/2022
      </Typography>

      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        <b>• Informations: des infobulles ont été ajoutées pour vous accompagner </b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Dans l'utilisation de l'estimation du nombre de patients AP-HP au moment de la création de votre cohorte.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Dans le calcul du delta de nombre de patients par rapport à une ancienne requête.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        <b>• Parcours Patient</b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Un filtre sur les types de diagnostics affichés sur le parcours patient a été ajouté.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        Le design a été amélioré.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        <b>• Correctif</b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8 }}>
        L'anomalie concernant la visualisation des pdf des documents médicaux a été corrigée.
      </Typography>

      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>
    </>
  )
}

export default FirstNews
