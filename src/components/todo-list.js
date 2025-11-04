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
      display: block;
      height: 100%;
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
      max-height: calc((var(--todo-item-row-height, 68px) + 8px) * 5);
      height: 100%;
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

  constructor() {
    super();
    this.todos = [];
    this.pendingDeletionIds = new Set();
    this.previousTodosLength = 0;
  }

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

  render() {
    if (this.todos.length === 0) {
      return html`
        <div class="empty-state" aria-live="polite">
          <p>No todos yet. Add one above!</p>
        </div>
      `;
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
