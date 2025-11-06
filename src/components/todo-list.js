import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import './todo-item.js';

/**
 * TodoList - Displays a list of todos
 */
export class TodoList extends LitElement {
  static properties = {
    todos: { type: Array },
    pendingDeletionIds: { type: Object }
  };

  static styles = css`
    :host {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      border: 1px solid #e0e6ff;
      border-radius: 12px;
      background: #f9f9ff;
      padding: 12px 0 12px 12px;
      min-height: calc(var(--todo-item-row-height, 68px) * 5 + 24px);
      max-height: calc(var(--todo-item-row-height, 68px) * 5 + 24px);
      overflow: hidden;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: white;
      font-size: 18px;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .list-container {
      flex: 1 1 auto;
      min-height: 0;
      max-height: calc((var(--todo-item-row-height, 68px) + 8px) * 5);
      overflow-y: auto;
      padding-right: 10px;
      scrollbar-width: auto;
      scrollbar-color: #667eea #e6e9ff;
    }

    /* Custom scrollbar */
    .list-container::-webkit-scrollbar {
      width: 12px;
    }

    .list-container::-webkit-scrollbar-track {
      background: #e6e9ff;
      border-radius: 6px;
    }

    .list-container::-webkit-scrollbar-thumb {
      background: #667eea;
      border-radius: 6px;
    }

    .list-container::-webkit-scrollbar-thumb:hover {
      background: #5560c5;
    }
  `;

  /**
   * Initializes empty list data.
   */
  constructor() {
    super();
    this.todos = [];
    this.pendingDeletionIds = new Set();
    this.previousTodosLength = 0;
  }

  /**
   * Auto scrolls to the bottom when new todos are added.
   * @param {Map<string, unknown>} changedProperties
   */
  updated(changedProperties) {
    if (!changedProperties.has('todos')) {
      return;
    }

    const container = this.renderRoot.querySelector('.list-container');
    if (!container) {
      this.previousTodosLength = this.todos.length;
      return;
    }

    const previousLength = this.previousTodosLength;
    const currentLength = this.todos.length;

    if (currentLength > previousLength) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }

    this.previousTodosLength = currentLength;
  }

  /**
   * @returns {import('lit').TemplateResult}
   */
  render() {
    if (this.todos.length === 0) {
      return html`<p class="empty-state" aria-live="polite">
        No todos yet. Add one above!
      </p>`;
    }

    return html`
      <div class="list-container" role="list">
        ${repeat(
          this.todos,
          todo => todo.id,
          todo => html`<todo-item
            role="listitem"
            .todo=${todo}
            .pendingDeletion=${this.pendingDeletionIds?.has?.(todo.id) ?? false}>
          </todo-item>`
        )}
      </div>
    `;
  }
}

customElements.define('todo-list', TodoList);
