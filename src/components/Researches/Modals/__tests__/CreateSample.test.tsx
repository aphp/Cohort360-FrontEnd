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

  describe('name validation', () => {
    it('should show error when name is empty after interaction', () => {
      renderCreateSample(createMockCohort(100))

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'a' } })
      fireEvent.change(nameInput, { target: { value: '' } })

      expect(screen.getByText(/Le nom doit comporter au moins un caractère/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).toBeDisabled()
    })

    it('should show error when name exceeds 255 characters', () => {
      renderCreateSample(createMockCohort(100))

      const nameInput = screen.getByPlaceholderText('Nom')
      const longName = 'a'.repeat(256)
      fireEvent.change(nameInput, { target: { value: longName } })

      expect(screen.getByText(/Le nom est trop long/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).toBeDisabled()
    })

    it('should accept name with exactly 255 characters', () => {
      renderCreateSample(createMockCohort(100))

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'a'.repeat(255) } })

      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '10' } })

      expect(screen.queryByText(/Le nom est trop long/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).not.toBeDisabled()
    })
  })

  describe('percentage validation', () => {
    it('should show error when percentage is below 0.01', () => {
      renderCreateSample(createMockCohort(100))

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test' } })

      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '0.001' } })

      // Regex only allows 2 decimal places, so this would be blocked at input level
      // Let's test with 0 instead
      fireEvent.change(percentageInput, { target: { value: '0' } })

      expect(screen.getByText(/Le pourcentage doit être compris entre 0.01 et 99.99/i)).toBeInTheDocument()
    })

    it('should show error when percentage exceeds 99.99', () => {
      renderCreateSample(createMockCohort(100))

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test' } })

      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '100' } })

      expect(screen.getByText(/Le pourcentage doit être compris entre 0.01 et 99.99/i)).toBeInTheDocument()
    })

    it('should accept boundary value 0.01', () => {
      renderCreateSample(createMockCohort(10000))

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test' } })

      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '0.01' } })

      expect(screen.queryByText(/Le pourcentage doit être compris/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).not.toBeDisabled()
    })

    it('should accept boundary value 99.99', () => {
      renderCreateSample(createMockCohort(100))

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test' } })

      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '99.99' } })

      expect(screen.queryByText(/Le pourcentage doit être compris/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).not.toBeDisabled()
    })
  })

  describe('zero patient validation', () => {
    it('should show error when percentage would result in 0 patients', () => {
      const cohort = createMockCohort(3) // 3 patients
      renderCreateSample(cohort)

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test Sample' } })

      // Enter 1% - which gives 0.03 patients = 0 after floor
      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '1' } })

      expect(screen.getByText(/Ce pourcentage donnerait 0 patient/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).toBeDisabled()
    })

    it('should allow creation when percentage results in at least 1 patient', () => {
      const cohort = createMockCohort(100) // 100 patients
      renderCreateSample(cohort)

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test Sample' } })

      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '10' } })

      expect(screen.queryByText(/Ce pourcentage donnerait 0 patient/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).not.toBeDisabled()
    })

    it('should show error for small cohort with low percentage', () => {
      const cohort = createMockCohort(10) // 10 patients
      renderCreateSample(cohort)

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test Sample' } })

      // Enter 5% - which gives 0.5 patients = 0 after floor
      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '5' } })

      expect(screen.getByText(/contient 10 patient/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).toBeDisabled()
    })

    it('should allow 10% on 10 patients (results in 1 patient)', () => {
      const cohort = createMockCohort(10) // 10 patients
      renderCreateSample(cohort)

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'Test Sample' } })

      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '10' } })

      expect(screen.queryByText(/Ce pourcentage donnerait 0 patient/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /créer/i })).not.toBeDisabled()
    })
  })

  describe('form submission', () => {
    it('should call onCreate with correct data on valid submission', () => {
      const cohort = createMockCohort(100)
      renderCreateSample(cohort)

      const nameInput = screen.getByPlaceholderText('Nom')
      fireEvent.change(nameInput, { target: { value: 'My Sample' } })

      const percentageInput = screen.getByPlaceholderText('Entrez une valeur entre 0.01 et 99.99%')
      fireEvent.change(percentageInput, { target: { value: '25.5' } })

      const descriptionInput = screen.getByPlaceholderText('Description')
      fireEvent.change(descriptionInput, { target: { value: 'Sample description' } })

      const createButton = screen.getByRole('button', { name: /créer/i })
      fireEvent.click(createButton)

      expect(mockOnCreate).toHaveBeenCalledWith({
        parentCohort: 'test-uuid',
        cohortName: 'My Sample',
        cohortDescription: 'Sample description',
        samplingRatio: 0.255
      })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not call onCreate when form has errors', () => {
      renderCreateSample(createMockCohort(100))

      // Don't fill anything, just click create
      const createButton = screen.getByRole('button', { name: /créer/i })
      fireEvent.click(createButton)

      expect(mockOnCreate).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should call onClose when cancel is clicked', () => {
      renderCreateSample(createMockCohort(100))

      const cancelButton = screen.getByRole('button', { name: /annuler/i })
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
      expect(mockOnCreate).not.toHaveBeenCalled()
    })
  })
})
