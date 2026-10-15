export const empires = [
  { id: 'british', name: 'British Empire', region: 'The Isles', color: '#a94b38', sigil: 'L', spellPrefix: 'Crown', units: ['Crown Squire', 'Longbow Scout', 'Tower Guard', 'Whitecliff Knight', 'Border Rider', 'Royal Archer', 'Stonekeep Warden', 'Royal Lion', 'Red Stag Guardian', 'Crown Champion'] },
  { id: 'mongol', name: 'Mongol Empire', region: 'The Steppe', color: '#aa7933', sigil: 'ᛟ', spellPrefix: 'Steppe', units: ['Steppe Foal', 'Wind Scout', 'Keshig Guard', 'Wolf-Rider', 'Falcon Archer', 'Khanate Lancer', 'Golden Horde', 'Ordu Champion', 'Steppe Wolf', 'Golden Eagle'] },
  { id: 'russian', name: 'Russian Empire', region: 'The North', color: '#536d52', sigil: '✥', spellPrefix: 'Winter', units: ['Snowland Squire', 'Pinewood Scout', 'Ironwall Guard', 'Winter Knight', 'Cossack Rider', 'Frost Archer', 'Bearskin Warden', 'White Tsar', 'Brown Bear Guardian', 'White Wolf'] },
  { id: 'qing', name: 'Qing Dynasty', region: 'The East', color: '#398078', sigil: '龍', spellPrefix: 'Jade', units: ['Jade Page', 'Cloud Scout', 'Jade Dragon', 'Bannerman Knight', 'Swift Lancer', 'Silk Archer', 'Jadewall Sentinel', 'Azure General', 'Qing Lion', 'Dragon Emperor'] },
  { id: 'spanish', name: 'Spanish Empire', region: 'The West', color: '#b28a37', sigil: '☼', spellPrefix: 'Gilded', units: ['Castilian Page', 'Sierra Scout', 'Sunlit Guard', 'Toledo Knight', 'Conquistador', 'Crossbow Archer', 'Citadel Warden', 'Golden Hidalgo', 'Iberian Lynx', 'Sun King Champion'] },
  { id: 'french', name: 'French Colonial', region: 'The New World', color: '#526982', sigil: '⚜', spellPrefix: 'Frontier', units: ['Frontier Page', 'River Scout', 'Fleur Guard', 'Loyalist Knight', 'Voyageur Rider', 'Forest Archer', 'Stonefort Warden', 'Marquis Champion', 'Frontier Bison', 'Great Horned Owl'] },
];

const resourceNames = ['food', 'wood', 'stone'];
const ranks = ['Initiate', 'Vanguard', 'Veteran', 'Sentinel', 'Captain', 'Exemplar'];
const spellNames = ['Rations from Home', 'Timberwrights', 'Stonecutters', 'Field Medicine', 'Flaming Volley', 'Rallying Cry', 'Reinforced Harness', 'Quartermaster’s Gift', 'Storm the Ramparts', 'Supply Caravan'];
const spellRanks = ['Minor', 'Swift', 'Proven', 'Grand'];
const spellEffects = ['harvest', 'harvest', 'harvest', 'heal', 'damage', 'rally', 'ward', 'harvest', 'storm', 'harvest'];
const bestiary = {
  'royal lion': 'lion', 'red stag guardian': 'stag',
  'steppe wolf': 'wolf', 'golden eagle': 'eagle',
  'brown bear guardian': 'bear', 'white wolf': 'wolf',
  'jade dragon': 'dragon', 'qing lion': 'lion',
  'iberian lynx': 'lynx', 'frontier bison': 'bison',
  'great horned owl': 'owl',
};

function makeCost(food, wood, stone) { return { food, wood, stone }; }

function spellDescription(effect, amount) {
  if (effect === 'damage') return `Deal ${amount} damage to a rival creature.`;
  if (effect === 'heal') return `Restore ${amount} health to your commander.`;
  if (effect === 'rally') return `Give a friendly creature +${amount} attack this turn.`;
  if (effect === 'ward') return `Give a friendly creature +${amount} health and +1 defense.`;
  if (effect === 'storm') return `Deal ${amount} damage to rival creatures.`;
  return 'Supplies from across the realm.';
}

function makeCard(empire, details, serial) {
  const cost = details.kind === 'Resource'
    ? details.cost
    : Object.fromEntries(resourceNames.map((resource) => [
      resource,
      details.cost[resource] + Number(details.cost[resource] > 0),
    ]));
  return { ...details, cost, name: `${empire.id.slice(0, 3).toUpperCase()}-${String(serial).padStart(3, '0')} ${details.name}`, empire, instanceId: `${empire.id}-${details.id}` };
}

