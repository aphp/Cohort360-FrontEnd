import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import MenuButtonFilter from 'components/Researches/MenuButtonFilter'

describe('MenuButtonFilter', () => {
  it('opens the pickers when dates come from the URL as YYYY-MM-DD strings (page reload)', () => {
    render(
      <MenuButtonFilter
        startDate="2026-09-01"
        endDate="2026-09-15"
        onChangeStartDate={vi.fn()}
        onChangeEndDate={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Du .* au / }))

    expect(screen.getByDisplayValue('01/09/2026')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15/09/2026')).toBeInTheDocument()
  })

  it('emits the URL dates unchanged when applying without editing', () => {
    const onChangeStartDate = vi.fn()
    const onChangeEndDate = vi.fn()
    render(
      <MenuButtonFilter
        startDate="2026-09-01"
        endDate={null}
        onChangeStartDate={onChangeStartDate}
        onChangeEndDate={onChangeEndDate}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /À partir du/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }))

    expect(onChangeStartDate).toHaveBeenCalledWith('2026-09-01')
    expect(onChangeEndDate).toHaveBeenCalledWith(null)
  })

  it('emits a YYYY-MM-DD string, not a Moment, when a date is picked', () => {
    const onChangeStartDate = vi.fn()
    render(
      <MenuButtonFilter
        startDate="2026-09-01"
        endDate={null}
        onChangeStartDate={onChangeStartDate}
        onChangeEndDate={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /À partir du/ }))
    fireEvent.click(screen.getAllByRole('button', { name: /^Choisir la date/ })[0])
    fireEvent.click(within(screen.getByRole('grid')).getByRole('gridcell', { name: '10' }))
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }))

    expect(onChangeStartDate).toHaveBeenCalledWith('2026-09-10')
  })
})
