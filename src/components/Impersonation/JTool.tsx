/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { JSXElementConstructor, PropsWithChildren, ReactElement, useContext, useState } from 'react'
import { useAppSelector } from 'state'
import { AppConfig } from 'config'

export type JToolEggProps = {
  clickCount: number
  wrappedComponent?: ReactElement<any, string | JSXElementConstructor<any>>
}

type JToolEggWrapperClickProps = {
  Egg: React.FunctionComponent<JToolEggProps>
  eggProps?: any
}

export function JToolEggWrapper(props: PropsWithChildren<JToolEggWrapperClickProps>) {
  const { Egg, eggProps } = props
  const me = useAppSelector((state) => state.me)
  const appConfig = useContext(AppConfig)
  const [clickCount, setClickCount] = useState(0)
  const [originalHandler, setOriginalHandler] = useState<ReactElement<any, string | JSXElementConstructor<any>>>()

  const handleClick = (e: React.MouseEvent, child: ReactElement<any, string | JSXElementConstructor<any>>) => {
    e.stopPropagation()
    setClickCount((prev) => prev + 1)
    setOriginalHandler(child)
  }

  if (!!appConfig.system.jToolUsers.find((id: string) => id === me?.id)) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'column'
        }}
      >
        {clickCount > 0 && <Egg clickCount={clickCount} wrappedComponent={originalHandler} {...eggProps} />}
        {React.Children.map(props.children, (child) => {
          return React.cloneElement(child as ReactElement<any, string | JSXElementConstructor<any>>, {
            onClick: (e: React.MouseEvent) =>
              handleClick(e, child as ReactElement<any, string | JSXElementConstructor<any>>)
          })
        })}
      </div>
    )
  }
  return <>{props.children}</>
}

export function JToolComponentEggWrapper(props: PropsWithChildren<object>) {
  const { children } = props
  const me = useAppSelector((state) => state.me)
  const appConfig = useContext(AppConfig)

  if (!!appConfig.system.jToolUsers.find((id: string) => id === me?.id)) {
    return <>{children}</>
  }
  return <div />
}

export default JToolEggWrapper
