import React from 'react'
import { Box } from '@mui/material'
import { TabType } from 'types'
import { TabWrapper, TabsWrapper } from './styles'

type TabsProps<T, TL> = {
  values: TabType<T, TL>[]
  active: TabType<T, TL>
  onchange: (newValue: TabType<T, TL>) => void
}

const Tabs = <T, TL>({ values, active, onchange }: TabsProps<T, TL>) => {
  const tabSize = 100 / values.length
  return (
    <>
      {values && values?.length > 0 && (
        <Box>
          <TabsWrapper
            value={values.findIndex((value) => value.id === active.id)}
            onChange={(_: React.SyntheticEvent, newValue: number) => onchange(values[newValue])}
          >
            {values.map((value) => (
              <TabWrapper
                key={value.id as string}
                label={value.label as string}
                id={value.id as string}
                icon={value.icon}
                wrapped={value.wrapped ?? false}
                width={`${tabSize}%`}
              />
            ))}
          </TabsWrapper>
        </Box>
      )}
    </>
  )
}

export default Tabs
