import React from 'react'
import { TabType } from 'types'
import { TabWrapper, TabsWrapper } from './styles'

type TabsProps<T, TL> = {
  values: TabType<T, TL>[]
  active: TabType<T, TL>
  color?: string
  disabled?: boolean
  onchange: (newValue: TabType<T, TL>) => void
}

const Tabs = <T, TL>({ values, active, color = '#ED6D91', disabled = false, onchange }: TabsProps<T, TL>) => {
  const tabSize = 100 / values.length
  return (
    <>
      {values && values?.length > 0 && (
        <TabsWrapper
          color={color}
          value={values.findIndex((value) => value.id === active.id)}
          onChange={(_: React.SyntheticEvent, newValue: number) => onchange(values[newValue])}
        >
          {values.map((value) => (
            <TabWrapper
              disabled={disabled}
              color={color}
              key={value.id as string}
              label={value.label as string}
              id={value.id as string}
              icon={value.icon}
              wrapped={value.wrapped ?? false}
              width={`${tabSize}%`}
            />
          ))}
        </TabsWrapper>
      )}
    </>
  )
}

export default Tabs
