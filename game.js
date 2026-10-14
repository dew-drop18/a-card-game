const empires = [
  { id: 'british', name: 'British Empire', region: 'The Isles', color: '#a94b38', sigil: 'L', trait: 'Redoubtable Guard', spellPrefix: 'Crown', units: ['Crown Squire', 'Longbow Scout', 'Tower Guard', 'Whitecliff Knight', 'Border Rider', 'Royal Archer', 'Stonekeep Warden', 'Lionheart', 'Red Banner Captain', 'Crown Champion'] },
  { id: 'mongol', name: 'Mongol Empire', region: 'The Steppe', color: '#aa7933', sigil: 'ᛟ', trait: 'Riders of the Steppe', spellPrefix: 'Steppe', units: ['Steppe Foal', 'Wind Scout', 'Keshig Guard', 'Wolf-Rider', 'Falcon Archer', 'Khanate Lancer', 'Golden Horde', 'Ordu Champion', 'Eagle Standard', 'Great Khan'] },
  { id: 'russian', name: 'Russian Empire', region: 'The North', color: '#536d52', sigil: '✥', trait: 'Keepers of the North', spellPrefix: 'Winter', units: ['Snowland Squire', 'Pinewood Scout', 'Ironwall Guard', 'Winter Knight', 'Cossack Rider', 'Frost Archer', 'Bearskin Warden', 'White Tsar', 'North Banner Captain', 'Rus Champion'] },
  { id: 'qing', name: 'Qing Dynasty', region: 'The East', color: '#398078', sigil: '龍', trait: 'Jade Court', spellPrefix: 'Jade', units: ['Jade Page', 'Cloud Scout', 'Dragon Guard', 'Bannerman Knight', 'Swift Lancer', 'Silk Archer', 'Jadewall Sentinel', 'Azure General', 'Imperial Standard', 'Dragon Emperor'] },
  { id: 'spanish', name: 'Spanish Empire', region: 'The West', color: '#b28a37', sigil: '☼', trait: 'Gilded Armada', spellPrefix: 'Gilded', units: ['Castilian Page', 'Sierra Scout', 'Sunlit Guard', 'Toledo Knight', 'Conquistador', 'Crossbow Archer', 'Citadel Warden', 'Golden Hidalgo', 'Royal Standard', 'Sun King Champion'] },
  { id: 'french', name: 'French Colonial', region: 'The New World', color: '#526982', sigil: '⚜', trait: 'Frontier Company', spellPrefix: 'Frontier', units: ['Frontier Page', 'River Scout', 'Fleur Guard', 'Loyalist Knight', 'Voyageur Rider', 'Forest Archer', 'Stonefort Warden', 'Marquis Champion', 'Tricolor Captain', 'Royal Expeditioner'] },
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
      deck.push(makeCard(empire, {
        id: `unit-${unitIndex}-${rankIndex}`,
        name: `${rank} ${unit}`,
        kind: 'Creature', cost, attack, health, defense,
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
const screens = { intro: $('#intro-screen'), battle: $('#battle-screen') };
const state = { started: false, ended: false, busy: false, turn: 'player', round: 0, selectedAttacker: null, gathered: false, player: null, enemy: null };
const arena = { canvas: $('#pixel-battlefield'), context: null, combat: null, rendering: false };
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

function drawWarrior(creature, x, y, time, direction, action = '') {
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
  pixel(3, 1, 4, 1, gold);
  pixel(2, 2, 6, 2, color);
  pixel(3, 4, 4, 2, skin);
  pixel(2, 4, 1, 1, dark);
  pixel(7, 4, 1, 1, dark);
  pixel(2, 6, 6, 1, gold);
  pixel(1, 7, 8, 3, color);
  pixel(2, 7, 6, 1, metal);
  pixel(3, 10, 2, 2, dark);
  pixel(6, 10, 2, 2, dark);
  pixel(3, 12, 2, 1, gold);
  pixel(6, 12, 3, 1, gold);
  pixel(0, 8, 1, 2, metal);
  pixel(0, 7, 2, 1, gold);

  if (action === 'attack') {
    pixel(7, 7, 4, 1, metal);
    pixel(10, 6, 1, 1, gold);
    pixel(11, 5, 1, 1, metal);
    pixel(12, 4, 2, 1, metal);
  } else {
    pixel(8, 7 + Math.round(step / scale), 1, 3, metal);
    pixel(9, 6 + Math.round(step / scale), 2, 1, gold);
    pixel(10, 5 + Math.round(step / scale), 1, 1, metal);
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
  if (combat) {
    const owner = combat.owner;
    const rival = owner.isAI ? state.player : state.enemy;
    const attacker = owner.board.find((item) => item.instanceId === combat.attackerId);
    if (attacker) {
      attackerPosition = arenaSlot(owner, attacker);
      targetPosition = combat.targetId
        ? arenaSlot(rival, rival.board.find((item) => item.instanceId === combat.targetId) || { instanceId: combat.targetId })
        : { x: bounds.width / 2, y: owner.isAI ? bounds.height - 36 : 36 };
      const progress = Math.min(1, Math.max(0, (time - combat.startedAt) / combat.duration));
      const travel = progress < .62 ? progress / .62 : (1 - progress) / .38;
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
        drawWarrior(creature, attackerPosition.x, attackerPosition.y, time, owner.isAI ? -1 : 1, 'attack');
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

function createPlayer(empire, isAI) {
  return { empire, isAI, health: 30, maxHealth: 30, resources: makeCost(2, 2, 2), deck: buildEmpireDeck(empire), hand: [], board: [], fatigue: 0 };
}

function startGame(empireId) {
  const playerEmpire = empires.find((empire) => empire.id === empireId);
  const rivals = empires.filter((empire) => empire.id !== empireId);
  const enemyEmpire = rivals[Math.floor(Math.random() * rivals.length)];
  Object.assign(state, { started: true, ended: false, busy: false, turn: 'player', round: 0, selectedAttacker: null, gathered: false });
  state.player = createPlayer(playerEmpire, false);
  state.enemy = createPlayer(enemyEmpire, true);
  drawUntilHandSize(state.player);
  drawUntilHandSize(state.enemy);
  screens.intro.hidden = true;
  screens.battle.hidden = false;
  startBattlefieldAnimation();
  playSound('start');
  if ($('#result-dialog').open) $('#result-dialog').close();
  updateHeader();
  refresh();
  beginTurn(state.player);
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
  $('#round-label').textContent = `ROUND ${roman(state.round)}`;
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
  button.addEventListener('click', () => startGame(empire.id));
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
  if (card.kind === 'Creature') {
    const name = card.name.toLowerCase();
    const horse = /rider|foal|horde|elephant|khan/.test(name);
    const archer = /archer|scout|bow/.test(name);
    if (horse) {
      drawRows(['......DD....', '.....DGGD...', '.....DDDD...', '..DDDDDDDDD.', '.DDAAAAAAAAD', 'DDAAAAAADDDD', '.DDAAAADDD...', '..DDD.DD.....', '..DD..D.D....', '.DDD..DDD....'], { D: shadow, A: gold, G: light });
    } else {
      drawRows(['.....DDDD....', '....DGGGGD...', '....DGSSGD...', '.....DDDD....', '..DDDDDDDD...', '.DDAAAAAADD..', '.DAAMAAAAD...', '..DAAAAAAD...', '...DD..DD....', '...DD..DD....', '..DDD..DDD...', '..DDD..DDD...'], { D: shadow, A: sky, G: gold, S: light, M: archer ? '#f7e16b' : green });
    }
    if (archer) {
      rect(12, 2, gold); rect(11, 3, gold); rect(10, 4, gold); rect(9, 5, gold);
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
  button.draggable = card.kind === 'Creature';
  button.style.cssText = factionStyle(card.empire);
  button.disabled = state.turn !== 'player' || state.busy || !canAfford(state.player, card) || state.player.board.length >= 5 && card.kind === 'Creature';
  button.setAttribute('aria-label', `${card.name}, ${card.kind}. Costs ${resourceNames.filter((resource) => card.cost[resource]).map((resource) => `${card.cost[resource]} ${resource}`).join(', ')}. ${card.text}${card.kind === 'Creature' ? ` Attack ${card.attack}, health ${card.health}, defense ${card.defense}.` : ''}`);
  button.innerHTML = `<span class="hand-card-top"><span class="hand-symbol">${card.glyph}</span><span class="choice-number">${card.empire.sigil}</span></span>`;
  button.append(makePixelArt(card), document.createRange().createContextualFragment(`<span class="hand-name">${card.name}</span><span class="hand-kind">${card.kind}</span><span class="hand-cost">${renderCost(card.cost)}</span><span class="hand-description">${card.text}</span>${card.kind === 'Creature' ? `<span class="hand-stats"><span>⚔ ${card.attack}</span><span>♥ ${card.health}</span><span>⬡ ${card.defense}</span></span>` : ''}`));
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
  button.append(makePixelArt(creature, true), document.createRange().createContextualFragment(`<span class="board-name">${creature.name}</span><span class="board-type">${creature.empire.trait}</span><span class="board-stats"><span>⚔ ${attack}</span><span>♥ ${creature.health}</span><span>⬡ ${creature.defense}</span></span>`));
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

function notify(message) { $('#turn-message').textContent = message; }
function gather(owner, resource) {
  owner.resources[resource] += 2;
  playSound('gather');
}

function gatherForPlayer(resource) {
  if (state.turn !== 'player' || state.gathered || state.busy || state.ended) return;
  gather(state.player, resource);
  state.gathered = true;
  notify(`Your stores gain 2 ${resource}.`);
  refresh();
}

function playCard(card, owner) {
  if (state.ended || state.busy || !canAfford(owner, card)) return;
  if (owner.isAI && state.turn !== 'enemy' || !owner.isAI && state.turn !== 'player') return;
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
  }, 520));
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
  playSound(victory ? 'win' : 'defeat');
  state.selectedAttacker = null;
  $('#result-title').textContent = victory ? 'Victory' : 'Defeat';
  $('#result-copy').textContent = victory
    ? `${state.player.empire.name} claims the field. Your chronicle will be remembered.`
    : `${state.enemy.empire.name} has taken the crown. The chronicle is not over.`;
  $('#result-emblem').textContent = victory ? state.player.empire.sigil : state.enemy.empire.sigil;
  $('#result-dialog').showModal();
  refresh();
}

function endPlayerTurn() {
  if (state.turn !== 'player' || state.busy || state.ended) return;
  state.selectedAttacker = null;
  beginTurn(state.enemy);
}

function totalCost(cost) { return resourceNames.reduce((total, resource) => total + cost[resource], 0); }

async function runAiTurn() {
  if (state.ended) return;
  const enemy = state.enemy;
  if (!state.gathered) {
    const nextAffordable = enemy.hand.filter((card) => card.kind === 'Creature' && enemy.board.length < 5).sort((a, b) => totalCost(a.cost) - totalCost(b.cost))[0];
    const resourceToGather = nextAffordable ? resourceNames.reduce((best, resource) => nextAffordable.cost[resource] - enemy.resources[resource] > nextAffordable.cost[best] - enemy.resources[best] ? resource : best, resourceNames[0]) : 'food';
    gather(enemy, resourceToGather);
    state.gathered = true;
  }
  const affordable = enemy.hand.filter((card) => canAfford(enemy, card)).sort((a, b) => totalCost(b.cost) - totalCost(a.cost));
  for (const card of affordable) {
    if ((card.effect === 'rally' || card.effect === 'ward') && !enemy.board.length) continue;
    playCard(card, enemy);
    if (state.ended) return;
  }
  const attacker = enemy.board.find((creature) => creature.canAttack);
  if (attacker) {
    const target = state.player.board.length && Math.random() < 0.45
      ? state.player.board.reduce((weakest, creature) => creature.health < weakest.health ? creature : weakest, state.player.board[0])
      : null;
    await attack(attacker, target, enemy);
  }
  refresh();
  if (!checkWinner()) window.setTimeout(() => beginTurn(state.player), 500);
}

function returnToSelection() {
  $('#result-dialog').close();
  screens.battle.hidden = true;
  screens.intro.hidden = false;
  screens.intro.classList.remove('screen');
  void screens.intro.offsetWidth;
  screens.intro.classList.add('screen');
}

$('.rule-note').textContent = 'Start with 5 cards. At the start of each turn, draw until your hand has 5 cards. Each 100-card deck has 20 food, 20 wood, 20 stone, 30 creature, and 10 spell cards. Supply cards grant 2 resources when drawn.';
$('#empire-grid').replaceChildren(...empires.map(makeEmpireChoice));
$('#rules-button').addEventListener('click', () => $('#rules-dialog').showModal());
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
$('#concede-button').addEventListener('click', () => { if (state.started && !state.ended) finishGame(false); });
$('#play-again').addEventListener('click', returnToSelection);
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
