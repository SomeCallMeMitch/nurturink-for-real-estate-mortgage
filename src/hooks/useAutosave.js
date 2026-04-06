import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from 'lodash';

/**
 * useAutosave
 *
 * Debounced autosave hook. Watches `data` for changes and calls `saveFn`
 * after `delay` ms of inactivity. Skips the initial render so it doesn't
 * save on mount. Exposes `saveNow` for immediate saves before navigation.
 *
 * @param {any}      data     - The data object to watch and save
 * @param {function} saveFn   - Async function that receives data and persists it
 * @param {number}   delay    - Debounce delay in ms (default 500)
 * @param {boolean}  enabled  - Whether autosave is active (default true)
 *
 * @returns {{ isSaving: boolean, lastSaved: Date|null, error: Error|null, saveNow: function }}
 */
export function useAutosave(data, saveFn, delay = 500, enabled = true) {
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef(null);
  const errorRef = useRef(null);
  const initialLoadRef = useRef(true);
  const [, forceUpdate] = useState({});

  const debouncedSave = useRef(
    debounce(async (dataToSave) => {
      if (!enabled) return;

      try {
        isSavingRef.current = true;
        forceUpdate({});
        errorRef.current = null;

        await saveFn(dataToSave);

        lastSavedRef.current = new Date();
        isSavingRef.current = false;
        forceUpdate({});
      } catch (error) {
        console.error('Autosave error:', error);
        errorRef.current = error;
        isSavingRef.current = false;
        forceUpdate({});
      }
    }, delay)
  ).current;

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (!enabled) return;

    debouncedSave(data);

    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, debouncedSave]);

  const saveNow = useCallback(async () => {
    debouncedSave.cancel();

    try {
      isSavingRef.current = true;
      forceUpdate({});
      errorRef.current = null;

      await saveFn(data);

      lastSavedRef.current = new Date();
      isSavingRef.current = false;
      forceUpdate({});
    } catch (error) {
      console.error('Manual save error:', error);
      errorRef.current = error;
      isSavingRef.current = false;
      forceUpdate({});
      throw error;
    }
  }, [data, saveFn, debouncedSave]);

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current,
    error: errorRef.current,
    saveNow
  };
}

export default useAutosave;