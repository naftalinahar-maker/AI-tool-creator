// Tank battle game engine: pure state + update + render, no React.

export const TILE = 40;
export const COLS = 21;
export const ROWS = 15;
export const WIDTH = COLS * TILE;
export const HEIGHT = ROWS * TILE;

const EMPTY = 0;
const BRICK = 1;
const STEEL = 2;
const BUSH = 3;

const TANK_R = 15;
const DUEL_TARGET = 5;

export type Mode = "solo" | "coop" | "duel";
export type PowerKind = "shield" | "rapid" | "repair" | "triple";
type TankKind = "player" | "basic" | "fast" | "heavy";
export type SoundName = "shoot" | "boom" | "hit" | "power" | "brick" | "wave";

export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
}

interface AiState {
  wpC: number;
  wpR: number;
  hasWp: boolean;
  repath: number;
  stuckTime: number;
  lastX: number;
  lastY: number;
  wander: number;
  wanderAngle: number;
  aimError: number;
}

interface Tank {
  id: number;
  x: number;
  y: number;
  angle: number;
  turret: number;
  hp: number;
  maxHp: number;
  team: number;
  player: number; // -1 for bots
  kind: TankKind;
  speed: number;
  reload: number;
  cooldown: number;
  shield: number;
  rapid: number;
  triple: number;
  alive: boolean;
  tread: number;
  flash: number;
  ai?: AiState;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: number;
  owner: number;
  bounces: number;
  life: number;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  kind: PowerKind;
  life: number;
}

interface PlayerSlot {
  index: number;
  lives: number;
  respawn: number;
  kills: number;
  tankId: number | null;
}

export interface Game {
  mode: Mode;
  grid: number[][];
  brickHp: number[][];
  tanks: Tank[];
  bullets: Bullet[];
  particles: Particle[];
  powerups: PowerUp[];
  players: PlayerSlot[];
  wave: number;
  toSpawn: number;
  spawnTimer: number;
  waveDelay: number;
  banner: string;
  bannerTime: number;
  score: number;
  time: number;
  shake: number;
  nextId: number;
  fields: (number[][] | null)[];
  fieldTimer: number;
  powerTimer: number;
  over: boolean;
  winner: number;
  events: SoundName[];
}

export interface HudPlayer {
  lives: number;
  hp: number;
  maxHp: number;
  kills: number;
  alive: boolean;
  respawn: number;
  shield: number;
  rapid: number;
  triple: number;
}

export interface Hud {
  mode: Mode;
  score: number;
  wave: number;
  over: boolean;
  winner: number;
  players: HudPlayer[];
}

const PLAYER_COLORS = ["#3b82f6", "#f59e0b"];
const BOT_COLORS: Record<Exclude<TankKind, "player">, string> = {
  basic: "#dc2626",
  fast: "#d946ef",
  heavy: "#7f1d1d",
};

