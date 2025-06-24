import { Grid, styled, keyframes } from '@mui/material'

type DraggableWrapperProps = {
  isActive: boolean
  isDragging: boolean
}

export const DraggableWrapper = styled(Grid)<DraggableWrapperProps>(({ isActive, isDragging }) => ({
  position: 'relative',
  zIndex: 2,
  '& > *': {
    overflow: isDragging ? 'hidden' : 'visible',
    cursor: isActive ? 'grabbing' : 'grab',
    opacity: isDragging ? (isActive ? 1 : 0.6) : 1,
    border: isDragging ? (isActive ? '1px solid #19235a' : '1px solid #00000014') : '',
    transition: 'opacity 0.2s',
    backgroundColor: isDragging && isActive ? 'rgba(255,255,255,0.95)' : undefined
  }
}))

const pulse = keyframes`
  0% {
     box-shadow: 0 0 0 0 rgba(25, 35, 90, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 3px 3px rgba(25, 35, 90, 0);
    transform: scale(1.015);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 35, 90, 0);
    transform: scale(1);
  }
`

export const DroppableWrapper = styled(Grid)(() => ({
  position: 'absolute',
  maxWidth: 930,
  top: 0,
  left: 0,
  right: 0,
  border: '1px dashed #19235a',
  borderRadius: 3,
  background: '#5bc5f2',
  opacity: 0.3,
  animation: `${pulse} 1.2s ease-in-out infinite`,
  zIndex: 1,
  '& > *': {
    opacity: 0
  }
}))
