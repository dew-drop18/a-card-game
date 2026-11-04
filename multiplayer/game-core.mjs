export const empires = [
  { id: 'british', name: 'British Empire', region: 'The Isles', color: '#a94b38', sigil: 'L', spellPrefix: 'Crown', units: ['Crown Squire', 'Longbow Scout', 'Tower Guard', 'Whitecliff Knight', 'Border Rider', 'Royal Archer', 'Stonekeep Warden', 'Royal Lion', 'Red Stag Guardian', 'Crown Champion'] },
  { id: 'mongol', name: 'Mongol Empire', region: 'The Steppe', color: '#aa7933', sigil: 'ᛟ', spellPrefix: 'Steppe', units: ['Steppe Foal', 'Wind Scout', 'Keshig Guard', 'Wolf-Rider', 'Falcon Archer', 'Khanate Lancer', 'Golden Horde', 'Ordu Champion', 'Steppe Wolf', 'Golden Eagle'] },
  { id: 'russian', name: 'Russian Empire', region: 'The North', color: '#536d52', sigil: '✥', spellPrefix: 'Winter', units: ['Snowland Squire', 'Pinewood Scout', 'Ironwall Guard', 'Winter Knight', 'Cossack Rider', 'Frost Archer', 'Bearskin Warden', 'White Tsar', 'Brown Bear Guardian', 'White Wolf'] },
  { id: 'qing', name: 'Qing Dynasty', region: 'The East', color: '#398078', sigil: '龍', spellPrefix: 'Jade', units: ['Jade Page', 'Cloud Scout', 'Jade Dragon', 'Bannerman Knight', 'Swift Lancer', 'Silk Archer', 'Jadewall Sentinel', 'Azure General', 'Qing Lion', 'Dragon Emperor'] },
  { id: 'spanish', name: 'Spanish Empire', region: 'The West', color: '#b28a37', sigil: '☼', spellPrefix: 'Gilded', units: ['Castilian Page', 'Sierra Scout', 'Sunlit Guard', 'Toledo Knight', 'Conquistador', 'Crossbow Archer', 'Citadel Warden', 'Golden Hidalgo', 'Iberian Lynx', 'Sun King Champion'] },
  { id: 'french', name: 'French Colonial', region: 'The New World', color: '#526982', sigil: '⚜', spellPrefix: 'Frontier', units: ['Frontier Page', 'River Scout', 'Fleur Guard', 'Loyalist Knight', 'Voyageur Rider', 'Forest Archer', 'Stonefort Warden', 'Marquis Champion', 'Frontier Bison', 'Great Horned Owl'] },
];