// ---------- helpers ----------

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function angDiff(a: number, b: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function rotateToward(a: number, b: number, max: number) {
  const d = angDiff(a, b);
  if (Math.abs(d) <= max) return b;
  return a + Math.sign(d) * max;
}

function tileAt(g: Game, c: number, r: number) {
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return STEEL;
  return g.grid[r][c];
}

function solidAtPoint(g: Game, x: number, y: number) {
  const t = tileAt(g, Math.floor(x / TILE), Math.floor(y / TILE));
  return t === BRICK || t === STEEL;
}

function spawnPoints(mode: Mode) {
  const midR = Math.floor(ROWS / 2);
  const players =
    mode === "duel"
      ? [
          [1, midR],
          [COLS - 2, midR],
        ]
      : [
          [3, ROWS - 2],
          [COLS - 4, ROWS - 2],
        ];
  const bots = [
    [1, 1],
    [Math.floor(COLS / 2), 1],
    [COLS - 2, 1],
  ];
  return { players, bots };
}

const center = (c: number) => c * TILE + TILE / 2;

// ---------- map generation ----------

function generateMap(mode: Mode): number[][] {
  const { players, bots } = spawnPoints(mode);
  const spawns = mode === "duel" ? players : [...players, ...bots];
  const half = Math.ceil(COLS / 2);

  for (let attempt = 0; attempt < 50; attempt++) {
    const grid: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    const put = (c: number, r: number, v: number) => {
      if (c < 0 || r < 0 || c >= half || r >= ROWS) return;
      grid[r][c] = v;
    };
    const rects = (count: number, v: number, maxW: number, maxH: number) => {
      for (let i = 0; i < count; i++) {
        const w = 1 + Math.floor(Math.random() * maxW);
        const h = 1 + Math.floor(Math.random() * maxH);
        const c0 = Math.floor(Math.random() * half);
        const r0 = Math.floor(Math.random() * ROWS);
        for (let r = r0; r < r0 + h; r++) for (let c = c0; c < c0 + w; c++) put(c, r, v);
      }
    };
    rects(14, BRICK, 3, 3);
    rects(5, STEEL, 2, 1);
    rects(4, BUSH, 3, 2);

    // mirror left half to right half
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < half; c++) grid[r][COLS - 1 - c] = grid[r][c];

    // clear spawn areas
    for (const [sc, sr] of spawns) {
      for (let r = sr - 1; r <= sr + 1; r++)
        for (let c = sc - 1; c <= sc + 1; c++) if (r >= 0 && c >= 0 && r < ROWS && c < COLS) grid[r][c] = EMPTY;
    }

    // connectivity: every spawn reachable when bricks are considered breakable
    const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const q: [number, number][] = [[spawns[0][0], spawns[0][1]]];
    seen[spawns[0][1]][spawns[0][0]] = true;
    while (q.length) {
      const [c, r] = q.shift()!;
      for (const [dc, dr] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || seen[nr][nc] || grid[nr][nc] === STEEL) continue;
        seen[nr][nc] = true;
        q.push([nc, nr]);
      }
    }
    if (spawns.every(([c, r]) => seen[r][c])) return grid;
  }
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

// ---------- creation ----------

export function createGame(mode: Mode): Game {
  const grid = generateMap(mode);
  const g: Game = {
    mode,
    grid,
    brickHp: grid.map((row) => row.map((v) => (v === BRICK ? 2 : 0))),
    tanks: [],
    bullets: [],
    particles: [],
    powerups: [],
    players: [],
    wave: 0,
    toSpawn: 0,
    spawnTimer: 1,
    waveDelay: 0,
    banner: "",
    bannerTime: 0,
    score: 0,
    time: 0,
    shake: 0,
    nextId: 1,
    fields: [null, null],
    fieldTimer: 0,
    powerTimer: 6,
    over: false,
    winner: -1,
    events: [],
  };
  const count = mode === "solo" ? 1 : 2;
  for (let i = 0; i < count; i++) {
    g.players.push({ index: i, lives: mode === "duel" ? Infinity : 3, respawn: 0, kills: 0, tankId: null });
    spawnPlayer(g, i);
  }
  if (mode === "duel") {
    g.banner = `ראשון ל-${DUEL_TARGET} ניצחונות!`;
    g.bannerTime = 2.5;
  } else {
    startWave(g);
  }
  return g;
}

function makeTank(g: Game, partial: Partial<Tank> & Pick<Tank, "x" | "y" | "team" | "player" | "kind">): Tank {
  return {
    id: g.nextId++,
    angle: -Math.PI / 2,
    turret: -Math.PI / 2,
    hp: 3,
    maxHp: 3,
    speed: 110,
    reload: 0.45,
    cooldown: 0.5,
    shield: 0,
    rapid: 0,
    triple: 0,
    alive: true,
    tread: 0,
    flash: 0,
    ...partial,
  };
}

function spawnPlayer(g: Game, index: number) {
  const { players } = spawnPoints(g.mode);
  const [c, r] = players[index];
  const angle = g.mode === "duel" ? (index === 0 ? 0 : Math.PI) : -Math.PI / 2;
  const t = makeTank(g, {
    x: center(c),
    y: center(r),
    angle,
    turret: angle,
    team: g.mode === "duel" ? index : 0,
    player: index,
    kind: "player",
    shield: 2.5,
  });
  g.tanks.push(t);
  g.players[index].tankId = t.id;
}

