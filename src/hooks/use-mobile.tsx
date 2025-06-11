
"use client"; // Keep this if it was there, or add if needed for window access

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined); // Initialize to undefined

  React.useEffect(() => {
    // This effect runs only on the client after hydration
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set initial value on client
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  return isMobile; // Will be undefined on server and first client render
}
