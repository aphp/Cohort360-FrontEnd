import React, { ReactNode } from 'react'
import { TabType } from 'types'
import { TabVariant, TabWrapper, TabsWrapper } from './styles'

type TabsProps<T, TL> = {
  values: TabType<T, TL>[]
  active: TabType<T, TL>
  disabled?: boolean
  onchange: (newValue: TabType<T, TL>) => void
  variant?: TabVariant
}

const Tabs = <T, TL>({ values, active, disabled = false, onchange, variant = 'blue' }: TabsProps<T, TL>) => {
  const tabSize = variant !== 'pill' ? 100 / values.length : 100 / values.length - 2
  return (
    <>
      {values && values?.length > 0 && (
        <TabsWrapper
          _variant={variant}
          value={values.findIndex((value) => value.id === active.id)}
          onChange={(_: React.SyntheticEvent, newValue: number) => onchange(values[newValue])}
        >
          {values.map((value) => (
            <TabWrapper
              disabled={disabled}
              variant={variant}
              key={value.id as string}
              label={value.label as ReactNode}
              id={value.id as string}
              icon={value.icon}
              wrapped={value.wrapped ?? false}
              width={`${tabSize}%`}
              disableRipple={variant === 'pill'}
            />
          ))}
        </TabsWrapper>
      )}
    </>
  )
}

export default Tabs