function startWave(g: Game) {
  g.wave++;
  g.toSpawn = 2 + g.wave * 2 + (g.mode === "coop" ? 2 : 0);
  g.spawnTimer = 1;
  g.banner = `גל ${g.wave}`;
  g.bannerTime = 2;
  g.events.push("wave");
}

function spawnBot(g: Game): boolean {
  const { bots } = spawnPoints(g.mode);
  const free = bots.filter(([c, r]) =>
    g.tanks.every((t) => !t.alive || Math.hypot(t.x - center(c), t.y - center(r)) > TANK_R * 2.5),
  );
  if (!free.length) return false;
  const [c, r] = free[Math.floor(Math.random() * free.length)];
  const roll = Math.random();
  const heavyChance = Math.min(0.3, 0.05 * (g.wave - 1));
  const fastChance = Math.min(0.35, 0.08 * (g.wave - 1));
  const kind: TankKind = roll < heavyChance ? "heavy" : roll < heavyChance + fastChance ? "fast" : "basic";
  const scale = 1 + Math.min(0.5, g.wave * 0.04);
  const stats = {
    basic: { hp: 1, speed: 70, reload: 1.4 },
    fast: { hp: 1, speed: 115, reload: 1.1 },
    heavy: { hp: 4, speed: 50, reload: 1.2 },
  }[kind];
  g.tanks.push(
    makeTank(g, {
      x: center(c),
      y: center(r),
      angle: Math.PI / 2,
      turret: Math.PI / 2,
      team: 9,
      player: -1,
      kind,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed * scale,
      reload: stats.reload / scale,
      cooldown: 1.2,
      shield: 1,
      ai: {
        wpC: c,
        wpR: r,
        hasWp: false,
        repath: 0,
        stuckTime: 0,
        lastX: center(c),
        lastY: center(r),
        wander: 0,
        wanderAngle: 0,
        aimError: 0,
      },
    }),
  );
  return true;
}

// ---------- physics ----------

function circleHitsRect(cx: number, cy: number, r: number, rx: number, ry: number, rw: number, rh: number) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
}

function collides(g: Game, t: Tank, x: number, y: number) {
  const r = TANK_R;
  if (x - r < 0 || y - r < 0 || x + r > WIDTH || y + r > HEIGHT) return true;
  for (let tr = Math.floor((y - r) / TILE); tr <= Math.floor((y + r) / TILE); tr++) {
    for (let tc = Math.floor((x - r) / TILE); tc <= Math.floor((x + r) / TILE); tc++) {
      const v = tileAt(g, tc, tr);
      if ((v === BRICK || v === STEEL) && circleHitsRect(x, y, r, tc * TILE, tr * TILE, TILE, TILE)) return true;
    }
  }
  for (const o of g.tanks) {
    if (!o.alive || o.id === t.id) continue;
    const nd = Math.hypot(o.x - x, o.y - y);
    if (nd < r * 2 - 2 && nd < Math.hypot(o.x - t.x, o.y - t.y)) return true;
  }
  return false;
}

function moveTank(g: Game, t: Tank, dist: number) {
  const dx = Math.cos(t.angle) * dist;
  const dy = Math.sin(t.angle) * dist;
  const ox = t.x;
  const oy = t.y;
  if (!collides(g, t, t.x + dx, t.y)) t.x += dx;
  if (!collides(g, t, t.x, t.y + dy)) t.y += dy;
  t.tread += Math.hypot(t.x - ox, t.y - oy) * Math.sign(dist || 1);
}

function shoot(g: Game, t: Tank) {
  const angles = t.triple > 0 ? [-0.2, 0, 0.2] : [0];
  const speed = t.player >= 0 ? 400 : 290;
  for (const a of angles) {
    const ang = t.turret + a;
    g.bullets.push({
      x: t.x + Math.cos(ang) * 22,
      y: t.y + Math.sin(ang) * 22,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      team: t.team,
      owner: t.id,
      bounces: t.player >= 0 ? 1 : 0,
      life: 3,
      alive: true,
    });
  }
  t.cooldown = t.rapid > 0 ? 0.15 : t.reload;
  burst(g, t.x + Math.cos(t.turret) * 24, t.y + Math.sin(t.turret) * 24, 4, "#fde68a", 60, 0.15, 2);
  g.events.push("shoot");
}

