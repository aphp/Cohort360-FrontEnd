import { Grid } from '@mui/material'
import React, { useRef, useState, useEffect } from 'react'

interface TruncatedProps<T> {
  values: T[]
  component: React.FC<T>
  maxHeight?: number
  gap?: string
}

const Truncated = <T,>({ values, component: Component, maxHeight = 200, gap = '5px' }: TruncatedProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const actualHeight = container.scrollHeight
      setShowMore(actualHeight > maxHeight)
    }
  }, [values, maxHeight])

  return (
    <Grid container sx={{ justifyContent: 'space-between' }}>
      <Grid container size={{ xs: 12 }}>
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            position: 'relative',
            flexWrap: 'wrap',
            maxHeight,
            overflowY: showMore ? 'scroll' : 'hidden',
            gap
          }}
        >
          {values.map((item, index) => (
            <Component key={index} {...item} style={{ margin: gap }} />
          ))}
        </div>
      </Grid>
    </Grid>
  )
}

export default Truncated
