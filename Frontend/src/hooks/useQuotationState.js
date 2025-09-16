import { useState, useEffect, useCallback, useRef } from 'react';
import { defaultQuotationData } from '../constants/quotationConstants';

const STORAGE_KEY = 'quotation_draft';
const AUTO_SAVE_INTERVAL = 10000; // 10 seconds

export const useQuotationState = (initialData = null) => {
  const [quotationData, setQuotationData] = useState(() => {
    // Try to recover from localStorage first
    if (initialData) {
      return initialData;
    }
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the structure
        if (parsed && typeof parsed === 'object' && parsed.title !== undefined) {
          return { ...defaultQuotationData, ...parsed };
        }
      }
    } catch (error) {
      console.warn('Failed to parse saved quotation data:', error);
    }
    
    return defaultQuotationData;
  });
  
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const autoSaveTimerRef = useRef(null);
  const initialDataRef = useRef(JSON.stringify(quotationData));
  
  // Persist to localStorage whenever data changes
  const persistData = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to persist quotation data:', error);
    }
  }, []);
  
  // Update quotation data with persistence
  const updateQuotationData = useCallback((updater) => {
    setQuotationData(prevData => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      
      // Check if data actually changed
      const currentDataString = JSON.stringify(newData);
      const hasChanged = currentDataString !== initialDataRef.current;
      
      setIsDirty(hasChanged);
      
      // Persist to localStorage
      persistData(newData);
      
      return newData;
    });
  }, [persistData]);
  
  // Clear auto-save timer
  const clearAutoSaveTimer = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);
  
  // Auto-save functionality
  const scheduleAutoSave = useCallback((onAutoSave) => {
    clearAutoSaveTimer();
    
    if (isDirty && onAutoSave) {
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          setAutoSaveStatus('Auto-saving...');
          await onAutoSave(quotationData);
          setAutoSaveStatus('Auto-saved ' + new Date().toLocaleTimeString());
          setIsDirty(false);
          initialDataRef.current = JSON.stringify(quotationData);
          
          // Clear status after 3 seconds
          setTimeout(() => setAutoSaveStatus(''), 3000);
        } catch (error) {
          console.error('Auto-save failed:', error);
          setAutoSaveStatus('Auto-save failed');
          setTimeout(() => setAutoSaveStatus(''), 3000);
        }
      }, AUTO_SAVE_INTERVAL);
    }
  }, [isDirty, quotationData, clearAutoSaveTimer]);
  
  // Mark data as saved (after successful API save)
  const markAsSaved = useCallback((serverData = null) => {
    setIsDirty(false);
    setLastSaved(new Date());
    
    if (serverData) {
      // Update with server response data
      const updatedData = { ...quotationData, ...serverData };
      setQuotationData(updatedData);
      persistData(updatedData);
      initialDataRef.current = JSON.stringify(updatedData);
    } else {
      initialDataRef.current = JSON.stringify(quotationData);
    }
  }, [quotationData, persistData]);
  
  // Clear draft data
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setQuotationData(defaultQuotationData);
      setIsDirty(false);
      setLastSaved(null);
      setAutoSaveStatus('');
      initialDataRef.current = JSON.stringify(defaultQuotationData);
      clearAutoSaveTimer();
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [clearAutoSaveTimer]);
  
  // Check if there's unsaved data
  const hasUnsavedChanges = useCallback(() => {
    return isDirty;
  }, [isDirty]);
  
  // Listen for storage changes (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setQuotationData(newData);
        } catch (error) {
          console.error('Failed to sync storage change:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoSaveTimer();
    };
  }, [clearAutoSaveTimer]);
  
  // Warn about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  
  return {
    quotationData,
    updateQuotationData,
    isDirty,
    lastSaved,
    autoSaveStatus,
    scheduleAutoSave,
    markAsSaved,
    clearDraft,
    hasUnsavedChanges
  };
};