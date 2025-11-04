/**
 * StorageService - Handles localStorage operations for the TODO app.
 * Gracefully degrades when localStorage is unavailable (e.g. during tests).
 */
export class StorageService {
  #storage;
  #storageKey;

  constructor(storageKey = 'todos', storage = getBrowserStorage()) {
    this.#storageKey = storageKey;
    this.#storage = storage;
  }

  /**
   * Save data to localStorage.
   */
  save(key, data) {
    if (!this.#storage) {
      return;
    }

    try {
      this.#storage.setItem(this.#buildKey(key), JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load data from localStorage.
   */
  load(key, defaultValue = null) {
    if (!this.#storage) {
      return defaultValue;
    }

    try {
      const item = this.#storage.getItem(this.#buildKey(key));
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage.
   */
  remove(key) {
    if (!this.#storage) {
      return;
    }

    try {
      this.#storage.removeItem(this.#buildKey(key));
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Clear all data for this app.
   */
  clear() {
    if (!this.#storage) {
      return;
    }

    try {
      const keysToRemove = [];
      for (let index = 0; index < this.#storage.length; index += 1) {
        const key = this.#storage.key(index);
        if (key && key.startsWith(this.#storageKey)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => this.#storage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  #buildKey(keySuffix) {
    return `${this.#storageKey}_${keySuffix}`;
  }
}

function getBrowserStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    console.error('Accessing localStorage failed:', error);
  }
  return null;
}
