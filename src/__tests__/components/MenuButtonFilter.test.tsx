import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

    expect(screen.getByText('À partir du :')).toBeInTheDocument()
    expect(screen.getByText("Jusqu'au :")).toBeInTheDocument()
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
})
