import { LitElement, html, css } from 'lit';
import { TodoModel } from '../models/todo-model.js';
import { StorageService } from '../services/storage-service.js';
import './todo-form.js';
import './todo-list.js';

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
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
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
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  `;

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

    // Subscribe to model changes
    this.unsubscribe = this.model.subscribe(() => {
      this.todos = [...this.model.todos];
    });
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.cancelAllAutoClear();
    super.disconnectedCallback();
  }

  requestConfirmation(message) {
    try {
      return this.confirmHandler(message);
    } catch (error) {
      console.error('Confirmation prompt failed:', error);
      return false;
    }
  }

  handleAddTodo(e) {
    const text = e?.detail?.text;
    if (text) {
      this.model.addTodo(text);
    }
  }

  handleToggleTodo(e) {
    const id = e?.detail?.id;
    if (typeof id !== 'number') {
      return;
    }

    const didToggle = this.model.toggleComplete(id);
    if (!didToggle) {
      return;
    }

    const todo = this.model.todos.find(item => item.id === id);
    if (todo?.completed) {
      this.scheduleAutoClear(id);
    } else {
      this.cancelAutoClear(id);
    }
  }

  handleDeleteTodo(e) {
    const id = e?.detail?.id;
    if (typeof id !== 'number') {
      return;
    }

    const todo = this.todos.find(item => item.id === id);
    const message = todo ? `Delete "${todo.text}"?` : 'Delete this todo?';

    if (this.requestConfirmation(message)) {
      this.cancelAutoClear(id);
      this.model.deleteTodo(id);
    }
  }

  handleUpdateTodo(e) {
    const { id, text } = e?.detail ?? {};
    if (typeof id === 'number') {
      this.model.updateTodo(id, text);
    }
  }

  handleClearAll() {
    if (this.todos.length === 0) {
      return;
    }

    if (this.requestConfirmation('Clear ALL todos? This cannot be undone.')) {
      this.cancelAllAutoClear();
      this.model.clearAll();
    }
  }

  render() {
    const totalTodos = this.todos.length;
    const activeTodos = this.model.activeCount;
    const completedTodos = this.model.completedCount;

    return html`
      <div class="app-container">
        <div class="header">
          <div class="heading-group">
            <h1>My Tasks</h1>
            <p class="subtitle">Stay organized and productive</p>
          </div>
          <button
            class="clear-all"
            @click=${this.handleClearAll}
            ?disabled=${totalTodos === 0}>
            Clear All
          </button>
        </div>

        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${totalTodos}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${activeTodos}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${completedTodos}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>

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

        <div class="footer">
          Lab 9: The final battle!
        </div>
      </div>
    `;
  }

  scheduleAutoClear(id) {
    this.cancelAutoClear(id);
    this.markPendingDeletion(id);
    const timerId = setTimeout(() => {
      const todo = this.model.todos.find(item => item.id === id);
      if (todo?.completed) {
        this.model.deleteTodo(id);
      }
      this.autoClearTimers.delete(id);
      this.unmarkPendingDeletion(id);
    }, 1000);

    this.autoClearTimers.set(id, timerId);
  }

  cancelAutoClear(id) {
    const timerId = this.autoClearTimers.get(id);
    if (timerId) {
      clearTimeout(timerId);
      this.autoClearTimers.delete(id);
    }
    this.unmarkPendingDeletion(id);
  }

  cancelAllAutoClear() {
    this.autoClearTimers.forEach(timerId => clearTimeout(timerId));
    this.autoClearTimers.clear();
    this.pendingDeletionIds = new Set();
  }

  markPendingDeletion(id) {
    const next = new Set(this.pendingDeletionIds);
    next.add(id);
    this.pendingDeletionIds = next;
  }

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
