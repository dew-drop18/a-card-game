const empires = [
  { id: 'british', name: 'British Empire', region: 'The Isles', color: '#a94b38', sigil: 'L', trait: 'Redoubtable Guard', spellPrefix: 'Crown', units: ['Crown Squire', 'Longbow Scout', 'Tower Guard', 'Whitecliff Knight', 'Border Rider', 'Royal Archer', 'Stonekeep Warden', 'Royal Lion', 'Red Stag Guardian', 'Crown Champion'] },
  { id: 'mongol', name: 'Mongol Empire', region: 'The Steppe', color: '#aa7933', sigil: 'ᛟ', trait: 'Riders of the Steppe', spellPrefix: 'Steppe', units: ['Steppe Foal', 'Wind Scout', 'Keshig Guard', 'Wolf-Rider', 'Falcon Archer', 'Khanate Lancer', 'Golden Horde', 'Ordu Champion', 'Steppe Wolf', 'Golden Eagle'] },
  { id: 'russian', name: 'Russian Empire', region: 'The North', color: '#536d52', sigil: '✥', trait: 'Keepers of the North', spellPrefix: 'Winter', units: ['Snowland Squire', 'Pinewood Scout', 'Ironwall Guard', 'Winter Knight', 'Cossack Rider', 'Frost Archer', 'Bearskin Warden', 'White Tsar', 'Brown Bear Guardian', 'White Wolf'] },
  { id: 'qing', name: 'Qing Dynasty', region: 'The East', color: '#398078', sigil: '龍', trait: 'Jade Court', spellPrefix: 'Jade', units: ['Jade Page', 'Cloud Scout', 'Jade Dragon', 'Bannerman Knight', 'Swift Lancer', 'Silk Archer', 'Jadewall Sentinel', 'Azure General', 'Qing Lion', 'Dragon Emperor'] },
  { id: 'spanish', name: 'Spanish Empire', region: 'The West', color: '#b28a37', sigil: '☼', trait: 'Gilded Armada', spellPrefix: 'Gilded', units: ['Castilian Page', 'Sierra Scout', 'Sunlit Guard', 'Toledo Knight', 'Conquistador', 'Crossbow Archer', 'Citadel Warden', 'Golden Hidalgo', 'Iberian Lynx', 'Sun King Champion'] },
  { id: 'french', name: 'French Colonial', region: 'The New World', color: '#526982', sigil: '⚜', trait: 'Frontier Company', spellPrefix: 'Frontier', units: ['Frontier Page', 'River Scout', 'Fleur Guard', 'Loyalist Knight', 'Voyageur Rider', 'Forest Archer', 'Stonefort Warden', 'Marquis Champion', 'Frontier Bison', 'Great Horned Owl'] },
];

const ranks = ['Initiate', 'Vanguard', 'Veteran', 'Sentinel', 'Captain', 'Exemplar'];
const spellNames = ['Rations from Home', 'Timberwrights', 'Stonecutters', 'Field Medicine', 'Flaming Volley', 'Rallying Cry', 'Reinforced Harness', 'Quartermaster’s Gift', 'Storm the Ramparts', 'Supply Caravan'];
const spellRanks = ['Minor', 'Swift', 'Proven', 'Grand'];
const resourceNames = ['food', 'wood', 'stone'];
const resourceMarks = { food: 'F', wood: 'W', stone: 'S' };

function makeCost(food, wood, stone) { return { food, wood, stone }; }

function makeCard(empire, details, serial) {
  const code = empire.id.slice(0, 3).toUpperCase();
  const cost = details.kind === 'Resource'
    ? details.cost
    : Object.fromEntries(resourceNames.map((resource) => [
      resource,
      details.cost[resource] + Number(details.cost[resource] > 0),
    ]));
  return { ...details, cost, name: `${code}-${String(serial).padStart(3, '0')} ${details.name}`, empire, instanceId: `${empire.id}-${details.id}` };
}

function getUnitLoadout(unit, empire, tier) {
  const name = unit.toLowerCase();
  const bestiary = {
    'royal lion': 'lion', 'red stag guardian': 'stag',
    'steppe wolf': 'wolf', 'golden eagle': 'eagle',
    'brown bear guardian': 'bear', 'white wolf': 'wolf',
    'jade dragon': 'dragon', 'qing lion': 'lion',
    'iberian lynx': 'lynx', 'frontier bison': 'bison',
    'great horned owl': 'owl',
  };
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

function buildEmpireDeck(empire) {
  const deck = [];
  const creatureRanks = [0, 2, 4];
  empire.units.forEach((unit, unitIndex) => {
    creatureRanks.forEach((rankIndex, rankSlot) => {
      const rank = ranks[rankIndex];
      const tier = Math.min(5, Math.floor(unitIndex / 2) + rankSlot);
      const attack = 1 + tier;
      const health = 2 + Math.floor(tier / 2);
      const defense = tier >= 4 ? 1 : 0;
      const cost = makeCost(0, 0, 0);
      cost[resourceNames[unitIndex % resourceNames.length]] = tier + 1;
      const loadout = getUnitLoadout(unit, empire, tier);
      deck.push(makeCard(empire, {
        id: `unit-${unitIndex}-${rankIndex}`,
        name: `${rank} ${unit}`,
        kind: 'Creature', cost, attack, health, defense,
        ...loadout,
        glyph: ['♞', '➶', '⬟', '♜', '✦', '⚔'][unitIndex % 6],
        text: defense ? 'A veteran with armor to hold the line.' : 'A loyal hand in service of the banner.',
      }, deck.length + 1));
    });
  });
  spellNames.forEach((spell, spellIndex) => {
    const rankIndex = spellIndex % spellRanks.length;
    const rank = spellRanks[rankIndex];
    const effect = ['harvest', 'harvest', 'harvest', 'heal', 'damage', 'rally', 'ward', 'harvest', 'storm', 'harvest'][spellIndex];
    const resource = resourceNames[spellIndex % resourceNames.length];
    const amount = 2 + rankIndex;
    const cost = makeCost(0, 0, 0);
    cost[resource] = amount - 1;
    deck.push(makeCard(empire, {
      id: `spell-${spellIndex}`,
      name: `${empire.spellPrefix} ${rank} ${spell}`,
      kind: 'Spell', cost, glyph: ['✚', 'ϟ', '⚑', '⬡', '✦'][spellIndex % 5], effect, amount, resource,
      text: effect === 'harvest' ? `Gain ${amount} ${resource}.` : spellDescription(effect, amount),
    }, deck.length + 1));
  });
  resourceNames.forEach((resource) => {
    for (let index = 0; index < 20; index++) {
      deck.push(makeCard(empire, {
        id: `supply-${resource}-${index}`,
        name: `${resource[0].toUpperCase()}${resource.slice(1)} Supply ${String(index + 1).padStart(2, '0')}`,
        kind: 'Resource', cost: makeCost(0, 0, 0), glyph: resourceMarks[resource],
        resource, amount: 2, effect: 'harvest', text: `Gain 2 ${resource}.`,
      }, deck.length + 1));
    }
  });
  return shuffle(deck);
}

function spellDescription(effect, amount) {
  if (effect === 'damage') return `Deal ${amount} damage to a rival creature.`;
  if (effect === 'heal') return `Restore ${amount} health to your commander.`;
  if (effect === 'rally') return `Give a friendly creature +${amount} attack this turn.`;
  if (effect === 'ward') return `Give a friendly creature +${amount} health and +1 defense.`;
  if (effect === 'storm') return `Deal ${amount} damage to rival creatures.`;
  return 'Supplies from across the realm.';
}

const $ = (selector) => document.querySelector(selector);
const screens = { intro: $('#intro-screen'), difficulty: $('#difficulty-screen'), battle: $('#battle-screen') };
const difficulties = [
  { id: 'easy-living', name: 'Easy Living', enemyHealth: 22, enemySupplies: 1, aiTargetChance: .2, color: '#668357', summary: 'Rivals begin with 22 health and 1 of each supply.' },
  { id: 'farm-work', name: 'Farm Work', enemyHealth: 30, enemySupplies: 2, aiTargetChance: .4, color: '#aa7933', summary: 'Rivals begin with 30 health and 2 of each supply.' },
  { id: 'painful-adventure', name: 'Painful Adventure', enemyHealth: 36, enemySupplies: 3, aiTargetChance: .65, color: '#bd6840', summary: 'Rivals begin with 36 health and 3 of each supply.' },
  { id: 'true-battlegrounds', name: 'True Battlegrounds', enemyHealth: 42, enemySupplies: 4, aiTargetChance: .85, color: '#a94b38', summary: 'Rivals begin with 42 health and 4 of each supply.' },
];
const state = { started: false, ended: false, busy: false, turn: 'player', round: 0, selectedAttacker: null, gathered: false, selectedEmpire: null, campaign: null, player: null, enemy: null };
const arena = { canvas: $('#pixel-battlefield'), context: null, combat: null, rendering: false };
let onlineSelection = false;
let onlineConnection = null;
let audioContext;

function playSound(effect) {
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextType) return;
  audioContext ||= new AudioContextType();
  if (audioContext.state === 'suspended') audioContext.resume();
  const now = audioContext.currentTime;
  const sounds = {
    start: [[392, 587, .18, 'triangle'], [587, 784, .24, 'triangle']],
    draw: [[523, 784, .12, 'sine']],
    resource: [[392, 587, .15, 'triangle'], [587, 784, .19, 'sine']],
    gather: [[294, 440, .18, 'triangle'], [440, 587, .21, 'sine']],
    play: [[330, 494, .11, 'triangle']],
    spell: [[440, 880, .26, 'sine'], [659, 988, .2, 'triangle']],
    turn: [[262, 349, .2, 'triangle']],
    select: [[440, 523, .075, 'sine']],
    attack: [[180, 90, .24, 'sawtooth'], [330, 165, .18, 'triangle']],
    impact: [[125, 65, .16, 'square'], [220, 110, .12, 'triangle']],
    defeat: [[180, 110, .32, 'triangle']],
    win: [[523, 659, .18, 'triangle'], [659, 784, .28, 'triangle'], [784, 1047, .4, 'sine']],
  }[effect];
  if (!sounds) return;
  sounds.forEach(([startFrequency, endFrequency, duration, type], index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const offset = index * .055;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, now + offset);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + offset + duration);
    gain.gain.setValueAtTime(.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(.075, now + offset + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, now + offset + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + duration + .01);
  });
}

