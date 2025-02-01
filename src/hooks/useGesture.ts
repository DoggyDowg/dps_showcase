'use client'

import { useEffect, useRef } from 'react'
import Hammer from 'hammerjs'

interface UseGestureProps {
  onTap?: () => void
  onPress?: () => void
  onPressUp?: () => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
}

export function useGesture(props: UseGestureProps) {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const hammer = new Hammer(elementRef.current)

    // Configure recognizers
    hammer.get('tap').set({ enable: true })
    hammer.get('press').set({ enable: true })
    hammer.get('swipe').set({ enable: true, direction: Hammer.DIRECTION_ALL })

    // Event handlers
    if (props.onTap) {
      hammer.on('tap', props.onTap)
    }

    if (props.onPress) {
      hammer.on('press', props.onPress)
    }

    if (props.onPressUp) {
      hammer.on('pressup', props.onPressUp)
    }

    if (props.onSwipe) {
      hammer.on('swipe', (ev) => {
        const direction = 
          ev.direction === Hammer.DIRECTION_LEFT ? 'left' :
          ev.direction === Hammer.DIRECTION_RIGHT ? 'right' :
          ev.direction === Hammer.DIRECTION_UP ? 'up' : 'down'
        props.onSwipe?.(direction)
      })
    }

    return () => {
      hammer.destroy()
    }
  }, [props])

  return elementRef
} 