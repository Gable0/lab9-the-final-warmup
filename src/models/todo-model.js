/**
 * TodoModel - Manages the todo list data and business logic.
 * Implements the Observer pattern for reactive updates.
 */
export class TodoModel {
  #listeners;
  #nextId;
  #storage;
  #completedTotal;

  /**
   * @param {import('../services/storage-service.js').StorageService} storageService
   */
  constructor(storageService) {
    this.#storage = storageService;
    const storedTodos = this.#storage.load('items', []);
    this.todos = Array.isArray(storedTodos)
      ? storedTodos.map(todo => ({
        ...todo,
        wasCounted: todo.wasCounted ?? false
      }))
      : [];
    this.#nextId = Number.parseInt(this.#storage.load('nextId', 1), 10) || 1;
    this.#completedTotal = Number.parseInt(this.#storage.load('completedTotal', 0), 10) || 0;
    this.#listeners = new Set();
  }

  /**
   * Subscribe to model changes and get an unsubscribe callback.
   * @param {() => void} listener
   * @returns {() => void}
   */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  /**
   * Notifies all registered listeners.
   * @returns {void}
   */
  notify() {
    this.#listeners.forEach(listener => listener());
  }

  /**
   * Adds a new todo when the text is non-empty.
   * @param {string} text
   * @returns {boolean}
   */
  addTodo(text) {
    const trimmed = typeof text === 'string' ? text.trim() : '';
    if (!trimmed) {
      return false;
    }

    const todo = {
      id: this.#nextId,
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      wasCounted: false
    };

    this.#nextId += 1;
    this.todos = [...this.todos, todo];
    return this.#commit(true);
  }

  /**
   * Toggles completion and tracks lifetime completed count.
   * @param {number} id
   * @returns {boolean}
   */
  toggleComplete(id) {
    let updated = false;
    let nextCompletedTotal = this.#completedTotal;

    this.todos = this.todos.map(todo => {
      if (todo.id !== id) {
        return todo;
      }

      updated = true;
      const toggled = {
        ...todo,
        completed: !todo.completed
      };

      if (!todo.completed && toggled.completed && !todo.wasCounted) {
        nextCompletedTotal += 1;
        toggled.wasCounted = true;
      } else if (!toggled.completed) {
        toggled.wasCounted = todo.wasCounted;
      }

      return toggled;
    });

    if (updated) {
      this.#completedTotal = nextCompletedTotal;
    }

    return this.#commit(updated);
  }

  /**
   * Deletes a todo by id.
   * @param {number} id
   * @returns {boolean}
   */
  deleteTodo(id) {
    const nextTodos = this.todos.filter(todo => todo.id !== id);
    const didChange = nextTodos.length !== this.todos.length;
    this.todos = didChange ? nextTodos : this.todos;
    // completed total remains unchanged; reflects lifetime completions
    return this.#commit(didChange);
  }

  /**
   * Updates todo text when the trimmed text is non-empty.
   * @param {number} id
   * @param {string} newText
   * @returns {boolean}
   */
  updateTodo(id, newText) {
    const trimmed = typeof newText === 'string' ? newText.trim() : '';
    if (!trimmed) {
      return false;
    }

    let updated = false;
    this.todos = this.todos.map(todo => {
      if (todo.id !== id) {
        return todo;
      }

      if (todo.text === trimmed) {
        return todo;
      }

      updated = true;
      return { ...todo, text: trimmed };
    });

    return this.#commit(updated);
  }

  /**
   * Removes only completed todos.
   * @returns {boolean}
   */
  clearCompleted() {
    const nextTodos = this.todos.filter(todo => !todo.completed);
    const didChange = nextTodos.length !== this.todos.length;
    this.todos = didChange ? nextTodos : this.todos;
    return this.#commit(didChange);
  }

  /**
   * Clears every todo and resets counters.
   * @returns {boolean}
   */
  clearAll() {
    if (this.todos.length === 0 && this.#nextId === 1) {
      return false;
    }

    this.todos = [];
    this.#nextId = 1;
    this.#completedTotal = 0;
    return this.#commit(true);
  }

  /**
   * Gets the count of active (incomplete) todos.
   * @returns {number}
   */
  get activeCount() {
    return this.todos.reduce((count, todo) => (todo.completed ? count : count + 1), 0);
  }

  /**
   * Gets the lifetime completed count.
   * @returns {number}
   */
  get completedCount() {
    return this.#completedTotal;
  }

  /**
   * @param {boolean} didChange
   * @returns {boolean}
   */
  #commit(didChange) {
    if (!didChange) {
      return false;
    }

    this.#persist();
    this.notify();
    return true;
  }

  /**
   * Persists current state to storage.
   * @returns {void}
   */
  #persist() {
    this.#storage.save('items', this.todos);
    this.#storage.save('nextId', this.#nextId);
    this.#storage.save('completedTotal', this.#completedTotal);
  }
}