function burst(g: Game, x: number, y: number, n: number, color: string, speed: number, life: number, size: number) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * speed;
    const l = life * rand(0.6, 1.2);
    g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: l, max: l, size: size * rand(0.6, 1.4), color });
  }
}

function explode(g: Game, x: number, y: number, big: boolean) {
  burst(g, x, y, big ? 40 : 14, "#f97316", big ? 220 : 120, 0.6, 4);
  burst(g, x, y, big ? 20 : 6, "#fde047", big ? 150 : 80, 0.4, 3);
  burst(g, x, y, big ? 18 : 5, "#52525b", 60, 1.2, 7);
  g.shake = Math.max(g.shake, big ? 10 : 3);
}

function playerTank(g: Game, index: number) {
  const id = g.players[index].tankId;
  return g.tanks.find((t) => t.id === id && t.alive) ?? null;
}

function kill(g: Game, t: Tank, killerId: number) {
  t.alive = false;
  explode(g, t.x, t.y, true);
  g.events.push("boom");
  const killer = g.tanks.find((k) => k.id === killerId);

  if (t.player >= 0) {
    const slot = g.players[t.player];
    slot.tankId = null;
    if (g.mode === "duel") {
      const other = g.players[1 - t.player];
      other.kills++;
      if (other.kills >= DUEL_TARGET) {
        g.over = true;
        g.winner = other.index;
      } else {
        slot.respawn = 2;
      }
    } else {
      slot.lives--;
      if (slot.lives > 0) slot.respawn = 2;
      if (g.players.every((p) => p.lives <= 0)) g.over = true;
    }
  } else {
    g.score += { basic: 100, fast: 150, heavy: 300, player: 0 }[t.kind];
    if (killer && killer.player >= 0) g.players[killer.player].kills++;
    if (Math.random() < 0.22) dropPower(g, t.x, t.y);
  }
}

function dropPower(g: Game, x: number, y: number) {
  const kinds: PowerKind[] = ["shield", "rapid", "repair", "triple"];
  g.powerups.push({ x, y, kind: kinds[Math.floor(Math.random() * kinds.length)], life: 12 });
}

function randomEmptyTile(g: Game): [number, number] | null {
  for (let i = 0; i < 60; i++) {
    const c = Math.floor(Math.random() * COLS);
    const r = Math.floor(Math.random() * ROWS);
    if (g.grid[r][c] === EMPTY) return [center(c), center(r)];
  }
  return null;
}

// ---------- AI ----------

function computeField(g: Game, t: Tank): number[][] {
  const field = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
  const sc = Math.floor(t.x / TILE);
  const sr = Math.floor(t.y / TILE);
  field[sr][sc] = 0;
  const q: [number, number][] = [[sc, sr]];
  let head = 0;
  while (head < q.length) {
    const [c, r] = q[head++];
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
      const v = g.grid[nr][nc];
      if (v === STEEL) continue;
      const cost = field[r][c] + (v === BRICK ? 3 : 1);
      if (cost < field[nr][nc]) {
        field[nr][nc] = cost;
        q.push([nc, nr]);
      }
    }
  }
  return field;
}

function lineOfSight(g: Game, x1: number, y1: number, x2: number, y2: number) {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.ceil(d / 8);
  for (let i = 1; i < steps; i++) {
    const k = i / steps;
    if (solidAtPoint(g, x1 + (x2 - x1) * k, y1 + (y2 - y1) * k)) return false;
  }
  return true;
}

