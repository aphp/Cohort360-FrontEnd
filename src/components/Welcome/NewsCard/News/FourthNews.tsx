import React from 'react'

import Typography from '@material-ui/core/Typography'

const FirstNews = () => {
  return (
    <>
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelles fonctionnalités</b> - 03/2022
      </Typography>

      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Les résultats de biologie sont disponibles dans le requêteur et la fiche patient. Attention, pour l'instant,
        la biologie est restreinte aux 3870 codes ANABIO les plus utilisés.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • L'unité exécutrice dans la fiche patient affiche maintenant les Unités Fonctionnelles dans lesquelles les
        patients ont réalisé un séjour.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Il est maintenant possible de filtrer les documents des patients par IPP
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • La mise à disposition da la recherche par expression régulière
      </Typography>

      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>
    </>
  )
}

export default FirstNews