function arenaSlot(owner, creature) {
  const foundIndex = owner.board.findIndex((item) => item.instanceId === creature.instanceId);
  const index = foundIndex < 0 ? owner.board.length : foundIndex;
  const count = Math.max(1, owner.board.length + Number(foundIndex < 0));
  return { x: arena.canvas.clientWidth * ((index + 1) / (count + 1)), y: owner.isAI ? 42 : arena.canvas.clientHeight - 42 };
}

function drawWarrior(creature, x, y, time, direction, action = '', progress = 0) {
  const context = arena.context;
  const color = creature.empire.color;
  const scale = Math.max(3, Math.min(5, arena.canvas.clientWidth / 170));
  const bob = Math.sin(time / 180 + creature.attack) * 2.5;
  const step = action === 'idle' ? Math.sin(time / 95 + creature.health) * scale : 0;
  context.save();
  context.translate(x, y + bob);
  if (direction < 0) context.scale(-1, 1);
  context.fillStyle = '#302e2944';
  context.beginPath();
  context.ellipse(0, scale * 11, scale * 5, scale * 1.25, 0, 0, Math.PI * 2);
  context.fill();

  const pixel = (px, py, width, height, fill) => {
    context.fillStyle = fill;
    context.fillRect(px * scale - scale * 5, py * scale - scale * 11, width * scale, height * scale);
  };
  const dark = '#342b39';
  const metal = '#ded7bd';
  const gold = '#f0bd4d';
  const skin = '#e99b68';
  if (creature.species) {
    const beasts = {
      lion: ['....GGGG....', '..GGGGGGGG..', '.GGCCCCCCGG.', '.GCCCCCCCCG.', '..CCCCCCCC..', '..CCCDCCCCC.', '.CCCCC.CCC..', '..CCC...CC..', '.CC.C...C.C.'],
      stag: ['.....DD.....', '...D.DD.D...', '....GGGG....', '...GCCCCG...', '..GCCCCCCG..', '..CCCCCCCC..', '..CCC.DCCC..', '...CC..CC...', '..CC....CC..'],
      wolf: ['..D........D.', '.DDD......DDD', '.DCCCCCCCCDD.', '..CCCCCCCCCC.', '..CCCDCCCCCC.', '..CCCCCCCCCC.', '...CCCCCCC...', '...CC...CC....'],
      eagle: ['......DD......', '.....DGGD.....', '....DDGGDD....', '..DDDDGGDDDD..', '.DCCCCGGCCCCD.', '..CCCCGGCCCC..', '.....DGGD.....', '....DD..DD....'],
      bear: ['....DDDDDD....', '..DDCCCCCCDD..', '.DCCCCCCCCCCD.', '.DCCCDCCCDCCCD.', '..CCCCCCCCCC..', '..CCCDCCCCCC..', '.CCCCCCCCCCCC.', '..CCC....CCC..'],
      dragon: ['....DD..DD....', '..DDCCCCCCDD..', '.DCCCCGGCCCCD.', '..CCCCCCCCCC..', '...CCCDCCCC...', '..CCCCC.CCCC..', '.DD...C..C...DD', '......DDDD....'],
      lynx: ['..D........D..', '.DDD......DDD.', '.DCCCCCCCCCCCD.', '..CCCCCCCCCC...', '..CCCDCCCCCC...', '..CCCCCCCCCCC..', '...CCCCCCCC....', '...CC....CC.....'],
      bison: ['....DDDDDD....', '..DDCCCCCCDD..', '.DCCCCCCCCCCD.', '.DCCCDCCCCCCD.', '..CCCCCCCCCC..', '..CCCCCCCCCC..', '...CCCCC.CCC...', '..CC....CC......'],
      owl: ['.....DDDD.....', '....DGGGGD....', '...DCCCCCCD...', '..DCCCDCCCDCC..', '..DCCGGGGCCCD..', '...DCCCCCCD....', '....CCCCCC.....', '...CC....CC....'],
    };
    const pattern = beasts[creature.species] || beasts.wolf;
    const colors = { D: dark, C: color, G: gold };
    pattern.forEach((row, rowIndex) => [...row].forEach((mark, column) => {
      if (colors[mark]) pixel(column - 3, rowIndex + 3, 1, 1, colors[mark]);
    }));
    pixel(4, 7, 1, 1, skin);
    if (action === 'attack') {
      const clawX = 8 + Math.round(progress * 2);
      pixel(clawX, 7, 2, 1, '#fff3a9');
      pixel(clawX + 1, 6, 1, 1, metal);
    }
    if (action === 'hit') {
      context.globalCompositeOperation = 'screen';
      context.fillStyle = '#fff3a9aa';
      context.fillRect(-scale * 5, -scale * 11, scale * 11, scale * 14);
    }
    context.restore();
    return;
  }
  if (creature.mounted) {
    pixel(-4, 10, 8, 3, dark);
    pixel(-2, 8, 7, 3, color);
    pixel(3, 7, 3, 2, dark);
    pixel(-2, 12, 1, 2, dark);
    pixel(3, 12, 1, 2, dark);
    pixel(5, 7, 1, 1, gold);
  }
  const armorColor = creature.armor === 'plate armor' ? '#bdc9ca' : creature.armor === 'chain mail' ? '#82939a' : color;
  if (creature.headwear === 'crown and helm') {
    pixel(2, 1, 1, 2, gold); pixel(4, 0, 1, 3, gold); pixel(6, 1, 1, 2, gold);
  } else if (creature.headwear?.includes('fur')) {
    pixel(2, 1, 6, 2, '#e7dfc5'); pixel(3, 0, 4, 1, color);
  } else if (creature.headwear?.includes('plumed')) {
    pixel(4, 0, 2, 3, '#e5d5a7'); pixel(2, 2, 6, 1, gold);
  } else {
    pixel(3, 1, 4, 1, gold); pixel(2, 2, 6, 2, color);
  }
  pixel(3, 4, 4, 2, skin);
  pixel(2, 4, 1, 1, dark);
  pixel(7, 4, 1, 1, dark);
  pixel(2, 6, 6, 1, gold);
  pixel(1, 7, 8, 3, armorColor);
  pixel(2, 7, 6, 1, metal);
  pixel(3, 10, 2, 2, dark);
  pixel(6, 10, 2, 2, dark);
  pixel(3, 12, 2, 1, gold);
  pixel(6, 12, 3, 1, gold);
  pixel(0, 8, 1, 2, metal);
  pixel(0, 7, 2, 1, gold);

  const swing = action === 'attack' ? Math.sin(Math.PI * Math.min(1, Math.max(0, (progress - .58) / .2))) : 0;
  const weaponY = Math.round(6 - swing * 3 + (action === 'idle' ? step / scale : 0));
  if (creature.weapon === 'bow') {
    pixel(9, 4, 1, 1, gold); pixel(10, 5, 1, 3, metal); pixel(9, 8, 1, 1, gold);
    pixel(8, 5, 1, 1, metal); pixel(8, 7, 1, 1, metal);
    if (action === 'attack') {
      const arrowX = 10 + Math.round(progress * 7);
      pixel(arrowX, 6, 3, 1, gold); pixel(arrowX + 2, 5, 1, 1, metal); pixel(arrowX + 2, 7, 1, 1, metal);
    }
  } else if (creature.weapon === 'axe') {
    pixel(8, 7, 1, 5, '#8b6041'); pixel(9, 5, 3, 2, metal); pixel(11, 6, 1, 2, gold);
    if (action === 'attack') { pixel(10, weaponY, 3, 2, metal); pixel(12, weaponY - 1, 1, 3, gold); }
  } else if (creature.weapon === 'lance') {
    pixel(7, 7, 6, 1, '#8b6041'); pixel(12, 6, 2, 1, metal); pixel(14, 5, 2, 1, gold);
    if (action === 'attack') { pixel(9, weaponY, 5, 1, metal); pixel(14, weaponY - 1, 2, 1, gold); }
  } else if (creature.weapon === 'sword-shield') {
    pixel(8, 7, 1, 4, '#8b6041'); pixel(9, 5, 1, 2, gold); pixel(7, 4, 3, 1, metal);
    pixel(-2, 7, 2, 3, color); pixel(-2, 8, 2, 1, gold);
    if (action === 'attack') { pixel(9, weaponY, 1, 5, metal); pixel(8, weaponY, 3, 1, gold); }
  } else {
    pixel(8, 8, 1, 4, '#8b6041');
    pixel(9, weaponY + 2, 1, 2, gold);
    pixel(10, weaponY, 1, 3, metal);
    pixel(11, weaponY - 1, 1, 1, metal);
    pixel(10, weaponY - 2, creature.weapon === 'greatsword' ? 2 : 1, 1, gold);
    if (action === 'attack') { pixel(10, weaponY - 2, 2, 1, '#fff3a9'); pixel(12, weaponY, 2, 1, metal); }
  }
  if (action === 'hit') {
    context.globalCompositeOperation = 'screen';
    context.fillStyle = '#fff3a9aa';
    context.fillRect(-scale * 5, -scale * 11, scale * 11, scale * 14);
  }
  context.restore();
}

