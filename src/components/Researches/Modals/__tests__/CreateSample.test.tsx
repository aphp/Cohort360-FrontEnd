import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CreateSample from 'components/Researches/Modals/CreateSample'
import { Cohort } from 'types'
import { AppConfig, getConfig } from 'config'

const mockOnCreate = vi.fn()
const mockOnClose = vi.fn()

const createMockCohort = (resultSize: number): Cohort =>
  ({
    uuid: 'test-uuid',
    name: 'Test Cohort',
    result_size: resultSize
  }) as Cohort

const renderCreateSample = (parentCohort: Cohort) => {
  return render(
    <AppConfig.Provider value={getConfig()}>
      <CreateSample open={true} parentCohort={parentCohort} onCreate={mockOnCreate} onClose={mockOnClose} />
    </AppConfig.Provider>
  )
}

describe('CreateSample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('zero patient validation', () => {
    it('should show error when percentage would result in 0 patients', () => {
      const cohort = createMockCohort(3) // 3 patients
      renderCreateSample(cohort)

      // Fill name
      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test Sample' } })

      // Enter 1% - which gives 0.03 patients = 0 after floor
      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '1' } })

      // Should show error message
      expect(
        screen.getByText(/Ce pourcentage donnerait 0 patient/i)
      ).toBeInTheDocument()

      // Create button should be disabled
      const createButton = screen.getByRole('button', { name: /créer/i })
      expect(createButton).toBeDisabled()
    })

    it('should allow creation when percentage results in at least 1 patient', () => {
      const cohort = createMockCohort(100) // 100 patients
      renderCreateSample(cohort)

      // Fill name
      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test Sample' } })

      // Enter 10% - which gives 10 patients
      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '10' } })

      // Should NOT show error message
      expect(screen.queryByText(/Ce pourcentage donnerait 0 patient/i)).not.toBeInTheDocument()

      // Create button should be enabled
      const createButton = screen.getByRole('button', { name: /créer/i })
      expect(createButton).not.toBeDisabled()
    })

    it('should show error for small cohort with low percentage', () => {
      const cohort = createMockCohort(10) // 10 patients
      renderCreateSample(cohort)

      // Fill name
      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test Sample' } })

      // Enter 5% - which gives 0.5 patients = 0 after floor
      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '5' } })

      // Should show error message mentioning 10 patients
      expect(screen.getByText(/contient 10 patient/i)).toBeInTheDocument()

      // Create button should be disabled
      const createButton = screen.getByRole('button', { name: /créer/i })
      expect(createButton).toBeDisabled()
    })

    it('should allow 10% on 10 patients (results in 1 patient)', () => {
      const cohort = createMockCohort(10) // 10 patients
      renderCreateSample(cohort)

      // Fill name
      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test Sample' } })

      // Enter 10% - which gives 1 patient
      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '10' } })

      // Should NOT show error
      expect(screen.queryByText(/Ce pourcentage donnerait 0 patient/i)).not.toBeInTheDocument()

      // Create button should be enabled
      const createButton = screen.getByRole('button', { name: /créer/i })
      expect(createButton).not.toBeDisabled()
    })
  })
})
