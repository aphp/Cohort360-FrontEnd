import React from 'react'

import Typography from '@material-ui/core/Typography'

const FifthNews = () => {
  return (
    <>
      <Typography color="textSecondary" style={{ paddingBottom: 14 }}>
        <b>Nouvelles fonctionnalités</b> - 22/07/2022
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • L'option <b>"Mes requêtes"</b> dans le menu de paramétrage du requêteur permet d'ajouter les critères d'une
        requête dans une autre. Cela fonctionne avec les anciennes requêtes créées et les requêtes partagées avec vous.
      </Typography>
      <Typography color="textSecondary" style={{ paddingBottom: 8, paddingLeft: 16 }}>
        • Dans le paramétrage des requêtes, pour les critères qui possèdent une hiérarchie (biologie, PMSI et
        médicaments) il est possible de <b>sélectionner toute la hiérarchie</b> en un seul clic.
      </Typography>
      <Typography color="textSecondary" style={{ paddingTop: 6 }}>
        <b>L'équipe Cohort360</b>
      </Typography>
    </>
  )
}

export default FifthNews