function drawBattlefield(time) {
  const canvas = arena.canvas;
  if (!canvas || !canvas.isConnected) return;
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) {
    window.requestAnimationFrame(drawBattlefield);
    return;
  }
  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(bounds.width * ratio);
  const height = Math.round(bounds.height * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const context = arena.context;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, bounds.width, bounds.height);
  context.fillStyle = '#d7c9a7';
  context.fillRect(0, 0, bounds.width, bounds.height);
  context.fillStyle = '#c7d4ad';
  context.fillRect(0, 0, bounds.width, bounds.height * .49);
  context.fillStyle = '#b8c99a';
  context.fillRect(0, bounds.height * .51, bounds.width, bounds.height * .49);
  context.fillStyle = '#ddc99e';
  context.fillRect(0, bounds.height * .43, bounds.width, bounds.height * .14);
  context.fillStyle = '#968d6b';
  context.fillRect(0, bounds.height * .495, bounds.width, 2);
  for (let index = 0; index < 18; index++) {
    const x = ((index * 67 + 19) % Math.max(1, bounds.width));
    const y = index % 2 ? bounds.height * .18 : bounds.height * .82;
    context.fillStyle = index % 3 ? '#82966866' : '#efe1bc88';
    context.fillRect(x, y, 5, 3);
  }

  const combat = arena.combat;
  let attackerPosition = null;
  let targetPosition = null;
  let combatProgress = 0;
  if (combat) {
    const owner = combat.owner;
    const rival = owner.isAI ? state.player : state.enemy;
    const attacker = owner.board.find((item) => item.instanceId === combat.attackerId);
    if (attacker) {
      attackerPosition = arenaSlot(owner, attacker);
      targetPosition = combat.targetId
        ? arenaSlot(rival, rival.board.find((item) => item.instanceId === combat.targetId) || { instanceId: combat.targetId })
        : { x: bounds.width / 2, y: owner.isAI ? bounds.height - 36 : 36 };
      combatProgress = Math.min(1, Math.max(0, (time - combat.startedAt) / combat.duration));
      const travel = combatProgress < .62 ? combatProgress / .62 : (1 - combatProgress) / .38;
      attackerPosition = {
        x: attackerPosition.x + (targetPosition.x - attackerPosition.x) * travel,
        y: attackerPosition.y + (targetPosition.y - attackerPosition.y) * travel,
      };
    }
  }

  for (const owner of [state.enemy, state.player]) {
    if (!owner?.board) continue;
    owner.board.forEach((creature) => {
      if (combat?.attackerId === creature.instanceId && attackerPosition) {
        drawWarrior(creature, attackerPosition.x, attackerPosition.y, time, owner.isAI ? -1 : 1, 'attack', combatProgress);
        return;
      }
      if (combat?.targetId === creature.instanceId) {
        const position = arenaSlot(owner, creature);
        drawWarrior(creature, position.x, position.y, time, owner.isAI ? -1 : 1, 'hit');
        return;
      }
      const position = arenaSlot(owner, creature);
      drawWarrior(creature, position.x, position.y, time, owner.isAI ? -1 : 1, 'idle');
    });
  }
  if (combat && time - combat.startedAt >= combat.duration) arena.combat = null;
  window.requestAnimationFrame(drawBattlefield);
}

function startBattlefieldAnimation() {
  if (!arena.canvas || arena.rendering) return;
  arena.context ||= arena.canvas.getContext('2d');
  if (!arena.context) return;
  arena.rendering = true;
  window.requestAnimationFrame(drawBattlefield);
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}

function createPlayer(empire, isAI, difficulty) {
  const health = isAI ? difficulty.enemyHealth : 30;
  const supplies = isAI ? difficulty.enemySupplies : 2;
  return { empire, isAI, health, maxHealth: health, resources: makeCost(supplies, supplies, supplies), deck: buildEmpireDeck(empire), hand: [], board: [], fatigue: 0 };
}

function getCampaignDifficulty(campaign) {
  const streak = campaign.winStreak;
  return {
    ...campaign.difficulty,
    enemyHealth: campaign.difficulty.enemyHealth + streak * 6,
    enemySupplies: campaign.difficulty.enemySupplies + streak,
    aiTargetChance: Math.min(.98, campaign.difficulty.aiTargetChance + streak * .05),
  };
}

function startGame(empireId) {
  state.selectedEmpire = empires.find((empire) => empire.id === empireId);
  $('#chosen-empire-label').textContent = `${state.selectedEmpire.name} · ${state.selectedEmpire.region}`;
  $('#chosen-empire-label').style.color = state.selectedEmpire.color;
  $('#difficulty-screen').style.setProperty('--faction', state.selectedEmpire.color);
  screens.intro.hidden = true;
  screens.difficulty.hidden = false;
}

function multiplayerSocketUrl(path) {
  const endpoint = window.MULTIPLAYER_ENDPOINT?.trim();
  if (!endpoint) throw new Error('Online play is not configured yet. Follow the Multiplayer setup in README.md.');
  const url = new URL(endpoint);
  if (url.protocol === 'https:') url.protocol = 'wss:';
  else if (url.protocol === 'http:') url.protocol = 'ws:';
  if (url.protocol !== 'wss:' && url.protocol !== 'ws:') throw new Error('The multiplayer endpoint must use HTTPS or WSS.');
  if (window.location.protocol === 'https:' && url.protocol !== 'wss:') throw new Error('The multiplayer endpoint must use HTTPS on this page.');
  url.pathname = `${url.pathname.replace(/\/+$/, '')}${path}`;
  return url;
}

function setOnlineMode(enabled) {
  onlineSelection = enabled;
  const button = $('#online-mode-button');
  button.textContent = enabled ? 'CANCEL ONLINE MODE' : 'FIND AN ONLINE DUEL';
  $('#empire-grid').querySelectorAll('button').forEach((choice) => { choice.disabled = Boolean(onlineConnection?.queue); });
  if (!enabled) $('#online-status').textContent = '';
  else $('#online-status').textContent = 'Choose an empire above to join a one-on-one match.';
}

