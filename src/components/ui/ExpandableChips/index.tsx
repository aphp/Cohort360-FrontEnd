import React, { useEffect, useRef, useState } from 'react'
import { Box, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ChipWrapper } from 'components/ui/Chip/styles'

type ExpandableChipsLineProps = {
  items: string[]
  colorString?: string
  backgroundColor?: string
}

const ExpandableChipsLine: React.FC<ExpandableChipsLineProps> = ({
  items,
  colorString = '#153d8a',
  backgroundColor = '#FFF'
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(items.length)
  const chipRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!containerRef.current || expanded) return

    const containerWidth = containerRef.current.offsetWidth
    let total = 0
    let count = 0

    for (let i = 0; i < items.length; i++) {
      const chip = chipRefs.current[i]
      if (!chip) continue

      const width = chip.offsetWidth + 8 // margin/gap compensation
      // 40px is the width reserved for the expand chip
      if (total + width + 40 > containerWidth) break
      total += width
      count++
    }

    setVisibleCount(count)
  }, [items, expanded])

  const chipsToRender = expanded ? items : items.slice(0, visibleCount)
  const showExpand = !expanded && visibleCount < items.length

  return (
    <Box width="100%" marginTop={'4px'}>
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        {chipsToRender.map((label, index) => (
          <ChipWrapper
            key={label}
            label={label}
            colorString={colorString}
            backgroundColor={backgroundColor}
            style={{ margin: 0 }}
            ref={(el) => {
              chipRefs.current[index] = el
            }}
          />
        ))}

        {showExpand && (
          <Tooltip title="Afficher plus">
            <ChipWrapper
              label="..."
              colorString={colorString}
              backgroundColor={backgroundColor}
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => setExpanded(true)}
            />
          </Tooltip>
        )}

        {expanded && (
          <Tooltip title="Réduire">
            <ChipWrapper
              label={
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <CloseIcon fontSize="small" />
                </Box>
              }
              colorString={colorString}
              backgroundColor={backgroundColor}
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => setExpanded(false)}
            />
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

export default ExpandableChipsLine
