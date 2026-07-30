import { describe, it, expect, vi } from 'vitest'
import { mapExportListToTable } from 'mappers/exports'
import { JobStatus } from 'types'
import { ExportCallbacks, ExportList } from 'types/export'
import { Action, CellType } from 'types/table'

const callbacks: ExportCallbacks = {
  onDownload: vi.fn(),
  onRetry: vi.fn()
}

const recentDate = new Date().toISOString()

const baseExport: ExportList = {
  uuid: 'uuid-1',
  cohort_id: '42',
  cohort_name: 'Cohorte test',
  created_at: recentDate,
  modified_at: recentDate,
  output_format: 'csv',
  owner: 'owner',
  patients_count: 10,
  request_job_status: JobStatus.FINISHED,
  target_datalab: null,
  target_name: 'export-test'
}

const getActions = (exportItem: ExportList, maintenanceIsActive: boolean): Action[] => {
  const table = mapExportListToTable([exportItem], callbacks, maintenanceIsActive)
  const actionsCell = table.rows[0].find((cell) => cell.type === CellType.ACTIONS)
  return actionsCell?.value as Action[]
}

describe('mapExportListToTable - maintenance handling', () => {
  describe('when maintenance is active (true)', () => {
    it('should disable the download button', () => {
      const [download] = getActions(baseExport, true)
      expect(download.disabled).toBe(true)
    })

    it('should disable the retry button', () => {
      const failedExport = { ...baseExport, request_job_status: JobStatus.FAILED }
      const [, retry] = getActions(failedExport, true)
      expect(retry.disabled).toBe(true)
    })
  })

  describe('when maintenance is inactive (false)', () => {
    it('should not disable the download button for a finished recent export', () => {
      const [download] = getActions(baseExport, false)
      expect(download.disabled).toBe(false)
    })

    it('should not disable the retry button for a failed export', () => {
      const failedExport = { ...baseExport, request_job_status: JobStatus.FAILED }
      const [, retry] = getActions(failedExport, false)
      expect(retry.disabled).toBe(false)
    })
  })
})