function startOnlineMatch(empireId) {
  let url;
  try {
    url = multiplayerSocketUrl('/match');
  } catch (error) {
    $('#online-status').textContent = error.message;
    setOnlineMode(false);
    $('#online-status').textContent = error.message;
    return;
  }
  onlineSelection = false;
  $('#empire-grid').querySelectorAll('button').forEach((choice) => { choice.disabled = true; });
  $('#online-mode-button').textContent = 'CANCEL SEARCH';
  $('#online-status').textContent = 'Connecting to matchmaking…';
  let socket;
  try { socket = new WebSocket(url); } catch {
    setOnlineMode(false);
    $('#online-status').textContent = 'Could not open matchmaking. Check the endpoint and try again.';
    return;
  }
  onlineConnection = { queue: socket, room: null };
  socket.addEventListener('open', () => {
    if (onlineConnection?.queue === socket) socket.send(JSON.stringify({ type: 'join', empireId }));
  });
  socket.addEventListener('message', (event) => {
    if (onlineConnection?.queue !== socket) return;
    let message;
    try { message = JSON.parse(event.data); } catch { return; }
    if (message.type === 'queued') $('#online-status').textContent = message.message;
    if (message.type === 'error') {
      $('#online-status').textContent = message.message;
      onlineConnection = null;
      setOnlineMode(false);
      $('#online-status').textContent = message.message;
    }
    if (message.type === 'matched') {
      const credentials = { roomId: message.roomId, token: message.token };
      sessionStorage.setItem('empires-online-match', JSON.stringify(credentials));
      onlineConnection = { queue: null, room: null };
      connectOnlineRoom(credentials);
    }
  });
  socket.addEventListener('error', () => {
    if (onlineConnection?.queue === socket) {
      onlineConnection = null;
      setOnlineMode(false);
      $('#online-status').textContent = 'Could not reach matchmaking. Check the endpoint and try again.';
    }
  });
  socket.addEventListener('close', () => {
    if (onlineConnection?.queue === socket) {
      onlineConnection = null;
      setOnlineMode(false);
    }
  });
}

function connectOnlineRoom(credentials) {
  let url;
  try {
    url = multiplayerSocketUrl(`/room/${encodeURIComponent(credentials.roomId)}`);
  } catch (error) {
    $('#online-status').textContent = error.message;
    return;
  }
  url.searchParams.set('token', credentials.token);
  $('#online-status').textContent = 'Connecting to your rival’s battlefield…';
  let socket;
  try { socket = new WebSocket(url); } catch {
    $('#online-status').textContent = 'Could not open the match connection. Reload to reconnect.';
    return;
  }
  onlineConnection = { queue: null, room: socket };
  socket.addEventListener('open', () => { $('#online-status').textContent = ''; });
  socket.addEventListener('message', (event) => {
    let message;
    try { message = JSON.parse(event.data); } catch { return; }
    if (message.type === 'state') renderOnlineState(message);
    else if (message.type === 'error') {
      state.busy = false;
      notify(message.message);
      refresh();
    } else if (message.type === 'opponent-disconnected') {
      notify(`Your rival lost connection. They have ${message.reconnectSeconds} seconds to return.`);
    } else if (message.type === 'opponent-connected') notify('Your rival has returned to the field.');
  });
  socket.addEventListener('close', () => {
    if (onlineConnection?.room === socket && state.started && !state.ended) {
      state.busy = true;
      refresh();
      notify('Connection lost. Reload this page within 90 seconds to reconnect.');
    }
  });
  socket.addEventListener('error', () => {
    if (onlineConnection?.room === socket) $('#online-status').textContent = 'Connection interrupted. Reload to reconnect.';
  });
}

function renderOnlineState(match) {
  const local = match.players[match.seat];
  const rival = match.players[1 - match.seat];
  state.player = { ...local, isAI: false };
  state.enemy = { ...rival, isAI: true, hand: [] };
  state.turn = match.turn === match.seat ? 'player' : 'enemy';
  state.round = match.round;
  state.gathered = state.turn === 'player' && match.gathered;
  state.busy = false;
  state.started = true;
  state.ended = Boolean(match.finished);
  state.selectedAttacker = null;
  screens.intro.hidden = true;
  screens.difficulty.hidden = true;
  screens.battle.hidden = false;
  startBattlefieldAnimation();
  updateHeader();
  $('#round-label').textContent = `ONLINE DUEL · ${roman(state.round)}`;
  $('#concede-button').disabled = state.ended;
  refresh();
  if (match.finished) {
    const victory = match.finished.winner === match.seat;
    const reason = match.finished.reason;
    $('#result-title').textContent = reason === 'abandoned' ? 'Duel Abandoned' : victory ? 'Victory' : 'Defeat';
    if (reason === 'abandoned') $('#result-copy').textContent = 'Both commanders lost connection. This duel has been closed.';
    else if (reason === 'disconnect') $('#result-copy').textContent = victory
      ? 'Your rival did not return to the field in time.'
      : 'You lost connection for too long and forfeited the duel.';
    else if (reason === 'surrender') $('#result-copy').textContent = victory
      ? 'Your rival surrendered the field.'
      : 'You surrendered the duel.';
    else $('#result-copy').textContent = victory
      ? 'The rival commander has fallen. You claim the crown.'
      : 'Your commander has fallen. The rival claims the crown.';
    $('#play-again').textContent = 'RETURN TO BANNERS →';
    $('#result-emblem').textContent = match.finished.winner === null ? '⚔' : victory ? state.player.empire.sigil : state.enemy.empire.sigil;
    if (!$('#result-dialog').open) $('#result-dialog').showModal();
  } else {
    if ($('#result-dialog').open) $('#result-dialog').close();
    notify(state.turn === 'player' ? 'Your move, commander.' : `${state.enemy.empire.name} is taking their turn.`);
  }
}

function sendOnlineAction(action) {
  const socket = onlineConnection?.room;
  if (!socket || socket.readyState !== WebSocket.OPEN || state.busy || state.ended) {
    notify('The battlefield is reconnecting. Please wait before moving.');
    return false;
  }
  state.busy = true;
  refresh();
  socket.send(JSON.stringify(action));
  return true;
}

function cancelOnlineSearch() {
  if (onlineConnection?.queue) {
    const socket = onlineConnection.queue;
    onlineConnection = null;
    socket.close();
  }
  setOnlineMode(false);
}

function chooseDifficulty(difficultyId) {
  const difficulty = difficulties.find((option) => option.id === difficultyId);
  state.campaign = {
    playerEmpire: state.selectedEmpire,
    difficulty,
    opponents: shuffle(empires.filter((empire) => empire.id !== state.selectedEmpire.id)),
    opponentIndex: 0,
    winStreak: 0,
    lastVictory: false,
  };
  startCampaignBattle();
}

function startCampaignBattle() {
  const campaign = state.campaign;
  if (!campaign) return;
  Object.assign(state, { started: true, ended: false, busy: false, turn: 'player', round: 0, selectedAttacker: null, gathered: false });
  campaign.currentDifficulty = getCampaignDifficulty(campaign);
  state.player = createPlayer(campaign.playerEmpire, false, campaign.currentDifficulty);
  state.enemy = createPlayer(campaign.opponents[campaign.opponentIndex], true, campaign.currentDifficulty);
  drawUntilHandSize(state.player);
  drawUntilHandSize(state.enemy);
  screens.difficulty.hidden = true;
  screens.battle.hidden = false;
  startBattlefieldAnimation();
  if ($('#result-dialog').open) $('#result-dialog').close();
  updateHeader();
  refresh();
  beginTurn(state.player);
  if (campaign.opponentIndex === 0) playSound('start');
}

function drawCard(owner) {
  if (!owner.deck.length) {
    owner.fatigue += 1;
    owner.health -= owner.fatigue;
    notify(`${owner.empire.name} takes ${owner.fatigue} fatigue damage.`);
    return false;
  }
  const card = owner.deck.pop();
  if (card.kind === 'Resource') {
    owner.resources[card.resource] += card.amount;
    notify(`${card.name}: gained ${card.amount} ${card.resource}.`);
    playSound('resource');
  } else if (owner.hand.length < 10) {
    owner.hand.push(card);
    playSound('draw');
  }
  else notify(`${card.name} was lost; your hand is full.`);
  return true;
}

function drawUntilHandSize(owner, handSize = 5) {
  while (owner.hand.length < handSize && owner.deck.length) drawCard(owner);
  if (owner.hand.length < handSize && !owner.deck.length) drawCard(owner);
}

