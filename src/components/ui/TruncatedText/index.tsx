import React, { useRef, useState, useEffect } from 'react'
import { Typography, Tooltip } from '@mui/material'

type TruncatedTextProps = {
  lineNb: number
  text: string
}

const TruncatedText = ({ lineNb, text }: TruncatedTextProps) => {
  const textRef = useRef<HTMLDivElement | null>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight)
    }
  }, [])

  return (
    <div>
      <Tooltip title={isTruncated ? textRef.current?.textContent : ''} arrow>
        <Typography
          variant="body1"
          ref={textRef}
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: lineNb,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {text}
        </Typography>
      </Tooltip>
    </div>
  )
}

export default TruncatedText
