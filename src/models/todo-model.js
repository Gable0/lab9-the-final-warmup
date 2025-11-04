/**
 * TodoModel - Manages the todo list data and business logic.
 * Implements the Observer pattern for reactive updates.
 */
export class TodoModel {
  #listeners;
  #nextId;
  #storage;

  constructor(storageService) {
    this.#storage = storageService;
    const storedTodos = this.#storage.load('items', []);
    this.todos = Array.isArray(storedTodos) ? storedTodos : [];
    this.#nextId = Number.parseInt(this.#storage.load('nextId', 1), 10) || 1;
    this.#listeners = new Set();
  }

  /**
   * Subscribe to model changes.
   * Returns an unsubscribe callback to remove the listener.
   */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  /**
   * Notify all subscribers of changes.
   */
  notify() {
    this.#listeners.forEach(listener => listener());
  }

  /**
   * Add a new todo.
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
      createdAt: new Date().toISOString()
    };

    this.#nextId += 1;
    this.todos = [...this.todos, todo];
    return this.#commit(true);
  }

  /**
   * Toggle todo completion status.
   */
  toggleComplete(id) {
    let updated = false;
    this.todos = this.todos.map(todo => {
      if (todo.id !== id) {
        return todo;
      }

      updated = true;
      return {
        ...todo,
        completed: !todo.completed
      };
    });

    return this.#commit(updated);
  }

  /**
   * Delete a todo.
   */
  deleteTodo(id) {
    const nextTodos = this.todos.filter(todo => todo.id !== id);
    const didChange = nextTodos.length !== this.todos.length;
    this.todos = didChange ? nextTodos : this.todos;
    return this.#commit(didChange);
  }

  /**
   * Update todo text.
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
   * Clear all completed todos.
   */
  clearCompleted() {
    const nextTodos = this.todos.filter(todo => !todo.completed);
    const didChange = nextTodos.length !== this.todos.length;
    this.todos = didChange ? nextTodos : this.todos;
    return this.#commit(didChange);
  }

  /**
   * Clear all todos and reset id counter.
   */
  clearAll() {
    if (this.todos.length === 0 && this.#nextId === 1) {
      return false;
    }

    this.todos = [];
    this.#nextId = 1;
    return this.#commit(true);
  }

  /**
   * Get count of active todos.
   */
  get activeCount() {
    return this.todos.reduce((count, todo) => (todo.completed ? count : count + 1), 0);
  }

  /**
   * Get count of completed todos.
   */
  get completedCount() {
    return this.todos.length - this.activeCount;
  }

  #commit(didChange) {
    if (!didChange) {
      return false;
    }

    this.#persist();
    this.notify();
    return true;
  }

  #persist() {
    this.#storage.save('items', this.todos);
    this.#storage.save('nextId', this.#nextId);
  }
}