function beginTurn(owner) {
  if (state.ended) return;
  state.turn = owner.isAI ? 'enemy' : 'player';
  state.round += owner.isAI ? 0 : 1;
  state.gathered = false;
  owner.board.forEach((creature) => { creature.canAttack = true; creature.bonusAttack = 0; });
  playSound('turn');
  drawUntilHandSize(owner);
  state.selectedAttacker = null;
  $('#round-label').textContent = `EMPIRE ${state.campaign.opponentIndex + 1}/5 · ${state.campaign.currentDifficulty.name.toUpperCase()} · STREAK ${state.campaign.winStreak}`;
  notify(owner.isAI ? `${owner.empire.name} is taking its turn` : 'Your move, commander');
  refresh();
  if (owner.isAI) window.setTimeout(runAiTurn, 650);
}

function roman(number) { return ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][Math.min(number, 10)]; }
function factionStyle(empire) { return `--faction:${empire.color}`; }

function applyEmpireTheme() {
  const battleScreen = $('#battle-screen');
  if (!battleScreen || !state.player || !state.enemy) return;
  battleScreen.style.setProperty('--player-color', state.player.empire.color);
  battleScreen.style.setProperty('--enemy-color', state.enemy.empire.color);
}

function updateHeader() {
  const { player, enemy } = state;
  $('#match-label').textContent = `${player.empire.name.toUpperCase()} VS ${enemy.empire.name.toUpperCase()}`;
  $('#player-name').textContent = player.empire.name;
  $('#enemy-name').textContent = enemy.empire.name;
  $('#player-portrait').textContent = player.empire.sigil;
  $('#player-portrait').style.backgroundColor = player.empire.color;
  $('#enemy-portrait').textContent = enemy.empire.sigil;
  $('#enemy-portrait').style.backgroundColor = enemy.empire.color;
  applyEmpireTheme();
}

function makeEmpireChoice(empire, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'empire-choice';
  button.style.setProperty('--faction', empire.color);
  button.setAttribute('aria-label', `Play as ${empire.name}`);
  button.innerHTML = `<span class="choice-top"><span class="choice-sigil">${empire.sigil}</span><span class="choice-number">0${index + 1}</span></span><span class="choice-name">${empire.name}</span><span class="choice-region">${empire.region}</span>`;
  button.addEventListener('click', () => onlineSelection ? startOnlineMatch(empire.id) : startGame(empire.id));
  return button;
}

function renderCost(cost) {
  return resourceNames.filter((resource) => cost[resource] > 0).map((resource) => `<span class="cost-item"><i class="resource-icon ${resource}-icon">${resourceMarks[resource]}</i>${cost[resource]}</span>`).join('');
}

function canAfford(owner, card) { return resourceNames.every((resource) => owner.resources[resource] >= card.cost[resource]); }

function artSeed(card) {
  return `${card.empire.id}:${card.id}`.split('').reduce((seed, character) => Math.imul(seed ^ character.charCodeAt(0), 16777619), 2166136261) >>> 0;
}

function makePixelArt(card, compact = false) {
  const seed = artSeed(card);
  const palette = {
    british: ['#ed664b', '#ffc857', '#fff0a8', '#47395c', '#42b6a5'],
    mongol: ['#df753b', '#ffd166', '#fff0a3', '#4b3545', '#83bd68'],
    russian: ['#427e9c', '#f2c14e', '#f7edcf', '#493b5a', '#79b777'],
    qing: ['#e14b5a', '#ffcf5a', '#fff0a5', '#333f68', '#58c7ad'],
    spanish: ['#e44d47', '#ffc857', '#fff0a3', '#47415f', '#58aa72'],
    french: ['#477ec5', '#f3c34b', '#fff0a8', '#453856', '#eb6b6b'],
  }[card.empire.id] || ['#ed664b', '#ffc857', '#fff0a8', '#47395c', '#42b6a5'];
  const [sky, gold, light, shadow, green] = palette;
  const width = 16;
  const cell = compact ? 4 : 6;
  const height = 12;
  const blocks = [];
  const rect = (x, y, color, w = 1, h = 1) => blocks.push(`<rect x="${x * cell}" y="${y * cell}" width="${w * cell}" height="${h * cell}" fill="${color}"/>`);
  const landscape = seed % 3;
  const scene = [sky, '#75cbd0', '#e7965c', '#8ac66b', '#4d527a', '#f5bc60'][(seed >>> 4) % 6];
  blocks.push(`<rect width="${width * cell}" height="${height * cell}" fill="${scene}"/>`);
  for (let x = 0; x < width; x += 2) rect(x, 2 + ((x + landscape) % 3), light);
  rect(1, 2, gold, 2, 2);
  for (let x = 0; x < width; x++) rect(x, 9 + ((x + landscape) % 2), [green, '#53a987', '#408e9b'][landscape], 1, height);
  rect(0, 11, shadow, width, 1);

  const drawRows = (rows, colors, offsetY = 0) => rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => { if (pixel !== '.') rect(x + Math.floor((width - row.length) / 2), y + offsetY, colors[pixel]); });
  });
  const type = card.kind === 'Resource' ? 'harvest' : card.kind === 'Spell' ? card.effect : 'creature';
  if (card.kind === 'Creature' && card.species) {
    const beasts = {
      lion: ['....GGGG....', '..GGGGGGGG..', '.GGCCCCCCGG.', '.GCCCCCCCCG.', '..CCCCCCCC..', '..CCCDCCCCC.', '.CCCCC.CCC..', '..CCC...CC..', '.CC.C...C.C.'],
      stag: ['.....DD.....', '...D.DD.D...', '....GGGG....', '...GCCCCG...', '..GCCCCCCG..', '..CCCCCCCC..', '..CCC.DCCC..', '...CC..CC...', '..CC....CC..'],
      wolf: ['..D........D.', '.DDD......DDD', '.DCCCCCCCCDD.', '..CCCCCCCCCC.', '..CCCDCCCCCC.', '..CCCCCCCCCC.', '...CCCCCCC...', '...CC...CC....'],
      eagle: ['......DD......', '.....DGGD.....', '....DDGGDD....', '..DDDDGGDDDD..', '.DCCCCGGCCCCD.', '..CCCCGGCCCC..', '.....DGGD.....', '....DD..DD....'],
      bear: ['....DDDDDD....', '..DDCCCCCCDD..', '.DCCCCCCCCCCD.', '.DCCCDCCCDCCCD.', '..CCCCCCCCCC..', '..CCCDCCCCCC..', '.CCCCCCCCCCCC.', '..CCC....CCC..'],
      dragon: ['....DD..DD....', '..DDCCCCCCDD..', '.DCCCCGGCCCCD.', '..CCCCCCCCCC..', '...CCCDCCCC...', '..CCCCC.CCCC..', '.DD...C..C...DD', '......DDDD....'],
      lynx: ['..D........D..', '.DDD......DDD.', '.DCCCCCCCCCCCD.', '..CCCCCCCCCC...', '..CCCDCCCCCC...', '..CCCCCCCCCCC..', '...CCCCCCCC....', '...CC....CC.....'],
      bison: ['....DDDDDD....', '..DDCCCCCCDD..', '.DCCCCCCCCCCD.', '.DCCCDCCCCCCD.', '..CCCCCCCCCC..', '..CCCCCCCCCC..', '...CCCCC.CCC...', '..CC....CC......'],
      owl: ['.....DDDD.....', '....DGGGGD....', '...DCCCCCCD...', '..DCCCDCCCDCC..', '..DCCGGGGCCCD..', '...DCCCCCCD....', '....CCCCCC.....', '...CC....CC....'],
    };
    drawRows(beasts[card.species] || beasts.wolf, { D: shadow, C: sky, G: gold }, 2);
    rect(10, 7, light);
    if (card.species === 'stag') { rect(4, 1, gold); rect(10, 1, gold); }
    if (card.species === 'eagle' || card.species === 'owl') rect(7, 6, '#e99b36', 2, 1);
  } else if (card.kind === 'Creature') {
    const name = card.name.toLowerCase();
    const horse = /rider|foal|horde|elephant|khan/.test(name);
    const archer = card.weapon === 'bow' || /archer|scout|bow/.test(name);
    const armorTone = card.armor === 'plate armor' ? '#bdc9ca' : card.armor === 'chain mail' ? '#82939a' : sky;
    if (horse) {
      drawRows(['......DD....', '.....DGGD...', '.....DDDD...', '..DDDDDDDDD.', '.DDAAAAAAAAD', 'DDAAAAAADDDD', '.DDAAAADDD...', '..DDD.DD.....', '..DD..D.D....', '.DDD..DDD....'], { D: shadow, A: gold, G: light });
    } else {
      drawRows(['.....DDDD....', '....DGGGGD...', '....DGSSGD...', '.....DDDD....', '..DDDDDDDD...', '.DDAAAAAADD..', '.DAAMAAAAD...', '..DAAAAAAD...', '...DD..DD....', '...DD..DD....', '..DDD..DDD...', '..DDD..DDD...'], { D: shadow, A: armorTone, G: gold, S: light, M: archer ? '#f7e16b' : green });
    }
    if (card.headwear === 'crown and helm') {
      rect(6, 0, gold); rect(8, 0, gold); rect(5, 1, gold, 5, 1);
    } else if (card.headwear?.includes('fur')) {
      rect(5, 1, light, 5, 1); rect(6, 0, sky, 3, 1);
    } else if (card.headwear?.includes('plumed')) {
      rect(7, 0, '#e65d48', 2, 2); rect(5, 2, gold, 5, 1);
    }
    if (card.weapon === 'bow') {
      rect(12, 2, gold); rect(11, 3, gold); rect(10, 4, gold); rect(9, 5, gold);
    } else if (card.weapon === 'lance') {
      rect(11, 4, '#8c6040', 1, 5); rect(12, 3, light, 1, 1); rect(12, 2, gold, 1, 1);
    } else if (card.weapon === 'axe') {
      rect(12, 5, '#8c6040', 1, 4); rect(11, 3, light, 3, 2); rect(13, 4, gold);
    } else if (card.weapon === 'sword-shield') {
      rect(12, 4, '#8c6040', 1, 4); rect(11, 3, light, 3, 1); rect(4, 7, sky, 2, 2);
    } else {
      rect(11, 5, light, 1, 3); rect(12, 4, gold); rect(12, 8, gold);
    }
    for (let star = 0; star < card.attack % 3; star++) rect(1 + star * 2, 3, gold);
  } else if (type === 'harvest') {
    if (card.resource === 'wood') drawRows(['.....LLL....', '....LLLLL...', '...LLLLLLL..', '..LLLLLLLLL.', '.....WWW....', '.....WWW....', '...WWWWWWW..'], { L: green, W: '#8c503e' }, 1);
    else if (card.resource === 'stone') drawRows(['......TT....', '.....TTTT...', '....TTTTTT..', '...TTTTTTTT.', '..TTTTTTTTTT'], { T: '#c7d5d4' }, 3);
    else drawRows(['......LL....', '......LL....', '.....LLL....', '....LLLL....', '......WW....', '......WW....'], { L: gold, W: green }, 3);
  } else if (type === 'heal') {
    drawRows(['......GG....', '......GG....', '...GGGGGGGG..', '...GGGGGGGG..', '......GG....', '......GG....'], { G: light }, 3);
  } else if (type === 'damage' || type === 'storm') {
    drawRows(['......RR....', '.....RYYR...', '....RYMMYR..', '....RMMMMR..', '...RMMMMMMR.', '..RRMMMMMMRR', '...RRMMMMRR.'], { R: '#df4d44', Y: gold, M: light }, 2);
    rect(2, 2, light); rect(12, 4, gold); rect(3, 7, '#fff0a8');
  } else if (type === 'rally') {
    drawRows(['....DDDD....', '...DAAAD....', '...DAAAD....', '...DDDDD....', '....DDD.....', '....DDD.....'], { D: shadow, A: sky }, 3);
    rect(6, 2, '#ed5d57', 3, 3); rect(6, 2, gold); rect(8, 3, gold); rect(7, 4, gold);
  } else {
    drawRows(['...DDDDDD...', '..DAAAAAAD..', '.DAAGGGAAAD.', '.DAAGGGAAAD.', '.DAAAAAAAAD.', '..DAAAAAAD..', '...DDDDDD...'], { D: shadow, A: sky, G: gold }, 2);
    rect(7, 5, light, 2, 2);
  }
  const sparkleCount = 2 + (seed % 4);
  for (let index = 0; index < sparkleCount; index++) {
    const x = (seed >>> (index * 5)) % width;
    const y = ((seed >>> (index * 3 + 2)) % 5) + 1;
    rect(x, y, index % 2 ? gold : light);
  }
  const svg = `<svg class="pixel-art${compact ? ' pixel-art-compact' : ''}" viewBox="0 0 ${width * cell} ${height * cell}" role="img" aria-hidden="true" shape-rendering="crispEdges">${blocks.join('')}</svg>`;
  const wrapper = document.createElement('span');
  wrapper.className = 'pixel-art-frame';
  wrapper.innerHTML = svg;
  return wrapper;
}

