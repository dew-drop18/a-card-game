import test from 'node:test';
import assert from 'node:assert/strict';
import { GameRoom } from './worker.mjs';

test('creating a room stores game state, tokens, and disconnect state together', async () => {
  const records = new Map();
  const storage = {
    async get(key) {
      return records.get(key);
    },
    async put(key, value) {
      if (arguments.length === 1 && typeof key === 'object') {
        Object.entries(key).forEach(([entryKey, entryValue]) => records.set(entryKey, entryValue));
        return;
      }
      records.set(key, value);
    },
  };
  const room = new GameRoom({
    storage,
    getWebSockets: () => [],
  });
  const setup = {
    game: { turn: 0, players: [] },
    tokens: ['first-token', 'second-token'],
  };

  const response = await room.fetch(new Request('https://room.internal/create', {
    method: 'POST',
    body: JSON.stringify(setup),
  }));

  assert.equal(response.status, 201);
  assert.deepEqual(await storage.get('game'), {
    ...setup,
    disconnectedAt: [null, null],
  });
});
