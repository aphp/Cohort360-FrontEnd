import React from 'react'

export type Paragraph = { text: string; sx?: React.CSSProperties }

type ParagraphsProps = {
  value: Paragraph[]
}

const Paragraphs = ({ value }: ParagraphsProps) => {
  return (
    <>
      {value.map((paragraph) => (
        <p style={{ ...paragraph.sx, margin: 0 }}>{paragraph.text}</p>
      ))}
    </>
  )
}

export default Paragraphs
