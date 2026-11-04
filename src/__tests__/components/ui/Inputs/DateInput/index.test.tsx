import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateInput from 'components/ui/Inputs/DateInput'

const FORMAT_ERROR = 'Format attendu : JJ/MM/AAAA'

const renderDateInput = (props: Partial<React.ComponentProps<typeof DateInput>> = {}) => {
  const onChange = vi.fn()
  const onIncomplete = vi.fn()
  render(
    <>
      <DateInput defaultValue={null} onChange={onChange} onIncomplete={onIncomplete} {...props} />
      <button>dehors</button>
    </>
  )
  return { user: userEvent.setup(), onChange, onIncomplete }
}

const section = (name: 'Jour' | 'Mois' | 'Année') => screen.getByRole('spinbutton', { name })
const isInvalid = () => document.querySelector('[aria-invalid="true"]') !== null

describe('DateInput', () => {
  it("remplit l'année de gauche à droite", async () => {
    const { user } = renderDateInput()

    await user.click(section('Jour'))
    await user.keyboard('01102')
    expect(section('Année')).toHaveTextContent(/^2/)
    await user.keyboard('0')
    expect(section('Année')).toHaveTextContent(/^20/)
  })

  it('affiche le format attendu à la sortie du champ quand la date est incomplète', async () => {
    const { user, onChange, onIncomplete } = renderDateInput()

    await user.click(section('Jour'))
    await user.keyboard('0110')
    expect(screen.queryByText(FORMAT_ERROR)).not.toBeInTheDocument()
    expect(isInvalid()).toBe(false)
    expect(onIncomplete).toHaveBeenLastCalledWith(true)

    await user.click(screen.getByText('dehors'))
    expect(screen.getByText(FORMAT_ERROR)).toBeInTheDocument()
    expect(isInvalid()).toBe(true)
    expect(onChange).not.toHaveBeenCalledWith(expect.any(String))
  })

  it('traite une année de moins de 4 chiffres comme incomplète', async () => {
    const { user, onIncomplete } = renderDateInput()

    await user.click(section('Jour'))
    await user.keyboard('01102')
    await user.click(screen.getByText('dehors'))

    expect(onIncomplete).toHaveBeenLastCalledWith(true)
    expect(screen.getByText(FORMAT_ERROR)).toBeInTheDocument()
  })

  it("retire l'erreur dès que la date devient valide", async () => {
    const { user, onChange, onIncomplete } = renderDateInput()

    await user.click(section('Jour'))
    await user.keyboard('0110')
    await user.click(screen.getByText('dehors'))
    await user.click(section('Année'))
    await user.keyboard('2026')

    expect(screen.queryByText(FORMAT_ERROR)).not.toBeInTheDocument()
    expect(isInvalid()).toBe(false)
    expect(onIncomplete).toHaveBeenLastCalledWith(false)
    expect(onChange).toHaveBeenLastCalledWith('2026-10-01')
  })

  it("retire l'erreur dès que le champ est vidé", async () => {
    const { user, onIncomplete } = renderDateInput()

    await user.click(section('Jour'))
    await user.keyboard('0110')
    await user.click(screen.getByText('dehors'))
    await user.click(section('Jour'))
    await user.keyboard('{Backspace}')
    await user.click(section('Mois'))
    await user.keyboard('{Backspace}')

    expect(screen.queryByText(FORMAT_ERROR)).not.toBeInTheDocument()
    expect(isInvalid()).toBe(false)
    expect(onIncomplete).toHaveBeenLastCalledWith(false)
  })

  it("un champ laissé vide n'est pas en erreur", async () => {
    const { user, onIncomplete } = renderDateInput()

    await user.click(section('Jour'))
    await user.click(screen.getByText('dehors'))

    expect(screen.queryByText(FORMAT_ERROR)).not.toBeInTheDocument()
    expect(isInvalid()).toBe(false)
    expect(onIncomplete).not.toHaveBeenCalledWith(true)
  })

  it("affiche l'erreur transmise par le parent", () => {
    renderDateInput({ defaultValue: '2026-10-01', error: 'Fin antérieure au début' })

    expect(screen.getByText('Fin antérieure au début')).toBeInTheDocument()
    expect(isInvalid()).toBe(true)
  })
})
