import React from 'react'

import Typography from '@material-ui/core/Typography'

const SeventhNews = () => {
  return (
    <>
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelles fonctionnalités</b> - 28/11/2022
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Le <b>menu latéral</b> reste déplié par défaut.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Dans le critère de biologie, la <b>recherche par valeur</b> est désormais optionnelle.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Il est maintenant possible de filtrer les documents selon la <b>disponibilité du PDF</b>.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • <b>La deconnexion automatique</b> est dorénavant effective sur tous les onglets ouverts de Cohort360.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Les cohortes d'I2B2 ne sont plus remontées dans Cohort360. La colonne <b>"type de cohorte"</b> a ainsi été
        retirée du tableau des cohortes.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Divers <b>correctifs de bugs et d'anomalies</b> ont été réalisés.
      </Typography>
      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>
    </>
  )
}

export default SeventhNews
