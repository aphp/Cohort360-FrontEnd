import { useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { getCleanGroupId } from 'utils/paginationUtils'

const ALLOWED_PARAMS = ['page', 'groupId', 'subtab']

export const useCleanSearchParams = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const cleanedParams = new URLSearchParams()

    ALLOWED_PARAMS.forEach((key) => {
      const value = searchParams.get(key)
      if (value) {
        if (key === 'groupId') {
          const cleanGroupId = getCleanGroupId(value)
          if (cleanGroupId) cleanedParams.set(key, cleanGroupId)
        } else {
          cleanedParams.set(key, value)
        }
      }
    })

    const original = searchParams.toString()
    const cleaned = cleanedParams.toString()

    if (original !== cleaned) {
      navigate(`${location.pathname}?${cleaned}`, { replace: true })
    }
  }, [searchParams, location.pathname, navigate])
}
