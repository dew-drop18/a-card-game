import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, buildEmpireDeck, createGame, empires, playerView } from './game-core.mjs';

const fixedRandom = () => 0;

test('each empire starts with a shuffled 100-card deck and a five-card hand', () => {
  for (const empire of empires) {
    const game = createGame([empire.id, empires.find((item) => item.id !== empire.id).id], fixedRandom);
    const deck = buildEmpireDeck(empire, fixedRandom);
    assert.equal(deck.length, 100);
    assert.equal(new Set(deck.map((card) => card.instanceId)).size, 100);
    assert.equal(deck.filter((card) => card.kind === 'Creature').length, { british: 34, mongol: 39, russian: 31, qing: 30, spanish: 33, french: 36 }[empire.id]);
    assert.equal(deck.filter((card) => card.kind === 'Spell').length, { british: 12, mongol: 12, russian: 12, qing: 17, spanish: 15, french: 15 }[empire.id]);
    assert.equal(deck.filter((card) => card.kind === 'Structure').length, { british: 28, mongol: 21, russian: 29, qing: 25, spanish: 24, french: 21 }[empire.id]);
    assert.equal(deck.filter((card) => card.kind === 'Resource').length, empire.id === 'british' ? 26 : 28);
    const specials = deck.filter((card) => card.special);
    assert.equal(specials.length, 15);
    assert.equal(specials.filter((card) => card.kind === 'Creature').length, 5);
    assert.equal(specials.filter((card) => card.kind === 'Spell').length, 5);
    assert.equal(specials.filter((card) => card.kind === 'Structure').length, 5);
    for (const card of deck) {
      const paidResource = card.kind === 'Creature' ? 'food' : card.kind === 'Spell' ? 'stone' : card.kind === 'Structure' ? 'wood' : null;
      if (paidResource) {
        assert.ok(card.cost[paidResource] > 0, `${card.name} should cost ${paidResource}`);
        assert.equal(Object.entries(card.cost).filter(([, amount]) => amount > 0).length, 1);
      }
    }
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

  test('a commander cannot place more than five creatures or structures', () => {
    const game = createGame(['british', 'mongol'], fixedRandom);
    const player = game.players[0];
    const deck = buildEmpireDeck(empires[0], fixedRandom);
    const creature = deck.find((card) => card.kind === 'Creature');
    const structure = deck.find((card) => card.kind === 'Structure');
    player.resources = { food: 20, wood: 20, stone: 20 };
    player.board = Array.from({ length: 5 }, (_, index) => ({
      ...creature,
      instanceId: `field-card-${index}`,
      health: creature.health,
      maxHealth: creature.health,
    }));
    creature.instanceId = 'blocked-creature';
    structure.instanceId = 'blocked-structure';
    player.hand.push(creature, structure);

    assert.throws(() => applyAction(game, 0, { type: 'play', cardId: creature.instanceId }), /battlefield is full/);
    assert.throws(() => applyAction(game, 0, { type: 'play', cardId: structure.instanceId }), /battlefield is full/);
    assert.equal(player.board.length, 5);
  });
});

test('structures have passive start-of-turn effects and no attack', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  const player = game.players[0];
  const deck = buildEmpireDeck(empires[0], fixedRandom);
  const resourceStructure = deck.find((card) => card.kind === 'Structure' && card.effect === 'resources');
  const healingStructure = deck.find((card) => card.kind === 'Structure' && card.effect === 'healing');
  const trainingStructure = deck.find((card) => card.kind === 'Structure' && card.effect === 'training');
  const creatures = deck.filter((card) => card.kind === 'Creature').slice(0, 2);
  player.board = [
    { ...resourceStructure, instanceId: 'resource-structure' },
    { ...healingStructure, instanceId: 'healing-structure' },
    { ...trainingStructure, instanceId: 'training-structure' },
    ...creatures.map((creature, index) => ({
      ...creature, instanceId: `trained-creature-${index}`, maxHealth: creature.health,
      health: 1, canAttack: false,
    })),
  ];
  player.resources = { food: 4, wood: 4, stone: 4 };
  assert.equal(Object.hasOwn(trainingStructure, 'attack'), false);
  const attack = player.board[3].attack + 1;

  applyAction(game, 0, { type: 'end-turn' });
  applyAction(game, 1, { type: 'end-turn' });

  assert.deepEqual(player.resources, { food: 6, wood: 6, stone: 6 });
  assert.equal(player.board[3].health, 2);
  assert.equal(player.board[4].health, 2);
  applyAction(game, 0, { type: 'attack', attackerId: 'trained-creature-0', targetId: null });
  assert.equal(game.players[1].health, 30 - attack);
});

test('destroying a training structure removes creatures whose bonus health ran out', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  const deck = buildEmpireDeck(empires[0], fixedRandom);
  const trainingStructure = deck.find((card) => card.kind === 'Structure' && card.effect === 'training');
  const creature = deck.find((card) => card.kind === 'Creature');
  const attacker = { instanceId: 'structure-breaker', kind: 'Creature', attack: 1, defense: 0, health: 2, maxHealth: 2, canAttack: true };
  game.players[0].board = [
    { ...trainingStructure, instanceId: 'last-training', health: 1 },
    { ...creature, instanceId: 'barely-living', maxHealth: creature.health, health: 0 },
  ];
  game.players[1].board = [attacker];
  game.turn = 1;

  applyAction(game, 1, { type: 'attack', attackerId: attacker.instanceId, targetId: 'last-training' });

  assert.equal(game.players[0].board.some((card) => card.instanceId === 'last-training'), false);
  assert.equal(game.players[0].board.some((card) => card.instanceId === 'barely-living'), false);
  assert.equal(attacker.health, 2);
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

test('weather heals wounded creatures and expires after four commander turns', () => {
  const game = createGame(['british', 'mongol'], fixedRandom);
  game.weather = { id: 'suddenwealth', name: 'Sudden Wealth', description: 'Everything heals 1 each turn', remaining: 4 };
  game.players[0].board = [{ ...buildEmpireDeck(empires[0], fixedRandom).find((card) => card.kind === 'Creature'), instanceId: 'wounded', health: 1, maxHealth: 3, canAttack: false }];

  applyAction(game, 0, { type: 'end-turn' });
  assert.equal(game.weather.remaining, 3);
  applyAction(game, 1, { type: 'end-turn' });
  assert.equal(game.players[0].board[0].health, 2);
  assert.equal(game.weather.remaining, 2);

  applyAction(game, 0, { type: 'end-turn' });
  applyAction(game, 1, { type: 'end-turn' });
  assert.equal(game.players[0].board[0].health, 3);
  assert.equal(game.weather.remaining, 0);
  assert.notEqual(game.weather.id, 'suddenwealth');
});
