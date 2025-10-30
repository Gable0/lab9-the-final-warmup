/**
 * TodoModel - Manages the todo list data and business logic
 * Implements the Observer pattern for reactive updates
 */
export class TodoModel {
  constructor(storageService) {
    this.storage = storageService;
    this.todos = this.storage.load('items', []);
    this.listeners = [];
    this.nextId = this.storage.load('nextId', 1);
  }

  /**
   * Subscribe to model changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
  }

  /**
   * Notify all subscribers of changes
   */
  notify() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Add a new todo
   */
  addTodo(text) {
    if (!text || text.trim() === '') {
      return;
    }

    const todo = {
      id: this.nextId++,
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.push(todo);
    this.save();
    this.notify();
  }

  /**
   * Toggle todo completion status
   */
  toggleComplete(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save();
      this.notify();
    }
  }

  /**
   * Delete a todo
   */
  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
    this.notify();
  }

  /**
   * Update todo text
   */
  updateTodo(id, newText) {
    const todo = this.todos.find(t => t.id === id);
    if (todo && newText && newText.trim() !== '') {
      todo.text = newText.trim();
      this.save();
      this.notify();
    }
  }

  /**
   * Clear all completed todos
   */
  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    this.save();
    this.notify();
  }

  /**
   * Clear all todos
   */
  clearAll() {
    this.todos = [];
    this.save();
    this.notify();
  }

  /**
   * Get count of active todos
   */
  get activeCount() {
    return this.todos.filter(t => !t.completed).length;
  }

  /**
   * Get count of completed todos
   */
  get completedCount() {
    return this.todos.filter(t => t.completed).length;
  }

  /**
   * Save todos to storage
   */
  save() {
    this.storage.save('items', this.todos);
    this.storage.save('nextId', this.nextId);
  }
}
