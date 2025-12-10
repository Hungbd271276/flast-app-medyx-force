import { useState, useEffect, useCallback } from 'react';
import { getControlData, ControlData } from '../functions/controlService';

interface UseControlDataReturn {
  controlData: ControlData | null;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export const useControlData = (formname: string): UseControlDataReturn => {
  const [controlData, setControlData] = useState<ControlData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getControlData(formname);
      setControlData(data);
      console.log(`Control data loaded for ${formname}:`, data);
    } catch (err: any) {
      console.error(`Error loading control data for ${formname}:`, err);
      setError(err.message || 'Không thể tải dữ liệu control');
    } finally {
      setLoading(false);
    }
  }, [formname]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    controlData,
    loading,
    error,
    refetch
  };
};

export const useDSPKControlData = (): UseControlDataReturn => {
  return useControlData('DSPK');
}; 


export const useTVGDControlData = (): UseControlDataReturn => {
  return useControlData('TVGD');
}; 