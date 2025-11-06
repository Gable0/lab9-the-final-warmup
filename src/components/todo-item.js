import { LitElement, html, css } from 'lit';

/**
 * TodoItem - Individual todo item component
 */
export class TodoItem extends LitElement {
  static properties = {
    todo: { type: Object },
    isEditing: { state: true },
    editValue: { state: true },
    pendingDeletion: { type: Boolean, attribute: 'pending-deletion' }
  };

  static styles = css`
    :host {
      display: block;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      min-height: var(--todo-item-row-height, 68px);
      transition: box-shadow 0.2s ease;
    }

    .todo-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .todo-text {
      font-size: 16px;
      color: #333;
      word-break: break-word;
    }

    .todo-text.completed {
      text-decoration: line-through;
      color: #999;
    }

    .todo-text-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .pending-indicator {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .pending-indicator .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: currentColor;
      opacity: 0.4;
      animation: ripple 1s infinite ease-in-out;
    }

    .pending-indicator .dot:nth-child(2) {
      animation-delay: 0.15s;
    }

    .pending-indicator .dot:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes ripple {
      0%, 100% {
        transform: scale(0.5);
        opacity: 0.2;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.7;
      }
    }

    .edit-input {
      flex: 1;
      padding: 8px;
      font-size: 16px;
      border: 2px solid #667eea;
      border-radius: 4px;
      outline: none;
    }

    .button-group {
      display: flex;
      gap: 8px;
    }

    button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .edit-btn {
      background: #4CAF50;
      color: white;
    }

    .edit-btn:hover {
      background: #45a049;
    }

    .delete-btn {
      background: #f44336;
      color: white;
    }

    .delete-btn:hover {
      background: #da190b;
    }

    .save-btn {
      background: #2196F3;
      color: white;
    }

    .save-btn:hover {
      background: #0b7dda;
    }

    .cancel-btn {
      background: #757575;
      color: white;
    }

    .cancel-btn:hover {
      background: #616161;
    }
  `;

  /**
   * Sets default state for an item.
   */
  constructor() {
    super();
    this.isEditing = false;
    this.editValue = '';
    this.pendingDeletion = false;
  }

  /**
   * Emits toggle-todo for this todo.
   */
  handleToggle() {
    this.dispatchEvent(new CustomEvent('toggle-todo', {
      detail: { id: this.todo.id },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Emits delete-todo for this todo.
   */
  handleDelete() {
    this.dispatchEvent(new CustomEvent('delete-todo', {
      detail: { id: this.todo.id },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Enters edit mode with the current todo text.
   */
  handleEdit() {
    this.isEditing = true;
    this.editValue = this.todo.text;
  }

  /**
   * Emits update-todo with the edited value when non-empty.
   */
  handleSave() {
    if (this.editValue.trim()) {
      this.dispatchEvent(new CustomEvent('update-todo', {
        detail: { id: this.todo.id, text: this.editValue },
        bubbles: true,
        composed: true
      }));
      this.isEditing = false;
    }
  }

  /**
   * Leaves edit mode without saving changes.
   */
  handleCancel() {
    this.isEditing = false;
    this.editValue = '';
  }

  /**
   * Tracks the value typed into the edit field.
   * @param {InputEvent & { target: HTMLInputElement }} event
   */
  handleEditInput(event) {
    this.editValue = event.target.value;
  }

  /**
   * Supports keyboard shortcuts while editing.
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    if (e.key === 'Enter') {
      this.handleSave();
    } else if (e.key === 'Escape') {
      this.handleCancel();
    }
  }

  /**
   * @returns {import('lit').TemplateResult}
   */
  render() {
    if (this.isEditing) {
      return html`
        <div class="todo-item">
          <input
            class="edit-input"
            type="text"
            .value=${this.editValue}
            @input=${this.handleEditInput}
            @keydown=${this.handleKeyDown}
            autofocus
          />
          <div class="button-group">
            <button class="save-btn" @click=${this.handleSave}>Save</button>
            <button class="cancel-btn" @click=${this.handleCancel}>Cancel</button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="todo-item">
        <input
          type="checkbox"
          class="checkbox"
          .checked=${this.todo.completed}
          @change=${this.handleToggle}
          aria-label="Toggle todo"
        />
        <div class="todo-text-wrapper">
          <span class="todo-text ${this.todo.completed ? 'completed' : ''}">
            ${this.todo.text}
          </span>
          ${this.pendingDeletion ? html`
            <span class="pending-indicator" aria-live="polite">
              Deleting
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </span>
          ` : null}
        </div>
        <div class="button-group">
          <button
            class="edit-btn"
            @click=${this.handleEdit}
            ?disabled=${this.todo.completed}
            aria-label="Edit todo">
            Edit
          </button>
          <button
            class="delete-btn"
            @click=${this.handleDelete}
            aria-label="Delete todo">
            Delete
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('todo-item', TodoItem);
