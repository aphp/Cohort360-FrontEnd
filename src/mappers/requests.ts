import { RequestType } from 'types'
import { ResearchesTableLabels, SubItemType } from 'types/cohorts'
import { Order } from 'types/searchCriterias'
import { Action, CellType, Column, Row, SubItem, Table } from 'types/table'
import { getCohortTotal, getRequestName } from 'utils/explorationUtils'
import { formatDate } from 'utils/formatDate'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

const getRequestsInfos = (request: RequestType) => {
  const name = getRequestName(request) ?? 'N/A'
  const parentName = request.parent_folder?.name ?? 'N/A'
  const updatedAt = formatDate(request.updated_at)
  const cohorts = getCohortTotal(request.query_snapshots)

  return { name, parentName, updatedAt, cohorts }
}

const mapRequestsToRows = (list: RequestType[], simplified: boolean, requestId?: string, disabled = false) => {
  const rows: Row[] = []
  list.forEach((request) => {
    const { name, parentName, updatedAt, cohorts } = getRequestsInfos(request)
    const actions = [
      {
        title: 'Partager la requête',
        icon: ShareIcon,
        onClick: () => {},
        disabled: disabled || request.query_snapshots?.length === 0
      },
      {
        title: 'Éditer la requête',
        icon: EditIcon,
        onClick: () => {},
        disabled: disabled
      }
    ]
    const row: Row = [
      ...(!simplified
        ? [
            {
              id: `${request.uuid}-select`,
              value: '',
              type: CellType.CHECKBOX
            }
          ]
        : []),
      {
        id: `${request.uuid}-name`,
        value: name,
        type: CellType.TEXT,
        sx: { fontWeight: 900 }
      },
      { id: `${request.uuid}-actions`, value: actions as Action[], type: CellType.ACTIONS },
      ...(!requestId
        ? [
            {
              id: `${request.uuid}-parentName`,
              value: parentName,
              type: CellType.TEXT
            }
          ]
        : []),
      {
        id: `${request.uuid}-updatedAt`,
        value: updatedAt,
        type: CellType.TEXT
      },
      {
        id: `${request.uuid}-cohorts`,
        value: { label: SubItemType.COHORTS, total: cohorts, onClick: () => {} } as SubItem,
        type: CellType.SUB_ITEM
      }
    ]
    rows.push(row)
  })

  return rows
}

const mapRequestsToColumns = (simplified: boolean, projectId?: string): Column[] => {
  const columns: Column[] = [
    ...(!simplified ? [{ label: '' }] : []),
    { label: ResearchesTableLabels.REQUEST_NAME, align: 'left', code: !simplified ? Order.NAME : undefined },
    { label: '', align: 'left' },
    ...(!projectId
      ? [{ label: ResearchesTableLabels.PARENT_PROJECT, code: !simplified ? Order.PARENT_FOLDER : undefined }]
      : []),
    { label: ResearchesTableLabels.MODIFIED_AT, code: !simplified ? Order.UPDATED : undefined },
    { label: ResearchesTableLabels.COHORTS, align: 'left' }
  ]

  return columns
}

export const mapRequestsToTable = (
  list: RequestType[],
  simplified: boolean,
  projectId?: string,
  disabled = false
): Table => {
  const table: Table = { rows: [], columns: [] }
  table.columns = mapRequestsToColumns(simplified, projectId)
  table.rows = mapRequestsToRows(list, simplified, projectId, disabled)
  return table
}
