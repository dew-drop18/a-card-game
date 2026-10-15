import { applyAction, createGame, empires, playerView } from './game-core.mjs';

const QUEUE_TIMEOUT_MS = 120_000;
const RECONNECT_GRACE_MS = 90_000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function validEmpire(id) {
  return typeof id === 'string' && empires.some((empire) => empire.id === id);
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function originAllowed(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = (env.ALLOWED_ORIGIN || '').split(',').map((value) => value.trim()).filter(Boolean);
  return !origin || !allowedOrigins.length || allowedOrigins.includes(origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return json({ status: 'ok' });
    if (!originAllowed(request, env)) return new Response('Origin not allowed.', { status: 403 });
    if (url.pathname === '/match') {
      const id = env.MATCHMAKER.idFromName('global');
      return env.MATCHMAKER.get(id).fetch(request);
    }
    const roomMatch = url.pathname.match(/^\/room\/([0-9a-f-]{36})$/i);
    if (roomMatch) {
      const id = env.ROOMS.idFromName(roomMatch[1]);
      return env.ROOMS.get(id).fetch(request);
    }
    return new Response('Not found.', { status: 404 });
  },
};

export class Matchmaker {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.pending = Promise.resolve();
  }

  serialize(operation) {
    const result = this.pending.then(operation);
    this.pending = result.catch(() => {});
    return result;
  }

  async fetch(request) {
    if (request.method !== 'GET' || request.headers.get('Upgrade') !== 'websocket') {
      return new Response('WebSocket upgrade required.', { status: 426 });
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1], ['queue']);
    pair[1].serializeAttachment({ status: 'new' });
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  webSocketMessage(socket, message) {
    return this.serialize(() => this.handleWebSocketMessage(socket, message));
  }

  async handleWebSocketMessage(socket, message) {
    let request;
    try {
      if (typeof message !== 'string' || message.length > 2048) throw new Error('Invalid message.');
      request = JSON.parse(message);
    } catch {
      send(socket, { type: 'error', message: 'Invalid matchmaking request.' });
      socket.close(1008, 'Invalid matchmaking request');
      return;
    }
    const attachment = socket.deserializeAttachment();
    if (!request || typeof request !== 'object' || Array.isArray(request)
      || attachment?.status !== 'new' || request.type !== 'join' || !validEmpire(request.empireId)) {
      send(socket, { type: 'error', message: 'Choose a valid empire to join matchmaking.' });
      socket.close(1008, 'Invalid matchmaking request');
      return;
    }

    const waiting = this.ctx.getWebSockets('queue')
      .find((candidate) => candidate !== socket && candidate.deserializeAttachment()?.status === 'waiting');
    if (!waiting) {
      socket.serializeAttachment({ status: 'waiting', empireId: request.empireId, joinedAt: Date.now() });
      send(socket, { type: 'queued', message: 'Searching for a rival commander…' });
      await this.ctx.storage.setAlarm(Date.now() + QUEUE_TIMEOUT_MS);
      return;
    }

    const other = waiting.deserializeAttachment();
    waiting.serializeAttachment({ ...other, status: 'matched' });
    socket.serializeAttachment({ status: 'matched' });
    const roomId = crypto.randomUUID();
    const tokens = [newToken(), newToken()];
    const game = createGame(
      [other.empireId, request.empireId],
      () => crypto.getRandomValues(new Uint32Array(1))[0] / 0x1_0000_0000,
    );
    try {
      const room = this.env.ROOMS.get(this.env.ROOMS.idFromName(roomId));
      const response = await room.fetch('https://room.internal/create', {
        method: 'POST',
        body: JSON.stringify({ game, tokens }),
      });
      if (!response.ok) throw new Error('Could not create the game room.');
    } catch (error) {
      send(waiting, { type: 'error', message: 'Could not start the match. Please try again.' });
      send(socket, { type: 'error', message: 'Could not start the match. Please try again.' });
      waiting.close(1011, 'Match creation failed');
      socket.close(1011, 'Match creation failed');
      throw error;
    }

    send(waiting, { type: 'matched', roomId, token: tokens[0], seat: 0 });
    send(socket, { type: 'matched', roomId, token: tokens[1], seat: 1 });
    waiting.close(1000, 'Match found');
    socket.close(1000, 'Match found');
  }

  webSocketClose(socket) {
    return this.serialize(() => this.handleWebSocketClose(socket));
  }

  async handleWebSocketClose(socket) {
    const attachment = socket.deserializeAttachment();
    if (attachment?.status === 'waiting') {
      send(socket, { type: 'error', message: 'Search ended before a rival joined.' });
    }
  }

  alarm() {
    return this.serialize(() => this.handleAlarm());
  }

  async handleAlarm() {
    const now = Date.now();
    for (const socket of this.ctx.getWebSockets('queue')) {
      const attachment = socket.deserializeAttachment();
      if (attachment?.status === 'waiting' && now - attachment.joinedAt >= QUEUE_TIMEOUT_MS) {
        send(socket, { type: 'error', message: 'No rival found yet. Please try again later.' });
        socket.close(1000, 'Search expired');
      }
    }
    const stillWaiting = this.ctx.getWebSockets('queue').some((socket) => socket.deserializeAttachment()?.status === 'waiting');
    if (stillWaiting) await this.ctx.storage.setAlarm(now + QUEUE_TIMEOUT_MS);
  }
}

export class GameRoom {
  constructor(ctx) {
    this.ctx = ctx;
    this.pending = Promise.resolve();
  }

  serialize(operation) {
    const result = this.pending.then(operation);
    this.pending = result.catch(() => {});
    return result;
  }