const resourceNames = ['food', 'wood', 'stone'];
const MAX_FIELD_CARDS = 5;
const weatherTypes = [
  { id: 'average', name: 'Average', description: 'Normal conditions', weight: 10 },
  { id: 'drought', name: 'Drought', description: 'Creatures lose 1 temporary health', weight: 3 },
  { id: 'thunderstorm', name: 'Thunder Storm', description: 'Buildings may be struck by lightning', weight: 2 },
  { id: 'blackplague', name: 'Black Plague', description: 'The plague spreads through creatures', weight: 2 },
  { id: 'peace', name: 'Peace', description: 'A random stat is temporarily strengthened', weight: 2 },
  { id: 'winterstorm', name: 'Winter Storm', description: 'Random 1 damage strikes the field', weight: 2 },
  { id: 'suddenwealth', name: 'Sudden Wealth', description: 'Everything heals 1 each turn', weight: 2 },
];
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
const structureTypes = [
  { id: 'trade-post', name: 'Trade Post', effect: 'resources', count: 5, text: 'At the start of your turn, gain 1 food, 1 wood, and 1 stone for each friendly creature.' },
  { id: 'field-hospital', name: 'Field Hospital', effect: 'healing', count: 5, text: 'At the start of your turn, heal each friendly creature by 1.' },
  { id: 'war-college', name: 'War College', effect: 'training', count: 5, text: 'Friendly creatures have +1 attack and +1 health while this stands.' },
];
const supplyCounts = { food: 14, wood: 13, stone: 13 };
const deckProfiles = {
  british: { creatures: 34, spells: 12, structures: 28, supplies: { food: 8, wood: 11, stone: 7 }, strategy: 'Build a fortified formation with extra structures and creature bonuses.' },
  mongol: { creatures: 39, spells: 12, structures: 21, supplies: { food: 12, wood: 9, stone: 7 }, strategy: 'Overrun the rival with the largest creature increase in the replacement profile.' },
  russian: { creatures: 31, spells: 12, structures: 29, supplies: { food: 10, wood: 10, stone: 8 }, strategy: 'Use extra structures and healing for a long attrition battle.' },
  qing: { creatures: 30, spells: 17, structures: 25, supplies: { food: 11, wood: 9, stone: 8 }, strategy: 'Use the largest spell increase to control card advantage and battlefield actions.' },
  spanish: { creatures: 33, spells: 15, structures: 24, supplies: { food: 10, wood: 8, stone: 10 }, strategy: 'Use balanced replacements to convert victories into supplies and flexible options.' },
  french: { creatures: 36, spells: 15, structures: 21, supplies: { food: 12, wood: 8, stone: 8 }, strategy: 'Use creatures and spells to mix card types and activate the shared attack bonus.' },
};
const dynastySpecials = {
  british: {
    creatures: ['Agincourt Longbow Company', 'New Model Army Veteran', 'Wellington’s Peninsular Rifleman', 'East India Company Sepoy', 'Royal Marine at Trafalgar'],
    spells: ['East India Company Charter', 'Trafalgar Cannonade', 'Scutari Field Hospital', 'Wellington’s Square', 'Royal Navy Convoy'],
    structures: ['Portsmouth Royal Dockyard', 'Fort William Barracks', 'Scutari Military Hospital', 'East India Company Warehouse', 'Royal Naval Hospital'],
  },
  mongol: {
    creatures: ['Keshig Imperial Guard', 'Yam Relay Rider', 'Siege Engineer of Zhongdu', 'Golden Horde Horse Archer', 'Yuan Cavalry of Kublai'],
    spells: ['Yam Relay Network', 'Siege of Baghdad', 'Mongol Field Surgeon', 'Karakorum Muster', 'Pax Mongolica'],
    structures: ['Yam Relay Station', 'Keshig Camp', 'Karakorum Infirmary', 'Golden Horde Supply Post', 'Karakorum Healers’ Yurt'],
  },
  russian: {
    creatures: ['Moscow Streltsy Musketeer', 'Don Cossack Host', 'Siberian Frontier Pioneer', 'Borodino Grenadier', 'Baltic Fleet Marine'],
    spells: ['Siberian Fur Tribute', 'Smolensk Scorched Earth', 'Borodino Field Hospital', 'Cossack Host Muster', 'Winter March'],
    structures: ['Siberian Ostrog', 'Cossack Host Encampment', 'Borodino Field Hospital', 'Peter the Great Foundry', 'Winter Quarters Infirmary'],
  },
  qing: {
    creatures: ['Eight Banner Guard', 'Green Standard Infantry', 'Kangxi Bannerman', 'Jinchuan Campaign Veteran', 'Zuo Zongtang’s Army Veteran'],
    spells: ['Grand Canal Granaries', 'Three Feudatories Campaign', 'Imperial Medical Bureau', 'Eight Banner Review', 'Great Wall Garrison'],
    structures: ['Grand Canal Granary', 'Eight Banner Garrison', 'Imperial Medical Bureau', 'Canton Thirteen Factories', 'Jinchuan Field Hospital'],
  },
  spanish: {
    creatures: ['Flanders Tercio Pikeman', 'Pizarro Expedition Veteran', 'Armada Boarding Crew', 'Manila Galleon Guard', 'Cartagena Dragoon'],
    spells: ['Manila Galleon Convoy', 'Lepanto Broadside', 'Camino Real Hospital', 'Tercio Pike Square', 'Armada Refit'],
    structures: ['Casa de Contratación', 'Cartagena Fortress', 'Hospital de la Sangre', 'Royal Mint of Potosí', 'Manila Naval Hospital'],
  },
  french: {
    creatures: ['Carignan-Salières Soldier', 'Coureur des bois', 'Quebec Colonial Militia', 'Louisbourg Marine', 'New France Voyageur'],
    spells: ['Fur Trade Convoy', 'Siege of Quebec', 'Hôtel-Dieu de Québec', 'Carignan-Salières Muster', 'Louisbourg Refit'],
    structures: ['Quebec Royal Storehouse', 'Fort Frontenac', 'Hôtel-Dieu de Québec', 'Port-Royal Trading Post', 'Louisbourg Hospital'],
  },
};
const specialSpellEffects = ['harvest', 'damage', 'heal', 'rally', 'ward'];
const specialStructureEffects = ['resources', 'training', 'healing', 'resources', 'healing'];
const specialHarvestResources = { british: 'wood', mongol: 'food', russian: 'wood', qing: 'food', spanish: 'stone', french: 'wood' };

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
  empire.units.forEach((unit, unitIndex) => {
    const creatureRanks = unitIndex < 5 ? [0, 2, 4] : [0, 2];
    creatureRanks.forEach((rankIndex, rankSlot) => {
      const tier = Math.min(5, Math.floor(unitIndex / 2) + rankSlot);
      const attack = 1 + tier;
      const health = 2 + Math.floor(tier / 2);
      const defense = tier >= 4 ? 1 : 0;
      const cost = makeCost(tier + 1, 0, 0);
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
  spellNames.slice(0, 5).forEach((spell, spellIndex) => {
    const rankIndex = spellIndex % spellRanks.length;
    const effect = spellEffects[spellIndex];
    const resource = resourceNames[spellIndex % resourceNames.length];
    const amount = 2 + rankIndex;
    const cost = makeCost(0, 0, 0);
    cost.stone = amount - 1;
    deck.push(makeCard(empire, {
      id: `spell-${spellIndex}`,
      name: `${empire.spellPrefix} ${spellRanks[rankIndex]} ${spell}`,
      kind: 'Spell', cost, glyph: ['✚', 'ϟ', '⚑', '⬡', '✦'][spellIndex % 5], effect, amount, resource,
      text: effect === 'harvest' ? `Gain ${amount} ${resource}.` : spellDescription(effect, amount),
    }, deck.length + 1));
  });
  resourceNames.forEach((resource) => {
    for (let index = 0; index < deckProfiles[empire.id].supplies[resource]; index++) {
      deck.push(makeCard(empire, {
        id: `supply-${resource}-${index}`,
        name: `${resource[0].toUpperCase()}${resource.slice(1)} Supply ${String(index + 1).padStart(2, '0')}`,
        kind: 'Resource', cost: makeCost(0, 0, 0), glyph: resource[0].toUpperCase(),
        resource, amount: 2, effect: 'harvest', text: `Gain 2 ${resource}.`,
      }, deck.length + 1));
    }
  });
  structureTypes.forEach((structure) => {
    for (let index = 0; index < structure.count; index++) {
      deck.push(makeCard(empire, {
        id: `structure-${structure.id}-${index}`,
        name: structure.name,
        kind: 'Structure', cost: makeCost(0, 2, 0), health: 5, effect: structure.effect,
        glyph: structure.effect === 'resources' ? '⌂' : structure.effect === 'healing' ? '✚' : '⚑',
        text: structure.text,
      }, deck.length + 1));
    }
  });
  const profile = deckProfiles[empire.id];
  ['Creature', 'Spell', 'Structure'].forEach((kind) => {
    const target = (kind === 'Creature' ? profile.creatures : kind === 'Spell' ? profile.spells : profile.structures) - 5;
    const regular = deck.filter((card) => card.kind === kind && !card.special);
    while (regular.length < target) {
      const template = regular[regular.length % regular.length];
      if (!template) break;
      const copy = makeCard(empire, {
        ...template, id: `${template.id}-copy-${regular.length + 1}`,
        name: `${template.name} II`,
      }, deck.length + 1);
      deck.push(copy);
      regular.push(copy);
    }
    if (regular.length > target) {
      const keep = new Set(regular.slice(0, target));
      for (let index = deck.length - 1; index >= 0; index--) {
        if (deck[index].kind === kind && !keep.has(deck[index])) deck.splice(index, 1);
        if (deck.filter((card) => card.kind === kind).length <= target) break;
      }
    }
  });
  const specials = dynastySpecials[empire.id];
  specials.creatures.forEach((name, index) => {
    const attack = 3 + index;
    const health = 3 + Math.floor(index / 2);
    const cost = makeCost(index + 1, 0, 0);
    deck.push(makeCard(empire, {
      id: `special-creature-${index}`,
      name, kind: 'Creature', cost, attack, health, defense: index >= 3 ? 1 : 0,
      ...getUnitLoadout(name, empire, index + 1),
      glyph: ['♞', '➶', '⬟', '♜', '⚔'][index],
      text: `A special unit inspired by ${name}.`,
      special: true,
    }, deck.length + 1));
  });
  specials.spells.forEach((name, index) => {
    const effect = specialSpellEffects[index];
    const amount = index < 3 ? 3 : 2;
    const resource = specialHarvestResources[empire.id];
    const cost = makeCost(0, 0, amount - 1);
    deck.push(makeCard(empire, {
      id: `special-spell-${index}`,
      name, kind: 'Spell', cost, glyph: ['✚', 'ϟ', '⚑', '⬡', '✦'][index],
      effect, amount, resource, text: effect === 'harvest' ? `Gain ${amount} ${resource}, inspired by ${name}.` : spellDescription(effect, amount),
      special: true,
    }, deck.length + 1));
  });
  specials.structures.forEach((name, index) => {
    const effect = specialStructureEffects[index];
    const cost = makeCost(0, 2 + Number(index >= 3), 0);
    const effectText = effect === 'resources'
      ? 'At the start of your turn, gain 1 food, 1 wood, and 1 stone for each friendly creature.'
      : effect === 'healing'
        ? 'At the start of your turn, heal each friendly creature by 1.'
        : 'Friendly creatures have +1 attack and +1 health while this stands.';
    deck.push(makeCard(empire, {
      id: `special-structure-${index}`,
      name, kind: 'Structure', cost, health: 5 + Number(index < 3), effect,
      glyph: ['⌂', '⚑', '✚', '⌂', '✚'][index],
      text: `${effectText} Inspired by ${name}.`,
      special: true,
    }, deck.length + 1));
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
  if (card.kind === 'Resource') player.resources[card.resource] += card.amount + (player.empire.id === 'qing' ? 1 : 0);
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
    resources: makeCost(5, 5, 5),
    deck, hand: [], board: [], fatigue: 0, britishStructureCount: 0,
  };
  drawToFive(player);
  return player;
}

export function createGame(empireIds, random = Math.random) {
  if (!Array.isArray(empireIds) || empireIds.length !== 2) throw new Error('A match needs two empires.');
  const players = empireIds.map((id, seat) => makePlayer(id, seat, random));
  return { players, turn: 0, round: 1, gathered: false, finished: null, version: 0, random, weather: { id: 'average', name: 'Average', description: 'Normal conditions', remaining: 0 } };
}

function trainingBonus(player) {
  return player.board.filter((card) => card.kind === 'Structure' && card.effect === 'training').length;
}

function effectiveCreatureHealth(player, creature) {
  return creature.health + trainingBonus(player);
}

function creatureAttack(player, creature) {
  return creature.attack + (creature.bonusAttack || 0) + (creature.weatherPeace?.attack || 0) + (player.empire.id === 'mongol' ? creature.killBonusAttack || 0 : 0) + trainingBonus(player) + (creature.britishStats?.attack || 0) + (player.empire.id === 'mongol' && creature.mounted ? 1 : 0);
}

function creatureDefense(player, creature) {
  return (creature.defense || 0) + (creature.weatherPeace?.defense || 0) + (creature.britishStats?.defense || 0);
}

function randomResource(player, random, count = 1) {
  for (let index = 0; index < count; index++) player.resources[resourceNames[Math.floor(random() * resourceNames.length)]] += 1;
}

function randomBritishBonus(player, random) {
  const stat = ['attack', 'health', 'defense'][Math.floor(random() * 3)];
  player.board.filter((card) => card.kind === 'Creature').forEach((creature) => {
    creature.britishStats ||= { attack: 0, health: 0, defense: 0 };
    creature.britishStats[stat] += 1;
    if (stat === 'health') {
      creature.health += 1;
      creature.maxHealth = (creature.maxHealth ?? creature.health) + 1;
    }
  });
}

function removeDeadCreatures(player) {
  player.board = player.board.filter((card) => card.kind !== 'Creature' || effectiveCreatureHealth(player, card) > 0);
}

function dealDamage(player, creature, amount) {
  creature.health -= Math.max(1, amount - creatureDefense(player, creature));
  const defeated = creature.kind === 'Structure'
    ? creature.health <= 0
    : effectiveCreatureHealth(player, creature) <= 0;
  if (!defeated) return false;
  player.board = player.board.filter((item) => item.instanceId !== creature.instanceId);
  if (creature.kind === 'Structure') removeDeadCreatures(player);
  return true;
}

function checkFinished(game) {
  const loser = game.players.findIndex((player) => player.health <= 0);
  if (loser !== -1) game.finished = { winner: 1 - loser, reason: 'health' };
}

function applySpell(card, caster, rival) {
  const friendlyCreatures = caster.board.filter((item) => item.kind === 'Creature');
  const rivalCreatures = rival.board.filter((item) => item.kind === 'Creature');
  const friendliest = friendlyCreatures.reduce((target, creature) => !target || creature.health < target.health ? creature : target, null);
  const mostWounded = rivalCreatures.reduce((target, creature) => !target || creature.health < target.health ? creature : target, null);
  if (card.effect === 'harvest') caster.resources[card.resource] += card.amount;
  if (card.effect === 'heal') caster.health = Math.min(caster.maxHealth, caster.health + card.amount);
  if (card.effect === 'damage') {
    if (mostWounded) dealDamage(rival, mostWounded, card.amount);
    else rival.health -= card.amount;
  }
  if (card.effect === 'rally' && friendliest) friendliest.bonusAttack = (friendliest.bonusAttack || 0) + card.amount;
  if (card.effect === 'ward' && friendliest) {
    friendliest.maxHealth = (friendliest.maxHealth ?? friendliest.health) + card.amount;
    friendliest.health += card.amount;
    friendliest.defense += 1;
  }
  if (card.effect === 'storm') rivalCreatures.forEach((creature) => dealDamage(rival, creature, card.amount));
}

function applyStructureTurnEffects(player) {
  const structures = player.board.filter((card) => card.kind === 'Structure');
  const resourceCount = structures.filter((card) => card.effect === 'resources').length;
  const healingCount = structures.filter((card) => card.effect === 'healing').length;
  const creatureCount = player.board.filter((card) => card.kind === 'Creature').length;
  if (resourceCount) resourceNames.forEach((resource) => { player.resources[resource] += resourceCount * creatureCount; });
  if (healingCount) {
    player.board.filter((card) => card.kind === 'Creature').forEach((creature) => {
      creature.health = Math.min(creature.maxHealth ?? creature.health, creature.health + healingCount);
    });
  }
}

function applyDynastyTurnEffects(player) {
  if (player.empire.id !== 'russian') return;
  player.board.filter((card) => card.kind === 'Creature').forEach((creature) => {
    creature.health = Math.min(creature.maxHealth ?? creature.health, creature.health + 1);
  });
}

function applyFrenchBonus(player) {
  if (player.empire.id === 'french' && !player.frenchBonusActive && ['Creature', 'Spell', 'Structure'].every((kind) => player.playedKinds.includes(kind))) {
    player.board.filter((card) => card.kind === 'Creature').forEach((creature) => {
      creature.bonusAttack = (creature.bonusAttack || 0) + 1;
    });
    player.frenchBonusActive = true;
  }
}

function pickWeather(random) {
  const roll = random() * weatherTypes.reduce((total, weather) => total + weather.weight, 0);
  let accumulated = 0;
  for (const weather of weatherTypes) {
    accumulated += weather.weight;
    if (roll < accumulated) return weather;
  }
  return weatherTypes[0];
}

function removeWeatherBuffs(player) {
  player.board.forEach((card) => {
    if (card.kind === 'Creature' && card.weatherDrought) {
      card.health += 1;
      card.maxHealth = Math.max(card.maxHealth ?? card.health, card.health);
      delete card.weatherDrought;
    }
    if (card.kind === 'Creature' && card.weatherPeace) {
      if (card.weatherPeace.health) {
        card.health -= card.weatherPeace.health;
        card.maxHealth -= card.weatherPeace.health;
      }
      delete card.weatherPeace;
    }
    delete card.weatherPlague;
  });
}

function startWeather(game) {
  const selected = pickWeather(game.random || Math.random);
  game.weather = { ...selected, remaining: selected.id === 'average' ? 0 : 4 };
  if (selected.id === 'peace') {
    const stat = ['attack', 'health', 'defense'][Math.floor((game.random || Math.random)() * 3)];
    game.weather.stat = stat;
    game.players.forEach((player) => player.board.filter((card) => card.kind === 'Creature').forEach((creature) => {
      creature.weatherPeace ||= {};
      creature.weatherPeace[stat] = (creature.weatherPeace[stat] || 0) + 1;
      if (stat === 'health') {
        creature.health += 1;
        creature.maxHealth += 1;
      }
    }));
  } else if (selected.id === 'drought') {
    game.players.forEach((player) => player.board.filter((card) => card.kind === 'Creature' && !card.weatherDrought).forEach((creature) => {
      creature.health -= 1;
      creature.weatherDrought = true;
    }));
  } else if (selected.id === 'blackplague') {
    const creatures = game.players.flatMap((player) => player.board.filter((card) => card.kind === 'Creature'));
    if (creatures.length) creatures[Math.floor((game.random || Math.random)() * creatures.length)].weatherPlague = 1;
  }
  removeDeadCreatures(game.players[0]);
  removeDeadCreatures(game.players[1]);
}

function expireWeather(game) {
  game.players.forEach(removeWeatherBuffs);
  removeDeadCreatures(game.players[0]);
  removeDeadCreatures(game.players[1]);
}

function applyWeatherTurn(game, player) {
  const weather = game.weather;
  if (!weather || weather.id === 'average') return;
  if (weather.id === 'drought') {
    player.board.filter((card) => card.kind === 'Creature' && !card.weatherDrought).forEach((creature) => {
      creature.health -= 1;
      creature.weatherDrought = true;
    });
  } else if (weather.id === 'thunderstorm') {
    player.board.filter((card) => card.kind === 'Structure').forEach((structure) => {
      if ((game.random || Math.random)() < .35) dealDamage(player, structure, 99);
    });
  } else if (weather.id === 'blackplague') {
    const creatures = player.board.filter((card) => card.kind === 'Creature');
    creatures.filter((card) => card.weatherPlague).forEach((creature) => {
      creature.health -= 1;
    });
    const healthy = creatures.filter((card) => !card.weatherPlague);
    if (healthy.length && creatures.some((card) => card.weatherPlague)) {
      const infectedIndex = creatures.findIndex((card) => card.weatherPlague);
      const adjacent = healthy.filter((creature) => {
        const creatureIndex = creatures.indexOf(creature);
        return creatureIndex === infectedIndex - 1 || creatureIndex === infectedIndex + 1;
      });
      const candidates = adjacent.length ? adjacent : healthy;
      candidates[Math.floor((game.random || Math.random)() * candidates.length)].weatherPlague = 1;
    }
  } else if (weather.id === 'winterstorm') {
    player.board.forEach((card) => {
      if ((game.random || Math.random)() < .5) dealDamage(player, card, 1);
    });
  } else if (weather.id === 'suddenwealth') {
    player.board.forEach((card) => {
      if (card.health < (card.maxHealth ?? card.health)) card.health += 1;
    });
  }
  removeDeadCreatures(player);
}

function advanceWeather(game, nextPlayer) {
  if (game.weather?.remaining > 0) {
    applyWeatherTurn(game, nextPlayer);
    game.weather.remaining -= 1;
    if (game.weather.remaining === 0) {
      expireWeather(game);
      startWeather(game);
    }
  } else if (game.weather?.id === 'average') {
    startWeather(game);
  }
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
    if ((card.kind === 'Creature' || card.kind === 'Structure') && player.board.length >= MAX_FIELD_CARDS) throw new Error('Your battlefield is full.');
    if ((card.effect === 'rally' || card.effect === 'ward') && !player.board.some((item) => item.kind === 'Creature')) throw new Error('You need a creature on the field for that spell.');
    resourceNames.forEach((resource) => { player.resources[resource] -= card.cost[resource]; });
    player.hand.splice(index, 1);
    if (card.kind === 'Creature') {
      const britishStats = player.empire.id === 'british' ? { attack: 0, health: 0, defense: 0 } : undefined;
      const creature = { ...card, maxHealth: card.health, canAttack: false, bonusAttack: 0, britishStats };
      if (britishStats) {
        for (let bonus = 0; bonus < player.britishStructureCount; bonus++) {
          const stat = ['attack', 'health', 'defense'][Math.floor(game.random() * 3)];
          britishStats[stat] += 1;
          if (stat === 'health') {
            creature.health += 1;
            creature.maxHealth += 1;
          }
        }
      }
      if (game.weather?.id === 'drought') {
        creature.health -= 1;
        creature.weatherDrought = true;
      } else if (game.weather?.id === 'peace') {
        creature.weatherPeace = { [game.weather.stat]: 1 };
        if (game.weather.stat === 'health') {
          creature.health += 1;
          creature.maxHealth += 1;
        }
      }
      player.board.push(creature);
    }
    else if (card.kind === 'Structure') {
      player.board.push({ ...card });
      if (player.empire.id === 'british') {
        player.britishStructureCount += 1;
        randomBritishBonus(player, game.random || Math.random);
      }
    }
    else applySpell(card, player, rival);
    if (['Creature', 'Spell', 'Structure'].includes(card.kind)) {
      player.playedKinds ||= [];
      player.playedKinds.push(card.kind);
      applyFrenchBonus(player);
    }
  } else if (action.type === 'attack') {
    if (typeof action.attackerId !== 'string') throw new Error('Choose a creature to attack with.');
    const attacker = player.board.find((card) => card.instanceId === action.attackerId);
    if (!attacker || attacker.kind === 'Structure' || !attacker.canAttack) throw new Error('That creature cannot attack.');
    if (action.targetId !== null && typeof action.targetId !== 'string') throw new Error('Invalid target.');
    const target = action.targetId === null ? null : rival.board.find((card) => card.instanceId === action.targetId);
    if (action.targetId !== null && !target) throw new Error('That rival creature is no longer on the field.');
    attacker.canAttack = false;
    const strength = creatureAttack(player, attacker);
    if (target) {
      const retaliation = target.kind === 'Structure' ? 0 : creatureAttack(rival, target);
      const targetDefeated = dealDamage(rival, target, strength);
      if (retaliation) dealDamage(player, attacker, retaliation);
      if (targetDefeated && player.empire.id === 'mongol') attacker.killBonusAttack = (attacker.killBonusAttack || 0) + 2;
      if (targetDefeated && player.empire.id === 'spanish') randomResource(player, game.random || Math.random, target.kind === 'Structure' ? 2 : 1);
    } else rival.health -= strength;
  } else if (action.type === 'end-turn') {
    game.turn = 1 - seat;
    if (game.turn === 0) game.round += 1;
    game.gathered = false;
    const nextPlayer = game.players[game.turn];
    nextPlayer.board.filter((creature) => creature.kind !== 'Structure').forEach((creature) => { creature.canAttack = true; creature.bonusAttack = 0; });
    nextPlayer.playedKinds = [];
    nextPlayer.frenchBonusActive = false;
    applyStructureTurnEffects(nextPlayer);
    applyDynastyTurnEffects(nextPlayer);
    advanceWeather(game, nextPlayer);
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
    weather: game.weather,
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
