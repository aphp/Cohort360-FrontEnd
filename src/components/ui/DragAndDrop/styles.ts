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
    //zIndex: isDragging ? (isActive ? 1000 : 500) : 1,
    transition: 'opacity 0.2s',
    opacity: isDragging ? (isActive ? 1 : 0.85) : 1,
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

export const DropPlaceholder = styled(Grid)(() => ({
  '& > *': {
    opacity: 0
  },
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '100%',
  width: '100%',
  border: '1px dashed #19235a',
  borderRadius: 3,
  background: '#5bc5f2',
  opacity: 0.3,
  animation: `${pulse} 1.2s ease-in-out infinite`,
  zIndex: 1
}))
