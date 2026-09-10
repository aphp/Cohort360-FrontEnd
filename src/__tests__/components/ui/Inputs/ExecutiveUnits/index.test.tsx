import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SourceType } from 'types/scope'

const getPerimeters = vi.fn().mockResolvedValue({ results: [], count: 0 })
vi.mock('services/aphp/servicePerimeters', () => ({
  default: { getPerimeters: (...args: unknown[]) => getPerimeters(...args) }
}))
vi.mock('components/ScopeTree', () => ({ default: () => <div data-testid="scope-tree" /> }))

import ExecutiveUnits from 'components/ui/Inputs/ExecutiveUnits'

const PLACEHOLDER = 'Sélectionner une unité exécutrice'

const renderField = (props: { disabled?: boolean } = {}) =>
  render(<ExecutiveUnits value={[]} sourceType={SourceType.SUPPORTED} onChange={vi.fn()} disabled={props.disabled} />)

// The selection panel only mounts its content (incl. the "Annuler" button) while open.
const panelOpen = () => screen.queryByRole('button', { name: /annuler/i }) !== null

beforeEach(() => {
  vi.clearAllMocks()
})

describe('components/ui/Inputs/ExecutiveUnits', () => {
  it("ouvre le panneau au clic n'importe où sur le champ, pas seulement sur la loupe", async () => {
    renderField()
    await screen.findByTestId('SearchOutlinedIcon') // wait for the initial getPerimeters() effect

    expect(panelOpen()).toBe(false)

    await userEvent.click(screen.getByText(PLACEHOLDER))

    expect(await screen.findByRole('button', { name: /annuler/i })).toBeInTheDocument()
  })

  it('ne réagit pas au clic quand le champ est désactivé', async () => {
    renderField({ disabled: true })

    await userEvent.click(screen.getByText(PLACEHOLDER))

    expect(panelOpen()).toBe(false)
    expect(getPerimeters).not.toHaveBeenCalled()
  })
})
