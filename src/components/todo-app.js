import { LitElement, html, css } from 'lit';
import { TodoModel } from '../models/todo-model.js';
import { StorageService } from '../services/storage-service.js';
import './todo-form.js';
import './todo-list.js';

const AUTO_CLEAR_DELAY_MS = 500;

/**
 * TodoApp - Main application component
 * Coordinates between Model and View components
 */
export class TodoApp extends LitElement {
  static properties = {
    todos: { state: true },
    pendingDeletionIds: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .app-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 32px;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .heading-group {
      flex: 1;
    }

    h1 {
      margin: 0 0 8px;
      color: #333;
      font-size: 32px;
      font-weight: 700;
    }

    .subtitle {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .stats {
      display: flex;
      justify-content: center;
      align-items: stretch;
      gap: 24px;
      margin: 24px 0;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 140px;
      padding: 16px 20px;
      border-radius: 12px;
      background: #f5f5f5;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .clear-all {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      background: #f44336;
      color: white;
    }

    .clear-all:hover {
      background: #da190b;
    }

    .clear-all:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .footer {
      margin-top: auto;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  `;

  /**
   * Creates a TodoApp.
   */
  constructor() {
    super();
    this.storageService = new StorageService();
    this.model = new TodoModel(this.storageService);
    this.todos = this.model.todos;
    this.confirmHandler = typeof window !== 'undefined' && typeof window.confirm === 'function'
      ? window.confirm.bind(window)
      : () => true;
    this.autoClearTimers = new Map();
    this.pendingDeletionIds = new Set();
    this.appContainer = null;
    this.baseContainerHeight = 0;

    // Subscribe to model changes
    this.unsubscribe = this.model.subscribe(() => {
      this.todos = [...this.model.todos];
    });
  }

  /**
   * Clean up subscriptions and timers when the element detaches.
   */
  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.cancelAllAutoClear();
    super.disconnectedCallback();
  }

  /**
   * Cache the container element and lock its height after first render.
   */
  firstUpdated() {
    this.appContainer = this.renderRoot.querySelector('.app-container');
    if (!this.appContainer) {
      return;
    }

    requestAnimationFrame(() => {
      if (!this.appContainer) {
        return;
      }
      this.baseContainerHeight = this.appContainer.offsetHeight;
      const heightValue = `${this.baseContainerHeight}px`;
      this.appContainer.style.minHeight = heightValue;
      this.appContainer.style.maxHeight = heightValue;
      this.appContainer.style.height = heightValue;
    });
  }

  /**
   * Requests confirmation from the user.
   * @param {string} message
   * @returns {boolean}
   */
  confirmAction(message) {
    try {
      return this.confirmHandler(message);
    } catch (error) {
      console.error('Confirmation prompt failed:', error);
      return false;
    }
  }

  /**
   * Handles the add-todo event from the form.
   * @param {CustomEvent<{text: string}>} e
   */
  handleAddTodo(e) {
    const text = e?.detail?.text;
    if (text) {
      this.model.addTodo(text);
    }
  }

  /**
   * Handles checkbox changes from todo items.
   * @param {CustomEvent<{id: number}>} e
   */
  handleToggleTodo(e) {
    const id = e?.detail?.id;
    if (typeof id !== 'number') {
      return;
    }

    const didToggle = this.model.toggleComplete(id);
    if (!didToggle) {
      return;
    }

    const todo = this.getTodoFromModel(id);
    if (todo?.completed) {
      this.scheduleAutoClear(id);
    } else {
      this.cancelAutoClear(id);
    }
  }

  /**
   * Handles delete button events from todo items.
   * @param {CustomEvent<{id: number}>} e
   */
  handleDeleteTodo(e) {
    const id = e?.detail?.id;
    if (typeof id !== 'number') {
      return;
    }

    const todo = this.getTodoById(id);
    const message = todo ? `Delete "${todo.text}"?` : 'Delete this todo?';

    if (this.confirmAction(message)) {
      this.cancelAutoClear(id);
      this.model.deleteTodo(id);
    }
  }

  /**
   * Handles save events from edited todo items.
   * @param {CustomEvent<{id: number, text: string}>} e
   */
  handleUpdateTodo(e) {
    const { id, text } = e?.detail ?? {};
    if (typeof id === 'number') {
      this.model.updateTodo(id, text);
    }
  }

  /**
   * Clears the entire list after user confirmation.
   */
  handleClearAll() {
    const hasTodos = this.todos.length > 0;
    const hasCompleted = this.model.completedCount > 0;

    if (!hasTodos && !hasCompleted) {
      return;
    }

    if (this.confirmAction('Clear ALL todos? This cannot be undone.')) {
      this.cancelAllAutoClear();
      this.model.clearAll();
    }
  }

  /**
   * @returns {import('lit').TemplateResult}
   */
  render() {
    const activeTodos = this.model.activeCount;
    const completedTodos = this.model.completedCount;

    return html`
      <div class="app-container">
        <header class="header">
          <div class="heading-group">
            <h1>My Tasks:</h1>
            <p class="subtitle">Stay organized and productive</p>
          </div>
          <button
            class="clear-all"
            @click=${this.handleClearAll}
            ?disabled=${this.todos.length === 0 && completedTodos === 0}>
            Clear All Values
          </button>
        </header>

        <section class="stats" aria-label="Task statistics">
          <article class="stat-item">
            <p class="stat-value">${activeTodos}</p>
            <p class="stat-label">To&nbsp;Do</p>
          </article>
          <article class="stat-item">
            <p class="stat-value">${completedTodos}</p>
            <p class="stat-label">Completed</p>
          </article>
        </section>

        <todo-form
          @add-todo=${this.handleAddTodo}>
        </todo-form>

        <todo-list
          .todos=${this.todos}
          .pendingDeletionIds=${this.pendingDeletionIds}
          @toggle-todo=${this.handleToggleTodo}
          @delete-todo=${this.handleDeleteTodo}
          @update-todo=${this.handleUpdateTodo}>
        </todo-list>

        <footer class="footer">
          Lab 9: The Final Battle!
        </footer>
      </div>
    `;
  }

  /**
   * Removes a completed todo after a delay.
   * @param {number} id
   */
  scheduleAutoClear(id) {
    this.cancelAutoClear(id);
    this.markPendingDeletion(id);
    const timerId = setTimeout(() => {
      const todo = this.getTodoFromModel(id);
      if (todo?.completed) {
        this.model.deleteTodo(id);
      }
      this.autoClearTimers.delete(id);
      this.unmarkPendingDeletion(id);
    }, AUTO_CLEAR_DELAY_MS);

    this.autoClearTimers.set(id, timerId);
  }

  /**
   * Cancels a pending auto-clear for a given todo.
   * @param {number} id
   */
  cancelAutoClear(id) {
    const timerId = this.autoClearTimers.get(id);
    if (timerId) {
      clearTimeout(timerId);
      this.autoClearTimers.delete(id);
    }
    this.unmarkPendingDeletion(id);
  }

  /**
   * Cancels all auto clear timers.
   */
  cancelAllAutoClear() {
    this.autoClearTimers.forEach(timerId => clearTimeout(timerId));
    this.autoClearTimers.clear();
    this.pendingDeletionIds = new Set();
  }

  /**
   * Marks a todo as pending deletion so the UI can show a spinner.
   * @param {number} id
   */
  markPendingDeletion(id) {
    const next = new Set(this.pendingDeletionIds);
    next.add(id);
    this.pendingDeletionIds = next;
  }

  /**
   * Finds a todo in the current state by id.
   * @param {number} id
   * @returns {{ id: number, text: string, completed: boolean }|undefined}
   */
  getTodoById(id) {
    return this.todos.find(item => item.id === id);
  }

  /**
   * Finds a todo from the model by id.
   * @param {number} id
   * @returns {{ id: number, text: string, completed: boolean }|undefined}
   */
  getTodoFromModel(id) {
    return this.model.todos.find(item => item.id === id);
  }

  /**
   * Removes the pending deletion state from a todo.
   * @param {number} id
   */
  unmarkPendingDeletion(id) {
    if (!this.pendingDeletionIds.has(id)) {
      return;
    }
    const next = new Set(this.pendingDeletionIds);
    next.delete(id);
    this.pendingDeletionIds = next;
  }
}

customElements.define('todo-app', TodoApp);
