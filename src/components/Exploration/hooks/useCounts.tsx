import React, { useEffect, useState } from 'react'

const useCounts = (searchTerm: string, startDate?: string | null, endDate?: string | null) => {
  const [data, setData] = useState<{
    projectsCount: number
    requestsCount: number
    cohortsCount: number
    samplesCount: number
  }>({
    projectsCount: 0,
    requestsCount: 0,
    cohortsCount: 0,
    samplesCount: 0
  })

  useEffect(() => {
    if (!searchTerm && !startDate && !endDate) {
      setData({ projectsCount: 0, requestsCount: 0, cohortsCount: 0, samplesCount: 0 })
      return
    }

    const fetchCounts = async () => {
      // TODO: API call

      setData({
        projectsCount: searchTerm ? 5 : 0,
        requestsCount: searchTerm ? 20 : 0,
        cohortsCount: searchTerm ? 3 : 0,
        samplesCount: searchTerm ? 4 : 0
      })
    }

    fetchCounts()
  }, [searchTerm, startDate, endDate])

  return data
}

export default useCounts
