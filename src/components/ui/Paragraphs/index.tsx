import { Typography } from '@mui/material'
import React from 'react'

export type Paragraph = string

type ParagraphsProps = {
  value: Paragraph[]
}

const Paragraphs = ({ value }: ParagraphsProps) => {
  return (
    <>
      {value.map((paragraph) => (
        <Typography>{paragraph}</Typography>
      ))}
    </>
  )
}

export default Paragraphs
