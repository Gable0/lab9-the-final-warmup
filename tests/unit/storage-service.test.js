import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StorageService } from '../../src/services/storage-service.js';

class FakeLocalStorage {
  constructor() {
    this.store = new Map();
  }

  setItem(key, value) {
    this.store.set(key, value);
  }

  getItem(key) {
    return this.store.get(key) ?? null;
  }

  removeItem(key) {
    this.store.delete(key);
  }

  key(index) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  get length() {
    return this.store.size;
  }
}

test('StorageService saves and loads JSON data with prefix', () => {
  const backing = new FakeLocalStorage();
  const service = new StorageService('todo', backing);

  service.save('items', [{ id: 1 }]);

  assert.equal(backing.getItem('todo_items'), JSON.stringify([{ id: 1 }]));
  const loaded = service.load('items', []);
  assert.deepEqual(loaded, [{ id: 1 }]);
});

test('StorageService returns default when missing or parsing fails', () => {
  const backing = new FakeLocalStorage();
  const service = new StorageService('todo', backing);

  assert.deepEqual(service.load('missing', ['fallback']), ['fallback']);

  backing.setItem('todo_items', 'not json');
  assert.deepEqual(service.load('items', ['fallback']), ['fallback']);
});

test('StorageService.clear only removes prefixed keys', () => {
  const backing = new FakeLocalStorage();
  const service = new StorageService('todo', backing);

  backing.setItem('todo_items', '[]');
  backing.setItem('todo_nextId', '1');
  backing.setItem('other', 'keep');

  service.clear();

  assert.equal(backing.getItem('todo_items'), null);
  assert.equal(backing.getItem('todo_nextId'), null);
  assert.equal(backing.getItem('other'), 'keep');
});