function getUnitLoadout(unit, empire, tier) {
  const name = unit.toLowerCase();
  const species = bestiary[name];
  const mounted = !species && /rider|foal|horde|khan|lancer|cossack|voyageur/.test(name);
  const weapon = species ? 'claws'
    : /archer|scout|longbow|crossbow|bow/.test(name) ? 'bow'
      : /elephant|bearskin/.test(name) ? 'axe'
        : mounted ? 'lance'
          : /guard|warden|sentinel/.test(name) ? 'sword-shield'
            : /champion|general|captain|emperor|king|tsar|hidalgo/.test(name) ? 'greatsword' : 'sword';
  const weaponName = { bow: 'Longbow', axe: 'Battle axe', lance: 'War lance', 'sword-shield': 'Sword & shield', greatsword: 'Greatsword', sword: 'Arming sword', claws: 'Claws & fangs' }[weapon];
  const armor = species ? 'natural hide' : tier >= 4 ? 'plate armor' : tier >= 2 ? 'chain mail' : 'leather armor';
  const royal = /crown|royal|king|tsar|emperor|khan|marquis|champion/.test(name);
  const headwear = species ? 'distinctive crest' : royal ? 'crown and helm' : {
    british: 'nasal helm', mongol: 'fur-lined cap', russian: 'fur helm', qing: 'plumed helmet', spanish: 'morion helmet', french: 'plumed bascinet',
  }[empire.id];
  const feature = species ? `${species} form` : mounted ? 'warhorse and lance' : weapon === 'bow' ? 'quiver and bow' : armor;
  return { weapon, weaponName, mounted, species, armor, headwear, feature };
}

export function buildEmpireDeck(empire, random = Math.random) {
  const deck = [];
  const creatureRanks = [0, 2, 4];
  empire.units.forEach((unit, unitIndex) => {
    creatureRanks.forEach((rankIndex, rankSlot) => {
      const tier = Math.min(5, Math.floor(unitIndex / 2) + rankSlot);
      const attack = 1 + tier;
      const health = 2 + Math.floor(tier / 2);
      const defense = tier >= 4 ? 1 : 0;
      const cost = makeCost(0, 0, 0);
      cost[resourceNames[unitIndex % resourceNames.length]] = tier + 1;
      deck.push(makeCard(empire, {
        id: `unit-${unitIndex}-${rankIndex}`,
        name: `${ranks[rankIndex]} ${unit}`,
        kind: 'Creature', cost, attack, health, defense,
        ...getUnitLoadout(unit, empire, tier),
        glyph: ['♞', '➶', '⬟', '♜', '✦', '⚔'][unitIndex % 6],
        text: defense ? 'A veteran with armor to hold the line.' : 'A loyal hand in service of the banner.',
      }, deck.length + 1));
    });
  });
  spellNames.forEach((spell, spellIndex) => {
    const rankIndex = spellIndex % spellRanks.length;
    const effect = spellEffects[spellIndex];
    const resource = resourceNames[spellIndex % resourceNames.length];
    const amount = 2 + rankIndex;
    const cost = makeCost(0, 0, 0);
    cost[resource] = amount - 1;
    deck.push(makeCard(empire, {
      id: `spell-${spellIndex}`,
      name: `${empire.spellPrefix} ${spellRanks[rankIndex]} ${spell}`,
      kind: 'Spell', cost, glyph: ['✚', 'ϟ', '⚑', '⬡', '✦'][spellIndex % 5], effect, amount, resource,
      text: effect === 'harvest' ? `Gain ${amount} ${resource}.` : spellDescription(effect, amount),
    }, deck.length + 1));
  });
  resourceNames.forEach((resource) => {
    for (let index = 0; index < 20; index++) {
      deck.push(makeCard(empire, {
        id: `supply-${resource}-${index}`,
        name: `${resource[0].toUpperCase()}${resource.slice(1)} Supply ${String(index + 1).padStart(2, '0')}`,
        kind: 'Resource', cost: makeCost(0, 0, 0), glyph: resource[0].toUpperCase(),
        resource, amount: 2, effect: 'harvest', text: `Gain 2 ${resource}.`,
      }, deck.length + 1));
    }
  });
  for (let index = deck.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(random() * (index + 1));
    [deck[index], deck[randomIndex]] = [deck[randomIndex], deck[index]];
  }
  return deck;
}

function drawCard(player) {
  if (!player.deck.length) {
    player.fatigue += 1;
    player.health -= player.fatigue;
    return;
  }
  const card = player.deck.pop();
  if (card.kind === 'Resource') player.resources[card.resource] += card.amount;
  else if (player.hand.length < 10) player.hand.push(card);
}

function drawToFive(player) {
  while (player.hand.length < 5 && player.deck.length) drawCard(player);
  if (player.hand.length < 5 && !player.deck.length) drawCard(player);
}

function makePlayer(empireId, seat, random) {
  const empire = empires.find((item) => item.id === empireId);
  if (!empire) throw new Error('Choose a valid empire.');
  const deck = buildEmpireDeck(empire, random);
  deck.forEach((card) => { card.instanceId = `${card.instanceId}-p${seat}`; });
  const player = {
    empire, health: 30, maxHealth: 30,
    resources: makeCost(2, 2, 2),
    deck, hand: [], board: [], fatigue: 0,
  };
  drawToFive(player);
  return player;
}

export function createGame(empireIds, random = Math.random) {
  if (!Array.isArray(empireIds) || empireIds.length !== 2) throw new Error('A match needs two empires.');
  const players = empireIds.map((id, seat) => makePlayer(id, seat, random));
  return { players, turn: 0, round: 1, gathered: false, finished: null, version: 0 };
}

