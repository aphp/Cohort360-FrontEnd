import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import ActionsLogging from '../ActionsLogging'
import CareTeamSharing from '../CareTeamSharing'
import DataDeletion from '../DataDeletion'

const SCREENS = [
  { name: 'ActionsLogging', node: <ActionsLogging />, title: "L'enregistrement de vos actions" },
  { name: 'CareTeamSharing', node: <CareTeamSharing />, title: "Un partage limité à « l'équipe de soin »" },
  { name: 'DataDeletion', node: <DataDeletion />, title: 'La suppression de vos données' }
]

describe('chip titles of the accent screens', () => {
  it.each(SCREENS)('$name renders its label as a level-2 heading', ({ node, title }) => {
    render(node)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(title)
  })

  it.each(SCREENS)('$name avoids the h6 variant, which the theme uppercases and shrinks to 11px', ({ node }) => {
    render(node)
    expect(screen.getByRole('heading', { level: 2 })).not.toHaveClass('MuiTypography-h6')
  })

  it.each(SCREENS)('$name sizes its chip to the label, not to the card width', ({ node }) => {
    render(node)
    // A block-level chip would span the whole card; the mockup hugs the text.
    expect(getComputedStyle(screen.getByRole('heading', { level: 2 })).display).toBe('inline-block')
  })

  it.each(SCREENS)('$name lifts its chip out of the flow, straddling the card edge', ({ node }) => {
    render(node)
    const heading = screen.getByRole('heading', { level: 2 })
    // In the flow, the chip would push the body copy down instead of overlapping the border.
    expect(getComputedStyle(heading).position).toBe('absolute')
    expect(getComputedStyle(heading).transform).toContain('translateY(-50%)')
    expect(heading.parentElement && getComputedStyle(heading.parentElement).position).toBe('relative')
  })
})
