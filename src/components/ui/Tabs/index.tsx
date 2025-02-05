import React from 'react'
import { TabType } from 'types'
import { Tab, Tabs as TabsMui } from '@mui/material'

type TabsProps<T, TL> = {
  values: TabType<T, TL>[]
  active: TabType<T, TL>
  disabled?: boolean
  onchange: (newValue: TabType<T, TL>) => void
  variant?: 'pink' | 'blue'
}

const Tabs = <T, TL>({ values, active, disabled = false, onchange, variant = 'blue' }: TabsProps<T, TL>) => {
 // const tabSize = 100 / values.length
  return (
    <>
      {values && values?.length > 0 && (
        <TabsMui
          value={values.findIndex((value) => value.id === active.id)}
          onChange={(_: React.SyntheticEvent, newValue: number) => onchange(values[newValue])}
        >
          {values.map((value) => (
            <Tab
              disabled={disabled}
              // variant={variant}
              key={value.id as string}
              label={value.label as string}
              id={value.id as string}
              icon={value.icon}
              sx={{
                fontSize: 12,
                color: '#303030',
                padding: '4px 8px',
                marginRight: '12px'
              }}
              //sx={{ '&.Mui-selected': { color: '#5bc5f2' } }}
              // wrapped={value.wrapped ?? false}
              //width={`${tabSize}%`}
            />
          ))}
        </TabsMui>
      )}
    </>
  )
}

export default Tabs