  fetch(request) {
    return this.serialize(() => this.handleFetch(request));
  }

  async handleFetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/create' && request.method === 'POST') {
      const { game, tokens } = await request.json();
      if (!game || !Array.isArray(tokens) || tokens.length !== 2 || !tokens.every((token) => typeof token === 'string')) {
        return json({ error: 'Invalid room setup.' }, 400);
      }
      if (await this.ctx.storage.get('game')) return json({ error: 'Room already exists.' }, 409);
      await this.ctx.storage.put('game', { game, tokens, disconnectedAt: [null, null] });
      return json({ status: 'created' }, 201);
    }
    if (request.method !== 'GET' || request.headers.get('Upgrade') !== 'websocket') {
      return new Response('WebSocket upgrade required.', { status: 426 });
    }

    const token = url.searchParams.get('token');
    const room = await this.ctx.storage.get('game');
    if (!room || !token) return new Response('Unknown room or missing token.', { status: 404 });
    const seat = room.tokens.indexOf(token);
    if (seat < 0) return new Response('Invalid room token.', { status: 403 });

    const pair = new WebSocketPair();
    const existing = this.ctx.getWebSockets().find((socket) => socket.deserializeAttachment()?.seat === seat);
    if (existing) {
      const attachment = existing.deserializeAttachment();
      existing.serializeAttachment({ ...attachment, replaced: true });
      existing.close(4001, 'Reconnected from another tab');
    }
    this.ctx.acceptWebSocket(pair[1], [`seat-${seat}`]);
    pair[1].serializeAttachment({ seat });
    room.disconnectedAt[seat] = null;
    await this.ctx.storage.put('game', room);
    await this.ctx.storage.deleteAlarm();
    send(pair[1], playerView(room.game, seat));
    for (const socket of this.ctx.getWebSockets()) {
      if (socket !== pair[1]) send(socket, { type: 'opponent-connected' });
    }
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  webSocketMessage(socket, message) {
    return this.serialize(() => this.handleWebSocketMessage(socket, message));
  }

  async handleWebSocketMessage(socket, message) {
    const attachment = socket.deserializeAttachment();
    const room = await this.ctx.storage.get('game');
    if (!room || !attachment || attachment.replaced) return;
    let action;
    try {
      if (typeof message !== 'string' || message.length > 2048) throw new Error('Invalid move.');
      action = JSON.parse(message);
      applyAction(room.game, attachment.seat, action);
    } catch (error) {
      send(socket, { type: 'error', message: error instanceof Error ? error.message : 'That move was rejected.' });
      return;
    }
    await this.ctx.storage.put('game', room);
    this.broadcast(room);
    if (room.game.finished) await this.ctx.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
  }

  webSocketClose(socket) {
    return this.serialize(() => this.handleWebSocketClose(socket));
  }

  async handleWebSocketClose(socket) {
    const attachment = socket.deserializeAttachment();
    if (!attachment || attachment.replaced) return;
    const room = await this.ctx.storage.get('game');
    if (!room || room.game.finished) return;
    if (room.disconnectedAt[attachment.seat]) return;
    room.disconnectedAt[attachment.seat] = Date.now();
    await this.ctx.storage.put('game', room);
    await this.ctx.storage.setAlarm(Date.now() + RECONNECT_GRACE_MS);
    this.broadcast(room, { type: 'opponent-disconnected', reconnectSeconds: RECONNECT_GRACE_MS / 1000 });
  }

  webSocketError(socket) {
    return this.serialize(() => this.handleWebSocketError(socket));
  }

  async handleWebSocketError(socket) {
    const attachment = socket.deserializeAttachment();
    if (!attachment || attachment.replaced) return;
    const room = await this.ctx.storage.get('game');
    if (!room || room.game.finished || room.disconnectedAt[attachment.seat]) return;
    room.disconnectedAt[attachment.seat] = Date.now();
    await this.ctx.storage.put('game', room);
    await this.ctx.storage.setAlarm(Date.now() + RECONNECT_GRACE_MS);
    this.broadcast(room, { type: 'opponent-disconnected', reconnectSeconds: RECONNECT_GRACE_MS / 1000 });
  }

  broadcast(room, extra = {}) {
    for (const socket of this.ctx.getWebSockets()) {
      const seat = socket.deserializeAttachment()?.seat;
      if (Number.isInteger(seat)) send(socket, { ...playerView(room.game, seat), ...extra });
    }
  }

  alarm() {
    return this.serialize(() => this.handleAlarm());
  }

  async handleAlarm() {
    const room = await this.ctx.storage.get('game');
    if (!room) return;
    if (room.game.finished) {
      await this.ctx.storage.deleteAll();
      return;
    }
    const expiredSeat = room.disconnectedAt.findIndex((time) => time && Date.now() - time >= RECONNECT_GRACE_MS);
    if (expiredSeat !== -1) {
      const bothExpired = room.disconnectedAt.every((time) => time && Date.now() - time >= RECONNECT_GRACE_MS);
      room.game.finished = { winner: bothExpired ? null : 1 - expiredSeat, reason: bothExpired ? 'abandoned' : 'disconnect' };
      room.game.version += 1;
      await this.ctx.storage.put('game', room);
      this.broadcast(room);
      await this.ctx.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      const earliest = room.disconnectedAt.filter(Boolean).reduce((best, time) => Math.min(best, time), Infinity);
      if (Number.isFinite(earliest)) await this.ctx.storage.setAlarm(earliest + RECONNECT_GRACE_MS);
    }
  }
}
