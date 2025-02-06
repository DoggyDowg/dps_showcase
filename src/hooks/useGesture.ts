'use client'

import { useEffect, useRef } from 'react'

// Define the types we need from Hammer.js
type HammerManager = {
  on: (event: string, handler: (event: HammerInput) => void) => void
  get: (recognizer: string) => { set: (options: { enable: boolean; direction?: number }) => void }
  destroy: () => void
}

type HammerInput = {
  direction: number
}

type HammerStatic = {
  default: {
    new (element: HTMLElement): HammerManager
    DIRECTION_ALL: number
    DIRECTION_LEFT: number
    DIRECTION_RIGHT: number
    DIRECTION_UP: number
    DIRECTION_DOWN: number
  }
}

interface UseGestureProps {
  onTap?: () => void
  onPress?: () => void
  onPressUp?: () => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
}

export function useGesture(props: UseGestureProps) {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return // Guard against SSR
    if (!elementRef.current) return

    let hammer: HammerManager | null = null
    
    // Dynamically import Hammer only on the client side
    import('hammerjs').then((Hammer: HammerStatic) => {
      if (!elementRef.current) return // Double check ref is still valid

      hammer = new Hammer.default(elementRef.current)

      // Configure recognizers
      hammer.get('tap').set({ enable: true })
      hammer.get('press').set({ enable: true })
      hammer.get('swipe').set({ enable: true, direction: Hammer.default.DIRECTION_ALL })

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
        hammer.on('swipe', (ev: HammerInput) => {
          const direction = 
            ev.direction === Hammer.default.DIRECTION_LEFT ? 'left' :
            ev.direction === Hammer.default.DIRECTION_RIGHT ? 'right' :
            ev.direction === Hammer.default.DIRECTION_UP ? 'up' : 'down'
          props.onSwipe?.(direction)
        })
      }
    })

    // Cleanup
    return () => {
      if (hammer) {
        hammer.destroy()
      }
    }
  }, [props])

  return elementRef
} 