function updateBot(g: Game, t: Tank, dt: number) {
  const ai = t.ai!;
  let target: Tank | null = null;
  let best = Infinity;
  for (const p of g.players) {
    const pt = playerTank(g, p.index);
    if (!pt) continue;
    const d = Math.hypot(pt.x - t.x, pt.y - t.y);
    if (d < best) {
      best = d;
      target = pt;
    }
  }

  const sees = target ? lineOfSight(g, t.x, t.y, target.x, target.y) : false;
  let desired: number | null = null;
  let blockedByBrick = false;

  if (ai.wander > 0) {
    ai.wander -= dt;
    desired = ai.wanderAngle;
  } else if (target && !(sees && best < 170)) {
    const field = g.fields[target.player];
    const tc = Math.floor(t.x / TILE);
    const tr = Math.floor(t.y / TILE);
    ai.repath -= dt;
    const reached = Math.hypot(center(ai.wpC) - t.x, center(ai.wpR) - t.y) < 5;
    if (field && (!ai.hasWp || reached || ai.repath <= 0)) {
      let bestV = field[tr][tc];
      let pick: [number, number] | null = null;
      const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].sort(() => Math.random() - 0.5);
      for (const [dc, dr] of dirs) {
        const nc = tc + dc;
        const nr = tr + dr;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        if (field[nr][nc] < bestV) {
          bestV = field[nr][nc];
          pick = [nc, nr];
        }
      }
      if (pick) {
        ai.wpC = pick[0];
        ai.wpR = pick[1];
        ai.hasWp = true;
      } else {
        ai.hasWp = false;
      }
      ai.repath = 1;
    }
    if (ai.hasWp) {
      desired = Math.atan2(center(ai.wpR) - t.y, center(ai.wpC) - t.x);
      blockedByBrick = g.grid[ai.wpR][ai.wpC] === BRICK;
    }
  }

  let tryingToMove = false;
  if (desired !== null) {
    t.angle = rotateToward(t.angle, desired, 3 * dt);
    if (Math.abs(angDiff(t.angle, desired)) < 0.3 && !blockedByBrick) {
      moveTank(g, t, t.speed * dt);
      tryingToMove = true;
    }
  }

  // stuck detection
  if (tryingToMove) {
    ai.stuckTime += dt;
    if (ai.stuckTime > 0.7) {
      if (Math.hypot(t.x - ai.lastX, t.y - ai.lastY) < 6) {
        ai.wander = rand(0.4, 0.9);
        ai.wanderAngle = t.angle + (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 2);
        ai.hasWp = false;
      }
      ai.stuckTime = 0;
      ai.lastX = t.x;
      ai.lastY = t.y;
    }
  }

  // turret & fire
  if (target && sees && best < 540) {
    const aim = Math.atan2(target.y - t.y, target.x - t.x) + ai.aimError;
    t.turret = rotateToward(t.turret, aim, 2.6 * dt);
    if (Math.abs(angDiff(t.turret, aim)) < 0.1 && t.cooldown <= 0) {
      shoot(g, t);
      ai.aimError = rand(-0.07, 0.07);
    }
  } else {
    t.turret = rotateToward(t.turret, t.angle, 3 * dt);
    if (blockedByBrick && Math.abs(angDiff(t.turret, t.angle)) < 0.1 && t.cooldown <= 0) shoot(g, t);
  }
}

// ---------- update ----------

function updatePlayer(g: Game, t: Tank, c: Controls, dt: number) {
  const turn = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  t.angle += turn * 3.2 * dt;
  const throttle = (c.up ? 1 : 0) - (c.down ? 0.6 : 0);
  if (throttle) moveTank(g, t, throttle * t.speed * dt);
  t.turret = t.angle;
  if (c.fire && t.cooldown <= 0) shoot(g, t);
}

function damageBrick(g: Game, c: number, r: number, x: number, y: number) {
  g.brickHp[r][c]--;
  burst(g, x, y, 6, "#b45309", 90, 0.4, 3);
  if (g.brickHp[r][c] <= 0) {
    g.grid[r][c] = EMPTY;
    burst(g, center(c), center(r), 14, "#92400e", 120, 0.6, 4);
  }
  g.events.push("brick");
}

