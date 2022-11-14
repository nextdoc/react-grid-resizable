import React, {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'
import styled from 'styled-components'
import { Direction } from '../hooks/useRefsWithInitialSize'

export interface SeparatorDivProps {
  style?: CSSProperties
  className?: string
  children?: ReactElement | ReactElement[]
  direction?: Direction
}

interface SeparatorProps extends SeparatorDivProps {
  onDragStart: () => void
  onDrag: (distance: number) => void
}

interface SeparatorDragEvent {
  clientX: number
  clientY: number
}

const getPositionFromDragEvent = (
  direction: Direction | undefined,
  event: SeparatorDragEvent
) => {
  if (direction == 'horizontal') {
    return event.clientX
  } else {
    return event.clientY
  }
}
/**
 * Set cursor and size of the separator
 */
const SeparatorDiv = styled.div<SeparatorDivProps>`
  user-select: none;
  flex: none;
  ${(props) => (props.direction == 'horizontal' ? 'height' : 'width')}: 100%;
  ${(props) => (props.direction == 'horizontal' ? 'width' : 'height')}: 10px;
  cursor: ${(props) =>
    props.direction == 'horizontal' ? 'e-resize' : 'n-resize'};
`

export const Separator = (props: SeparatorProps) => {
  const [mousePositionAtLastMouseEvent, setMousePositionAtLastMouseEvent] =
    useState<number | null>(null)

  const getMovedDistance = useCallback(
    (event: SeparatorDragEvent) => {
      const mousePosition = getPositionFromDragEvent(props.direction, event)
      return mousePosition - (mousePositionAtLastMouseEvent || 0)
    },
    [mousePositionAtLastMouseEvent, props.direction]
  )
  /**
   * Start dragging
   * Record the initial mouse position to calculate distance later
   */
  const mouseDownEventHandler = (event: SeparatorDragEvent) => {
    const mousePosition = getPositionFromDragEvent(props.direction, event)
    setMousePositionAtLastMouseEvent(mousePosition)
    props.onDragStart()
  }
  /**
   * End dragging
   * Clear initial mouse position, which will stop mouse move handling
   */
  const mouseUpEventHandler = useCallback(
    (event: SeparatorDragEvent) => {
      if (mousePositionAtLastMouseEvent) {
        setMousePositionAtLastMouseEvent(null)
      }
    },
    [mousePositionAtLastMouseEvent]
  )
  /**
   * Calculate distance from the initial mouse position when start dragging
   * Send the distance to parent component
   */
  const mouseMoveEventHandler = useCallback(
    (event: SeparatorDragEvent) => {
      if (
        mousePositionAtLastMouseEvent !== null &&
        mousePositionAtLastMouseEvent !== undefined
      ) {
        const movedDistance = getMovedDistance(event)
        props.onDrag(movedDistance)
      }
    },
    [getMovedDistance, mousePositionAtLastMouseEvent, props]
  )
  /**
   * Listen to mouse move and mouse up at global because the position of the separator
   * will not be updated at mouse position instantly
   */
  useEffect(() => {
    document.body.addEventListener<'mouseup'>('mouseup', mouseUpEventHandler)
    document.body.addEventListener<'mousemove'>(
      'mousemove',
      mouseMoveEventHandler
    )
    return () => {
      document.body.addEventListener<'mouseup'>('mouseup', mouseUpEventHandler)
      document.body.removeEventListener<'mousemove'>(
        'mousemove',
        mouseMoveEventHandler
      )
    }
  }, [
    mouseMoveEventHandler,
    mousePositionAtLastMouseEvent,
    mouseUpEventHandler
  ])

  return (
    <SeparatorDiv
      style={props.style}
      className={props.className}
      direction={props.direction}
      onMouseDown={mouseDownEventHandler}
    >
      {props.children}
    </SeparatorDiv>
  )
}
