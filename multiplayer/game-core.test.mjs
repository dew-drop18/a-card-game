import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, buildEmpireDeck, createGame, empires, playerView } from './game-core.mjs';

const fixedRandom = () => 0.5;

test('each empire starts with a shuffled 100-card deck and a five-card hand', () => {
  for (const empire of empires) {
    const game = createGame([empire.id, empires.find((item) => item.id !== empire.id).id], fixedRandom);
    const deck = buildEmpireDeck(empire, fixedRandom);
    assert.equal(deck.length, 100);
    assert.equal(new Set(deck.map((card) => card.instanceId)).size, 100);
    assert.equal(deck.filter((card) => card.kind === 'Creature').length, 30);
    assert.equal(deck.filter((card) => card.kind === 'Spell').length, 10);
    assert.equal(deck.filter((card) => card.kind === 'Resource').length, 60);
    assert.equal(game.players[0].hand.length, 5);
  }
});

test('player views expose only their own hand', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  const view = playerView(game, 0);
  assert.equal(view.players[0].hand.length, 5);
  assert.deepEqual(view.players[1].hand, []);
  assert.equal(view.players[1].handCount, 5);
  assert.equal(view.players[1].deck.every((card) => card === null), true);
});

test('both commanders may choose the same empire without sharing card instance IDs', () => {
  const game = createGame(['british', 'british'], fixedRandom);
  const firstCardIds = game.players[0].hand.map((card) => card.instanceId);
  const secondCardIds = game.players[1].hand.map((card) => card.instanceId);
  assert.equal(game.players[0].empire.id, game.players[1].empire.id);
  assert.equal(firstCardIds.some((id) => secondCardIds.includes(id)), false);
});

test('actions enforce turns, resource gathering, and hand ownership', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  const initialFood = game.players[0].resources.food;
  applyAction(game, 0, { type: 'gather', resource: 'food' });
  assert.equal(game.players[0].resources.food, initialFood + 2);
  assert.throws(() => applyAction(game, 0, { type: 'gather', resource: 'food' }), /already gathered/);
  assert.throws(() => applyAction(game, 1, { type: 'end-turn' }), /Wait for your turn/);
  assert.throws(() => applyAction(game, 0, { type: 'play', cardId: 'not-in-hand' }), /not in your hand/);
});

test('attacks resolve on the server and a creature can attack only once per turn', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  game.players[0].board.push({ instanceId: 'test-attacker', attack: 5, defense: 0, canAttack: true });
  applyAction(game, 0, { type: 'attack', attackerId: 'test-attacker', targetId: null });
  assert.equal(game.players[1].health, 25);
  assert.equal(game.players[0].board[0].canAttack, false);
  assert.throws(() => applyAction(game, 0, { type: 'attack', attackerId: 'test-attacker', targetId: null }), /cannot attack/);
});

test('playing a card charges its server-defined cost and summons a sleeping creature', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  const player = game.players[0];
  const creature = buildEmpireDeck(empires[0], fixedRandom).find((card) => card.kind === 'Creature');
  creature.instanceId = 'server-card';
  player.hand.push(creature);
  player.resources = { food: 20, wood: 20, stone: 20 };
  const resourcesBefore = { ...player.resources };
  applyAction(game, 0, { type: 'play', cardId: creature.instanceId });
  assert.equal(player.hand.includes(creature), false);
  assert.equal(player.board[0].instanceId, creature.instanceId);
  assert.equal(player.board[0].canAttack, false);
  assert.deepEqual(player.resources, {
    food: resourcesBefore.food - creature.cost.food,
    wood: resourcesBefore.wood - creature.cost.wood,
    stone: resourcesBefore.stone - creature.cost.stone,
  });
});

test('ending turns resets the next commander and draws to hand size', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  game.players[1].board.push({ canAttack: false, bonusAttack: 3 });
  applyAction(game, 0, { type: 'end-turn' });
  assert.equal(game.turn, 1);
  assert.equal(game.players[1].hand.length, 5);
  assert.equal(game.players[1].board[0].canAttack, true);
  assert.equal(game.players[1].board[0].bonusAttack, 0);
  assert.equal(game.gathered, false);
  applyAction(game, 1, { type: 'end-turn' });
  assert.equal(game.turn, 0);
  assert.equal(game.round, 2);
});

test('surrender ends the duel for the opposing seat', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  applyAction(game, 1, { type: 'surrender' });
  assert.deepEqual(game.finished, { winner: 0, reason: 'surrender' });
  assert.throws(() => applyAction(game, 0, { type: 'end-turn' }), /match has ended/);
});
