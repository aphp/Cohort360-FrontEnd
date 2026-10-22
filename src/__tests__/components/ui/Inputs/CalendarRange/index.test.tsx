import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalendarRange from 'components/ui/Inputs/CalendarRange'

describe('CalendarRange', () => {
  it('affiche « Fin antérieure au début » sous le champ de fin et signale une erreur', () => {
    const onError = vi.fn()
    const onChange = vi.fn()
    render(<CalendarRange value={['2026-10-02', '2026-10-01']} onChange={onChange} onError={onError} />)

    expect(screen.getByText('Fin antérieure au début')).toBeInTheDocument()
    expect(onError).toHaveBeenLastCalledWith(true)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("n'est pas en erreur quand les dates sont dans l'ordre ou vides", () => {
    const onError = vi.fn()
    const onChange = vi.fn()
    render(<CalendarRange value={['2026-10-01', null]} onChange={onChange} onError={onError} />)

    expect(screen.queryByText('Fin antérieure au début')).not.toBeInTheDocument()
    expect(onError).toHaveBeenLastCalledWith(false)
    expect(onChange).toHaveBeenLastCalledWith(['2026-10-01', null], false)
  })

  it('signale une erreur tant que la date est incomplète', async () => {
    const user = userEvent.setup()
    const onError = vi.fn()
    render(<CalendarRange value={[null, null]} onChange={vi.fn()} onError={onError} />)

    await user.click(screen.getAllByRole('spinbutton', { name: 'Jour' })[1])
    await user.keyboard('0110')
    expect(onError).toHaveBeenLastCalledWith(true)

    await user.keyboard('2026')
    expect(onError).toHaveBeenLastCalledWith(false)
  })
})
