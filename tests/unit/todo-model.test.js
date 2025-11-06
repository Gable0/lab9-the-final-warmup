import { test } from 'node:test';
import assert from 'node:assert';
import { TodoModel } from '../../src/models/todo-model.js';

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

test('TodoModel - toggleComplete tracks lifetime completions', () => {
  const storage = new MockStorage();
  const model = new TodoModel(storage);
  model.addTodo('Walk the dog');

  const todoId = model.todos[0].id;
  model.toggleComplete(todoId);

  assert.strictEqual(model.todos[0].completed, true);
  assert.strictEqual(model.completedCount, 1);

  model.toggleComplete(todoId);
  assert.strictEqual(model.todos[0].completed, false);
  assert.strictEqual(model.completedCount, 1);

  model.toggleComplete(todoId);
  assert.strictEqual(model.todos[0].completed, true);
  assert.strictEqual(model.completedCount, 1);
});

test('TodoModel - subscribe returns unsubscribe callback', () => {
  const storage = new MockStorage();
  const model = new TodoModel(storage);
  let callCount = 0;

  const unsubscribe = model.subscribe(() => {
    callCount += 1;
  });

  model.addTodo('First');
  assert.strictEqual(callCount, 1);

  unsubscribe();
  model.addTodo('Second');
  assert.strictEqual(callCount, 1);
});

test('TodoModel - clearAll resets todos and id counter', () => {
  const storage = new MockStorage();
  const model = new TodoModel(storage);

  model.addTodo('One');
  model.addTodo('Two');
  assert.strictEqual(model.todos.length, 2);

  model.toggleComplete(model.todos[0].id);
  assert.strictEqual(model.completedCount, 1);

  model.clearAll();
  assert.strictEqual(model.todos.length, 0);
  assert.strictEqual(model.completedCount, 0);

  model.addTodo('Three');
  assert.strictEqual(model.todos[0].id, 1);
});

test('TodoModel - completed count persists after deleting completed todo', () => {
  const storage = new MockStorage();
  const model = new TodoModel(storage);

  model.addTodo('Write docs');
  const id = model.todos[0].id;

  model.toggleComplete(id);
  assert.strictEqual(model.completedCount, 1);

  model.deleteTodo(id);
  assert.strictEqual(model.completedCount, 1);
});

test('TodoModel - updateTodo trims text and notifies subscribers', () => {
  const storage = new MockStorage();
  const model = new TodoModel(storage);
  let notifications = 0;
  const unsubscribe = model.subscribe(() => {
    notifications += 1;
  });

  model.addTodo('Review tests');
  const id = model.todos[0].id;
  const didUpdate = model.updateTodo(id, '  Updated title  ');

  assert.strictEqual(didUpdate, true);
  assert.strictEqual(model.todos[0].text, 'Updated title');
  assert.strictEqual(notifications, 2);
  unsubscribe();
});

test('TodoModel - clearCompleted removes only completed todos', () => {
  const storage = new MockStorage();
  const model = new TodoModel(storage);

  model.addTodo('Keep me');
  model.addTodo('Finish docs');
  const [, docTodo] = model.todos;

  model.toggleComplete(docTodo.id);
  const didClear = model.clearCompleted();

  assert.strictEqual(didClear, true);
  assert.strictEqual(model.todos.length, 1);
  assert.strictEqual(model.todos[0].text, 'Keep me');
  assert.strictEqual(model.completedCount, 1);
});

/* so few tests! I guess you can say you have testing, but it isn't meaningful.
   Also where are our end to end tests!?! */
