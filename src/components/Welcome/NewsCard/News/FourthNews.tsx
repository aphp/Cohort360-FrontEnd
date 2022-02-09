import React from 'react'

import Typography from '@material-ui/core/Typography'

const FirstNews = () => {
  return (
    <>
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelles fonctionnalités</b> - XX/XX/2022
      </Typography>

      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • La biologie est disponible dans le requêteur et la fiche patient. Attention, pour l'instant, la biologie est
        restreinte aux 3000 codes ANABIO les plus utilisés.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • L'unité exécutrice dans la fiche patient affiche maintenant les Unité Fonctionnelles dans lesquels les
        patients ont réalisé un séjour.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Il est maintenant possible de filtrer par IPP les documents du patient
      </Typography>

      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>
    </>
  )
}

export default FirstNews
