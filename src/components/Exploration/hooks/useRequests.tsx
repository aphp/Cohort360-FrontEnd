import React, { useEffect, useState } from 'react'
import services from 'services/aphp'

const useRequests = (projectId: string, searchTerm: string, startDate?: string, endDate?: string, page = 1) => {
  const [requestsList, setRequestsList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // TODO: à externaliser
  const fetchRequestsList = async () => {
    // TODO: modifier le service de sorte à ajouter les filtres + try/catch
    const rowsPerPage = 20
    const offset = (page - 1) * rowsPerPage
    const requestsList = await services.projects.fetchRequestsList(rowsPerPage, offset)
    console.log('test requestsList', requestsList)
    setRequestsList(requestsList.results)
    setTotal(requestsList.count)
  }

  useEffect(() => {
    // setLoading(true)
    console.log('test fetchRequestsList()', fetchRequestsList())
  }, [projectId, searchTerm, startDate, endDate, page])

  return { requestsList, total, loading }
}

export default useRequests