function updateBullets(g: Game, dt: number) {
  for (const b of g.bullets) {
    if (!b.alive) continue;
    b.life -= dt;
    if (b.life <= 0) {
      b.alive = false;
      continue;
    }
    const nx = b.x + b.vx * dt;
    const ny = b.y + b.vy * dt;
    const c = Math.floor(nx / TILE);
    const r = Math.floor(ny / TILE);
    const v = tileAt(g, c, r);
    if (v === BRICK) {
      damageBrick(g, c, r, nx, ny);
      b.alive = false;
      continue;
    }
    if (v === STEEL) {
      if (b.bounces > 0) {
        b.bounces--;
        const hitX = solidAtPoint(g, nx, b.y);
        const hitY = solidAtPoint(g, b.x, ny);
        if (hitX) b.vx = -b.vx;
        if (hitY) b.vy = -b.vy;
        if (!hitX && !hitY) {
          b.vx = -b.vx;
          b.vy = -b.vy;
        }
        burst(g, b.x, b.y, 3, "#e5e7eb", 60, 0.2, 2);
      } else {
        b.alive = false;
        burst(g, b.x, b.y, 5, "#e5e7eb", 70, 0.25, 2);
      }
      continue;
    }
    b.x = nx;
    b.y = ny;

    for (const t of g.tanks) {
      if (!t.alive || t.team === b.team) continue;
      if (Math.hypot(t.x - b.x, t.y - b.y) < TANK_R + 2) {
        b.alive = false;
        if (t.shield > 0) {
          burst(g, b.x, b.y, 8, "#67e8f9", 90, 0.3, 2);
        } else {
          t.hp--;
          t.flash = 0.15;
          g.events.push("hit");
          explode(g, b.x, b.y, false);
          if (t.hp <= 0) kill(g, t, b.owner);
        }
        break;
      }
    }
  }

  // bullets cancel each other
  for (let i = 0; i < g.bullets.length; i++) {
    const a = g.bullets[i];
    if (!a.alive) continue;
    for (let j = i + 1; j < g.bullets.length; j++) {
      const b = g.bullets[j];
      if (!b.alive || a.team === b.team) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) < 7) {
        a.alive = b.alive = false;
        burst(g, a.x, a.y, 8, "#fde68a", 80, 0.3, 2);
        break;
      }
    }
  }
  g.bullets = g.bullets.filter((b) => b.alive);
}

function applyPower(t: Tank, kind: PowerKind) {
  if (kind === "shield") t.shield = 6;
  if (kind === "rapid") t.rapid = 8;
  if (kind === "triple") t.triple = 8;
  if (kind === "repair") t.hp = t.maxHp;
}

export function update(g: Game, dt: number, input: Controls[]) {
  g.time += dt;
  g.shake = Math.max(0, g.shake - dt * 30);
  g.bannerTime = Math.max(0, g.bannerTime - dt);

  for (const p of g.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 1 - 3 * dt;
    p.vy *= 1 - 3 * dt;
  }
  g.particles = g.particles.filter((p) => p.life > 0);
  if (g.over) return;

  // respawns
  for (const slot of g.players) {
    if (slot.respawn > 0) {
      slot.respawn -= dt;
      if (slot.respawn <= 0) {
        slot.respawn = 0;
        spawnPlayer(g, slot.index);
      }
    }
  }

  // AI distance fields
  g.fieldTimer -= dt;
  if (g.fieldTimer <= 0) {
    g.fieldTimer = 0.4;
    g.fields = g.players.map((p) => {
      const pt = playerTank(g, p.index);
      return pt ? computeField(g, pt) : null;
    });
  }

  for (const t of g.tanks) {
    if (!t.alive) continue;
    t.cooldown -= dt;
    t.shield = Math.max(0, t.shield - dt);
    t.rapid = Math.max(0, t.rapid - dt);
    t.triple = Math.max(0, t.triple - dt);
    t.flash = Math.max(0, t.flash - dt);
    if (t.player >= 0) updatePlayer(g, t, input[t.player] ?? NO_INPUT, dt);
    else updateBot(g, t, dt);
  }

  updateBullets(g, dt);
  g.tanks = g.tanks.filter((t) => t.alive);

  // power-ups
  for (const pu of g.powerups) {
    pu.life -= dt;
    for (const t of g.tanks) {
      if (t.player < 0 || pu.life <= 0) continue;
      if (Math.hypot(t.x - pu.x, t.y - pu.y) < 24) {
        applyPower(t, pu.kind);
        burst(g, pu.x, pu.y, 16, POWER_STYLE[pu.kind].color, 120, 0.5, 3);
        g.events.push("power");
        pu.life = 0;
      }
    }
  }
  g.powerups = g.powerups.filter((p) => p.life > 0);
  g.powerTimer -= dt;
  if (g.powerTimer <= 0) {
    g.powerTimer = g.mode === "duel" ? 7 : 16;
    if (g.powerups.length < 3) {
      const spot = randomEmptyTile(g);
      if (spot) dropPower(g, spot[0], spot[1]);
    }
  }

  // waves
  if (g.mode !== "duel" && !g.over) {
    const botsAlive = g.tanks.filter((t) => t.player < 0).length;
    const maxConcurrent = Math.min(2 + g.wave, 7);
    if (g.toSpawn > 0) {
      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0 && botsAlive < maxConcurrent && spawnBot(g)) {
        g.toSpawn--;
        g.spawnTimer = Math.max(0.7, 2 - g.wave * 0.12);
      }
    } else if (botsAlive === 0) {
      if (g.waveDelay <= 0) {
        g.waveDelay = 2.5;
        g.score += g.wave * 250;
        g.banner = `גל ${g.wave} הושלם! +${g.wave * 250}`;
        g.bannerTime = 2.3;
      } else {
        g.waveDelay -= dt;
        if (g.waveDelay <= 0) startWave(g);
      }
    }
  }
}

