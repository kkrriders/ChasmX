'use client'

import { useEffect } from 'react'

/**
 * Suppresses hydration errors caused by browser extensions
 * (e.g., password managers adding fdprocessedid attributes)
 */
export function HydrationErrorSuppressor() {
  useEffect(() => {
    // Prevent double-wrapping if this effect runs multiple times
    const anyConsole = console as any
    if (anyConsole.__hydrationSuppressorInstalled) return

    // Suppress hydration warnings caused by browser extensions
    const originalError = console.error
    const originalWarn = console.warn
    anyConsole.__hydrationSuppressorInstalled = true

    const safeArgsToString = (args: any[]) => {
      try {
        return args
          .map((a) => {
            if (typeof a === 'string') return a
            if (a && typeof a === 'object') {
              if ('message' in a && typeof a.message === 'string') return a.message
              try {
                return JSON.stringify(a)
              } catch {
                return String(a)
              }
            }
            return String(a)
          })
          .join(' ')
      } catch {
        return args.map((a) => String(a)).join(' ')
      }
    }

    console.error = (...args) => {
      const errorStr = safeArgsToString(args)

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

      // Call original error for legitimate errors (apply to keep console context)
      if (typeof originalError === 'function') {
        try {
          originalError.apply(console, args)
        } catch {
          // If calling the original via apply throws, try calling the saved original directly
          try {
            Function.prototype.apply.call(originalError, console, args)
          } catch {
            // Give up silently if even that fails - we don't want logging to crash the app
          }
        }
      }
    }

    console.warn = (...args) => {
      const warnStr = safeArgsToString(args)

      // Suppress hydration warnings
      if (typeof args[0] === 'string' && args[0].includes('hydration')) {
        if (
          warnStr.includes('fdprocessedid') ||
          warnStr.includes('autocomplete') ||
          warnStr.includes('data-kwimpalastatus')
        ) {
          return
        }
      }

      if (typeof originalWarn === 'function') {
        try {
          originalWarn.apply(console, args)
        } catch {
          try {
            Function.prototype.apply.call(originalWarn, console, args)
          } catch {
            // swallow - don't let logging break the app
          }
        }
      }
    }

    return () => {
      // Restore only if we installed the wrapper
      if (anyConsole.__hydrationSuppressorInstalled) {
        console.error = originalError
        console.warn = originalWarn
        delete anyConsole.__hydrationSuppressorInstalled
      }
    }
  }, [])

  return null
}
