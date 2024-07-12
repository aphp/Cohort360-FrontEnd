import { useCallback, useEffect, useState } from 'react'

type LoadingProgressInfo = {
  partsCount: number
  partsProgress: Map<number, { stage: number; total: number }>
}

export default function useMultipartDataLoading() {
  const [dataLoading, setDataLoading] = useState(true)
  const [dataPartsLoadingProgress, setDataPartsLoadingProgress] = useState<LoadingProgressInfo | undefined>()
  const [dataLoadingProgress, setDataLoadingProgress] = useState<number | undefined>(undefined)

  const updateLoadingProgress = useCallback((part: number, stage: number, total: number, partCounts: number) => {
    setDataPartsLoadingProgress((prev) => {
      const prevProgress = prev?.partsProgress || new Map()
      return {
        partsCount: partCounts,
        partsProgress: prevProgress.set(part, total > 0 ? { stage, total } : { stage: 1, total: 1 })
      }
    })
  }, [])

  useEffect(() => {
    if (!dataLoading) {
      setDataPartsLoadingProgress(undefined)
      setDataLoadingProgress(undefined)
    }
  }, [dataLoading])

  useEffect(() => {
    if (!dataPartsLoadingProgress) {
      setDataLoadingProgress(undefined)
      return
    }

    const progressParts = [...dataPartsLoadingProgress.partsProgress.values()]
    if (progressParts.length !== dataPartsLoadingProgress.partsCount) {
      setDataLoadingProgress(undefined)
      return
    }

    const combinedProgress = progressParts.reduce(
      (acc, progress) => {
        if (progress.total === 0) {
          return acc
        }
        return {
          stage: acc.stage + progress.stage,
          total: acc.total + progress.total
        }
      },
      { stage: 0, total: 0 }
    )
    setDataLoadingProgress(100 * (combinedProgress.stage / combinedProgress.total))
  }, [dataPartsLoadingProgress])

  return { dataLoading, dataLoadingProgress, updateLoadingProgress, setDataLoading }
}
