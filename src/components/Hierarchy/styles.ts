import { Grid, styled } from '@mui/material'

type RowContainerProps = {
  color?: string
}

type RowWrapperProps = {
  size?: string
}

type CellWrapperProps = {
  cursor?: boolean
  color?: string
  fontWeight?: number
}

export const RowContainerWrapper = styled(Grid)<RowContainerProps>(({ color = '#fff' }) => ({
  backgroundColor: color,
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  padding: '0 8px'
}))

export const RowWrapper = styled(Grid)<RowWrapperProps>(({ size = '50px' }) => ({
  height: size
}))

export const CellWrapper = styled(Grid)<CellWrapperProps>(
  ({ cursor = false, color = '#4F4F4f', fontWeight = 600 }) => ({
    color: color,
    cursor: cursor ? 'pointer' : '',
    fontWeight: fontWeight
  })
)
