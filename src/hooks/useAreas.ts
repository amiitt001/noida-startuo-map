import { useState, useEffect } from 'react';
import { Area } from '../types';
import { areaService } from '../services/areaService';

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    setAreas(areaService.getAllAreas());
  }, []);

  return { areas };
}