function makeHandCard(card) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `hand-card${card.kind === 'Spell' ? ' spell-card' : ''}`;
  button.draggable = card.kind === 'Creature' && window.matchMedia('(pointer: fine)').matches;
  button.style.cssText = factionStyle(card.empire);
  button.disabled = state.turn !== 'player' || state.busy || !canAfford(state.player, card) || state.player.board.length >= 5 && card.kind === 'Creature';
  button.setAttribute('aria-label', `${card.name}, ${card.kind}. Costs ${resourceNames.filter((resource) => card.cost[resource]).map((resource) => `${card.cost[resource]} ${resource}`).join(', ')}. ${card.text}${card.kind === 'Creature' ? ` Attack ${card.attack}, health ${card.health}, defense ${card.defense}.` : ''}`);
  button.innerHTML = `<span class="hand-card-top"><span class="hand-symbol">${card.glyph}</span><span class="choice-number">${card.empire.sigil}</span></span>`;
  button.append(makePixelArt(card), document.createRange().createContextualFragment(`<span class="hand-name">${card.name}</span><span class="hand-kind">${card.kind}</span>${card.weaponName ? `<span class="hand-weapon">⚔ ${card.weaponName}${card.mounted ? ' · Mounted' : ''}</span><span class="hand-feature">${card.species ? `${card.species} · ${card.armor}` : `${card.armor} · ${card.headwear}`}</span>` : ''}<span class="hand-cost">${renderCost(card.cost)}</span><span class="hand-description">${card.text}</span>${card.kind === 'Creature' ? `<span class="hand-stats"><span>⚔ ${card.attack}</span><span>♥ ${card.health}</span><span>⬡ ${card.defense}</span></span>` : ''}`));
  button.addEventListener('dragstart', (event) => {
    if (card.kind !== 'Creature' || state.turn !== 'player' || state.busy || !canAfford(state.player, card) || state.player.board.length >= 5) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('text/plain', card.instanceId);
    event.dataTransfer.effectAllowed = 'move';
  });
  button.addEventListener('click', () => playCard(card, state.player));
  return button;
}

function makeBoardCard(creature, owner) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `board-card${creature.canAttack ? '' : ' sleeping'}${state.selectedAttacker === creature.instanceId ? ' selected' : ''}`;
  button.style.cssText = factionStyle(creature.empire);
  button.dataset.cardInstance = creature.instanceId;
  const attack = creature.attack + (creature.bonusAttack || 0);
  button.setAttribute('aria-label', `${creature.name}: attack ${attack}, health ${creature.health}, defense ${creature.defense}${creature.canAttack ? ', ready to attack' : ', cannot attack yet'}`);
  button.innerHTML = `<span class="board-top"><span class="card-sigil">${creature.glyph}</span></span>`;
  button.append(makePixelArt(creature, true), document.createRange().createContextualFragment(`<span class="board-name">${creature.name}</span><span class="board-weapon">${creature.species ? `${creature.species} · ${creature.armor}` : `${creature.weaponName} · ${creature.headwear}`}</span><span class="board-stats"><span>⚔ ${attack}</span><span>♥ ${creature.health}</span><span>⬡ ${creature.defense}</span></span>`));
  button.addEventListener('click', () => handleCreatureClick(creature, owner));
  return button;
}

function renderBoard(element, owner, label) {
  element.replaceChildren();
  element.classList.toggle('drop-zone', !owner.isAI && state.turn === 'player' && !state.busy && owner.board.length < 5);
  const heading = document.createElement('span');
  heading.className = 'battlefield-label';
  heading.textContent = owner.isAI ? 'RIVAL BATTLEFIELD' : 'YOUR BATTLEFIELD';
  element.append(heading);
  if (!owner.board.length) {
    const empty = document.createElement('span');
    empty.className = 'board-empty';
    empty.textContent = owner.isAI ? label : 'Drop a creature here or play it from your hand';
    element.append(empty);
    return;
  }
  owner.board.forEach((creature) => element.append(makeBoardCard(creature, owner)));
}

