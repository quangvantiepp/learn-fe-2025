// src/hooks/useVirtualization.ts

import { useState, useEffect } from 'react';
import { CellMeasurerCache } from 'react-virtualized';

export function useVirtualization() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // Tạo cache cho CellMeasurer
  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      cache.clearAll();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    windowHeight,
    cache,
  };
}