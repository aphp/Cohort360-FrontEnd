import { Grid, styled, keyframes } from '@mui/material'

type DraggableWrapperProps = {
  isActive: boolean
  isDragging: boolean
  isDropZone: boolean
  isDisabled: boolean
}

type DroppableWrapperProps = {
  isActive: boolean
}

export const DraggableWrapper = styled(Grid)<DraggableWrapperProps>(
  ({ isActive, isDragging, isDropZone, isDisabled }) => ({
    position: 'relative',
    zIndex: isActive ? 3 : 2,
    '& > *': {
      cursor: isDisabled || isDropZone ? 'auto' : isActive ? 'grabbing' : 'grab',
      opacity: isDropZone ? 0 : isDragging ? (isActive ? 1 : 0.6) : 1,
      overflow: isDisabled ? 'visible' : isDragging ? 'hidden' : 'visible',
      border: isDragging ? (isActive ? '1px solid #19235a' : '1px solid #00000014') : '',
      backgroundColor: isDragging && isActive ? 'rgba(255,255,255,0.95)' : undefined
    }
  })
)

const attract = keyframes`
  0% {
    background-position: 100% 0%;
  }
  100% {
    background-position: 100% 0%;
  }
`

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(91, 197, 242, 0.4);
  }
  50% {
    box-shadow: 0 0 15px rgba(91, 197, 242, 0.8);
  }
  100% {
    box-shadow: 0 0 20px rgba(91, 197, 242, 0.4);
  }
`
export const DroppableWrapper = styled(Grid)<DroppableWrapperProps>(({ isActive }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  minWidth: 400,
  maxWidth: 930,
  zIndex: 1,
  overflow: 'hidden',
  border: isActive ? '1px solid #5bc5f2' : '2px dashed #fff)',
  opacity: 0.5,
  borderRadius: 4,
  background: isActive ? 'linear-gradient(90deg, #5bc5f2, #5bc5f2, #fff)' : '#fff',
  backgroundSize: isActive ? '300% 100%' : '100% 100%',
  backgroundRepeat: 'no-repeat',
  animation: isActive ? `${attract} 1s ease-in-out forwards, ${glow} 1.5s infinite ease-in-out` : `none`,
  transition: 'background 300ms ease-in-out',
  '& > *': {
    opacity: 0
  }
}))
