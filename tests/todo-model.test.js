import { test } from 'node:test';
import assert from 'node:assert';
import { TodoModel } from '../src/models/todo-model.js';

/**
 * Mock storage service for testing
 */
class MockStorage {
  constructor() {
    this.data = {};
  }

  save(key, value) {
    this.data[key] = value;
  }

  load(key, defaultValue) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  remove(key) {
    delete this.data[key];
  }

  clear() {
    this.data = {};
  }
}

test('TodoModel - addTodo should add a new todo', () => {
  const storage = new MockStorage();
  const model = new TodoModel(storage);

  model.addTodo('Test todo');

  assert.strictEqual(model.todos.length, 1);
  assert.strictEqual(model.todos[0].text, 'Test todo');
  assert.strictEqual(model.todos[0].completed, false);
});

test('TodoModel - should not add empty todos', () => {
  const storage = new MockStorage();
  const model = new TodoModel(storage);

  model.addTodo('');
  model.addTodo('   ');

  assert.strictEqual(model.todos.length, 0);
});

/* so few tests! I guess you can say you have testing, but it isn't meaningful.
   Also where are our end to end tests!?! */

