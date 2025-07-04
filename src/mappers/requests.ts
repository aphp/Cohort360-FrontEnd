import { RequestType } from 'types'
import { RequestsCallbacks, ResearchesTableLabels, SubItemType } from 'types/cohorts'
import { Order } from 'types/searchCriterias'
import { Action, CellType, Column, Row, SubItem, Table } from 'types/table'
import { getCohortTotal, getRequestName } from 'utils/explorationUtils'
import { formatDate } from 'utils/formatDate'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import { isChecked } from 'utils/filters'

const getRequestsInfos = (request: RequestType) => {
  const name = getRequestName(request) ?? 'N/A'
  const parentName = request.parent_folder?.name ?? 'N/A'
  const updatedAt = formatDate(request.updated_at)
  const cohorts = getCohortTotal(request.query_snapshots)

  return { name, parentName, updatedAt, cohorts }
}

const mapRequestsToRows = (
  list: RequestType[],
  simplified: boolean,
  callbacks: RequestsCallbacks,
  selectedRequests: RequestType[],
  requestId?: string,
  disabled = false
) => {
  const rows: Row[] = []
  list.forEach((request) => {
    const { name, parentName, updatedAt, cohorts } = getRequestsInfos(request)
    const { onSelectRequest, onShareRequest, onClickEdit, onClickCohorts, onClickRow } = callbacks
    const actions = [
      {
        title: 'Partager la requête',
        icon: ShareIcon,
        onClick: () => onShareRequest(request),
        disabled: disabled || request.query_snapshots?.length === 0
      },
      {
        title: 'Éditer la requête',
        icon: EditIcon,
        onClick: () => onClickEdit(request),
        disabled: disabled
      }
    ]
    const row: Row = [
      ...(!simplified
        ? [
            {
              id: `${request.uuid}-select`,
              value: {
                disabled,
                onClick: () => onSelectRequest(request),
                isChecked: isChecked(request, selectedRequests)
              },
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
        value: { label: SubItemType.COHORTS, total: cohorts, onClick: () => onClickCohorts(request) } as SubItem,
        type: CellType.SUB_ITEM
      }
    ]
    row._onClick = () => onClickRow(request)
    rows.push(row)
  })

  return rows
}

const mapRequestsToColumns = (
  simplified: boolean,
  requestsList: RequestType[],
  selectedRequests: RequestType[],
  onSelectAll: () => void,
  projectId?: string
): Column[] => {
  const columns: Column[] = [
    ...(!simplified
      ? [
          {
            label: '',
            isCheckbox: true,
            checkboxProps: {
              isChecked: selectedRequests.length === requestsList.length,
              isIndeterminate: selectedRequests.length > 0 && selectedRequests.length < requestsList.length,
              onSelectAll
            }
          }
        ]
      : []),
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
  callbacks: RequestsCallbacks,
  selectedRequests: RequestType[],
  projectId?: string,
  disabled = false
): Table => {
  const table: Table = { rows: [], columns: [] }
  table.columns = mapRequestsToColumns(simplified, list, selectedRequests, callbacks.onSelectAll, projectId)
  table.rows = mapRequestsToRows(list, simplified, callbacks, selectedRequests, projectId, disabled)
  return table
}
