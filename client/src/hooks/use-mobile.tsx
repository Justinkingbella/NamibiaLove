import { useState, useEffect } from 'react';

/**
 * Hook that returns if the viewport is in mobile width
 * Default mobile breakpoint is 768px
 */
export const useMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial state
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Set up event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useMobile;
