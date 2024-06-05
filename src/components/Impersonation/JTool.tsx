/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { JSXElementConstructor, PropsWithChildren, ReactElement, useState } from 'react'
import { JTOOL_USERS } from '../../constants.js'
import { useAppSelector } from 'state'

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
  const jtoolUsers = JTOOL_USERS.split(',').map((id: string) => id.trim())
  const [clickCount, setClickCount] = useState(0)
  const [originalHandler, setOriginalHandler] = useState<ReactElement<any, string | JSXElementConstructor<any>>>()

  const handleClick = (e: React.MouseEvent, child: ReactElement<any, string | JSXElementConstructor<any>>) => {
    e.stopPropagation()
    setClickCount((prev) => prev + 1)
    setOriginalHandler(child)
  }

  if (!!jtoolUsers.find((id: string) => id === me?.id)) {
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

export function JToolComponentEggWrapper(props: PropsWithChildren<{}>) {
  const { children } = props
  const me = useAppSelector((state) => state.me)
  const jtoolUsers = JTOOL_USERS.split(',').map((id: string) => id.trim())

  if (!!jtoolUsers.find((id: string) => id === me?.id)) {
    return <>{children}</>
  }
  return <div />
}

export default JToolEggWrapper