const NO_INPUT: Controls = { up: false, down: false, left: false, right: false, fire: false };

export function hud(g: Game): Hud {
  return {
    mode: g.mode,
    score: g.score,
    wave: g.wave,
    over: g.over,
    winner: g.winner,
    players: g.players.map((p) => {
      const t = playerTank(g, p.index);
      return {
        lives: p.lives,
        hp: t?.hp ?? 0,
        maxHp: t?.maxHp ?? 3,
        kills: p.kills,
        alive: !!t,
        respawn: p.respawn,
        shield: t?.shield ?? 0,
        rapid: t?.rapid ?? 0,
        triple: t?.triple ?? 0,
      };
    }),
  };
}

// ---------- render ----------

const POWER_STYLE: Record<PowerKind, { color: string; label: string }> = {
  shield: { color: "#22d3ee", label: "S" },
  rapid: { color: "#facc15", label: "»" },
  repair: { color: "#4ade80", label: "+" },
  triple: { color: "#f472b6", label: "3" },
};

function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, hp: number) {
  ctx.fillStyle = hp > 1 ? "#b45309" : "#7c2d12";
  ctx.fillRect(x, y, TILE, TILE);
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 1; i < 4; i++) {
    ctx.moveTo(x, y + i * 10);
    ctx.lineTo(x + TILE, y + i * 10);
  }
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 10 : 0;
    for (let cx = off; cx < TILE; cx += 20) {
      ctx.moveTo(x + cx, y + row * 10);
      ctx.lineTo(x + cx, y + row * 10 + 10);
    }
  }
  ctx.stroke();
  if (hp <= 1) {
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 6);
    ctx.lineTo(x + 18, y + 20);
    ctx.lineTo(x + 14, y + 32);
    ctx.moveTo(x + 18, y + 20);
    ctx.lineTo(x + 32, y + 26);
    ctx.stroke();
  }
}