function dealDamage(player, creature, amount) {
  creature.health -= Math.max(1, amount - creature.defense);
  if (creature.health <= 0) player.board = player.board.filter((item) => item.instanceId !== creature.instanceId);
}

function checkFinished(game) {
  const loser = game.players.findIndex((player) => player.health <= 0);
  if (loser !== -1) game.finished = { winner: 1 - loser, reason: 'health' };
}

function applySpell(card, caster, rival) {
  const friendliest = caster.board.reduce((target, creature) => !target || creature.health < target.health ? creature : target, null);
  const mostWounded = rival.board.reduce((target, creature) => !target || creature.health < target.health ? creature : target, null);
  if (card.effect === 'harvest') caster.resources[card.resource] += card.amount;
  if (card.effect === 'heal') caster.health = Math.min(caster.maxHealth, caster.health + card.amount);
  if (card.effect === 'damage') {
    if (mostWounded) dealDamage(rival, mostWounded, card.amount);
    else rival.health -= card.amount;
  }
  if (card.effect === 'rally' && friendliest) friendliest.bonusAttack = (friendliest.bonusAttack || 0) + card.amount;
  if (card.effect === 'ward' && friendliest) { friendliest.health += card.amount; friendliest.defense += 1; }
  if (card.effect === 'storm') rival.board.slice().forEach((creature) => dealDamage(rival, creature, card.amount));
}

export function applyAction(game, seat, action) {
  if (!Number.isInteger(seat) || seat < 0 || seat > 1) throw new Error('Invalid player seat.');
  if (game.finished) throw new Error('This match has ended.');
  if (!action || typeof action.type !== 'string') throw new Error('Invalid move.');
  if (game.turn !== seat && action.type !== 'surrender') throw new Error('Wait for your turn.');
  const player = game.players[seat];
  const rival = game.players[1 - seat];

  if (action.type === 'gather') {
    if (game.gathered) throw new Error('You have already gathered supplies this turn.');
    if (!resourceNames.includes(action.resource)) throw new Error('Choose a valid supply.');
    player.resources[action.resource] += 2;
    game.gathered = true;
  } else if (action.type === 'play') {
    if (typeof action.cardId !== 'string') throw new Error('Choose a card from your hand.');
    const index = player.hand.findIndex((card) => card.instanceId === action.cardId);
    if (index === -1) throw new Error('That card is not in your hand.');
    const card = player.hand[index];
    if (!resourceNames.every((resource) => player.resources[resource] >= card.cost[resource])) throw new Error('You cannot afford that card.');
    if (card.kind === 'Creature' && player.board.length >= 5) throw new Error('Your company is full.');
    if ((card.effect === 'rally' || card.effect === 'ward') && !player.board.length) throw new Error('You need a creature on the field for that spell.');
    resourceNames.forEach((resource) => { player.resources[resource] -= card.cost[resource]; });
    player.hand.splice(index, 1);
    if (card.kind === 'Creature') player.board.push({ ...card, canAttack: false, bonusAttack: 0 });
    else applySpell(card, player, rival);
  } else if (action.type === 'attack') {
    if (typeof action.attackerId !== 'string') throw new Error('Choose a creature to attack with.');
    const attacker = player.board.find((card) => card.instanceId === action.attackerId);
    if (!attacker || !attacker.canAttack) throw new Error('That creature cannot attack.');
    if (action.targetId !== null && typeof action.targetId !== 'string') throw new Error('Invalid target.');
    const target = action.targetId === null ? null : rival.board.find((card) => card.instanceId === action.targetId);
    if (action.targetId !== null && !target) throw new Error('That rival creature is no longer on the field.');
    attacker.canAttack = false;
    const strength = attacker.attack + (attacker.bonusAttack || 0);
    if (target) {
      const retaliation = target.attack + (target.bonusAttack || 0);
      dealDamage(rival, target, strength);
      dealDamage(player, attacker, retaliation);
    } else rival.health -= strength;
  } else if (action.type === 'end-turn') {
    game.turn = 1 - seat;
    if (game.turn === 0) game.round += 1;
    game.gathered = false;
    const nextPlayer = game.players[game.turn];
    nextPlayer.board.forEach((creature) => { creature.canAttack = true; creature.bonusAttack = 0; });
    drawToFive(nextPlayer);
  } else if (action.type === 'surrender') {
    game.finished = { winner: 1 - seat, reason: 'surrender' };
  } else throw new Error('Unknown move.');

  checkFinished(game);
  game.version += 1;
  return game;
}

export function playerView(game, seat) {
  return {
    type: 'state',
    seat,
    turn: game.turn,
    round: game.round,
    gathered: game.gathered,
    version: game.version,
    finished: game.finished,
    players: game.players.map((player, index) => ({
      empire: player.empire,
      health: player.health,
      maxHealth: player.maxHealth,
      resources: player.resources,
      deck: Array(player.deck.length).fill(null),
      hand: index === seat ? player.hand : [],
      handCount: player.hand.length,
      board: player.board,
      fatigue: player.fatigue,
    })),
  };
}
