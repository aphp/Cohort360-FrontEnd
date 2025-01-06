import React, { useEffect, useState } from 'react'
import services from 'services/aphp'

const useProjects = (searchTerm: string, startDate?: string, endDate?: string) => {
  const [projectsList, setProjectsList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // TODO: à externaliser
  const fetchProjectsList = async () => {
    // TODO: modifier le service de sorte à ajouter les filtres + try/catch
    const projectsList = await services.projects.fetchProjectsList()
    console.log('test projectsList', projectsList)
    setProjectsList(projectsList.results)
    setTotal(projectsList.count)
  }

  useEffect(() => {
    // setLoading(true)
    console.log('test fetchPRoejctsList()', fetchProjectsList())
  }, [searchTerm, startDate, endDate])

  return { projectsList, total, loading }
}

export default useProjects