function drawSteel(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const grad = ctx.createLinearGradient(x, y, x + TILE, y + TILE);
  grad.addColorStop(0, "#d4d4d8");
  grad.addColorStop(1, "#71717a");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = "#a1a1aa";
  ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
  ctx.fillStyle = "#3f3f46";
  for (const [dx, dy] of [
    [4, 4],
    [TILE - 4, 4],
    [4, TILE - 4],
    [TILE - 4, TILE - 4],
  ]) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "rgba(22, 101, 52, 0.92)";
  for (const [dx, dy, r] of [
    [12, 12, 13],
    [28, 12, 12],
    [12, 28, 12],
    [28, 28, 13],
    [20, 20, 12],
  ]) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(74, 222, 128, 0.35)";
  ctx.beginPath();
  ctx.arc(x + 14, y + 11, 5, 0, Math.PI * 2);
  ctx.arc(x + 27, y + 25, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawTank(ctx: CanvasRenderingContext2D, t: Tank, time: number) {
  const color = t.player >= 0 ? PLAYER_COLORS[t.player] : BOT_COLORS[t.kind as Exclude<TankKind, "player">];
  ctx.save();
  ctx.translate(t.x, t.y);

  ctx.save();
  ctx.rotate(t.angle);
  // tracks
  ctx.fillStyle = "#18181b";
  ctx.fillRect(-17, -16, 34, 8);
  ctx.fillRect(-17, 8, 34, 8);
  ctx.fillStyle = "#52525b";
  const phase = ((t.tread % 6) + 6) % 6;
  for (let i = -17 + phase; i < 17; i += 6) {
    ctx.fillRect(i, -16, 2, 8);
    ctx.fillRect(i, 8, 2, 8);
  }
  // hull
  ctx.fillStyle = t.flash > 0 ? "#ffffff" : color;
  ctx.fillRect(-14, -10, 28, 20);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(-14, 4, 28, 6);
  if (t.kind === "heavy") {
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -8, 24, 16);
  }
  ctx.restore();

  // turret
  ctx.save();
  ctx.rotate(t.turret);
  ctx.fillStyle = "#27272a";
  ctx.fillRect(4, t.kind === "heavy" ? -4 : -3, 20, t.kind === "heavy" ? 8 : 6);
  ctx.fillStyle = t.flash > 0 ? "#ffffff" : color;
  ctx.beginPath();
  ctx.arc(0, 0, t.kind === "heavy" ? 10 : 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  if (t.shield > 0) {
    const blink = t.shield < 1.5 && Math.floor(time * 10) % 2 === 0;
    if (!blink) {
      ctx.strokeStyle = "rgba(103, 232, 249, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 23 + Math.sin(time * 8) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (t.hp < t.maxHp || t.player >= 0) {
    const w = 30;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(-w / 2, -28, w, 4);
    ctx.fillStyle = t.hp / t.maxHp > 0.5 ? "#4ade80" : t.hp / t.maxHp > 0.25 ? "#facc15" : "#ef4444";
    ctx.fillRect(-w / 2, -28, (w * t.hp) / t.maxHp, 4);
  }
  if (t.player >= 0) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`P${t.player + 1}`, 0, -31);
  }
  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, g: Game) {
  ctx.save();
  if (g.shake > 0) ctx.translate(rand(-g.shake, g.shake), rand(-g.shake, g.shake));

  // ground
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = (r + c) % 2 ? "#3f4a32" : "#434f35";
      ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = g.grid[r][c];
      if (v === BRICK) drawBrick(ctx, c * TILE, r * TILE, g.brickHp[r][c]);
      else if (v === STEEL) drawSteel(ctx, c * TILE, r * TILE);
    }
  }

  // power-ups
  for (const pu of g.powerups) {
    if (pu.life < 3 && Math.floor(g.time * 8) % 2 === 0) continue;
    const s = POWER_STYLE[pu.kind];
    const bob = Math.sin(g.time * 4 + pu.x) * 2;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.arc(pu.x, pu.y + 4, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(pu.x, pu.y + bob, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.label, pu.x, pu.y + bob + 1);
    ctx.textBaseline = "alphabetic";
  }

  for (const t of g.tanks) drawTank(ctx, t, g.time);

  // bullets
  for (const b of g.bullets) {
    ctx.fillStyle = b.team === 9 ? "#fca5a5" : "#fef08a";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (g.grid[r][c] === BUSH) drawBush(ctx, c * TILE, r * TILE);

  for (const p of g.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.5 + 0.5 * (p.life / p.max)), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (g.bannerTime > 0 && g.banner) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.bannerTime * 2);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, HEIGHT / 2 - 40, WIDTH, 80);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Heebo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.fillText(g.banner, WIDTH / 2, HEIGHT / 2);
    ctx.restore();
  }
}
