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

  const [selectedTab, setSelectedTab] = useState<ResourceType>(tabName ?? ResourceType.PREVIEW)

  const availableTabs = useMemo(() => config.filter((tab) => tab.show), [config])
  const subTabs = availableTabs.find((t) => t.value === selectedTab)?.subs ?? null

  const { selectedSubTab, handleChangeSubTab } = useValidatedSubTab(subTabs)

  const handleChangeTab = (newTab: ResourceType) => {
    setSelectedTab(newTab)
  }

  return {
    availableTabs,
    selectedTab,
    selectedSubTab,
    subTabs,
    handleChangeTab,
    handleChangeSubTab
  }
}
