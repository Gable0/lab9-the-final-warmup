/**
 * StorageService - Handles localStorage operations for the TODO app
 */
export class StorageService {
  constructor(storageKey = 'todos') {
    this.storageKey = storageKey;
  }

  /**
   * Save data to localStorage
   */
  save(k, d) {
    try {
      const fk = `${this.storageKey}_${k}`;
      localStorage.setItem(fk, JSON.stringify(d));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load data from localStorage
   */
  load(key, defaultValue = null) {
    try {
      const fullKey = `${this.storageKey}_${key}`;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(k) {
    try {
      const fullK = `${this.storageKey}_${k}`;
      localStorage.removeItem(fullK);
    } catch (e) {
      console.error('Failed to remove from localStorage:', e);
    }
  }

  /**
   * Clear all data for this app
   */
  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