function renderResources(owner, targetSelector) {
  const target = $(targetSelector);
  target.replaceChildren(...resourceNames.map((resource) => {
    const entry = document.createElement('span');
    entry.className = 'resource-count';
    entry.setAttribute('aria-label', `${owner.resources[resource]} ${resource}`);
    entry.innerHTML = `<i class="resource-icon ${resource}-icon">${resourceMarks[resource]}</i>${owner.resources[resource]}`;
    return entry;
  }));
}

function refresh() {
  if (!state.started) return;
  for (const [owner, prefix] of [[state.player, 'player'], [state.enemy, 'enemy']]) {
    $(`#${prefix}-health`).textContent = Math.max(0, owner.health);
    $(`#${prefix}-health-bar`).style.width = `${Math.max(0, Math.min(100, owner.health / owner.maxHealth * 100))}%`;
    $(`#${prefix}-deck`).textContent = `${owner.deck.length} CARDS`;
    renderResources(owner, `#${prefix}-resources`);
  }
  renderBoard($('#player-board'), state.player, 'No company on the field');
  renderBoard($('#enemy-board'), state.enemy, 'The rival has no creatures');
  $('#hand').replaceChildren(...state.player.hand.map(makeHandCard));
  $('#hand-count').textContent = `${state.player.hand.length} CARD${state.player.hand.length === 1 ? '' : 'S'}`;
  document.querySelectorAll('.harvest-button').forEach((button) => { button.disabled = state.turn !== 'player' || state.gathered || state.busy || state.ended; });
  $('#gather-status').textContent = state.gathered ? 'SUPPLIES GATHERED' : 'ONE GATHER PER TURN';
  $('#end-turn').disabled = state.turn !== 'player' || state.busy || state.ended;
  $('#player-hero').classList.toggle('attacking', Boolean(state.selectedAttacker));
}

function notify(message) {
  const status = $('#turn-message');
  status.textContent = message;
  status.classList.toggle('ai-thinking', state.turn === 'enemy' && !state.ended);
}
function gather(owner, resource) {
  owner.resources[resource] += 2;
  playSound('gather');
}

function gatherForPlayer(resource) {
  if (state.turn !== 'player' || state.gathered || state.busy || state.ended) return;
  if (onlineConnection?.room) return sendOnlineAction({ type: 'gather', resource });
  gather(state.player, resource);
  state.gathered = true;
  notify(`Your stores gain 2 ${resource}.`);
  refresh();
}

function playCard(card, owner) {
  if (state.ended || state.busy || !canAfford(owner, card)) return;
  if (owner.isAI && state.turn !== 'enemy' || !owner.isAI && state.turn !== 'player') return;
  if (onlineConnection?.room) return sendOnlineAction({ type: 'play', cardId: card.instanceId });
  if (card.kind === 'Creature' && owner.board.length >= 5) return notify('Your company is full.');
  if ((card.effect === 'rally' || card.effect === 'ward') && !owner.board.length) return notify('You need a creature on the field for that spell.');
  resourceNames.forEach((resource) => { owner.resources[resource] -= card.cost[resource]; });
  owner.hand = owner.hand.filter((item) => item.instanceId !== card.instanceId);
  if (card.kind === 'Creature') {
    owner.board.push({ ...card, canAttack: false, bonusAttack: 0 });
    playSound('play');
    notify(`${card.name} joins ${owner.isAI ? 'the rival' : 'your'} company.`);
  } else {
    playSound('spell');
    applySpell(card, owner);
  }
  refresh();
  checkWinner();
}

function applySpell(card, caster) {
  const rival = caster.isAI ? state.player : state.enemy;
  const friendliest = caster.board.reduce((target, creature) => !target || creature.health < target.health ? creature : target, null);
  const mostWounded = rival.board.reduce((target, creature) => !target || creature.health < target.health ? creature : target, null);
  if (card.effect === 'harvest') caster.resources[card.resource] += card.amount;
  if (card.effect === 'heal') caster.health = Math.min(caster.maxHealth, caster.health + card.amount);
  if (card.effect === 'damage') { if (mostWounded) damageCreature(mostWounded, card.amount); else rival.health -= card.amount; }
  if (card.effect === 'rally' && friendliest) friendliest.bonusAttack = (friendliest.bonusAttack || 0) + card.amount;
  if (card.effect === 'ward' && friendliest) { friendliest.health += card.amount; friendliest.defense += 1; }
  if (card.effect === 'storm') rival.board.slice().forEach((creature) => damageCreature(creature, card.amount));
  notify(`${card.name} takes effect.`);
}

function damageCreature(creature, amount) {
  if (!creature) return;
  creature.health -= Math.max(1, amount - creature.defense);
  if (creature.health <= 0) {
    for (const owner of [state.player, state.enemy]) owner.board = owner.board.filter((item) => item.instanceId !== creature.instanceId);
    notify(`${creature.name} leaves the field.`);
  }
}

function handleCreatureClick(creature, owner) {
  if (state.ended || state.busy) return;
  if (owner === state.player && state.turn === 'player') {
    if (!creature.canAttack) return notify('That creature cannot attack until your next turn.');
    state.selectedAttacker = state.selectedAttacker === creature.instanceId ? null : creature.instanceId;
    playSound('select');
    notify(state.selectedAttacker ? 'Choose a rival creature or commander to attack.' : 'Attack selection cleared.');
    refresh();
  } else if (owner === state.enemy && state.turn === 'player' && state.selectedAttacker) {
    const attacker = state.player.board.find((item) => item.instanceId === state.selectedAttacker);
    if (attacker) attack(attacker, creature);
  }
}

function attack(attacker, target, owner = state.player) {
  if (!attacker.canAttack || state.busy) return false;
  if (onlineConnection?.room) {
    playSound('attack');
    return sendOnlineAction({ type: 'attack', attackerId: attacker.instanceId, targetId: target?.instanceId ?? null });
  }
  state.busy = true;
  $('#end-turn').disabled = true;
  attacker.canAttack = false;
  state.selectedAttacker = null;
  const strength = attacker.attack + (attacker.bonusAttack || 0);
  const rival = owner.isAI ? state.player : state.enemy;
  const attackerElement = document.querySelector(`[data-card-instance="${attacker.instanceId}"]`);
  const targetElement = target
    ? document.querySelector(`[data-card-instance="${target.instanceId}"]`)
    : $(`#${owner.isAI ? 'player' : 'enemy'}-hero`);
  const divider = $('.field-divider');
  const duration = 1700;
  arena.combat = { owner, attackerId: attacker.instanceId, targetId: target?.instanceId, startedAt: performance.now(), duration };
  attackerElement?.classList.add('combat-attacker');
  targetElement?.classList.add('combat-defender');
  divider.classList.add('combat-active');
  playSound('attack');
  window.setTimeout(() => playSound('impact'), duration * .64);
  notify('THE CLASH!');
  return new Promise((resolve) => window.setTimeout(() => {
    let result;
    if (target) {
      const retaliation = target.attack + (target.bonusAttack || 0);
      const dealt = Math.max(1, strength - target.defense);
      const received = Math.max(1, retaliation - attacker.defense);
      damageCreature(target, strength);
      if (owner.board.includes(attacker)) damageCreature(attacker, retaliation);
      const attackerSurvives = owner.board.includes(attacker);
      const targetSurvives = rival.board.includes(target);
      if (attackerSurvives && !targetSurvives) result = `${attacker.name} wins the clash!`;
      else if (!attackerSurvives && targetSurvives) result = `${target.name} wins the clash!`;
      else if (!attackerSurvives && !targetSurvives) result = 'Both creatures fall in the clash.';
      else result = dealt > received ? `${attacker.name} wins the exchange!` : `${target.name} holds the field!`;
    } else {
      rival.health -= strength;
      result = `${attacker.name} strikes for ${strength} damage!`;
    }
    arena.combat = null;
    state.busy = false;
    attackerElement?.classList.remove('combat-attacker');
    targetElement?.classList.remove('combat-defender');
    divider.classList.remove('combat-active');
    refresh();
    if (!checkWinner()) announceCombatResult(result);
    resolve();
  }, duration));
}

function announceCombatResult(message) {
  const status = $('#turn-message');
  status.textContent = message;
  status.classList.remove('combat-result');
  void status.offsetWidth;
  status.classList.add('combat-result');
  window.setTimeout(() => status.classList.remove('combat-result'), 1400);
}

function checkWinner() {
  if (state.player.health <= 0) return finishGame(false);
  if (state.enemy.health <= 0) return finishGame(true);
  return false;
}

