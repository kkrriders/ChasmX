'use client'

import { useEffect } from 'react'

/**
 * Suppresses hydration errors caused by browser extensions
 * (e.g., password managers adding fdprocessedid attributes)
 */
export function HydrationErrorSuppressor() {
  useEffect(() => {
    // Suppress hydration warnings caused by browser extensions
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args) => {
      // Convert args to string for checking
      const errorStr = JSON.stringify(args)
      
      // Check if it's a hydration error
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Hydration failed') ||
          args[0].includes('There was an error while hydrating') ||
          args[0].includes('hydrated but some attributes') ||
          args[0].includes('Text content does not match') ||
          args[0].includes('Prop `%s` did not match') ||
          args[0].includes('A tree hydrated'))
      ) {
        // Check if it's caused by browser extension attributes
        if (
          errorStr.includes('fdprocessedid') ||
          errorStr.includes('autocomplete') ||
          errorStr.includes('data-kwimpalastatus') ||
          errorStr.includes('data-form-type')
        ) {
          // Silently ignore these errors - they're from browser extensions
          return
        }
      }
      
      // Call original error for legitimate errors
      originalError.call(console, ...args)
    }
    
    console.warn = (...args) => {
      const warnStr = JSON.stringify(args)
      
      // Suppress hydration warnings
      if (
        typeof args[0] === 'string' &&
        args[0].includes('hydration')
      ) {
        if (
          warnStr.includes('fdprocessedid') ||
          warnStr.includes('autocomplete') ||
          warnStr.includes('data-kwimpalastatus')
        ) {
          return
        }
      }
      
      originalWarn.call(console, ...args)
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return null
}
