
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )
  
  React.useEffect(() => {
    // Set initial state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check immediately
    checkMobile()
    
    // Create media query list to watch for changes
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Modern event listener
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    
    // Add listener
    mediaQuery.addEventListener("change", handleMediaChange)
    
    // Cleanup function
    return () => mediaQuery.removeEventListener("change", handleMediaChange)
  }, [])

  return isMobile
}
