import React from 'react'
import { useLocation } from 'react-router'

const useBreadCrumb = () => {
  const location = useLocation()
  const pathParts = location.pathname.split('/').filter(Boolean)
  console.log('test pathParts', pathParts)

  const items = []

  // TODO: clean et externaliser
  // TODO: faire une fonction plus jolie pour trouver où je suis et récup les noms
  if (pathParts[1] === 'projects') {
    items.push({ label: 'Mes projets', url: 'researches/projects' })
  } else if (pathParts[1] === 'requests') {
    items.push({ label: 'Mes requêtes', url: 'researches/requests' })
  } else if (pathParts[1] === 'cohorts') {
    items.push({ label: 'Mes cohortes', url: 'researches/cohorts' })
  } else if (pathParts[1] === 'samples') {
    items.push({ label: 'Mes échantillons', url: 'researches/samples' })
  }

  return items
}

export default useBreadCrumb
