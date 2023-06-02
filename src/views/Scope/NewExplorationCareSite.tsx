import React, { useState } from 'react'
import ExploratedCareSite from 'components/ScopeTree/NewScopeTree/ExploratedCareSite'
import { Button, Divider } from '@mui/material'
import ScopeSearchBar from 'components/Inputs/ScopeSearchBar/ScopeSearchBar'
import ChipsMultiSelection from 'components/ScopeTree/NewScopeTree/ChipsMultiSelection'
import CareSiteResearchResult from 'components/ScopeTree/NewScopeTree/CareSiteResearchResult'

const NewExplorationCareSite = (props: any) => {
  const isResearch = useState<boolean>(false) // sert a savoir si un utilisateur fait une recherche
  return (
    <>
      <div>Le titre de la page</div>
      <Divider />
      <ChipsMultiSelection />
      <ScopeSearchBar searchInput={props} onChangeInput={props} />
      <ExploratedCareSite />
      {isResearch && <CareSiteResearchResult />}
      <Button
        variant="contained"
        disableElevation
        onClick={} // reset des caresite selectionne
        disabled={!props.length}
        className={}
      >
        Annuler
      </Button>
      <Button
        variant="contained"
        disableElevation
        disabled={!props.length}
        onClick={} // envoie des props et redirection vers la page de exploration de periemtre avec les caresiteID
        className={}
      >
        Valider
      </Button>
    </>
  )
}

export default NewExplorationCareSite
