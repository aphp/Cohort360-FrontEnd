import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { ResourceType } from 'types/requestCriterias'

type SubTab = {
  value: ResourceType
}

export const useValidatedSubtab = (subTabs: SubTab[] | null): ResourceType | null => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const subtabParam = searchParams.get('subtab')
  const [validatedSubtab, setValidatedSubtab] = useState<ResourceType | null>(null)

  useEffect(() => {
    if (!subTabs || subTabs.length === 0) {
      setValidatedSubtab(null)
      return
    }

    const matched = subTabs.find((s) => s.value.toLowerCase() === subtabParam?.toLowerCase())
    const defaultSubtab = subTabs[0].value

    if (!matched && subtabParam !== null) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('subtab', defaultSubtab)
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true })
    }

    setValidatedSubtab(matched?.value ?? defaultSubtab)
  }, [subtabParam, subTabs, location.pathname, navigate])

  return validatedSubtab
}
