import { useValidatedSubTab } from 'hooks/tabs/useValidatedSubTab'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ResourceType } from 'types/requestCriterias'

type TabConfig = {
  label: string
  value: ResourceType
  show: boolean
  subs?: { label: string; value: ResourceType }[]
}

export const useTabs = (config: TabConfig[]) => {
  const { tabName } = useParams<{ tabName?: ResourceType }>()
  const [currentTab, setCurrentTab] = useState<ResourceType>(tabName ?? ResourceType.PREVIEW)

  const tabs = useMemo(() => config.filter((t) => t.show), [config])

  const subTabs = useMemo(() => tabs.find((t) => t.value === currentTab)?.subs ?? null, [tabs, currentTab])

  // gère selectedSubTab uniquement si des sous-tabs existent
  const { selectedSubTab, handleChangeSubTab } = useValidatedSubTab(subTabs)

  // règle clé : si pas de subTabs → subTab = null pour éviter un double render
  const currentSubTab = subTabs ? selectedSubTab : null

  const handleChangeTab = (newTab: ResourceType) => {
    setCurrentTab(newTab)
  }
  const effectiveValue = currentSubTab ?? currentTab

  return {
    tabs,
    subTabs,
    currentTab,
    currentSubTab,
    effectiveValue,
    handleChangeTab,
    handleChangeSubTab
  }
}
