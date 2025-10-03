import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router'
import { ResourceType } from 'types/requestCriterias'

type SubTab = {
  value: ResourceType
}

export const useValidatedSubTab = (subTabs: SubTab[] | null) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const subtabParam = searchParams.get('subtab')
  const [selectedSubTab, setSelectedSubTab] = useState<ResourceType | null>(null)

  useEffect(() => {
    if (!subTabs || subTabs.length === 0) {
      setSelectedSubTab(null)
      return
    }

    const matched = subTabs.find((s) => s.value.toLowerCase() === subtabParam?.toLowerCase())
    const defaultSubtab = subTabs[0].value

    if (!matched && subtabParam !== null) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('subtab', defaultSubtab)
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true })
    }

    setSelectedSubTab(matched?.value ?? defaultSubtab)
  }, [subtabParam, subTabs, location.pathname, navigate, searchParams])

  const handleChangeSubTab = (newSubtab: ResourceType) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('subtab', newSubtab)
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true })
  }

  return { selectedSubTab, handleChangeSubTab }
}
