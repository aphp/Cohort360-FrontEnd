import { Grid, styled, keyframes } from '@mui/material'

type DraggableWrapperProps = {
  isActive: boolean
  isDragging: boolean
  isInvisible: boolean
}

type InvisibleWrapperProps = {
  isDisabled: boolean
}

export const DraggableWrapper = styled(Grid)<DraggableWrapperProps>(({ isActive, isDragging, isInvisible }) => ({
  //display: isPresent ? 'flex' : 'none',
  position: isInvisible ? 'absolute' : 'relative',
  // backgroundColor: isInvisible ? 'red' : '',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 3,
  //display: isOver ? 'none' : 'flex',
  //height: '100%',
  // maxHeight: isInvisible ? (isDragging && !isOver ? '1000px' : isOver ? '1000px' : '0px') : 'none',

  '& > *': {
    //opacity: isInvisible ? 0 : 1,
    cursor: isInvisible ? 'auto' : isActive ? 'grabbing' : 'grab',
    opacity: isInvisible ? 0.4 : isDragging ? (isActive ? 1 : 0.6) : 1,
    overflow: isDragging ? 'hidden' : 'visible',
    border: isDragging ? (isActive ? '1px solid #19235a' : '1px solid #00000014') : '',
    transition: 'opacity 0.2s',
    backgroundColor: isDragging && isActive ? 'rgba(255,255,255,0.95)' : undefined
  }
}))

export const InvisibleWrapper = styled(Grid)<InvisibleWrapperProps>(({ isDisabled }) => ({
  position: isDisabled ? 'absolute' : 'relative',
  backgroundColor: 'red',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 2,
  overflow: 'hidden',
  //maxHeight: isDisabled ? 5 : 1000, // ← ici 200 = max taille du contenu estimée
  //opacity: isDisabled ? 0 : 1,
  transition: 'max-height 0.3s ease, opacity 0.3s ease',
  pointerEvents: isDisabled ? 'auto' : 'inherit',
  '& > *': {
    opacity: 0
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
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  maxHeight: 200,
  transition: 'max-height 0.3s ease',
  animation: `${pulse} 1.2s infinite ease-in-out`,
  border: '1px dashed #19235a',
  background: '#5bc5f2',
  opacity: 0.3,
  '& > *': {
    opacity: 0
  }
}))