function finishGame(victory) {
  state.ended = true;
  state.campaign.lastVictory = victory;
  state.campaign.winStreak = victory ? state.campaign.winStreak + 1 : 0;
  playSound(victory ? 'win' : 'defeat');
  state.selectedAttacker = null;
  const beaten = state.campaign.opponentIndex + 1;
  const nextOpponent = state.campaign.opponents[state.campaign.opponentIndex + 1];
  const nextDifficulty = nextOpponent ? getCampaignDifficulty(state.campaign) : null;
  $('#result-title').textContent = victory ? nextOpponent ? `${beaten} of 5 victories` : 'Campaign Complete' : 'Defeat';
  $('#result-copy').textContent = victory
    ? nextOpponent
      ? `${state.enemy.empire.name} has fallen. Your streak is ${state.campaign.winStreak}. ${nextOpponent.name} now fields ${nextDifficulty.enemyHealth} health and ${nextDifficulty.enemySupplies} of each supply.`
      : `${state.player.empire.name} has defeated all five rival empires and claimed the crown.`
    : `${state.enemy.empire.name} has taken the field. Your win streak resets; retry this dynasty at your chosen starting difficulty.`;
  $('#play-again').innerHTML = victory
    ? nextOpponent ? `NEXT EMPIRE: ${nextOpponent.name} <span>→</span>` : 'CHOOSE ANOTHER EMPIRE <span>→</span>'
    : 'RETRY THIS EMPIRE <span>↻</span>';
  $('#result-emblem').textContent = victory ? state.player.empire.sigil : state.enemy.empire.sigil;
  $('#result-dialog').showModal();
  refresh();
}

function endPlayerTurn() {
  if (state.turn !== 'player' || state.busy || state.ended) return;
  if (onlineConnection?.room) return sendOnlineAction({ type: 'end-turn' });
  state.selectedAttacker = null;
  beginTurn(state.enemy);
}

function totalCost(cost) { return resourceNames.reduce((total, resource) => total + cost[resource], 0); }
function waitFor(milliseconds) { return new Promise((resolve) => window.setTimeout(resolve, milliseconds)); }

async function runAiTurn() {
  if (state.ended) return;
  const enemy = state.enemy;
  await waitFor(450);
  if (state.ended) return;
  if (!state.gathered) {
    const nextAffordable = enemy.hand.filter((card) => card.kind === 'Creature' && enemy.board.length < 5).sort((a, b) => totalCost(a.cost) - totalCost(b.cost))[0];
    const resourceToGather = nextAffordable ? resourceNames.reduce((best, resource) => nextAffordable.cost[resource] - enemy.resources[resource] > nextAffordable.cost[best] - enemy.resources[best] ? resource : best, resourceNames[0]) : 'food';
    notify(`${enemy.empire.name} gathers ${resourceToGather}.`);
    await waitFor(700);
    if (state.ended) return;
    gather(enemy, resourceToGather);
    state.gathered = true;
  }
  const affordable = enemy.hand.filter((card) => canAfford(enemy, card)).sort((a, b) => totalCost(b.cost) - totalCost(a.cost));
  for (const card of affordable) {
    if ((card.effect === 'rally' || card.effect === 'ward') && !enemy.board.length) continue;
    notify(`${enemy.empire.name} plays ${card.name}.`);
    await waitFor(650);
    if (state.ended) return;
    playCard(card, enemy);
    if (state.ended) return;
  }
  const attacker = enemy.board.find((creature) => creature.canAttack);
  if (attacker) {
    const target = state.player.board.length && Math.random() < state.campaign.difficulty.aiTargetChance
      ? state.player.board.reduce((weakest, creature) => creature.health < weakest.health ? creature : weakest, state.player.board[0])
      : null;
    notify(`${enemy.empire.name} readies ${attacker.name} to attack.`);
    await waitFor(550);
    if (state.ended) return;
    await attack(attacker, target, enemy);
  }
  if (state.ended) return;
  notify(`${enemy.empire.name} ends their turn.`);
  await waitFor(550);
  if (state.ended) return;
  refresh();
  if (!checkWinner()) window.setTimeout(() => beginTurn(state.player), 500);
}

function returnToSelection() {
  if (onlineConnection?.queue) onlineConnection.queue.close();
  if (onlineConnection?.room) onlineConnection.room.close();
  onlineConnection = null;
  $('#empire-grid').querySelectorAll('button').forEach((choice) => { choice.disabled = false; });
  sessionStorage.removeItem('empires-online-match');
  onlineSelection = false;
  $('#online-mode-button').textContent = 'FIND AN ONLINE DUEL';
  $('#online-status').textContent = '';
  state.ended = false;
  state.started = false;
  state.campaign = null;
  state.selectedEmpire = null;
  $('#result-dialog').close();
  screens.battle.hidden = true;
  screens.difficulty.hidden = true;
  screens.intro.hidden = false;
  screens.intro.classList.remove('screen');
  void screens.intro.offsetWidth;
  screens.intro.classList.add('screen');
}

function handleCampaignResult() {
  if (!state.campaign) return returnToSelection();
  if (!state.campaign.lastVictory) return startCampaignBattle();
  if (state.campaign.opponentIndex < state.campaign.opponents.length - 1) {
    state.campaign.opponentIndex += 1;
    startCampaignBattle();
    return;
  }
  returnToSelection();
}

function makeDifficultyChoice(option, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'difficulty-choice';
  button.style.setProperty('--difficulty-color', option.color);
  button.innerHTML = `<small>ROUTE 0${index + 1}</small><strong>${option.name}</strong><span>${option.summary}</span>`;
  button.addEventListener('click', () => chooseDifficulty(option.id));
  return button;
}

$('.rule-note').textContent = 'Start with 5 cards. At the start of each turn, draw until your hand has 5 cards. Each 100-card deck has 20 food, 20 wood, 20 stone, 30 creature, and 10 spell cards. Supply cards grant 2 resources when drawn.';
$('#empire-grid').replaceChildren(...empires.map(makeEmpireChoice));
$('#difficulty-grid').replaceChildren(...difficulties.map(makeDifficultyChoice));
$('#rules-button').addEventListener('click', () => $('#rules-dialog').showModal());
$('#online-mode-button').addEventListener('click', () => {
  if (onlineConnection?.queue) cancelOnlineSearch();
  else setOnlineMode(!onlineSelection);
});
$('#difficulty-back').addEventListener('click', () => {
  screens.difficulty.hidden = true;
  screens.intro.hidden = false;
});
$('#end-turn').addEventListener('click', endPlayerTurn);
$('.harvest-row').addEventListener('click', (event) => {
  const button = event.target.closest('[data-resource]');
  if (button) gatherForPlayer(button.dataset.resource);
});
$('#player-board').addEventListener('dragover', (event) => {
  if (state.turn !== 'player' || state.busy || state.player.board.length >= 5) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  $('#player-board').classList.add('drag-over');
});
$('#player-board').addEventListener('dragleave', (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) $('#player-board').classList.remove('drag-over');
});
$('#player-board').addEventListener('drop', (event) => {
  event.preventDefault();
  $('#player-board').classList.remove('drag-over');
  const card = state.player.hand.find((item) => item.instanceId === event.dataTransfer.getData('text/plain'));
  if (card?.kind === 'Creature') playCard(card, state.player);
});
$('#concede-button').addEventListener('click', () => {
  if (!state.started || state.ended) return;
  if (onlineConnection?.room) sendOnlineAction({ type: 'surrender' });
  else finishGame(false);
});
$('#play-again').addEventListener('click', handleCampaignResult);
$('#enemy-hero').addEventListener('click', () => {
  if (state.turn !== 'player' || !state.selectedAttacker || state.busy) return;
  const attacker = state.player.board.find((creature) => creature.instanceId === state.selectedAttacker);
  if (attacker) attack(attacker, null);
});
$('#enemy-hero').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $('#enemy-hero').click(); }
});
$('#result-dialog').addEventListener('close', () => {
  if (state.ended) returnToSelection();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && $('#rules-dialog').open) $('#rules-dialog').close();
});

window.addEventListener('resize', () => {
  if (arena.rendering) window.requestAnimationFrame(drawBattlefield);
});

const savedOnlineMatch = sessionStorage.getItem('empires-online-match');
if (savedOnlineMatch) {
  try {
    const credentials = JSON.parse(savedOnlineMatch);
    if (typeof credentials.roomId !== 'string' || typeof credentials.token !== 'string') throw new Error('Invalid saved match.');
    connectOnlineRoom(credentials);
  } catch {
    sessionStorage.removeItem('empires-online-match');
    $('#online-status').textContent = 'Could not restore the previous online match. Choose a banner to start again.';
  }
}
