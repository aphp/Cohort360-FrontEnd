import React from 'react'
import { Link } from 'react-router-dom'
import { Tab, Tabs } from '@mui/material'
import Select from 'components/ui/Searchbar/Select'
import { ResourceType } from 'types/requestCriterias'

type SubtabsDisplayProps = {
  subTabs: {
    label: string
    value: ResourceType
  }[]
  groupId?: string
  selectedSubTab: ResourceType
  baseUrl: string
  onChange: (newValue: ResourceType) => void
  asSelect?: boolean
}

const SubtabsDisplay: React.FC<SubtabsDisplayProps> = ({
  subTabs,
  groupId,
  selectedSubTab,
  baseUrl,
  onChange,
  asSelect
}) => {
  const groupIdParam = groupId ? `groupId=${groupId}` : ''

  return asSelect ? (
    <Select
      value={selectedSubTab}
      label="Formulaire"
      options={subTabs.map((subtab) => {
        return {
          id: subtab.value,
          label: subtab.label
        }
      })}
      onChange={(newSubTab) => onChange(newSubTab)}
      radius={25}
    />
  ) : (
    <Tabs value={selectedSubTab} onChange={(_, newSubTab) => onChange(newSubTab)}>
      {subTabs.map((subTab) => {
        return (
          <Tab
            sx={{ fontSize: 12 }}
            key={subTab.value}
            label={subTab.label}
            value={subTab.value}
            component={Link}
            to={`${baseUrl}?${groupIdParam}&subtab=${subTab.value}`}
          />
        )
      })}
    </Tabs>
  )
}

export default SubtabsDisplay
