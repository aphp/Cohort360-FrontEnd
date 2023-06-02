import React from 'react'

const CareSiteResearchResult = (props: any) => {
  return (
    <>
      <div>Composant qui affiche les resulats de la recherche{props} d'un caresite sous forme de tableau</div>
      <div>
        Lors de la selection d'un caresite, push dans la liste le caresite pour que le composant ChipsMultiselection
        puisse afficher les caresite selectionner {props}modifie
      </div>
    </>
  )
}

export default CareSiteResearchResult
