import React from 'react'

import Typography from '@material-ui/core/Typography'

const FirstNews = () => {
  return (
    <>
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelles fonctionnalités</b> - 06/2022
      </Typography>

      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Les résultats de <b>biologie</b> sont disponibles dans le requêteur et la fiche patient. Attention, pour
        l'instant, <b>la biologie est restreinte aux 3870 codes ANABIO les plus utilisés</b>.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • L'unité exécutrice dans la fiche patient affiche maintenant <b>les Unités Fonctionnelles</b> dans lesquelles
        les patients ont réalisé un séjour.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Il est maintenant possible de <b>filtrer les documents des patients par IPP.</b>
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • La mise à disposition de la <b>recherche par expression régulière</b> dans les documents médicaux lors de la
        sélection de patients et dans la visualisation des données.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • La nouvelle fonctionnalité <b>"Partager la requête"</b> dans le requêteur permet de créer une requête et de
        l'envoyer à un ou plusieurs autres utilisateurs de Cohort360. Un dossier "Mes requêtes reçues" a été ajouté sur
        la page Mes requêtes.
      </Typography>

      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>
    </>
  )
}

export default FirstNews
