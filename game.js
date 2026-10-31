(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // World & rules
  // ---------------------------------------------------------------------------

  const W = 1900;
  const H = 1140;
  const VIEW_W = 1000;
  const VIEW_H = 600;
  const VIEW_SCALE = VIEW_W / W;
  const RENDER_SCALE = 1;
  const STATIC_DPR = RENDER_SCALE;
  const POTATO = true;
  const M = 20;
  const HUD_H = 80;
  const CW = VIEW_W;
  const CH = HUD_H + VIEW_H;
  const TAU = Math.PI * 2;
  const R = 15;

  const GREEN = "#5ee08a";
  const TEAL = "#5ee0d8";
  const RED = "#ff6b6b";
  const PLAYER_COLORS = { h1: GREEN, h2: TEAL, seeker: RED };
  const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  const PHASE = {
    READY: "ready",
    START: "start",
    HIDE: "hide",
    LOOKBACK: "lookback",
    SEEK: "seek",
    OVER: "over",
    MATCH: "match",
  };

  const START_TIME = 2;
  const LOOKBACK_TIME = 1;

  const RULES = {
    2: { headStart: 6, seekTime: 40 },
    3: { headStart: 8, seekTime: 60 },
    twoSeekers: { headStart: 8, seekTime: 35 },
  };

  const CFG = {
    tagDist: 43,
    pingRange: 240,
    pingCooldown: 7,
    pingReveal: 1.6,
    pingWaveDur: 2.2,
    hider: {
      walk: 284,
      sprint: 429,
      hideSpeed: 1.25,
      seekWalk: 0.5,
      seekSprint: 0.5,
      darkSpeed: 1.1,
    },
    seeker: { walk: 304, sprint: 424, finalBoost: 1.15 },
    door: { channel: 0.75, cooldown: 5 },
    hard: {
      dashDuration: 0.18,
      dashCost: 90,
      dashMin: 50,
      woundedSlow: 0.5,
      woundedTime: 3,
      bleedTime: 7,
      trailLife: 2,
      seekerSlow: 0.5,
      seekerSlowTime: 3,
      healTime: 2.5,
      healDist: 42,
      stillSpeed: 16,
      radarLife: 15,
      radarRange: 225,
      radarSlow: 0.9,
      radarCooldown: 12.5,
      spikeHitCooldown: 1,
    },
    stamina: {
      max: 100,
      drain: 42,
      regen: 20,
      recoverDelay: 0.6,
      min: 25,
    },
  };

  const FLASHLIGHT = {
    range: 280,
    cone: 30,
    hiderRangeMult: 0.7,
  };

  const SEEKER_LIGHT_MODES = [
    { cone: 35, rangeMult: 1.5 },
    { cone: 75, rangeMult: 1 },
    { cone: 360, rangeMult: 0.3 },
  ];

  let WALLS = [
    { x: 210, y: 20, w: 26, h: 230 },
    { x: 210, y: 430, w: 26, h: 330 },
    { x: 1060, y: 20, w: 26, h: 230 },
    { x: 1060, y: 430, w: 26, h: 330 },
    { x: 480, y: 140, w: 320, h: 26 },
    { x: 480, y: 640, w: 320, h: 26 },
    { x: 300, y: 100, w: 150, h: 26 },
    { x: 300, y: 680, w: 150, h: 26 },
    { x: 850, y: 100, w: 150, h: 26 },
    { x: 850, y: 680, w: 150, h: 26 },
    { x: 610, y: 340, w: 100, h: 110 },
    { x: 1300, y: 40, w: 26, h: 220 },
    { x: 1300, y: 400, w: 300, h: 26 },
    { x: 1480, y: 460, w: 26, h: 180 },
    { x: 800, y: 780, w: 400, h: 26 },
  ];

  let HIDES = [
    { x: 60, y: 150, w: 110, h: 110, type: "building" },
    { x: 280, y: 260, w: 120, h: 110, type: "building" },
    { x: 60, y: 560, w: 110, h: 110, type: "building" },
    { x: 300, y: 520, w: 120, h: 110, type: "building" },
    { x: 620, y: 40, w: 140, h: 80, type: "bush" },
    { x: 450, y: 280, w: 120, h: 100, type: "building" },
    { x: 640, y: 500, w: 140, h: 110, type: "building" },
    { x: 880, y: 150, w: 110, h: 110, type: "building" },
    { x: 1130, y: 260, w: 110, h: 110, type: "bush" },
    { x: 870, y: 330, w: 120, h: 110, type: "building" },
    { x: 1130, y: 540, w: 110, h: 110, type: "building" },
    { x: 900, y: 540, w: 120, h: 110, type: "building" },
    { x: 760, y: 300, w: 100, h: 110, type: "building" },
    { x: 600, y: 676, w: 140, h: 80, type: "bush" },
    { x: 1350, y: 120, w: 130, h: 110, type: "building" },
    { x: 1500, y: 300, w: 100, h: 100, type: "bush" },
    { x: 1340, y: 480, w: 140, h: 110, type: "building" },
    { x: 1495, y: 650, w: 100, h: 110, type: "building" },
    { x: 1350, y: 810, w: 140, h: 100, type: "building" },
    { x: 1120, y: 820, w: 140, h: 90, type: "bush" },
    { x: 900, y: 820, w: 130, h: 90, type: "bush" },
  ];

  let SPAWN = {
    hiders: [
      { x: 650, y: 300 },
      { x: 730, y: 480 },
    ],
    seeker: { x: 85, y: 85 },
    seeker2: { x: 150, y: 85 },
  };

  const YARD_WALLS = [
    { x: 760, y: 350, w: 26, h: 220 },
    { x: 650, y: 460, w: 240, h: 26 },
    { x: 300, y: 300, w: 220, h: 26 },
    { x: 1100, y: 300, w: 220, h: 26 },
    { x: 300, y: 650, w: 220, h: 26 },
    { x: 1100, y: 650, w: 220, h: 26 },
    { x: 540, y: 520, w: 26, h: 150 },
    { x: 1060, y: 520, w: 26, h: 150 },
  ];

  const YARD_HIDES = [
    { x: 140, y: 120, w: 140, h: 120, type: "building" },
    { x: 370, y: 80, w: 120, h: 100, type: "building" },
    { x: 700, y: 100, w: 150, h: 110, type: "building" },
    { x: 1050, y: 100, w: 130, h: 120, type: "building" },
    { x: 1350, y: 120, w: 150, h: 110, type: "building" },
    { x: 150, y: 420, w: 130, h: 120, type: "building" },
    { x: 400, y: 430, w: 140, h: 110, type: "building" },
    { x: 900, y: 420, w: 150, h: 120, type: "building" },
    { x: 1250, y: 420, w: 140, h: 110, type: "building" },
    { x: 150, y: 720, w: 150, h: 110, type: "building" },
    { x: 500, y: 730, w: 140, h: 110, type: "building" },
    { x: 1000, y: 720, w: 150, h: 120, type: "building" },
    { x: 1350, y: 720, w: 130, h: 110, type: "building" },
    { x: 620, y: 300, w: 120, h: 90, type: "bush" },
    { x: 950, y: 600, w: 110, h: 90, type: "bush" },
    { x: 600, y: 600, w: 120, h: 90, type: "bush" },
  ];

  const YARD_SPAWN = {
    hiders: [
      { x: 800, y: 300 },
      { x: 800, y: 650 },
    ],
    seeker: { x: 200, y: 300 },
    seeker2: { x: 200, y: 350 },
  };

  const DEPOT_WALLS = [
    { x: 400, y: 470, w: 300, h: 26 },
    { x: 930, y: 470, w: 300, h: 26 },
    { x: 300, y: 300, w: 26, h: 150 },
    { x: 1300, y: 300, w: 26, h: 150 },
    { x: 300, y: 560, w: 26, h: 150 },
    { x: 1300, y: 560, w: 26, h: 150 },
    { x: 800, y: 280, w: 26, h: 120 },
    { x: 800, y: 580, w: 26, h: 150 },
  ];

  const DEPOT_HIDES = [
    { x: 150, y: 120, w: 160, h: 120, type: "building" },
    { x: 700, y: 120, w: 180, h: 120, type: "building" },
    { x: 1310, y: 120, w: 160, h: 120, type: "building" },
    { x: 150, y: 420, w: 140, h: 140, type: "building" },
    { x: 720, y: 420, w: 160, h: 140, type: "building" },
    { x: 1340, y: 420, w: 140, h: 140, type: "building" },
    { x: 150, y: 730, w: 160, h: 120, type: "building" },
    { x: 700, y: 730, w: 180, h: 120, type: "building" },
    { x: 1310, y: 730, w: 160, h: 120, type: "building" },
    { x: 450, y: 320, w: 120, h: 90, type: "bush" },
    { x: 1100, y: 320, w: 120, h: 90, type: "bush" },
    { x: 450, y: 610, w: 120, h: 90, type: "bush" },
    { x: 1100, y: 610, w: 120, h: 90, type: "bush" },
  ];

  const DEPOT_SPAWN = {
    hiders: [
      { x: 850, y: 300 },
      { x: 850, y: 650 },
    ],
    seeker: { x: 250, y: 300 },
    seeker2: { x: 400, y: 300 },
  };

  const GATE_WALLS = [
    { x: 500, y: 300, w: 26, h: 130 },
    { x: 1000, y: 300, w: 26, h: 130 },
    { x: 500, y: 650, w: 26, h: 130 },
    { x: 1000, y: 650, w: 26, h: 130 },
  ];

  const GATE_HIDES = [
    { x: 200, y: 150, w: 180, h: 130, type: "building" },
    { x: 700, y: 150, w: 180, h: 130, type: "building" },
    { x: 1200, y: 150, w: 180, h: 130, type: "building" },
    { x: 200, y: 500, w: 180, h: 130, type: "building" },
    { x: 700, y: 500, w: 180, h: 130, type: "building" },
    { x: 1200, y: 500, w: 180, h: 130, type: "building" },
    { x: 200, y: 800, w: 180, h: 130, type: "building" },
    { x: 700, y: 800, w: 180, h: 130, type: "building" },
    { x: 1200, y: 800, w: 180, h: 130, type: "building" },
    { x: 350, y: 330, w: 100, h: 80, type: "bush" },
    { x: 850, y: 330, w: 100, h: 80, type: "bush" },
  ];

  const GATE_SPAWN = {
    hiders: [
      { x: 800, y: 300 },
      { x: 800, y: 700 },
    ],
    seeker: { x: 250, y: 300 },
    seeker2: { x: 400, y: 300 },
  };

  const GATE_DOORS = [
    { x: 1760, y: 60, w: 60, h: 90 },
    { x: 1760, y: 990, w: 60, h: 90 },
  ];

  const MAPS = [
    {
      name: "CAMP",
      walls: WALLS,
      hides: HIDES,
      spawn: SPAWN,
      lamps: [{ x: 420, y: 400, radius: 160 }],
      doors: [],
    },
    {
      name: "YARD",
      walls: YARD_WALLS,
      hides: YARD_HIDES,
      spawn: YARD_SPAWN,
      lamps: [{ x: 950, y: 300, radius: 160 }],
      doors: [],
    },
    {
      name: "DEPOT",
      walls: DEPOT_WALLS,
      hides: DEPOT_HIDES,
      spawn: DEPOT_SPAWN,
      lamps: [{ x: 600, y: 350, radius: 160 }],
      doors: [],
    },
    {
      name: "GATE",
      walls: GATE_WALLS,
      hides: GATE_HIDES,
      spawn: GATE_SPAWN,
      lamps: [{ x: 950, y: 700, radius: 160 }],
      doors: GATE_DOORS,
    },
  ];
  for (const map of MAPS) {
    map.walls.forEach((wall, index) => {
      wall.spiked = index % 2 === 0;
    });
  }

  let mapIndex = 0;
  let LAMPS = MAPS[0].lamps;
  let DOORS = MAPS[0].doors;

  const MENU = {
    map: { x: 20, y: 12, w: 132, h: 30 },
    hard: { x: 160, y: 12, w: 100, h: 30 },
    ai: { x: 268, y: 12, w: 100, h: 30 },
    b2: { x: 20, y: 48, w: 120, h: 30 },
    b3: { x: 148, y: 48, w: 120, h: 30 },
    duo: { x: 276, y: 48, w: 132, h: 30 },
    fullscreen: { x: 780, y: 596, w: 190, h: 34 },
    start: { x: 300, y: 560, w: 400, h: 50 },
    controls: { x: 815, y: 22, w: 155, h: 36 },
  };

  const DEFAULT_CONTROLS = {
    h1: {
      up: "KeyW",
      down: "KeyS",
      left: "KeyA",
      right: "KeyD",
      sprint: "ShiftLeft",
      light: "KeyF",
      ping: "KeyQ",
    },
    h2: {
      up: "KeyI",
      down: "KeyK",
      left: "KeyJ",
      right: "KeyL",
      sprint: "Period",
      light: "Semicolon",
      ping: "KeyU",
    },
    seeker: {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      sprint: "ShiftRight",
      ping: "Space",
      light: "Enter",
    },
  };

  const CONTROL_GROUPS = [
    {
      key: "h1",
      title: "PLAYER 1",
      color: GREEN,
      actions: ["up", "down", "left", "right", "sprint", "light", "ping"],
    },
    {
      key: "h2",
      title: "PLAYER 2",
      color: TEAL,
      actions: ["up", "down", "left", "right", "sprint", "light", "ping"],
    },
    {
      key: "seeker",
      title: "PLAYER 3",
      color: RED,
      actions: ["up", "down", "left", "right", "sprint", "light", "ping"],
    },
  ];

  const ACTION_LABELS = {
    up: "MOVE UP",
    down: "MOVE DOWN",
    left: "MOVE LEFT",
    right: "MOVE RIGHT",
    sprint: "SPRINT",
    light: "LIGHT",
    ping: "PING",
  };

  const RESERVED_KEYS = new Set([
    "Escape",
    "KeyP",
    "KeyM",
    "KeyN",
    "Tab",
    "MetaLeft",
    "MetaRight",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
  ]);

  // ---------------------------------------------------------------------------
  // Small helpers
  // ---------------------------------------------------------------------------

  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  function seeded(seed) {
    let s = seed >>> 0;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function pointInRect(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function roundRectPath(x, y, w, h, r, c) {
    const g = c || ctx;
    g.beginPath();
    g.rect(x, y, w, h);
  }

  function fillRoundRect(x, y, w, h, r, fill) {
    roundRectPath(x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  const KEY_LABELS = {
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    ShiftLeft: "L-SHIFT",
    ShiftRight: "R-SHIFT",
    ControlLeft: "L-CTRL",
    ControlRight: "R-CTRL",
    AltLeft: "L-ALT",
    AltRight: "R-ALT",
    Space: "SPACE",
    Enter: "ENTER",
    Tab: "TAB",
    Backspace: "BACKSPACE",
    CapsLock: "CAPS",
    Period: ".",
    Comma: ",",
    Slash: "/",
    Semicolon: ";",
    Quote: "'",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
    Minus: "-",
    Equal: "=",
    Backquote: "`",
  };

  function keyLabel(code) {
    if (!code) return "—";
    if (KEY_LABELS[code]) return KEY_LABELS[code];
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    if (code.startsWith("Numpad")) return "NUM " + code.slice(6);
    return code.toUpperCase();
  }

  function moveLabel(bind) {
    return [bind.up, bind.left, bind.down, bind.right]
      .map(keyLabel)
      .join(" ");
  }

  function playerName(group) {
    return group === "h1" ? "PLAYER 1" : group === "h2" ? "PLAYER 2" : "PLAYER 3";
  }

  // ---------------------------------------------------------------------------
  // Canvas
  // ---------------------------------------------------------------------------

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });
  ctx.imageSmoothingEnabled = true;

  function resizeCanvas() {
    canvas.width = Math.round(CW * RENDER_SCALE);
    canvas.height = Math.round(CH * RENDER_SCALE);
    ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // ---------------------------------------------------------------------------
  // Static artwork
  // ---------------------------------------------------------------------------

  const background = (() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");

    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0e1e16");
    grad.addColorStop(0.55, "#0b1811");
    grad.addColorStop(1, "#08120d");
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    for (let x = 0; x < W; x += 64) {
      if ((x / 64) % 2 === 0) {
        g.fillStyle = "rgba(255, 255, 255, 0.014)";
        g.fillRect(x, 0, 64, H);
      }
    }

    const r = seeded(20240607);
    g.lineCap = "round";
    for (let i = 0; i < 1050; i++) {
      const x = r() * W;
      const y = r() * H;
      const a = 0.025 + r() * 0.05;
      g.strokeStyle = `rgba(126, 200, 154, ${a})`;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (r() - 0.5) * 5, y - 2 - r() * 5);
      g.stroke();
    }

    for (let i = 0; i < 150; i++) {
      const x = r() * W;
      const y = r() * H;
      g.fillStyle = `rgba(180, 230, 198, ${0.012 + r() * 0.02})`;
      g.beginPath();
      g.arc(x, y, 1 + r() * 2, 0, TAU);
      g.fill();
    }

    const vig = g.createRadialGradient(W / 2, H / 2, 250, W / 2, H / 2, 830);
    vig.addColorStop(0, "rgba(0, 0, 0, 0)");
    vig.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    g.fillStyle = vig;
    g.fillRect(0, 0, W, H);

    return c;
  })();

  function buildHideArt(hides) {
    return hides.map((b, i) => {
      const r = seeded(i * 977 + 41);
      const blobs = [];
      const cr = Math.min(b.w, b.h);
      for (let k = 0; k < 12; k++) {
        const ang = r() * TAU;
        const reach = 0.16 + r() * 0.32;
        blobs.push({
          x: b.w / 2 + Math.cos(ang) * b.w * reach * 0.55,
          y: b.h / 2 + Math.sin(ang) * b.h * reach * 0.55,
          r: cr * (0.17 + r() * 0.16),
          tone: r(),
          hx: r(),
          hy: r(),
        });
      }
      blobs.sort((a, b2) => a.tone - b2.tone);
      return blobs;
    });
  }

  function drawBushStatic(g, b, blobs) {
    g.save();
    g.fillStyle = "rgba(0, 0, 0, 0.32)";
    g.beginPath();
    g.ellipse(
      b.x + b.w / 2,
      b.y + b.h * 0.82,
      b.w * 0.52,
      b.h * 0.26,
      0,
      0,
      TAU
    );
    g.fill();

    for (const blob of blobs) {
      let color;
      if (blob.tone < 0.45) color = "#0f2a1b";
      else if (blob.tone < 0.8) color = "#173a25";
      else color = "#205033";
      g.fillStyle = color;
      g.beginPath();
      g.arc(b.x + blob.x, b.y + blob.y, blob.r, 0, TAU);
      g.fill();
    }

    for (const blob of blobs) {
      if (blob.tone < 0.68) continue;
      g.fillStyle = "rgba(88, 168, 112, 0.35)";
      g.beginPath();
      g.arc(
        b.x + blob.x - 3,
        b.y + blob.y - 4,
        blob.r * 0.34,
        0,
        TAU
      );
      g.fill();
    }
    g.restore();
  }

  const BUILDING_PALETTES = [
    {
      roofA: "#3a4d55",
      roofB: "#1f2c31",
      trim: "#5b747e",
      door: "#e6c77e",
      chimney: "#4a342c",
    },
    {
      roofA: "#4b3a2f",
      roofB: "#2a201a",
      trim: "#6d5544",
      door: "#f0d18a",
      chimney: "#3f2b25",
    },
    {
      roofA: "#3c4c42",
      roofB: "#22302a",
      trim: "#5c7265",
      door: "#dcbd72",
      chimney: "#46322a",
    },
    {
      roofA: "#3e4757",
      roofB: "#232a36",
      trim: "#5f6d82",
      door: "#e6c77e",
      chimney: "#42302a",
    },
  ];

  function drawBuildingStatic(g, b, index) {
    const pal = BUILDING_PALETTES[index % BUILDING_PALETTES.length];
    const x = b.x;
    const y = b.y;
    const w = b.w;
    const h = b.h;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const wide = w >= h;

    g.save();

    // cast shadow
    g.fillStyle = "rgba(0, 0, 0, 0.42)";
    roundRectPath(x + 4, y + 7, w, h, 8, g);
    g.fill();

    // eaves and walls
    roundRectPath(x, y, w, h, 8, g);
    g.fillStyle = pal.roofB;
    g.fill();
    g.strokeStyle = "rgba(0, 0, 0, 0.45)";
    g.lineWidth = 2;
    g.stroke();

    // sloped roof face
    const inset = 7;
    const rx = x + inset;
    const ry = y + inset;
    const rw = w - inset * 2;
    const rh = h - inset * 2;
    const grad = g.createLinearGradient(
      rx,
      ry,
      wide ? rx : rx + rw,
      wide ? ry + rh : ry
    );
    grad.addColorStop(0, pal.roofA);
    grad.addColorStop(1, pal.roofB);
    roundRectPath(rx, ry, rw, rh, 4, g);
    g.fillStyle = grad;
    g.fill();

    // shingle rows
    g.save();
    roundRectPath(rx, ry, rw, rh, 4, g);
    g.clip();
    g.strokeStyle = "rgba(0, 0, 0, 0.22)";
    g.lineWidth = 1;
    if (wide) {
      for (let ly = ry + 9; ly < ry + rh; ly += 9) {
        g.beginPath();
        g.moveTo(rx, ly);
        g.lineTo(rx + rw, ly);
        g.stroke();
      }
    } else {
      for (let lx = rx + 9; lx < rx + rw; lx += 9) {
        g.beginPath();
        g.moveTo(lx, ry);
        g.lineTo(lx, ry + rh);
        g.stroke();
      }
    }
    g.restore();

    // ridge cap
    g.strokeStyle = pal.trim;
    g.globalAlpha = 0.55;
    g.lineWidth = 3;
    g.beginPath();
    if (wide) {
      g.moveTo(rx + 6, cy);
      g.lineTo(rx + rw - 6, cy);
    } else {
      g.moveTo(cx, ry + 6);
      g.lineTo(cx, ry + rh - 6);
    }
    g.stroke();
    g.globalAlpha = 1;

    g.strokeStyle = "rgba(255, 255, 255, 0.12)";
    g.lineWidth = 1;
    g.beginPath();
    if (wide) {
      g.moveTo(rx + 6, cy - 2);
      g.lineTo(rx + rw - 6, cy - 2);
    } else {
      g.moveTo(cx - 2, ry + 6);
      g.lineTo(cx - 2, ry + rh - 6);
    }
    g.stroke();

    // chimney
    const chW = 12;
    const chH = 12;
    const chX = index % 2 === 0 ? rx + rw - chW - 8 : rx + 8;
    const chY = ry + 8;
    g.fillStyle = pal.chimney;
    roundRectPath(chX, chY, chW, chH, 2, g);
    g.fill();
    g.fillStyle = "rgba(0, 0, 0, 0.35)";
    g.fillRect(chX + 2, chY + 2, chW - 4, 2);
    g.strokeStyle = pal.trim;
    g.globalAlpha = 0.5;
    g.lineWidth = 1;
    roundRectPath(chX, chY, chW, chH, 2, g);
    g.stroke();
    g.globalAlpha = 1;

    // eave highlight
    g.strokeStyle = "rgba(255, 255, 255, 0.08)";
    g.lineWidth = 1;
    roundRectPath(x + 1.5, y + 1.5, w - 3, h - 3, 7, g);
    g.stroke();

    // door and step on the south side
    const doorW = 20;
    const doorH = 12;
    const dx = cx - doorW / 2;
    const dy = y + h - doorH - 2;
    g.fillStyle = "rgba(12, 10, 8, 0.95)";
    roundRectPath(dx, dy, doorW, doorH, 2, g);
    g.fill();
    g.strokeStyle = pal.door;
    g.globalAlpha = 0.75;
    g.lineWidth = 1.5;
    roundRectPath(dx, dy, doorW, doorH, 2, g);
    g.stroke();
    g.globalAlpha = 0.35;
    g.fillStyle = pal.door;
    g.fillRect(cx - doorW / 2 - 4, y + h - 4, doorW + 8, 3);
    g.globalAlpha = 1;

    g.restore();
  }

  function drawWallStatic(g, w) {
    g.save();
    g.shadowColor = "rgba(0, 0, 0, 0.45)";
    g.shadowBlur = 10;
    g.shadowOffsetY = 4;
    const grad = g.createLinearGradient(0, w.y, 0, w.y + w.h);
    grad.addColorStop(0, "#4a4a4a");
    grad.addColorStop(1, "#222222");
    roundRectPath(w.x, w.y, w.w, w.h, 5, g);
    g.fillStyle = grad;
    g.fill();
    g.restore();

    g.fillStyle = "rgba(255, 255, 255, 0.09)";
    g.fillRect(w.x + 3, w.y + 2, w.w - 6, 2);
  }

  function drawLampStatic(g, lamp) {
    const x = lamp.x;
    const y = lamp.y;
    g.strokeStyle = "#151515";
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(x, y + 6);
    g.lineTo(x, y + 26);
    g.stroke();
    g.fillStyle = "#222";
    g.fillRect(x - 9, y + 24, 18, 5);
    g.fillStyle = "#ffe9a8";
    g.beginPath();
    g.arc(x, y, 8, 0, TAU);
    g.fill();
    g.strokeStyle = "#000";
    g.lineWidth = 2;
    g.stroke();
    g.strokeStyle = "#333";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x - 10, y);
    g.lineTo(x + 10, y);
    g.stroke();
  }

  function drawDoorStatic(g, door) {
    const x = door.x;
    const y = door.y;
    const w = door.w;
    const h = door.h;
    g.fillStyle = "#08131c";
    g.fillRect(x, y, w, h);
    g.strokeStyle = "#7dd3fc";
    g.lineWidth = 3;
    g.strokeRect(x + 2, y + 2, w - 4, h - 4);
    g.strokeStyle = "rgba(125, 211, 252, 0.35)";
    g.lineWidth = 9;
    g.strokeRect(x + 10, y + 10, w - 20, h - 20);
    g.fillStyle = "#7dd3fc";
    g.beginPath();
    g.arc(x + w - 14, y + h / 2, 4, 0, TAU);
    g.fill();
    g.strokeStyle = "#000";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x + w - 14, y + h / 2, 4, 0, TAU);
    g.stroke();
  }

  function buildStaticArena(walls, hides, art, lamps, doors) {
    const c = document.createElement("canvas");
    c.width = Math.round(VIEW_W * STATIC_DPR);
    c.height = Math.round(VIEW_H * STATIC_DPR);
    const g = c.getContext("2d", { alpha: false });
    const scale = VIEW_SCALE * STATIC_DPR;
    g.scale(scale, scale);
    g.imageSmoothingEnabled = true;

    if (POTATO) {
      g.fillStyle = "#46503e";
      g.fillRect(0, 0, W, H);
      g.strokeStyle = "#37402f";
      g.lineWidth = 3;
      g.beginPath();
      for (let x = 0; x <= W; x += 100) {
        g.moveTo(x, 0);
        g.lineTo(x, H);
      }
      for (let y = 0; y <= H; y += 100) {
        g.moveTo(0, y);
        g.lineTo(W, y);
      }
      g.stroke();

      g.strokeStyle = "#141414";
      g.lineWidth = M;
      g.strokeRect(M / 2, M / 2, W - M, H - M);

      for (let i = 0; i < hides.length; i++) {
        const spot = hides[i];
        if (spot.type === "building") {
          const hue = (i * 47 + 12) % 360;
          g.fillStyle = `hsl(${hue}, 32%, 46%)`;
          g.fillRect(spot.x, spot.y, spot.w, spot.h);
          g.fillStyle = `hsl(${hue}, 34%, 30%)`;
          g.fillRect(spot.x + 8, spot.y + 8, spot.w - 16, spot.h - 16);
          g.fillStyle = "rgba(0, 0, 0, 0.55)";
          g.fillRect(
            spot.x + spot.w * 0.43,
            spot.y + spot.h - 16,
            spot.w * 0.14,
            12
          );
          g.strokeStyle = "#000";
          g.lineWidth = 4;
          g.strokeRect(spot.x + 2, spot.y + 2, spot.w - 4, spot.h - 4);
        } else {
          g.fillStyle = "#3f8a3f";
          g.beginPath();
          g.arc(
            spot.x + spot.w / 2,
            spot.y + spot.h / 2,
            Math.min(spot.w, spot.h) / 2 - 2,
            0,
            TAU
          );
          g.fill();
          g.strokeStyle = "#000";
          g.lineWidth = 4;
          g.stroke();
        }
      }

      for (const wall of walls) {
        g.fillStyle = "#3f3f3f";
        g.fillRect(wall.x, wall.y, wall.w, wall.h);
        g.strokeStyle = "#000";
        g.lineWidth = 4;
        g.strokeRect(wall.x, wall.y, wall.w, wall.h);
      }
    } else {
      g.drawImage(background, 0, 0);

      g.strokeStyle = "#16231c";
      g.lineWidth = M;
      g.strokeRect(M / 2, M / 2, W - M, H - M);
      g.strokeStyle = "rgba(255, 255, 255, 0.07)";
      g.lineWidth = 1;
      g.strokeRect(M + 0.5, M + 0.5, W - M * 2 - 1, H - M * 2 - 1);

      for (let i = 0; i < hides.length; i++) {
        const spot = hides[i];
        if (spot.type === "building") {
          drawBuildingStatic(g, spot, i);
        } else {
          drawBushStatic(g, spot, art[i]);
        }
      }
      for (const wall of walls) drawWallStatic(g, wall);
    }

    for (const lamp of lamps) drawLampStatic(g, lamp);
    for (const door of doors) drawDoorStatic(g, door);

    return c;
  }

  const mapArenas = MAPS.map((map) =>
    buildStaticArena(
      map.walls,
      map.hides,
      buildHideArt(map.hides),
      map.lamps,
      map.doors || []
    )
  );
  let staticArena = mapArenas[0];

  function buildSpikeArena(walls) {
    const c = document.createElement("canvas");
    c.width = Math.round(VIEW_W * STATIC_DPR);
    c.height = Math.round(VIEW_H * STATIC_DPR);
    const g = c.getContext("2d");
    const scale = VIEW_SCALE * STATIC_DPR;
    g.scale(scale, scale);
    g.fillStyle = "#c7d0d4";
    g.strokeStyle = "#111";
    g.lineWidth = 1;
    const step = 20;
    for (const wall of walls) {
      if (!wall.spiked) continue;
      for (let x = wall.x + 4; x < wall.x + wall.w - 4; x += step) {
        g.beginPath();
        g.moveTo(x, wall.y);
        g.lineTo(Math.min(x + 10, wall.x + wall.w), wall.y);
        g.lineTo(x + 5, wall.y - 7);
        g.closePath();
        g.fill();
        g.stroke();

        g.beginPath();
        g.moveTo(x, wall.y + wall.h);
        g.lineTo(Math.min(x + 10, wall.x + wall.w), wall.y + wall.h);
        g.lineTo(x + 5, wall.y + wall.h + 7);
        g.closePath();
        g.fill();
        g.stroke();
      }
      for (let y = wall.y + 4; y < wall.y + wall.h - 4; y += step) {
        g.beginPath();
        g.moveTo(wall.x, y);
        g.lineTo(wall.x, Math.min(y + 10, wall.y + wall.h));
        g.lineTo(wall.x - 7, y + 5);
        g.closePath();
        g.fill();
        g.stroke();

        g.beginPath();
        g.moveTo(wall.x + wall.w, y);
        g.lineTo(wall.x + wall.w, Math.min(y + 10, wall.y + wall.h));
        g.lineTo(wall.x + wall.w + 7, y + 5);
        g.closePath();
        g.fill();
        g.stroke();
      }
    }
    return c;
  }

  const spikeArenas = MAPS.map((map) => buildSpikeArena(map.walls));
  let spikeArena = spikeArenas[0];

  function makeBeamSprite(coneDeg) {
    const size = 512;
    const half = (coneDeg * Math.PI) / 360;
    const feather = 0.06;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d");
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    const radial = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    radial.addColorStop(0, "rgba(255, 255, 255, 1)");
    radial.addColorStop(0.5, "rgba(255, 255, 255, 1)");
    radial.addColorStop(0.82, "rgba(255, 255, 255, 0.55)");
    radial.addColorStop(1, "rgba(255, 255, 255, 0)");
    g.fillStyle = radial;
    g.beginPath();
    g.arc(cx, cy, r, 0, TAU);
    g.fill();

    g.globalCompositeOperation = "destination-in";
    if (typeof g.createConicGradient === "function") {
      // Canvas conic gradients start at 12 o'clock; shift so the beam points right.
      const start = Math.PI / 2 - half - feather;
      const conic = g.createConicGradient(start, cx, cy);
      const f1 = feather / TAU;
      const f2 = (feather + half * 2) / TAU;
      const f3 = (feather * 2 + half * 2) / TAU;
      conic.addColorStop(0, "rgba(0, 0, 0, 0)");
      conic.addColorStop(f1, "rgba(255, 255, 255, 1)");
      conic.addColorStop(f2, "rgba(255, 255, 255, 1)");
      conic.addColorStop(Math.min(f3, 0.999), "rgba(0, 0, 0, 0)");
      conic.addColorStop(1, "rgba(0, 0, 0, 0)");
      g.fillStyle = conic;
      g.fillRect(0, 0, size, size);
    } else {
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, r, -half, half);
      g.closePath();
      g.fill();
    }
    g.globalCompositeOperation = "source-over";
    return c;
  }

  const beams = {
    hider: makeBeamSprite(FLASHLIGHT.cone),
    seekerLong: makeBeamSprite(SEEKER_LIGHT_MODES[0].cone),
    seekerWide: makeBeamSprite(SEEKER_LIGHT_MODES[1].cone),
  };

  const revealGlow = (() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.55)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
  })();

  const darknessCanvas = document.createElement("canvas");
  darknessCanvas.width = Math.round(VIEW_W * RENDER_SCALE);
  darknessCanvas.height = Math.round(VIEW_H * RENDER_SCALE);
  const darknessCtx = darknessCanvas.getContext("2d");
  darknessCtx.imageSmoothingEnabled = true;

  const lightCanvas = document.createElement("canvas");
  lightCanvas.width = darknessCanvas.width;
  lightCanvas.height = darknessCanvas.height;
  const lightCtx = lightCanvas.getContext("2d");
  lightCtx.imageSmoothingEnabled = true;

  function makeBallSprite(light, body, edge, glowColor) {
    const size = 84;
    const quality = 1;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    const cx = size / 2;
    const cy = size / 2;

    g.fillStyle = body;
    g.beginPath();
    g.arc(cx, cy, R, 0, TAU);
    g.fill();
    g.lineWidth = 4;
    g.strokeStyle = "#000";
    g.stroke();

    return { canvas: c, size };
  }

  const ballSprites = {
    h1: makeBallSprite(
      "#b7f7cd",
      GREEN,
      "#1f7a45",
      "rgba(94, 224, 138, 0.16)"
    ),
    h2: makeBallSprite(
      "#c4fbf7",
      TEAL,
      "#1f7a76",
      "rgba(94, 224, 216, 0.18)"
    ),
    seeker: makeBallSprite(
      "#ffb0b0",
      RED,
      "#a32b2b",
      "rgba(255, 107, 107, 0.18)"
    ),
  };

  // ---------------------------------------------------------------------------
  // Audio
  // ---------------------------------------------------------------------------

  let muted = false;
  try {
    muted = localStorage.getItem("hide-and-seek-muted") === "1";
  } catch (e) {
    /* ignore */
  }

  let audio = null;

  function audioCtx() {
    if (muted) return null;
    try {
      if (!audio) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audio = new AC();
      }
      if (audio.state === "suspended") audio.resume();
      return audio;
    } catch (e) {
      return null;
    }
  }

  function tone(freq, dur, type, vol, when, slideTo) {
    const ac = audioCtx();
    if (!ac) return;
    const t0 = ac.currentTime + (when || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.04, t0 + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  const sfx = {
    start() {
      tone(392, 0.1, "triangle", 0.045, 0);
      tone(523, 0.12, "triangle", 0.045, 0.09);
      tone(659, 0.18, "triangle", 0.045, 0.19);
    },
    tick() {
      tone(880, 0.05, "square", 0.018, 0);
    },
    go() {
      tone(523, 0.1, "square", 0.04, 0);
      tone(784, 0.22, "square", 0.04, 0.1);
    },
    ping() {
      tone(1250, 0.24, "sine", 0.035, 0, 420);
    },
    tag() {
      tone(150, 0.2, "sawtooth", 0.07, 0, 60);
      tone(90, 0.28, "triangle", 0.07, 0.02, 45);
    },
    hiderWin() {
      tone(440, 0.12, "triangle", 0.05, 0);
      tone(554, 0.12, "triangle", 0.05, 0.11);
      tone(659, 0.2, "triangle", 0.05, 0.22);
      tone(880, 0.3, "triangle", 0.045, 0.34);
    },
    bell() {
      tone(880, 0.7, "sine", 0.045, 0);
      tone(1320, 0.55, "sine", 0.022, 0.012);
      tone(1760, 0.4, "sine", 0.012, 0.024);
    },
    teleport() {
      tone(520, 0.18, "sine", 0.03, 0, 980);
      tone(1040, 0.2, "sine", 0.02, 0.05, 1560);
    },
    dash() {
      tone(240, 0.14, "sawtooth", 0.035, 0, 540);
    },
    radar() {
      tone(320, 0.25, "sine", 0.04, 0, 640);
      tone(640, 0.2, "sine", 0.02, 0.12);
    },
    spike() {
      tone(170, 0.1, "square", 0.03, 0, 80);
    },
    heal() {
      tone(660, 0.2, "sine", 0.03, 0);
      tone(990, 0.25, "sine", 0.02, 0.12);
    },
    click() {
      tone(660, 0.04, "square", 0.015);
    },
    lightSwitch() {
      tone(240, 0.03, "square", 0.022);
      tone(90, 0.05, "square", 0.018, 0.025);
    },
  };

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const pressed = new Set();
  let phase = PHASE.READY;
  let menuScreen = "main";
  let phaseLeft = 0;
  let lastTick = -1;
  let roundNum = 1;
  let winner = null;
  let endReason = "";
  let overSince = 0;
  let paused = false;
  let time = 0;
  let ping = null;
  let particles = [];
  let shake = 0;
  let toast = null;
  let seekerBoost = 0;
  let seekerBoostTriggered = false;
  let bellPlayed = false;
  let seekerDoorBoost = 1;
  let mode = loadMode();
  let twoSeekers = mode === 3 && loadTwoSeekers();
  let hardMode = loadHardMode();
  let aiMode = loadAiMode();
  let radars = [];
  const roundAssignments = new Map();
  let controls = loadControls();
  let rebinding = null;
  let controlsNotice = 0;
  let hiders = [];
  let seeker = makeEntity(SPAWN.seeker, -1);
  let seeker2 = null;
  seeker.pingCD = 0;
  let mouse = { x: -1, y: -1 };

  function loadMode() {
    try {
      return localStorage.getItem("hide-and-seek-mode") === "3" ? 3 : 2;
    } catch (e) {
      return 2;
    }
  }

  function saveMode() {
    try {
      localStorage.setItem("hide-and-seek-mode", String(mode));
    } catch (e) {
      /* ignore */
    }
  }

  function loadHardMode() {
    try {
      return localStorage.getItem("hide-and-seek-hard") === "1";
    } catch (e) {
      return false;
    }
  }

  function saveHardMode() {
    try {
      localStorage.setItem("hide-and-seek-hard", hardMode ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  }

  function loadAiMode() {
    try {
      return localStorage.getItem("hide-and-seek-ai") === "1";
    } catch (e) {
      return false;
    }
  }

  function saveAiMode() {
    try {
      localStorage.setItem("hide-and-seek-ai", aiMode ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  }

  function loadTwoSeekers() {
    try {
      return localStorage.getItem("hide-and-seek-duo") === "1";
    } catch (e) {
      return false;
    }
  }

  function saveTwoSeekers() {
    try {
      localStorage.setItem("hide-and-seek-duo", twoSeekers ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  }

  function defaultControls() {
    return JSON.parse(JSON.stringify(DEFAULT_CONTROLS));
  }

  function loadControls() {
    const result = defaultControls();
    try {
      const raw = localStorage.getItem("hide-and-seek-controls");
      if (!raw) return result;
      const saved = JSON.parse(raw);
      for (const group of Object.keys(result)) {
        if (!saved || !saved[group]) continue;
        for (const action of Object.keys(result[group])) {
          const code = saved[group][action];
          if (typeof code === "string" && code) {
            result[group][action] = code;
          }
        }
      }
    } catch (e) {
      /* ignore */
    }
    return result;
  }

  function saveControls() {
    try {
      localStorage.setItem("hide-and-seek-controls", JSON.stringify(controls));
    } catch (e) {
      /* ignore */
    }
  }

  function rules() {
    return twoSeekers && mode === 3 ? RULES.twoSeekers : RULES[mode];
  }

  function aliveHiders() {
    return hiders.reduce((n, h) => n + (h.alive ? 1 : 0), 0);
  }

  function playerGroups() {
    return mode === 3 ? ["h1", "h2", "seeker"] : ["h1", "seeker"];
  }

  function roleAssignmentForRound(round) {
    if (roundAssignments.has(round)) return roundAssignments.get(round);
    const groups = playerGroups();
    const previous = roundAssignments.get(round - 1);
    let assignment;
    if (twoSeekers && mode === 3) {
      let candidates = previous
        ? groups.filter((g) => !previous.hiderGroups.includes(g))
        : groups;
      if (!candidates.length) candidates = groups;
      const hiderGroup =
        candidates[Math.floor(Math.random() * candidates.length)];
      assignment = {
        hiderGroups: [hiderGroup],
        seekerGroups: groups.filter((g) => g !== hiderGroup),
      };
    } else {
      let candidates = groups;
      if (mode === 3 && previous) {
        candidates = groups.filter((g) => !previous.seekerGroups.includes(g));
        if (!candidates.length) candidates = groups;
      }
      const seekerGroup =
        candidates[Math.floor(Math.random() * candidates.length)];
      assignment = {
        hiderGroups: groups.filter((g) => g !== seekerGroup),
        seekerGroups: [seekerGroup],
      };
    }
    roundAssignments.set(round, assignment);
    return assignment;
  }

  function seekerGroupForRound(round) {
    return roleAssignmentForRound(round).seekerGroups[0];
  }

  function hiderGroupsForRound(round) {
    return roleAssignmentForRound(round).hiderGroups;
  }

  function duoHiderGroupForRound(round) {
    return roleAssignmentForRound(round).hiderGroups[0];
  }

  function duoSeekerGroupsForRound(round) {
    return roleAssignmentForRound(round).seekerGroups;
  }

  function activeSeekers() {
    return [seeker, seeker2].filter((ent) => ent && !ent.eliminated);
  }

  function makeEntity(spawn, id, ctrl) {
    const group = ctrl || (id >= 0 ? (id === 0 ? "h1" : "h2") : "seeker");
    return {
      ctrl: group,
      flashlightOn: true,
      lightMode: 0,
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      facing: { x: 0, y: 1 },
      stamina: CFG.stamina.max,
      staminaDelay: 0,
      exhausted: false,
      sprinting: false,
      insideHide: false,
      hideType: null,
      spotted: true,
      leafT: 0,
      doorCooldown: 0,
      teleportT: 0,
      teleportDoor: -1,
      dashT: 0,
      dashX: 0,
      dashY: 0,
      wounded: false,
      woundT: 0,
      bleedT: 0,
      spikeSlowT: 0,
      spikeHitCD: 0,
      eliminated: false,
      trail: [],
      healT: 0,
      healer: null,
      aiDir: { x: 0, y: 0 },
      aiSprint: false,
      aiHide: -1,
      aiHideX: 0,
      aiHideY: 0,
      aiSearch: -1,
      aiBias: Math.random() * 2 - 1,
      aiCheckX: spawn.x,
      aiCheckY: spawn.y,
      aiCheckT: 0,
      aiStuckT: 0,
      aiLastX: spawn.x,
      aiLastY: spawn.y,
      aiHistX: spawn.x,
      aiHistY: spawn.y,
      aiHistT: 0,
      aiTravel: 0,
      aiWanderT: 0,
      aiWanderX: 0,
      aiWanderY: 0,
      pingCD: 0,
      revealT: 0,
      alive: true,
      id: id === undefined ? 0 : id,
      color: PLAYER_COLORS[group] || RED,
    };
  }

  function resetEntities() {
    if (twoSeekers && mode === 3) {
      const hiderGroup = duoHiderGroupForRound(roundNum);
      const seekerGroups = duoSeekerGroupsForRound(roundNum);
      hiders = [makeEntity(SPAWN.hiders[0], 0, hiderGroup)];
      seeker = makeEntity(SPAWN.seeker, -1, seekerGroups[0]);
      seeker2 = makeEntity(SPAWN.seeker2 || SPAWN.seeker, -1, seekerGroups[1]);
      seeker.pingCD = 0;
      seeker2.pingCD = 0;
    } else {
      seeker2 = null;
      const seekerGroup = seekerGroupForRound(roundNum);
      const hiderGroups = hiderGroupsForRound(roundNum);
      hiders = [makeEntity(SPAWN.hiders[0], 0, hiderGroups[0])];
      if (mode === 3)
        hiders.push(makeEntity(SPAWN.hiders[1], 1, hiderGroups[1]));
      seeker = makeEntity(SPAWN.seeker, -1, seekerGroup);
      seeker.pingCD = 0;
    }
    particles = [];
    ping = null;
    radars = [];
    shake = 0;
    toast = null;
    seekerBoost = 0;
    seekerBoostTriggered = false;
    bellPlayed = false;
    seekerDoorBoost = 1;
  }

  function setGameMode(m, duo) {
    if (m !== 2 && m !== 3) return;
    duo = Boolean(duo) && m === 3;
    if (mode === m && twoSeekers === duo) return;
    mode = m;
    twoSeekers = duo;
    roundAssignments.clear();
    saveMode();
    saveTwoSeekers();
    if (phase === PHASE.READY) resetEntities();
    sfx.click();
  }

  function setMode(m) {
    setGameMode(m, false);
  }

  function setHardMode(on) {
    hardMode = Boolean(on);
    saveHardMode();
    radars = [];
    ping = null;
    if (phase === PHASE.READY) resetEntities();
    sfx.click();
  }

  function setAiMode(on) {
    aiMode = Boolean(on);
    saveAiMode();
    if (phase === PHASE.READY) resetEntities();
    sfx.click();
  }

  function applyMap(index) {
    mapIndex = index;
    WALLS = MAPS[index].walls;
    HIDES = MAPS[index].hides;
    SPAWN = MAPS[index].spawn;
    LAMPS = MAPS[index].lamps;
    DOORS = MAPS[index].doors || [];
    staticArena = mapArenas[index];
    spikeArena = spikeArenas[index];
  }

  function setMap(index) {
    if (phase !== PHASE.READY || menuScreen !== "main") return;
    applyMap(((index % MAPS.length) + MAPS.length) % MAPS.length);
    resetEntities();
    sfx.click();
  }

  function toMenu() {
    phase = PHASE.READY;
    menuScreen = "main";
    rebinding = null;
    controlsNotice = 0;
    roundNum = 1;
    winner = null;
    endReason = "";
    overSince = 0;
    paused = false;
    pressed.clear();
    roundAssignments.clear();
    resetEntities();
    sfx.click();
  }

  // ---------------------------------------------------------------------------
  // Game flow
  // ---------------------------------------------------------------------------

  function startMatch() {
    roundNum = 1;
    menuScreen = "main";
    rebinding = null;
    startRound();
  }

  function startRound() {
    resetEntities();
    phase = PHASE.START;
    phaseLeft = START_TIME;
    lastTick = Math.ceil(phaseLeft);
    winner = null;
    endReason = "";
    overSince = 0;
    paused = false;
    sfx.start();
  }

  function beginHide() {
    phase = PHASE.HIDE;
    phaseLeft = rules().headStart;
    lastTick = Math.ceil(phaseLeft);
  }

  function beginLookBack() {
    phase = PHASE.LOOKBACK;
    phaseLeft = LOOKBACK_TIME;
    lastTick = Math.ceil(phaseLeft);
    toast = { text: "LOOK BACK", color: RED, t: 0, dur: 1.2 };
    sfx.bell();
  }

  function beginSeek() {
    phase = PHASE.SEEK;
    phaseLeft = rules().seekTime;
    lastTick = Math.ceil(phaseLeft);
    seekerBoost = 0;
    seekerBoostTriggered = false;
    bellPlayed = false;
    toast = { text: "GO!", color: RED, t: 0, dur: 0.9 };
    sfx.go();
  }

  function catchHider(hider) {
    hider.alive = false;
    hider.spotted = true;
    hider.revealT = 0;
    hider.vx = hider.vy = 0;
    hider.sprinting = false;
    burst(hider.x, hider.y, hider.color, 24);
    shake = 10;
    sfx.tag();
    if (aliveHiders() > 0) {
      toast = { text: "CAUGHT!", color: RED, t: 0, dur: 1.0 };
    }
  }

  function endRound(who, reason) {
    winner = who;
    endReason = reason;
    phase = PHASE.OVER;
    overSince = 0;

    for (const hider of hiders) {
      hider.vx = hider.vy = 0;
      hider.sprinting = false;
      hider.spotted = true;
    }
    for (const ent of activeSeekers()) {
      ent.vx = ent.vy = 0;
      ent.sprinting = false;
    }

    if (who === "seeker") {
      shake = 10;
      for (const ent of activeSeekers()) burst(ent.x, ent.y, ent.color, 24);
    } else {
      for (const hider of hiders) {
        if (hider.alive) burst(hider.x, hider.y, hider.color, 24);
      }
      sfx.hiderWin();
    }

  }

  function nextRound() {
    if (overSince < 0.55) return;
    roundNum += 1;
    startRound();
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------

  const PREVENT = new Set([
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    " ",
    "/",
    "f1",
  ]);

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    const code = e.code || "";
    if (PREVENT.has(k) || rebinding) e.preventDefault();
    if (e.repeat) return;

    if (rebinding) {
      if (k === "escape") {
        rebinding = null;
        return;
      }
      if (assignBinding(rebinding.group, rebinding.action, code)) {
        rebinding = null;
      } else {
        controlsNotice = 2.2;
      }
      return;
    }

    pressed.add(code);
    handlePress(k, code);
  });

  window.addEventListener("keyup", (e) => {
    pressed.delete(e.code || "");
  });

  window.addEventListener("blur", () => pressed.clear());

  document.addEventListener("visibilitychange", () => {
    if (
      document.hidden &&
      (phase === PHASE.HIDE || phase === PHASE.SEEK) &&
      !paused
    ) {
      paused = true;
      pressed.clear();
    }
  });

  function openControls() {
    menuScreen = "controls";
    rebinding = null;
    controlsNotice = 0;
    pressed.clear();
    sfx.click();
  }

  function closeControls() {
    menuScreen = "main";
    rebinding = null;
    sfx.click();
  }

  function resetControls() {
    controls = defaultControls();
    saveControls();
    rebinding = null;
    controlsNotice = 0;
    sfx.click();
  }

  function assignBinding(group, action, code) {
    if (!code || RESERVED_KEYS.has(code)) return false;
    const old = controls[group][action];

    for (const g of Object.keys(controls)) {
      for (const a of Object.keys(controls[g])) {
        if (g === group && a === action) continue;
        if (controls[g][a] === code) controls[g][a] = old;
      }
    }

    controls[group][action] = code;
    saveControls();
    sfx.click();
    return true;
  }

  function addTrailPoint(hider) {
    if (!hider.wounded) return;
    if (Math.hypot(hider.vx, hider.vy) < 8) return;
    const last = hider.trail[hider.trail.length - 1];
    if (!last || Math.hypot(hider.x - last.x, hider.y - last.y) > 8) {
      hider.trail.push({
        x: hider.x,
        y: hider.y,
        life: CFG.hard.trailLife,
      });
      if (hider.trail.length > 90) hider.trail.shift();
    }
  }

  function tryDash(hider, dirOverride) {
    if (!hardMode || !hider.alive) return false;
    if (hider.dashT > 0 || hider.teleportT > 0) return false;
    if (hider.stamina < CFG.hard.dashMin) return false;
    const dir = dirOverride || readDir(controls[hider.ctrl]);
    let dx = dir.x;
    let dy = dir.y;
    if (dx === 0 && dy === 0) {
      dx = hider.facing.x;
      dy = hider.facing.y;
    }
    const len = Math.hypot(dx, dy);
    if (len === 0) {
      dx = 0;
      dy = 1;
    } else {
      dx /= len;
      dy /= len;
    }
    hider.dashT = CFG.hard.dashDuration;
    hider.dashX = dx;
    hider.dashY = dy;
    hider.stamina = Math.max(0, hider.stamina - CFG.hard.dashCost);
    hider.sprinting = false;
    sfx.dash();
    return true;
  }

  function setFlashlight(ent, on) {
    if (ent.flashlightOn === on) return;
    ent.flashlightOn = on;
    sfx.lightSwitch();
  }

  function setLightMode(ent, mode) {
    if (ent.lightMode === mode) return;
    ent.lightMode = mode;
    sfx.lightSwitch();
  }

  function toggleFlashlightForKey(code) {
    for (const ent of activeSeekers()) {
      if (code === controls[ent.ctrl].light) {
        ent.flashlightOn = true;
        ent.lightMode = (ent.lightMode + 1) % SEEKER_LIGHT_MODES.length;
        sfx.lightSwitch();
        return true;
      }
    }
    for (const hider of hiders) {
      if (!hider.alive) continue;
      if (code === controls[hider.ctrl].light) {
        setFlashlight(hider, !hider.flashlightOn);
        return true;
      }
    }
    return false;
  }

  function handlePress(k, code) {
    if (k === "n") {
      muted = !muted;
      try {
        localStorage.setItem("hide-and-seek-muted", muted ? "1" : "0");
      } catch (e) {
        /* ignore */
      }
      if (!muted) sfx.click();
      return;
    }

    if (k === "escape") {
      if (phase === PHASE.HIDE || phase === PHASE.SEEK) {
        paused = !paused;
        pressed.clear();
        sfx.click();
      } else if (phase === PHASE.READY) {
        if (menuScreen === "controls") closeControls();
      } else if (
        (phase === PHASE.OVER || phase === PHASE.MATCH) &&
        overSince > 0.55
      ) {
        toMenu();
      }
      return;
    }

    if (k === "p") {
      if (phase === PHASE.HIDE || phase === PHASE.SEEK) {
        paused = !paused;
        pressed.clear();
        sfx.click();
      }
      return;
    }

    if (k === "m") {
      if (phase === PHASE.READY) {
        if (menuScreen === "controls") closeControls();
        else openControls();
      }
      return;
    }

    if (phase === PHASE.READY) {
      if (menuScreen === "controls") {
        return;
      }
      if (k === "2" || k === "arrowleft" || k === "a") {
        setMode(2);
        return;
      }
      if (k === "3" || k === "arrowright" || k === "d") {
        setMode(3);
        return;
      }
      if (k === "4") {
        setGameMode(3, true);
        return;
      }
      if (k === " " || k === "enter") {
        startMatch();
      }
      return;
    }

    if (
      !aiMode &&
      (phase === PHASE.HIDE || phase === PHASE.SEEK) &&
      !paused &&
      toggleFlashlightForKey(code)
    ) {
      return;
    }

    if (
      !aiMode &&
      hardMode &&
      (phase === PHASE.HIDE || phase === PHASE.SEEK) &&
      !paused
    ) {
      for (const hider of hiders) {
        if (!hider.alive) continue;
        if (code === controls[hider.ctrl].sprint) {
          tryDash(hider);
          return;
        }
      }
    }

    if (!aiMode && phase === PHASE.SEEK) {
      for (const ent of activeSeekers()) {
        if (code === controls[ent.ctrl].ping) {
          tryPing(ent);
          return;
        }
      }
    }

    if (k === " " || k === "enter") {
      if (phase === PHASE.OVER) nextRound();
      else if (phase === PHASE.MATCH && overSince > 0.55) startMatch();
    }
  }

  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CW,
      y: ((e.clientY - rect.top) / rect.height) * CH,
    };
  }

  function menuHit(x, y) {
    if (pointInRect(x, y, MENU.b2)) return "mode2";
    if (pointInRect(x, y, MENU.b3)) return "mode3";
    if (pointInRect(x, y, MENU.duo)) return "duo";
    if (pointInRect(x, y, MENU.map)) return "map";
    if (pointInRect(x, y, MENU.hard)) return "hard";
    if (pointInRect(x, y, MENU.ai)) return "ai";
    if (pointInRect(x, y, MENU.fullscreen)) return "fullscreen";
    if (pointInRect(x, y, MENU.controls)) return "controls";
    if (pointInRect(x, y, MENU.start)) return "start";
    return null;
  }

  function controlsLayout() {
    const cards = [];
    const bindings = [];
    const cardW = 300;
    const cardH = 350;
    const gap = 20;
    const startX = 30;
    const top = 152;

    CONTROL_GROUPS.forEach((group, index) => {
      const x = startX + index * (cardW + gap);
      cards.push({ ...group, x, y: top, w: cardW, h: cardH });
      group.actions.forEach((action, row) => {
        const cy = top + 78 + row * 34;
        bindings.push({
          group: group.key,
          action,
          centerY: cy,
          button: {
            x: x + cardW - 20 - 126,
            y: cy - 15,
            w: 126,
            h: 30,
          },
        });
      });
    });

    return {
      cards,
      bindings,
      reset: { x: 315, y: 548, w: 200, h: 42 },
      back: { x: 535, y: 548, w: 150, h: 42 },
    };
  }

  function controlsHitAt(x, y) {
    const layout = controlsLayout();
    for (const binding of layout.bindings) {
      if (pointInRect(x, y, binding.button)) {
        return {
          type: "binding",
          group: binding.group,
          action: binding.action,
        };
      }
    }
    if (pointInRect(x, y, layout.reset)) return { type: "reset" };
    if (pointInRect(x, y, layout.back)) return { type: "back" };
    return null;
  }

  canvas.addEventListener("click", (e) => {
    if (phase !== PHASE.READY) return;
    const p = canvasPoint(e);

    if (menuScreen === "controls") {
      const hit = controlsHitAt(p.x, p.y);
      if (!hit) {
        rebinding = null;
        return;
      }
      if (hit.type === "binding") {
        rebinding = { group: hit.group, action: hit.action };
        controlsNotice = 0;
        sfx.click();
      } else if (hit.type === "reset") {
        resetControls();
      } else if (hit.type === "back") {
        closeControls();
      }
      return;
    }

    const hit = menuHit(p.x, p.y);
    if (hit === "mode2") setMode(2);
    else if (hit === "mode3") setMode(3);
    else if (hit === "duo") setGameMode(3, true);
    else if (hit === "map") setMap(mapIndex + 1);
    else if (hit === "hard") setHardMode(!hardMode);
    else if (hit === "ai") setAiMode(!aiMode);
    else if (hit === "fullscreen") toggleFullscreen();
    else if (hit === "controls") openControls();
    else if (hit === "start") startMatch();
  });

  canvas.addEventListener("mousemove", (e) => {
    if (phase !== PHASE.READY) {
      canvas.style.cursor = "default";
      return;
    }
    const p = canvasPoint(e);
    mouse = p;
    const hit =
      menuScreen === "controls"
        ? controlsHitAt(p.x, p.y)
        : menuHit(p.x, p.y);
    canvas.style.cursor = hit ? "pointer" : "default";
  });

  function tryPing(ent = seeker) {
    if (phase !== PHASE.SEEK || paused || ent.pingCD > 0) return;
    ent.pingCD = hardMode ? CFG.hard.radarCooldown : CFG.pingCooldown;
    if (hardMode) {
      radars.push({
        x: ent.x,
        y: ent.y,
        t: 0,
        life: CFG.hard.radarLife,
        radius: CFG.hard.radarRange,
      });
      if (radars.length > 4) radars.shift();
      ping = null;
      sfx.radar();
      return;
    }
    ping = {
      x: ent.x,
      y: ent.y,
      t: 0,
      dur: CFG.pingWaveDur,
      radius: 0,
      hit: new Set(),
    };
    sfx.ping();
  }

  function readDir(bind) {
    let x = (pressed.has(bind.right) ? 1 : 0) - (pressed.has(bind.left) ? 1 : 0);
    let y = (pressed.has(bind.down) ? 1 : 0) - (pressed.has(bind.up) ? 1 : 0);
    const len = Math.hypot(x, y);
    if (len > 0) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  // ---------------------------------------------------------------------------
  // Movement & collision
  // ---------------------------------------------------------------------------

  function handleSpikeHit(ent) {
    if (!hardMode || (phase !== PHASE.HIDE && phase !== PHASE.SEEK)) return;
    if (ent.spikeHitCD > 0) return;
    ent.spikeHitCD = CFG.hard.spikeHitCooldown;
    if (activeSeekers().includes(ent)) {
      if (twoSeekers && mode === 3) {
        ent.eliminated = true;
        ent.alive = false;
        ent.vx = ent.vy = 0;
        ent.sprinting = false;
        burst(ent.x, ent.y, ent.color, 26);
        sfx.spike();
        if (activeSeekers().length === 0) {
          endRound("hider", "Both seekers hit the spikes");
        } else {
          toast = { text: "SEEKER ELIMINATED", color: RED, t: 0, dur: 1.2 };
        }
        return;
      }
      ent.spikeSlowT = CFG.hard.seekerSlowTime;
      burst(ent.x, ent.y, ent.color, 20);
      sfx.spike();
      return;
    }
    if (!ent.alive) return;
    if (ent.wounded) {
      catchHider(ent);
      if (aliveHiders() === 0) {
        endRound("seeker", "Bleeding hider hit the spikes");
      }
      return;
    }
    const solo = mode === 2 || twoSeekers;
    ent.wounded = true;
    ent.woundT = solo ? CFG.hard.woundedTime : 0;
    ent.bleedT = solo ? 0 : CFG.hard.bleedTime;
    ent.healT = 0;
    ent.healer = null;
    ent.trail = [{ x: ent.x, y: ent.y, life: CFG.hard.trailLife }];
    burst(ent.x, ent.y, ent.color, 20);
    sfx.spike();
  }

  function collideAxis(ent, axis) {
    for (const w of WALLS) {
      const nx = clamp(ent.x, w.x, w.x + w.w);
      const ny = clamp(ent.y, w.y, w.y + w.h);
      const dx = ent.x - nx;
      const dy = ent.y - ny;
      if (dx * dx + dy * dy >= R * R) continue;
      if (hardMode && w.spiked) handleSpikeHit(ent);

      if (axis === "x") {
        if (ent.x < w.x + w.w / 2) ent.x = w.x - R - 0.01;
        else ent.x = w.x + w.w + R + 0.01;
        ent.vx = 0;
      } else {
        if (ent.y < w.y + w.h / 2) ent.y = w.y - R - 0.01;
        else ent.y = w.y + w.h + R + 0.01;
        ent.vy = 0;
      }
    }
  }

  function moveEntity(ent, dir, stats, sprintHeld, dt) {
    const wantsMove = dir.x !== 0 || dir.y !== 0;
    const wantSprint =
      wantsMove &&
      sprintHeld &&
      ent.stamina > 0 &&
      !ent.exhausted;

    ent.sprinting = wantSprint;
    const speed = wantSprint ? stats.sprint : stats.walk;

    const k = 1 - Math.exp(-20 * dt);
    ent.vx += (dir.x * speed - ent.vx) * k;
    ent.vy += (dir.y * speed - ent.vy) * k;

    if (wantSprint) {
      ent.stamina = Math.max(0, ent.stamina - CFG.stamina.drain * dt);
      ent.staminaDelay = CFG.stamina.recoverDelay;
      if (ent.stamina <= 0) ent.exhausted = true;
    } else {
      if (ent.staminaDelay > 0) ent.staminaDelay -= dt;
      else
        ent.stamina = Math.min(
          CFG.stamina.max,
          ent.stamina + CFG.stamina.regen * dt
        );
      if (ent.exhausted && ent.stamina >= CFG.stamina.min) ent.exhausted = false;
    }

    if (wantsMove) {
      ent.facing.x = dir.x;
      ent.facing.y = dir.y;
    }

    ent.x += ent.vx * dt;
    collideAxis(ent, "x");
    ent.y += ent.vy * dt;
    collideAxis(ent, "y");

    ent.x = clamp(ent.x, M + R, W - M - R);
    ent.y = clamp(ent.y, M + R, H - M - R);

    if (wantSprint && Math.random() < dt * 18) {
      spawnDust(ent.x, ent.y + 8);
    }
  }

  function updateHiddenState(dt) {
    for (const hider of hiders) {
      if (!hider.alive) {
        hider.insideHide = false;
        hider.hideType = null;
        hider.spotted = false;
        continue;
      }

      let inside = null;
      for (let i = 0; i < HIDES.length; i++) {
        if (pointInRect(hider.x, hider.y, HIDES[i])) {
          inside = HIDES[i];
          break;
        }
      }
      hider.insideHide = !!inside;
      hider.hideType = inside ? inside.type : null;

      const pinged = hider.revealT > 0;
      hider.spotted = !inside || pinged;

      const speed = Math.hypot(hider.vx, hider.vy);
      if (
        inside &&
        inside.type === "bush" &&
        speed > 55
      ) {
        hider.leafT -= dt;
        if (hider.leafT <= 0) {
          hider.leafT = 0.07;
          spawnLeaf(hider);
        }
      } else {
        hider.leafT = 0;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Particles
  // ---------------------------------------------------------------------------

  function spawnDust(x, y) {
    particles.push({
      type: "dust",
      x: x + rand(-5, 5),
      y: y + rand(0, 5),
      vx: rand(-18, 18),
      vy: rand(-14, 4),
      life: 0.5,
      max: 0.5,
      size: rand(1.6, 3.4),
      color: "#8fb59c",
      rot: 0,
      vr: 0,
    });
  }

  function spawnLeaf(hider) {
    particles.push({
      type: "leaf",
      x: hider.x + rand(-7, 7),
      y: hider.y + rand(-7, 7),
      vx: rand(-45, 45),
      vy: rand(-60, -12),
      life: 0.85,
      max: 0.85,
      size: rand(2.2, 4.4),
      color: Math.random() < 0.5 ? "#3f8b54" : hider.color,
      rot: rand(0, TAU),
      vr: rand(-7, 7),
    });
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const ang = rand(0, TAU);
      const sp = rand(90, 320);
      particles.push({
        type: "spark",
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: rand(0.4, 0.8),
        max: 0.8,
        size: rand(2, 4.5),
        color: i % 3 === 0 ? "#ffe9a8" : color,
        rot: 0,
        vr: 0,
      });
    }
  }

  function confetti() {
    const colors = ["#5ee08a", "#ff6b6b", "#ffd166", "#7dd3fc", "#f472b6"];
    for (let i = 0; i < 90; i++) {
      particles.push({
        type: "confetti",
        x: rand(0, W),
        y: rand(-120, 40),
        vx: rand(-40, 40),
        vy: rand(40, 160),
        life: rand(2.2, 4),
        max: 4,
        size: rand(3, 6),
        color: colors[(Math.random() * colors.length) | 0],
        rot: rand(0, TAU),
        vr: rand(-9, 9),
      });
    }
  }

  function updateHealing(dt) {
    if (!hardMode) return;
    for (const hider of hiders) {
      for (let i = hider.trail.length - 1; i >= 0; i--) {
        hider.trail[i].life -= dt;
        if (hider.trail[i].life <= 0) hider.trail.splice(i, 1);
      }
      if (hider.wounded && hider.woundT > 0) {
        hider.woundT = Math.max(0, hider.woundT - dt);
        if (hider.woundT <= 0) {
          hider.wounded = false;
          hider.bleedT = 0;
          hider.healT = 0;
          hider.healer = null;
          hider.trail = [];
        }
      }
    }
    for (const wounded of hiders) {
      if (!wounded.alive || !wounded.wounded) {
        if (wounded.healT || wounded.healer) {
          wounded.healT = 0;
          wounded.healer = null;
        }
        wounded.bleedT = 0;
        continue;
      }
      let healer = null;
      for (const other of hiders) {
        if (other === wounded || !other.alive || other.wounded) continue;
        if (other.teleportT > 0 || other.dashT > 0) continue;
        if (dist(other, wounded) <= CFG.hard.healDist) {
          healer = other;
          break;
        }
      }
      const still =
        healer &&
        Math.hypot(wounded.vx, wounded.vy) < CFG.hard.stillSpeed &&
        Math.hypot(healer.vx, healer.vy) < CFG.hard.stillSpeed &&
        wounded.teleportT <= 0 &&
        wounded.dashT <= 0;
      if (!still) {
        wounded.healT = 0;
        wounded.healer = null;
        if (wounded.bleedT > 0) {
          wounded.bleedT = Math.max(0, wounded.bleedT - dt);
          if (wounded.bleedT <= 0) {
            wounded.bleedT = 0;
            catchHider(wounded);
            if (aliveHiders() === 0) {
              endRound("seeker", "Hider bled out");
            }
          }
        }
        continue;
      }
      wounded.healer = healer;
      wounded.healT += dt;
      if (wounded.healT >= CFG.hard.healTime) {
        wounded.wounded = false;
        wounded.woundT = 0;
        wounded.bleedT = 0;
        wounded.healT = 0;
        wounded.healer = null;
        wounded.trail = [];
        burst(wounded.x, wounded.y, wounded.color, 20);
        sfx.heal();
      }
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const damp = Math.exp(-3.4 * dt);
      p.vx *= damp;
      p.vy *= damp;
      if (p.type === "leaf") p.vy += 42 * dt;
      if (p.type === "confetti") p.vy += 30 * dt;
      if (p.type === "dust") p.vy -= 6 * dt;
    }
  }

  function aiPointBlocked(x, y) {
    if (x < M + R + 3 || x > W - M - R - 3) return true;
    if (y < M + R + 3 || y > H - M - R - 3) return true;
    for (const wall of WALLS) {
      const nx = clamp(x, wall.x, wall.x + wall.w);
      const ny = clamp(y, wall.y, wall.y + wall.h);
      const pad = hardMode && wall.spiked ? R + 10 : R + 4;
      const dx = x - nx;
      const dy = y - ny;
      if (dx * dx + dy * dy < pad * pad) return true;
    }
    return false;
  }

  function aiProbeDir(ent, tx, ty) {
    const base = Math.atan2(ty - ent.y, tx - ent.x);
    const offsets = [
      0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4, 1.75, -1.75,
      2.1, -2.1, 2.45, -2.45, 2.8, -2.8, Math.PI,
    ];
    const probe = 28;
    let best = null;
    let bestScore = Infinity;
    for (const off of offsets) {
      const a = base + off;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      let blocked = false;
      for (let step = 7; step <= probe; step += 7) {
        if (aiPointBlocked(ent.x + dx * step, ent.y + dy * step)) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;
      const px = ent.x + dx * probe;
      const py = ent.y + dy * probe;
      const score =
        Math.hypot(tx - px, ty - py) + Math.abs(off) * 9;
      if (score < bestScore) {
        bestScore = score;
        best = { x: dx, y: dy };
      }
    }
    if (!best) {
      return { x: Math.cos(base), y: Math.sin(base) };
    }
    return best;
  }

  function aiNearestSeeker(ent) {
    let best = null;
    let bestD = Infinity;
    for (const s of activeSeekers()) {
      const d = dist(ent, s);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return { ent: best, d: bestD };
  }

  function aiChooseHideout(ent, seekers) {
    const options = [];
    for (let i = 0; i < HIDES.length; i++) {
      const spot = HIDES[i];
      const cx = spot.x + spot.w / 2;
      const cy = spot.y + spot.h / 2;
      let safe = Infinity;
      for (const s of seekers) {
        safe = Math.min(safe, Math.hypot(s.x - cx, s.y - cy));
      }
      options.push({
        index: i,
        score:
          safe -
          Math.hypot(ent.x - cx, ent.y - cy) * 0.3 +
          (Math.random() - 0.5) * 40,
      });
    }
    if (!options.length) return -1;
    options.sort((a, b) => b.score - a.score);
    const limit = Math.min(3, options.length);
    return options[Math.floor(Math.random() * limit)].index;
  }

  function aiSetHideTarget(hider, index) {
    hider.aiHide = index;
    const spot = HIDES[index];
    const pad = 14;
    hider.aiHideX =
      spot.x + pad + Math.random() * Math.max(1, spot.w - pad * 2);
    hider.aiHideY =
      spot.y + pad + Math.random() * Math.max(1, spot.h - pad * 2);
  }

  function forceAiMove(ent) {
    const angle = Math.random() * TAU;
    ent.aiWanderT = 0.8;
    ent.aiWanderX = Math.cos(angle);
    ent.aiWanderY = Math.sin(angle);
    ent.aiStuckT = 0;
    ent.aiHide = -1;
    ent.aiSearch = -1;
  }

  function aiStuckCheck(ent, dt) {
    const step = Math.hypot(ent.x - ent.aiLastX, ent.y - ent.aiLastY);
    ent.aiTravel += step;
    ent.aiLastX = ent.x;
    ent.aiLastY = ent.y;
    ent.aiHistT += dt;
    if (ent.aiHistT >= 1) {
      const net = Math.hypot(ent.x - ent.aiHistX, ent.y - ent.aiHistY);
      if (ent.aiTravel > 30 && net < ent.aiTravel * 0.35) {
        forceAiMove(ent);
      }
      ent.aiHistT = 0;
      ent.aiHistX = ent.x;
      ent.aiHistY = ent.y;
      ent.aiTravel = 0;
    }

    ent.aiCheckT += dt;
    if (ent.aiCheckT < 0.7) return;
    const moved = Math.hypot(ent.x - ent.aiCheckX, ent.y - ent.aiCheckY);
    const wants = Math.hypot(ent.aiDir.x, ent.aiDir.y) > 0.2;
    if (wants && moved < 6) ent.aiStuckT += ent.aiCheckT;
    else ent.aiStuckT = 0;
    ent.aiCheckX = ent.x;
    ent.aiCheckY = ent.y;
    ent.aiCheckT = 0;
    if (ent.aiStuckT > 0.9) forceAiMove(ent);
  }

  function updateAI(dt) {
    if (!aiMode) return;
    const seekers = activeSeekers();
    for (const hider of hiders) {
      if (!hider.alive) {
        hider.aiDir.x = 0;
        hider.aiDir.y = 0;
        hider.aiSprint = false;
        continue;
      }
      aiStuckCheck(hider, dt);
      const near = aiNearestSeeker(hider);
      const danger = near.ent && near.d < 270;
      const healer = hiders.find(
        (h) => h !== hider && h.alive && !h.wounded
      );
      if (hider.wounded && healer && !danger) {
        const d = dist(hider, healer);
        hider.aiDir =
          d < CFG.hard.healDist - 6
            ? { x: 0, y: 0 }
            : aiProbeDir(hider, healer.x, healer.y);
        hider.aiSprint = false;
        setFlashlight(hider, false);
        continue;
      }
      if (!hider.wounded && !danger) {
        const woundedOther = hiders.find(
          (h) => h !== hider && h.alive && h.wounded
        );
        if (woundedOther) {
          const d = dist(hider, woundedOther);
          hider.aiDir =
            d < CFG.hard.healDist - 6
              ? { x: 0, y: 0 }
              : aiProbeDir(hider, woundedOther.x, woundedOther.y);
          hider.aiSprint = false;
          setFlashlight(hider, false);
          continue;
        }
      }
      if (danger) {
        const s = near.ent;
        let dx = hider.x - s.x;
        let dy = hider.y - s.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const side = hider.aiBias >= 0 ? 1 : -1;
        const spread = 35 + Math.abs(hider.aiBias) * 65;
        const tx = hider.x + dx * 220 - dy * side * spread;
        const ty = hider.y + dy * 220 + dx * side * spread;
        hider.aiDir = aiProbeDir(hider, tx, ty);
        setFlashlight(hider, false);
        if (hardMode) {
          hider.aiSprint = false;
          if (
            hider.stamina >= CFG.hard.dashMin &&
            hider.dashT <= 0 &&
            hider.teleportT <= 0
          ) {
            tryDash(hider, hider.aiDir);
          }
        } else {
          hider.aiSprint = hider.stamina > 20;
        }
        continue;
      }
      setFlashlight(hider, !hider.insideHide);
      hider.aiSprint = false;
      if (hider.insideHide) {
        hider.aiDir.x = 0;
        hider.aiDir.y = 0;
        continue;
      }
      let hideIndex = hider.aiHide;
      if (hideIndex >= 0 && hideIndex < HIDES.length && seekers.length) {
        const cx = hider.aiHideX;
        const cy = hider.aiHideY;
        if (seekers.some((s) => Math.hypot(s.x - cx, s.y - cy) < 200)) {
          hideIndex = -1;
        }
      }
      if (hideIndex < 0 || hideIndex >= HIDES.length) {
        hideIndex = aiChooseHideout(hider, seekers);
        if (hideIndex >= 0) aiSetHideTarget(hider, hideIndex);
      }
      if (hideIndex >= 0 && HIDES[hideIndex]) {
        const cx = hider.aiHideX;
        const cy = hider.aiHideY;
        const d = Math.hypot(cx - hider.x, cy - hider.y);
        if (d < 16) {
          hider.aiDir.x = 0;
          hider.aiDir.y = 0;
          setFlashlight(hider, false);
        } else {
          hider.aiDir = aiProbeDir(hider, cx, cy);
          hider.aiSprint = hider.stamina > 35 && d > 40;
        }
      } else {
        hider.aiDir = aiProbeDir(hider, W / 2, H / 2);
      }
      if (hider.aiWanderT > 0) {
        hider.aiWanderT = Math.max(0, hider.aiWanderT - dt);
        hider.aiDir = { x: hider.aiWanderX, y: hider.aiWanderY };
      }
    }

    for (const ent of activeSeekers()) {
      aiStuckCheck(ent, dt);
      let target = null;
      let targetDist = Infinity;
      for (const hider of hiders) {
        if (!hider.alive) continue;
        if (hider.insideHide && hider.revealT <= 0) continue;
        const d = dist(ent, hider);
        if (d < targetDist) {
          targetDist = d;
          target = hider;
        }
      }
      if (!target) {
        if (ent.aiSearch < 0 || ent.aiSearch >= HIDES.length) {
          ent.aiSearch = HIDES.length
            ? Math.floor(Math.random() * HIDES.length)
            : -1;
        }
        if (ent.aiSearch >= 0 && HIDES[ent.aiSearch]) {
          const spot = HIDES[ent.aiSearch];
          const cx = spot.x + spot.w / 2;
          const cy = spot.y + spot.h / 2;
          if (Math.hypot(ent.x - cx, ent.y - cy) < 28) {
            ent.aiSearch = (ent.aiSearch + 1) % HIDES.length;
          }
          target = { x: cx, y: cy };
        } else {
          target = { x: W / 2, y: H / 2 };
        }
      }
      if (ent.pingCD <= 0 && phase === PHASE.SEEK) {
        tryPing(ent);
      }
      const d = Math.hypot(target.x - ent.x, target.y - ent.y);
      setLightMode(ent, d > 280 ? 0 : d < 140 ? 2 : 1);
      ent.aiDir =
        d < 12 ? { x: 0, y: 0 } : aiProbeDir(ent, target.x, target.y);
      ent.aiSprint = false;
      if (ent.aiWanderT > 0) {
        ent.aiWanderT = Math.max(0, ent.aiWanderT - dt);
        ent.aiDir = { x: ent.aiWanderX, y: ent.aiWanderY };
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  function update(dt) {
    updateParticles(dt);
    if (shake > 0) shake = Math.max(0, shake - dt * 55);
    if (toast) {
      toast.t += dt;
      if (toast.t >= toast.dur) toast = null;
    }
    if (controlsNotice > 0) {
      controlsNotice = Math.max(0, controlsNotice - dt);
    }
    if (phase === PHASE.OVER || phase === PHASE.MATCH) {
      overSince += dt;
      if (aiMode && phase === PHASE.OVER && overSince > 2.5) nextRound();
      return;
    }
    if (phase === PHASE.START) {
      phaseLeft -= dt;
      const whole = Math.ceil(phaseLeft);
      if (whole !== lastTick) {
        lastTick = whole;
        if (whole > 0 && whole <= 3) sfx.tick();
      }
      if (phaseLeft <= 0) beginHide();
      return;
    }
    if (phase === PHASE.LOOKBACK) {
      phaseLeft -= dt;
      if (aiMode) {
        for (const ent of activeSeekers()) {
          let best = null;
          let bestD = Infinity;
          for (const hider of hiders) {
            if (!hider.alive) continue;
            const d = dist(ent, hider);
            if (d < bestD) {
              bestD = d;
              best = hider;
            }
          }
          if (best) {
            const dx = best.x - ent.x;
            const dy = best.y - ent.y;
            const len = Math.hypot(dx, dy) || 1;
            ent.facing.x = dx / len;
            ent.facing.y = dy / len;
          }
        }
      } else {
        for (const ent of activeSeekers()) {
          const dir = readDir(controls[ent.ctrl]);
          if (dir.x !== 0 || dir.y !== 0) {
            ent.facing.x = dir.x;
            ent.facing.y = dir.y;
          }
        }
      }
      if (phaseLeft <= 0) beginSeek();
      return;
    }
    if (phase !== PHASE.HIDE && phase !== PHASE.SEEK) return;

    for (const ent of activeSeekers()) {
      if (ent.pingCD > 0) ent.pingCD = Math.max(0, ent.pingCD - dt);
      if (ent.spikeSlowT > 0) {
        ent.spikeSlowT = Math.max(0, ent.spikeSlowT - dt);
      }
      if (ent.spikeHitCD > 0) {
        ent.spikeHitCD = Math.max(0, ent.spikeHitCD - dt);
      }
    }
    for (const hider of hiders) {
      if (hider.revealT > 0) hider.revealT = Math.max(0, hider.revealT - dt);
    }

    if (aiMode) updateAI(dt);

    for (const ent of activeSeekers()) {
      if (ent.lightMode !== 2 || !ent.flashlightOn) continue;
      const radius =
        FLASHLIGHT.range * SEEKER_LIGHT_MODES[2].rangeMult;
      for (const hider of hiders) {
        if (!hider.alive) continue;
        if (dist(hider, ent) <= radius) {
          hider.revealT = CFG.pingReveal;
        }
      }
    }

    phaseLeft -= dt;
    if (phase === PHASE.SEEK) {
      if (!seekerBoostTriggered && phaseLeft <= 10.5) {
        seekerBoostTriggered = true;
        seekerBoost = 10.5;
      }
      if (!bellPlayed && phaseLeft <= 10) {
        bellPlayed = true;
        sfx.bell();
      }
      if (seekerBoost > 0) seekerBoost = Math.max(0, seekerBoost - dt);
    }
    const walkMult =
      phase === PHASE.HIDE
        ? CFG.hider.hideSpeed
        : phase === PHASE.SEEK
        ? CFG.hider.seekWalk
        : 1;
    const sprintMult =
      phase === PHASE.HIDE
        ? CFG.hider.hideSpeed
        : phase === PHASE.SEEK
        ? CFG.hider.seekSprint
        : 1;
    const hiderStats = {
      walk: CFG.hider.walk * walkMult,
      sprint: CFG.hider.sprint * sprintMult,
    };
    for (const hider of hiders) {
      if (!hider.alive) continue;
      if (hider.spikeHitCD > 0) {
        hider.spikeHitCD = Math.max(0, hider.spikeHitCD - dt);
      }
      if (hider.teleportT > 0) {
        hider.teleportT = Math.max(0, hider.teleportT - dt);
        hider.vx = 0;
        hider.vy = 0;
        if (hider.teleportT <= 0) {
          const target = DOORS[(hider.teleportDoor + 1) % DOORS.length];
          const tx = target.x > W / 2
            ? target.x - 30
            : target.x + target.w + 30;
          const ty = target.y + target.h / 2;
          burst(hider.x, hider.y, "#7dd3fc", 16);
          hider.x = tx;
          hider.y = ty;
          hider.vx = 0;
          hider.vy = 0;
          hider.doorCooldown = CFG.door.cooldown;
          hider.teleportDoor = -1;
          seekerDoorBoost *= 1.05;
          burst(tx, ty, "#7dd3fc", 16);
          sfx.teleport();
        }
        continue;
      }
      if (hider.doorCooldown > 0) {
        hider.doorCooldown = Math.max(0, hider.doorCooldown - dt);
      }
      if (hardMode && hider.dashT > 0) {
        const dashDistance =
          FLASHLIGHT.range * FLASHLIGHT.hiderRangeMult * 0.5;
        let dashSpeed = dashDistance / CFG.hard.dashDuration;
        if (radars.some((r) => dist(hider, r) <= r.radius)) {
          dashSpeed *= CFG.hard.radarSlow;
        }
        const step = Math.min(dt, hider.dashT);
        hider.vx = hider.dashX * dashSpeed;
        hider.vy = hider.dashY * dashSpeed;
        hider.x += hider.vx * step;
        collideAxis(hider, "x");
        hider.y += hider.vy * step;
        collideAxis(hider, "y");
        hider.x = clamp(hider.x, M + R, W - M - R);
        hider.y = clamp(hider.y, M + R, H - M - R);
        hider.facing.x = hider.dashX;
        hider.facing.y = hider.dashY;
        hider.dashT = Math.max(0, hider.dashT - dt);
        if (hider.dashT <= 0) {
          hider.vx = 0;
          hider.vy = 0;
        }
        addTrailPoint(hider);
        continue;
      }
      const bind = controls[hider.ctrl];
      const dir = aiMode ? hider.aiDir : readDir(bind);
      const sprint = aiMode
        ? !hardMode && hider.aiSprint
        : !hardMode && pressed.has(bind.sprint);
      let stats = hiderStats;
      let mult = 1;
      if (!hider.flashlightOn) mult *= CFG.hider.darkSpeed;
      if (hider.wounded) mult *= CFG.hard.woundedSlow;
      if (radars.some((r) => dist(hider, r) <= r.radius)) {
        mult *= CFG.hard.radarSlow;
      }
      if (mult !== 1) {
        stats = {
          walk: hiderStats.walk * mult,
          sprint: hiderStats.sprint * mult,
        };
      }
      moveEntity(hider, dir, stats, sprint, dt);
      addTrailPoint(hider);
    }
    if (DOORS.length > 1) {
      for (const hider of hiders) {
        if (
          !hider.alive ||
          hider.teleportT > 0 ||
          hider.dashT > 0 ||
          hider.doorCooldown > 0
        ) {
          continue;
        }
        for (let i = 0; i < DOORS.length; i++) {
          const door = DOORS[i];
          if (!pointInRect(hider.x, hider.y, door)) continue;
          hider.teleportT = CFG.door.channel;
          hider.teleportDoor = i;
          hider.vx = 0;
          hider.vy = 0;
          hider.sprinting = false;
          break;
        }
      }
    }
    if (ping) {
      const prevRadius = ping.radius || 0;
      ping.t += dt;
      const p = clamp(ping.t / ping.dur, 0, 1);
      ping.radius = p * CFG.pingRange;
      for (const hider of hiders) {
        if (!hider.alive || ping.hit.has(hider)) continue;
        const d = dist(hider, ping);
        if (d >= prevRadius - 0.001 && d <= ping.radius) {
          hider.revealT = CFG.pingReveal;
          ping.hit.add(hider);
        }
      }
      if (ping.t >= ping.dur) ping = null;
    }
    for (let i = radars.length - 1; i >= 0; i--) {
      const r = radars[i];
      r.t += dt;
      if (r.t >= r.life) {
        radars.splice(i, 1);
        continue;
      }
      for (const hider of hiders) {
        if (!hider.alive) continue;
        if (dist(hider, r) <= r.radius) {
          hider.revealT = CFG.pingReveal;
        }
      }
    }
    if (phase === PHASE.SEEK) {
      for (const ent of activeSeekers()) {
        const slow = ent.spikeSlowT > 0 ? CFG.hard.seekerSlow : 1;
        const seekerStats = {
          walk:
            CFG.seeker.walk *
            seekerDoorBoost *
            (seekerBoost > 0 ? CFG.seeker.finalBoost : 1) *
            slow,
          sprint: CFG.seeker.sprint,
        };
        const dir = aiMode ? ent.aiDir : readDir(controls[ent.ctrl]);
        moveEntity(ent, dir, seekerStats, false, dt);
      }
    }
    if (phase === PHASE.OVER) return;
    updateHiddenState(dt);
    updateHealing(dt);
    if (phase === PHASE.OVER) return;

    if (phase === PHASE.HIDE) {
      const whole = Math.ceil(phaseLeft);
      if (whole !== lastTick) {
        lastTick = whole;
        if (whole > 0 && whole <= 3) sfx.tick();
      }
      if (phaseLeft <= 0) beginLookBack();
      return;
    }

    let caught = false;
    for (const hider of hiders) {
      if (!hider.alive || hider.teleportT > 0) continue;
      for (const ent of activeSeekers()) {
        if (dist(hider, ent) < CFG.tagDist) {
          catchHider(hider);
          caught = true;
          break;
        }
      }
    }

    if (caught && aliveHiders() === 0) {
      endRound(
        "seeker",
        twoSeekers
          ? `Hider caught with ${Math.max(0, phaseLeft).toFixed(1)}s left`
          : mode === 3
          ? `Both hiders caught with ${Math.max(0, phaseLeft).toFixed(1)}s left`
          : `Tagged with ${Math.max(0, phaseLeft).toFixed(1)}s left`
      );
    } else if (phaseLeft <= 0) {
      const alive = aliveHiders();
      const reason = twoSeekers
        ? `Hider survived the ${rules().seekTime}s hunt`
        : mode === 3
        ? alive >= 2
          ? `Both hiders survived all ${rules().seekTime} seconds`
          : `One hider survived the ${rules().seekTime}s hunt`
        : `Survived all ${rules().seekTime} seconds`;
      endRound("hider", reason);
    }
  }

  // ---------------------------------------------------------------------------
  // Drawing: world
  // ---------------------------------------------------------------------------

  function drawWorld() {
    // bush rustle
    for (let i = 0; i < HIDES.length; i++) {
      const b = HIDES[i];
      let rustlingHider = null;
      for (const hider of hiders) {
        if (!hider.alive || !hider.insideHide) continue;
        if (!pointInRect(hider.x, hider.y, b)) continue;
        if (Math.hypot(hider.vx, hider.vy) > 55) rustlingHider = hider;
      }

      if (b.type === "bush" && rustlingHider) {
        const h = rustlingHider;
        const wobble = time * 34 + i;
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = h.color;
        for (let k = 0; k < 3; k++) {
          const ang = wobble + k * 2.1;
          ctx.beginPath();
          ctx.arc(
            h.x + Math.cos(ang) * 7,
            h.y + Math.sin(ang * 1.3) * 6,
            5 + k * 1.5,
            0,
            TAU
          );
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // hiders
    const revealAll =
      phase === PHASE.HIDE ||
      phase === PHASE.READY ||
      phase === PHASE.OVER ||
      phase === PHASE.MATCH;
    for (const hider of hiders) {
      if (!hider.alive) continue;
      const role = hider.id === 1 ? "hider2" : "hider";
      const show = revealAll || hider.spotted;
      const drawnAbove = hider.revealT > 0 && hider.insideHide;
      if (show && !drawnAbove) {
        drawPlayerSprite(hider, role);
      }
    }

    // seekers on top
    for (const ent of activeSeekers()) drawPlayerSprite(ent, "seeker");

    // particles
    for (const p of particles) {
      if (p.type === "confetti") continue;
      drawParticle(p);
    }
  }

  function drawDarkness(shakeX, shakeY) {
    const d = darknessCtx;
    d.setTransform(1, 0, 0, 1, 0, 0);
    d.globalCompositeOperation = "source-over";
    d.clearRect(0, 0, darknessCanvas.width, darknessCanvas.height);
    d.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
    d.globalAlpha = 1;
    d.fillStyle = "#000";
    d.fillRect(0, 0, VIEW_W, VIEW_H);

    for (const ent of activeSeekers()) {
      const modeIndex =
        ent.lightMode === 2 ? 2 : ent.lightMode === 1 ? 1 : 0;
      const mode = SEEKER_LIGHT_MODES[modeIndex];
      const sprite =
        modeIndex === 2
          ? revealGlow
          : modeIndex === 1
          ? beams.seekerWide
          : beams.seekerLong;
      addPlayerLight(
        ent,
        sprite,
        FLASHLIGHT.range * mode.rangeMult,
        modeIndex === 2
      );
    }
    for (const hider of hiders) {
      if (!hider.alive || hider.insideHide) continue;
      addPlayerLight(
        hider,
        beams.hider,
        FLASHLIGHT.range * FLASHLIGHT.hiderRangeMult
      );
    }
    for (const lamp of LAMPS) addLampLight(lamp);

    d.globalCompositeOperation = "destination-out";
    for (const hider of hiders) {
      if (!hider.alive || hider.revealT <= 0) continue;
      const alpha = clamp(hider.revealT / CFG.pingReveal, 0, 1);
      const x = hider.x * VIEW_SCALE;
      const y = hider.y * VIEW_SCALE;
      const r = 95;
      d.globalAlpha = alpha;
      d.drawImage(revealGlow, x - r, y - r, r * 2, r * 2);
      d.globalAlpha = 1;
    }

    d.globalCompositeOperation = "source-over";
    ctx.drawImage(darknessCanvas, shakeX, HUD_H + shakeY, VIEW_W, VIEW_H);
  }

  function addPlayerLight(ent, sprite, range, throughWalls) {
    if (!ent.flashlightOn) return;
    const l = lightCtx;
    l.setTransform(1, 0, 0, 1, 0, 0);
    l.globalAlpha = 1;
    l.globalCompositeOperation = "source-over";
    l.clearRect(0, 0, lightCanvas.width, lightCanvas.height);
    l.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);

    drawFlashlight(l, ent, sprite, range);
    drawSelfLight(l, ent);

    if (!throughWalls) {
      l.globalCompositeOperation = "destination-out";
      eraseWallShadows(l, ent.x * VIEW_SCALE, ent.y * VIEW_SCALE);
      l.globalCompositeOperation = "source-over";
      restoreWallFaces(l, (c) => {
        drawFlashlight(c, ent, sprite, range);
        drawSelfLight(c, ent);
      });
    }

    darknessCtx.globalCompositeOperation = "destination-out";
    darknessCtx.drawImage(lightCanvas, 0, 0, VIEW_W, VIEW_H);
  }

  function drawLampGlow(c, lamp) {
    const x = lamp.x * VIEW_SCALE;
    const y = lamp.y * VIEW_SCALE;
    const r = lamp.radius * VIEW_SCALE;
    c.drawImage(revealGlow, x - r, y - r, r * 2, r * 2);
  }

  function addLampLight(lamp) {
    const l = lightCtx;
    l.setTransform(1, 0, 0, 1, 0, 0);
    l.globalAlpha = 1;
    l.globalCompositeOperation = "source-over";
    l.clearRect(0, 0, lightCanvas.width, lightCanvas.height);
    l.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);

    drawLampGlow(l, lamp);

    l.globalCompositeOperation = "destination-out";
    eraseWallShadows(l, lamp.x * VIEW_SCALE, lamp.y * VIEW_SCALE);
    l.globalCompositeOperation = "source-over";
    restoreWallFaces(l, (c) => drawLampGlow(c, lamp));

    darknessCtx.globalCompositeOperation = "destination-out";
    darknessCtx.drawImage(lightCanvas, 0, 0, VIEW_W, VIEW_H);
  }

  function eraseWallShadows(c, lx, ly) {
    const reach = 4000;
    for (const wall of WALLS) {
      const x = wall.x * VIEW_SCALE;
      const y = wall.y * VIEW_SCALE;
      const w = wall.w * VIEW_SCALE;
      const h = wall.h * VIEW_SCALE;
      const corners = [
        { x: x, y: y },
        { x: x + w, y: y },
        { x: x + w, y: y + h },
        { x: x, y: y + h },
      ];
      const normals = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ];
      for (let i = 0; i < 4; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % 4];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const nx = normals[i][0];
        const ny = normals[i][1];
        if (nx * (lx - mx) + ny * (ly - my) <= 0) continue;
        let ax = a.x - lx;
        let ay = a.y - ly;
        let bx = b.x - lx;
        let by = b.y - ly;
        const al = Math.hypot(ax, ay);
        const bl = Math.hypot(bx, by);
        if (al < 0.0001 || bl < 0.0001) continue;
        ax /= al;
        ay /= al;
        bx /= bl;
        by /= bl;
        c.fillStyle = "#000";
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.lineTo(b.x + bx * reach, b.y + by * reach);
        c.lineTo(a.x + ax * reach, a.y + ay * reach);
        c.closePath();
        c.fill();
      }
    }
  }


  function restoreWallFaces(c, drawLight) {
    c.save();
    c.beginPath();
    for (const wall of WALLS) {
      c.rect(
        wall.x * VIEW_SCALE,
        wall.y * VIEW_SCALE,
        wall.w * VIEW_SCALE,
        wall.h * VIEW_SCALE
      );
    }
    c.clip();
    drawLight(c);
    c.restore();
  }

  function drawFlashlight(d, ent, sprite, range) {
    const size = range * VIEW_SCALE * 2;
    d.save();
    d.translate(ent.x * VIEW_SCALE, ent.y * VIEW_SCALE);
    d.rotate(Math.atan2(ent.facing.y, ent.facing.x) + Math.PI / 2 + Math.PI);
    d.drawImage(sprite, -size / 2, -size / 2, size, size);
    d.restore();
  }

  function drawSelfLight(d, ent) {
    const x = ent.x * VIEW_SCALE;
    const y = ent.y * VIEW_SCALE;
    const r = 46;
    d.drawImage(revealGlow, x - r, y - r, r * 2, r * 2);
  }

  function drawAboveDarkness(shakeX, shakeY) {
    ctx.save();
    ctx.translate(shakeX, HUD_H + shakeY);
    ctx.scale(VIEW_SCALE, VIEW_SCALE);

    if (ping) {
      const p = clamp(ping.t / ping.dur, 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(255, 107, 107, ${(1 - p) * 0.55})`;
      ctx.beginPath();
      ctx.arc(ping.x, ping.y, ping.radius || 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    for (const r of radars) {
      const pulse = (r.t % 1.4) / 1.4;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 180, 80, ${0.18 + 0.22 * (1 - pulse)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, TAU);
      ctx.stroke();
      const sweep = r.t * 1.8;
      ctx.strokeStyle = "rgba(255, 180, 80, 0.45)";
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(
        r.x + Math.cos(sweep) * r.radius,
        r.y + Math.sin(sweep) * r.radius
      );
      ctx.stroke();
      ctx.fillStyle = "#ffb44a";
      ctx.beginPath();
      ctx.arc(r.x, r.y, 7, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    for (const hider of hiders) {
      if (!hider.alive || hider.revealT <= 0) continue;
      const role = hider.id === 1 ? "hider2" : "hider";
      if (hider.insideHide) {
        drawPlayerSprite(hider, role);
      }
      drawReticle(hider.x, hider.y, hider.revealT / CFG.pingReveal);
    }

    for (const hider of hiders) {
      if (!hider.alive || !hider.trail.length) continue;
      for (const point of hider.trail) {
        const fade = clamp(point.life / CFG.hard.trailLife, 0, 1);
        ctx.fillStyle = hider.color;
        ctx.globalAlpha = 0.14 * fade;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 9, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.6 * fade;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3.5, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (hider.healT > 0) {
        const p = clamp(hider.healT / CFG.hard.healTime, 0, 1);
        ctx.strokeStyle = "rgba(120, 255, 170, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          hider.x,
          hider.y,
          R + 12,
          -Math.PI / 2,
          -Math.PI / 2 + TAU * p
        );
        ctx.stroke();
        if (hider.healer) {
          ctx.strokeStyle = "rgba(120, 255, 170, 0.22)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(hider.x, hider.y);
          ctx.lineTo(hider.healer.x, hider.healer.y);
          ctx.stroke();
        }
      }
    }

    for (const door of DOORS) {
      ctx.save();
      ctx.strokeStyle = "rgba(125, 211, 252, 0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(door.x, door.y, door.w, door.h);
      ctx.restore();
    }

    if (hardMode) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 90, 90, 0.22)";
      ctx.lineWidth = 1;
      for (const wall of WALLS) {
        if (!wall.spiked) continue;
        ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
      }
      ctx.restore();
    }

    for (const hider of hiders) {
      if (!hider.alive || hider.teleportT <= 0) continue;
      const p = 1 - hider.teleportT / CFG.door.channel;
      ctx.save();
      ctx.strokeStyle = `rgba(125, 211, 252, ${0.4 + p * 0.6})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        hider.x,
        hider.y,
        R + 10 + (1 - p) * 8,
        -Math.PI / 2,
        -Math.PI / 2 + TAU * p
      );
      ctx.stroke();
      ctx.restore();
    }

    if (toast) {
      const p = toast.t / toast.dur;
      const a = p < 0.18 ? p / 0.18 : 1 - (p - 0.18) / 0.82;
      ctx.save();
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.font = `800 ${70 + 12 * Math.sin(p * Math.PI)}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = toast.color;
      ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      ctx.shadowBlur = 16;
      ctx.fillText(toast.text, W / 2, H / 2 - 20);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawParticle(p) {
    const a = clamp(p.life / p.max, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.type === "leaf") {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, TAU);
      ctx.fill();
    } else if (p.type === "confetti") {
      ctx.fillRect(-p.size, -p.size * 0.45, p.size * 2, p.size * 0.9);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawConfetti() {
    ctx.save();
    ctx.translate(0, HUD_H);
    ctx.scale(VIEW_SCALE, VIEW_SCALE);
    for (const p of particles) {
      if (p.type === "confetti") drawParticle(p);
    }
    ctx.restore();
  }

  function drawPlayerSprite(p, role, alpha) {
    const isSeeker = role === "seeker";
    const body = PLAYER_COLORS[p.ctrl] || RED;
    const speed = Math.hypot(p.vx, p.vy);
    const op = alpha === undefined ? 1 : alpha;

    ctx.save();
    ctx.globalAlpha = op;

    // sprint trail
    if (speed > 170) {
      for (let i = 1; i <= 3; i++) {
        ctx.globalAlpha = op * 0.11 * (4 - i);
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(
          p.x - (p.vx / 60) * i,
          p.y - (p.vy / 60) * i,
          R - i * 2,
          0,
          TAU
        );
        ctx.fill();
      }
      ctx.globalAlpha = op;
    }

    // pre-rendered ball body, glow and shadow
    const sprite = ballSprites[p.ctrl] || ballSprites.h1;
    ctx.drawImage(
      sprite.canvas,
      p.x - sprite.size / 2,
      p.y - sprite.size / 2,
      sprite.size,
      sprite.size
    );

    if (isSeeker) {
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, TAU);
      ctx.fill();
    }

    // stamina bar
    if (p.stamina < 99.5) {
      const bw = 32;
      const bx = p.x - bw / 2;
      const by = p.y + R + 5;
      fillRoundRect(bx, by, bw, 4.5, 2.2, "rgba(0, 0, 0, 0.45)");
      const pct = p.stamina / CFG.stamina.max;
      const col = pct > 0.5 ? "#7ddc9b" : pct > 0.22 ? "#ffd166" : "#ff7b7b";
      if (pct > 0.02) {
        fillRoundRect(bx + 1, by + 1, (bw - 2) * pct, 2.5, 1.2, col);
      }
    }

    // seeker ping cooldown ring
    if (isSeeker && (phase === PHASE.HIDE || phase === PHASE.SEEK)) {
      const cooldown = hardMode
        ? CFG.hard.radarCooldown
        : CFG.pingCooldown;
      const ready = phase === PHASE.HIDE ? 1 : 1 - p.pingCD / cooldown;
      ctx.save();
      ctx.globalAlpha = ready >= 1 ? 0.45 : 0.13;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = ready >= 1 ? body : "#fff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, R + 6, -Math.PI / 2, -Math.PI / 2 + TAU * ready);
      ctx.stroke();
      ctx.restore();
    }

    // hider number tag in 3-player mode
    if (!isSeeker && mode === 3 && p.alive) {
      ctx.fillStyle = "rgba(8, 17, 12, 0.8)";
      ctx.beginPath();
      ctx.arc(p.x, p.y - R - 11, 7.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = body;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = body;
      ctx.font = `700 9px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(p.id + 1), p.x, p.y - R - 10.5);
    }

    ctx.restore();
  }

  function drawReticle(x, y, strength) {
    const pulse = 0.55 + 0.45 * Math.sin(time * 12);
    const a = clamp(strength, 0, 1) * (0.5 + 0.5 * pulse);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 107, 107, ${a})`;
    ctx.lineWidth = 2;
    const rr = R + 12 + Math.sin(time * 9) * 3;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 107, 107, ${a * 0.9})`;
    ctx.beginPath();
    ctx.moveTo(x, y - rr - 12);
    ctx.lineTo(x - 6, y - rr - 20);
    ctx.lineTo(x + 6, y - rr - 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function roleForGroup(group) {
    const color = PLAYER_COLORS[group] || RED;
    if (activeSeekers().some((ent) => ent.ctrl === group)) {
      return { label: "SEEKER", color, isSeeker: true };
    }
    const hider = hiders.find((h) => h.ctrl === group);
    if (!hider) return null;
    return {
      label: twoSeekers ? "HIDER" : mode === 3 ? `HIDER ${hider.id + 1}` : "HIDER",
      color,
      isSeeker: false,
    };
  }

  function drawBottomHints() {
    const y = HUD_H + VIEW_H - 9;
    ctx.save();
    ctx.textBaseline = "middle";
    if (aiMode) {
      ctx.textAlign = "center";
      ctx.font = `600 10px ${FONT}`;
      ctx.fillStyle = "rgba(125, 211, 252, 0.6)";
      ctx.fillText("AI MATCH · P pause · M menu", VIEW_W / 2, y);
      ctx.restore();
      return;
    }

    function drawHint(group, align, anchorX) {
      const role = roleForGroup(group);
      if (!role) return;
      const bind = controls[group];
      let detail = `${moveLabel(bind)} · ${keyLabel(bind.light)} ${
        role.isSeeker ? "mode" : "light"
      }`;
      if (!role.isSeeker) {
        detail = `${moveLabel(bind)} · ${keyLabel(bind.sprint)} ${
          hardMode ? "dash" : "sprint"
        } · ${keyLabel(bind.light)} light`;
      } else {
        detail += ` · ${keyLabel(bind.ping)} ${hardMode ? "radar" : "ping"}`;
      }

      ctx.font = `700 10px ${FONT}`;
      const lw = ctx.measureText(role.label).width;
      ctx.font = `600 10px ${FONT}`;
      const dw = ctx.measureText(detail).width;
      let start = anchorX;
      if (align === "right") start = anchorX - lw - 8 - dw;
      else if (align === "center") start = anchorX - (lw + 8 + dw) / 2;

      ctx.textAlign = "left";
      ctx.font = `700 10px ${FONT}`;
      ctx.fillStyle = role.color;
      ctx.globalAlpha = 0.72;
      ctx.fillText(role.label, start, y);
      ctx.font = `600 10px ${FONT}`;
      ctx.fillStyle = "rgba(214, 238, 224, 1)";
      ctx.globalAlpha = 0.45;
      ctx.fillText(detail, start + lw + 8, y);
      ctx.globalAlpha = 1;
    }

    drawHint("h1", "left", 22);
    drawHint("seeker", "right", VIEW_W - 22);
    if (mode === 3) {
      drawHint("h2", "center", VIEW_W / 2);
    } else {
      ctx.textAlign = "center";
      ctx.font = `600 10px ${FONT}`;
      ctx.fillStyle = "rgba(214, 238, 224, 0.32)";
      ctx.fillText(
        `ROUND ${roundNum}`,
        VIEW_W / 2,
        y
      );
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Drawing: HUD
  // ---------------------------------------------------------------------------

  let hudLineGradient = null;

  function drawHud() {
    ctx.save();
    ctx.fillStyle = "#08110d";
    ctx.fillRect(0, 0, CW, HUD_H);

    if (!hudLineGradient) {
      hudLineGradient = ctx.createLinearGradient(0, 0, CW, 0);
      hudLineGradient.addColorStop(0, "rgba(94, 224, 138, 0.55)");
      hudLineGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
      hudLineGradient.addColorStop(1, "rgba(255, 107, 107, 0.55)");
    }
    ctx.fillStyle = hudLineGradient;
    ctx.fillRect(0, HUD_H - 1, CW, 1);

    let phaseLabel = "READY";
    let phaseColor = "rgba(230, 250, 240, 0.72)";
    let timerText = "—";
    let barPct = 0;
    let barColor = "rgba(255, 255, 255, 0.75)";

    if (phase === PHASE.READY) {
      phaseLabel = "HIDE & SEEK";
    } else if (phase === PHASE.START) {
      phaseLabel = `ROUND ${roundNum} · GET READY`;
      timerText = String(Math.max(0, Math.ceil(phaseLeft)));
      barPct = clamp(phaseLeft / START_TIME, 0, 1);
      barColor = GREEN;
      phaseColor = "rgba(94, 224, 138, 0.85)";
    } else if (phase === PHASE.LOOKBACK) {
      phaseLabel = `ROUND ${roundNum} · LOOK BACK`;
      timerText = String(Math.max(0, Math.ceil(phaseLeft)));
      barPct = clamp(phaseLeft / LOOKBACK_TIME, 0, 1);
      barColor = "#ffd166";
      phaseColor = "rgba(255, 209, 102, 0.9)";
    } else if (phase === PHASE.HIDE) {
      phaseLabel = `ROUND ${roundNum} · HEAD START`;
      timerText = String(Math.max(0, Math.ceil(phaseLeft)));
      barPct = clamp(phaseLeft / rules().headStart, 0, 1);
      barColor = GREEN;
      phaseColor = "rgba(94, 224, 138, 0.85)";
    } else if (phase === PHASE.SEEK) {
      phaseLabel = `ROUND ${roundNum} · SEEK`;
      timerText = String(Math.max(0, Math.ceil(phaseLeft)));
      barPct = clamp(phaseLeft / rules().seekTime, 0, 1);
      barColor = RED;
      phaseColor = "rgba(255, 130, 130, 0.9)";
    } else {
      phaseLabel = "ROUND OVER";
      timerText = "—";
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 11px ${FONT}`;
    ctx.fillStyle = phaseColor;
    ctx.fillText(phaseLabel, CW / 2, 26);

    ctx.font = `800 30px ${FONT}`;
    ctx.fillStyle = "#f2fff8";
    ctx.fillText(timerText, CW / 2, 58);

    const bw = 220;
    const bx = CW / 2 - bw / 2;
    fillRoundRect(bx, 66, bw, 5, 2.5, "rgba(255, 255, 255, 0.09)");
    if (barPct > 0) {
      fillRoundRect(bx, 66, bw * barPct, 5, 2.5, barColor);
    }

    if (hardMode) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = `700 10px ${FONT}`;
      ctx.fillStyle = "rgba(255, 130, 130, 0.75)";
      ctx.fillText("HARD", 22, 26);
    }
    if (aiMode) {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = `700 10px ${FONT}`;
      ctx.fillStyle = "rgba(125, 211, 252, 0.75)";
      ctx.fillText("AI", 22, hardMode ? 40 : 26);
    }

    if (
      seekerDoorBoost > 1.001 &&
      (phase === PHASE.HIDE || phase === PHASE.SEEK)
    ) {
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = `700 10px ${FONT}`;
      ctx.fillStyle = "rgba(255, 130, 130, 0.75)";
      ctx.fillText(
        `SEEKER +${Math.round((seekerDoorBoost - 1) * 100)}%`,
        CW - 22,
        26
      );
    }

    ctx.restore();
  }

  function drawScoreChip(x, label, score, color, pips, totalPips) {
    const y = 13;
    const w = 186;
    const h = 54;
    ctx.save();
    roundRectPath(x, y, w, h, 12);
    ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    ctx.fill();
    ctx.strokeStyle = color + "38";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 20, y + h / 2, 4.5, 0, TAU);
    ctx.fill();

    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.font = `700 11px ${FONT}`;
    ctx.fillStyle = color;
    ctx.fillText(label, x + 33, y + 24);

    if (pips !== null && pips !== undefined) {
      const total = totalPips || (mode === 3 ? 2 : 1);
      for (let i = 0; i < total; i++) {
        const px = x + 88 + i * 13;
        const py = y + 20;
        ctx.beginPath();
        ctx.arc(px, py, 3.3, 0, TAU);
        if (i < pips) {
          ctx.fillStyle = color;
          ctx.fill();
        } else {
          ctx.strokeStyle = color + "55";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    ctx.textAlign = "right";
    ctx.font = `800 26px ${FONT}`;
    ctx.fillStyle = "#effff6";
    ctx.fillText(String(score), x + w - 16, y + 40);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Drawing: overlays
  // ---------------------------------------------------------------------------

  function drawOverlayBackdrop(alpha) {
    ctx.fillStyle = `rgba(4, 9, 6, ${alpha})`;
    ctx.fillRect(0, 0, CW, CH);
  }

  function drawStartScreen() {
    drawOverlayBackdrop(0.86);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.font = `800 62px ${FONT}`;
    ctx.fillStyle = "#effff6";
    ctx.shadowColor = "rgba(94, 224, 138, 0.25)";
    ctx.shadowBlur = 26;
    ctx.fillText("HIDE & SEEK", CW / 2, 136);
    ctx.shadowBlur = 0;

    ctx.font = `500 16px ${FONT}`;
    ctx.fillStyle = "rgba(176, 210, 191, 0.85)";
    ctx.fillText("Local multiplayer · one keyboard", CW / 2, 170);

    drawModeButton(MENU.b2, 2, "2 PLAYERS", mode === 2);
    drawModeButton(MENU.b3, 3, "3 PLAYERS", mode === 3 && !twoSeekers);
    drawModeButton(MENU.duo, 3, "2 SEEKERS", mode === 3 && twoSeekers);
    drawMapButton();
    drawHardButton();
    drawAiButton();
    drawFullscreenButton();

    const hoverControls = pointInRect(mouse.x, mouse.y, MENU.controls);
    roundRectPath(
      MENU.controls.x,
      MENU.controls.y,
      MENU.controls.w,
      MENU.controls.h,
      10
    );
    ctx.fillStyle = hoverControls
      ? "rgba(255, 255, 255, 0.09)"
      : "rgba(255, 255, 255, 0.035)";
    ctx.fill();
    ctx.strokeStyle = hoverControls
      ? "rgba(214, 238, 224, 0.35)"
      : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 11px ${FONT}`;
    ctx.fillStyle = "rgba(214, 238, 224, 0.75)";
    ctx.fillText(
      "MENU · M",
      MENU.controls.x + MENU.controls.w / 2,
      MENU.controls.y + MENU.controls.h / 2 + 1
    );
    ctx.textBaseline = "alphabetic";

    ctx.font = `500 12px ${FONT}`;
    ctx.fillStyle = "rgba(160, 196, 176, 0.55)";
    ctx.fillText("← / → or 2 / 3 / 4 · click to switch", CW / 2, 262);

    const isThree = mode === 3;
    const isDuo = twoSeekers && isThree;
    const previewHiderGroups = isDuo
      ? [duoHiderGroupForRound(roundNum)]
      : hiderGroupsForRound(roundNum);
    const previewSeekerGroups = isDuo
      ? duoSeekerGroupsForRound(roundNum)
      : [seekerGroupForRound(roundNum)];
    const seekerBind = controls[previewSeekerGroups[0]];

    const hiderRows = isDuo
      ? (() => {
          const bind = controls[previewHiderGroups[0]];
          return [
            ["MOVE", moveLabel(bind)],
            [hardMode ? "DASH" : "SPRINT", keyLabel(bind.sprint)],
            ["LIGHT", keyLabel(bind.light)],
            ["HIDEOUTS", "vanish"],
          ];
        })()
      : isThree
      ? previewHiderGroups
          .map((group) => {
            const hider = hiders.find((h) => h.ctrl === group);
            const bind = controls[group];
            return [
              hider ? `HIDER ${hider.id + 1}` : "HIDER",
              `${moveLabel(bind)} · ${keyLabel(bind.sprint)} ${
                hardMode ? "dash" : "sprint"
              } · ${keyLabel(bind.light)} light`,
              hider ? hider.color : GREEN,
            ];
          })
          .concat([["HIDEOUTS", "vanish"]])
      : (() => {
          const bind = controls[previewHiderGroups[0]];
          return [
            ["MOVE", moveLabel(bind)],
            [hardMode ? "DASH" : "SPRINT", keyLabel(bind.sprint)],
            ["LIGHT", keyLabel(bind.light)],
            ["HIDEOUTS", "vanish"],
          ];
        })();

    drawControlCard(
      70,
      286,
      440,
      200,
      GREEN,
      isDuo ? "HIDER" : isThree ? "HIDERS" : "HIDER",
      hiderRows,
      hardMode
        ? mode === 2 || twoSeekers
          ? "HARD: dash · spikes slow 3s."
          : "HARD: dash · spikes bleed 7s · heal 2.5s."
        : "+25% head start · 50% seek speed."
    );

    const seekerRows = isDuo
      ? previewSeekerGroups
          .map((group) => {
            const bind = controls[group];
            return [
              playerName(group),
              `${moveLabel(bind)} · ${keyLabel(bind.light)} mode · ${keyLabel(
                bind.ping
              )} ${hardMode ? "radar" : "ping"}`,
              PLAYER_COLORS[group] || RED,
            ];
          })
          .concat([["SPRINT", "locked"]])
      : [
          ["MOVE", moveLabel(seekerBind)],
          [hardMode ? "RADAR" : "PING", keyLabel(seekerBind.ping)],
          ["LIGHT MODE", keyLabel(seekerBind.light)],
          ["SPRINT", "locked"],
        ];

    drawControlCard(
      530,
      286,
      400,
      200,
      isDuo ? RED : PLAYER_COLORS[previewSeekerGroups[0]] || RED,
      isDuo ? "SEEKERS" : "SEEKER",
      seekerRows,
      hardMode
        ? twoSeekers && isThree
          ? "HARD: radar · spikes eliminate a seeker."
          : "HARD: radar · spikes slow you."
        : isDuo
        ? "Catch the hider · 1.15× boost for final 10.5s."
        : isThree
        ? "Catch both · 1.15× boost for final 10.5s."
        : "Tag the hider · 1.15× boost for final 10.5s."
    );

    const headStart = rules().headStart;
    const article = headStart === 8 ? "an" : "a";
    ctx.font = `500 14px ${FONT}`;
    ctx.fillStyle = "rgba(198, 226, 210, 0.7)";
    ctx.fillText(
      isDuo
        ? `2s ready · the hider gets an ${headStart}s head start while the seekers count · 1s look-back bell.`
        : isThree
        ? `2s ready · both hiders get an ${headStart}s head start while the seeker counts · 1s look-back bell.`
        : `2s ready · the hider gets a ${headStart}s head start while the seeker counts · 1s look-back bell.`,
      CW / 2,
      512
    );
    ctx.fillText(
      isDuo
        ? "Hiders 30° / 0.7× · Seeker 35°/1.5×, 75°/1×, 360°/0.3× (reveals through walls) · roles change."
        : "Hiders 30° / 0.7× · Seeker 35°/1.5×, 75°/1×, 360°/0.3× (reveals through walls) · roles change.",
      CW / 2,
      534
    );

    const a = 0.55 + 0.45 * Math.sin(time * 3.4);
    const hoverStart = pointInRect(mouse.x, mouse.y, MENU.start);
    roundRectPath(
      MENU.start.x,
      MENU.start.y,
      MENU.start.w,
      MENU.start.h,
      14
    );
    ctx.fillStyle = hoverStart
      ? "rgba(94, 224, 138, 0.14)"
      : "rgba(94, 224, 138, 0.07)";
    ctx.fill();
    ctx.strokeStyle = `rgba(94, 224, 138, ${hoverStart ? 0.6 : 0.32})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `800 20px ${FONT}`;
    ctx.fillStyle = `rgba(239, 255, 246, ${a})`;
    ctx.textAlign = "center";
    ctx.fillText(
      aiMode ? "PRESS SPACE TO WATCH AI" : "PRESS SPACE TO START",
      MENU.start.x + MENU.start.w / 2,
      592
    );

    ctx.font = `500 12px ${FONT}`;
    ctx.fillStyle = "rgba(160, 196, 176, 0.5)";
    ctx.fillText(
      "M menu · P pause · N mute",
      CW / 2,
      638
    );
    ctx.restore();
  }

  function drawControlsScreen() {
    drawOverlayBackdrop(0.9);
    const layout = controlsLayout();

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.font = `800 46px ${FONT}`;
    ctx.fillStyle = "#effff6";
    ctx.shadowColor = "rgba(94, 224, 138, 0.22)";
    ctx.shadowBlur = 22;
    ctx.fillText("CONTROLS", CW / 2, 86);
    ctx.shadowBlur = 0;

    ctx.font = `500 14px ${FONT}`;
    ctx.fillStyle = "rgba(198, 226, 210, 0.72)";
    ctx.fillText("Click any key, then press the new key.", CW / 2, 116);
    ctx.fillText(
      "If the key is already used, the two controls swap.",
      CW / 2,
      136
    );

    for (const card of layout.cards) {
      roundRectPath(card.x, card.y, card.w, card.h, 16);
      ctx.fillStyle = "rgba(13, 26, 19, 0.94)";
      ctx.fill();
      ctx.strokeStyle = card.color + "4a";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      fillRoundRect(card.x + 20, card.y + 20, 34, 4, 2, card.color);

      ctx.textAlign = "left";
      ctx.font = `800 18px ${FONT}`;
      ctx.fillStyle = card.color;
      ctx.fillText(card.title, card.x + 22, card.y + 52);

      const tip = hardMode
        ? "HARD: dash / radar · spikes"
        : "Seeker: light modes, no sprint.";
      ctx.font = `500 11px ${FONT}`;
      ctx.fillStyle = card.color + "90";
      ctx.fillText(tip, card.x + 22, card.y + card.h - 18);
    }

    for (const binding of layout.bindings) {
      const card = layout.cards.find((c) => c.key === binding.group);
      const cy = binding.centerY;

      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = `700 10px ${FONT}`;
      ctx.fillStyle = "rgba(214, 238, 224, 0.5)";
      const actionLabel = hardMode
        ? binding.action === "sprint"
          ? "DASH"
          : binding.action === "ping"
          ? "RADAR"
          : ACTION_LABELS[binding.action]
        : ACTION_LABELS[binding.action];
      ctx.fillText(actionLabel, card.x + 22, cy);

      const active =
        rebinding &&
        rebinding.group === binding.group &&
        rebinding.action === binding.action;
      const hover = pointInRect(mouse.x, mouse.y, binding.button);
      drawKeyButton(
        binding.button,
        active
          ? "PRESS A KEY"
          : keyLabel(controls[binding.group][binding.action]),
        card.color,
        active,
        hover
      );
    }

    if (controlsNotice > 0) {
      const alpha = clamp(controlsNotice * 1.6, 0, 1);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 12px ${FONT}`;
      ctx.fillStyle = `rgba(255, 209, 102, ${0.9 * alpha})`;
      ctx.fillText(
        "ESC, P, M, N, TAB and F-keys are reserved.",
        CW / 2,
        522
      );
    }

    drawTextButton(layout.reset, "RESET DEFAULTS", false);
    drawTextButton(layout.back, "BACK", true);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `500 12px ${FONT}`;
    ctx.fillStyle = "rgba(160, 196, 176, 0.45)";
    ctx.fillText(
      "Changes save automatically · M/ESC to go back",
      CW / 2,
      632
    );
    ctx.restore();
  }

  function drawKeyButton(rect, label, color, active, hover) {
    ctx.save();
    roundRectPath(rect.x, rect.y, rect.w, rect.h, 8);
    if (active) {
      ctx.fillStyle = color + "22";
    } else if (hover) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    }
    ctx.fill();
    ctx.strokeStyle = active ? color : "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = active ? 1.8 : 1;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${active ? 10 : 12}px ${FONT}`;
    ctx.fillStyle = active ? color : "rgba(236, 250, 242, 0.92)";
    ctx.fillText(
      label,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2 + 1
    );
    ctx.restore();
  }

  function drawTextButton(rect, label, accent) {
    const hover = pointInRect(mouse.x, mouse.y, rect);
    ctx.save();
    roundRectPath(rect.x, rect.y, rect.w, rect.h, 11);
    ctx.fillStyle = hover
      ? accent
        ? "rgba(94, 224, 138, 0.14)"
        : "rgba(255, 255, 255, 0.09)"
      : "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.strokeStyle = accent
      ? `rgba(94, 224, 138, ${hover ? 0.6 : 0.32})`
      : `rgba(255, 255, 255, ${hover ? 0.28 : 0.14})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 12px ${FONT}`;
    ctx.fillStyle = accent
      ? "rgba(239, 255, 246, 0.92)"
      : "rgba(214, 238, 224, 0.7)";
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
    ctx.restore();
  }

  function drawModeButton(rect, value, label, selectedOverride) {
    const selected =
      selectedOverride === undefined ? mode === value : selectedOverride;
    const hover = pointInRect(mouse.x, mouse.y, rect);
    ctx.save();
    roundRectPath(rect.x, rect.y, rect.w, rect.h, rect.h >= 40 ? 12 : 7);
    ctx.fillStyle = selected
      ? "rgba(94, 224, 138, 0.16)"
      : hover
      ? "rgba(255, 255, 255, 0.06)"
      : "rgba(255, 255, 255, 0.03)";
    ctx.fill();
    ctx.strokeStyle = selected
      ? "rgba(94, 224, 138, 0.75)"
      : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = selected ? 1.8 : 1;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${rect.h >= 40 ? 15 : 10}px ${FONT}`;
    ctx.fillStyle = selected ? "#effff6" : "rgba(198, 226, 210, 0.6)";
    ctx.fillText(
      label || `${value} PLAYERS`,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2 + 1
    );
    ctx.restore();
  }

  function fullscreenActive() {
    return !!(
      document.fullscreenElement || document.webkitFullscreenElement
    );
  }

  function toggleFullscreen() {
    try {
      if (fullscreenActive()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) {
          const result = exit.call(document);
          if (result && result.catch) result.catch(() => {});
        }
      } else {
        const el = document.documentElement;
        const request = el.requestFullscreen || el.webkitRequestFullscreen;
        if (request) {
          const result = request.call(el);
          if (result && result.catch) result.catch(() => {});
        }
      }
    } catch (e) {
      /* ignore */
    }
    sfx.click();
  }

  function drawFullscreenButton() {
    const rect = MENU.fullscreen;
    const hover = pointInRect(mouse.x, mouse.y, rect);
    ctx.save();
    roundRectPath(rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fillStyle = hover
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(255, 255, 255, 0.035)";
    ctx.fill();
    ctx.strokeStyle = hover
      ? "rgba(214, 238, 224, 0.35)"
      : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 11px ${FONT}`;
    ctx.fillStyle = "rgba(214, 238, 224, 0.75)";
    ctx.fillText(
      fullscreenActive() ? "EXIT FULLSCREEN" : "FULLSCREEN",
      rect.x + rect.w / 2,
      rect.y + rect.h / 2 + 1
    );
    ctx.restore();
  }

  function drawHardButton() {
    const rect = MENU.hard;
    const hover = pointInRect(mouse.x, mouse.y, rect);
    ctx.save();
    roundRectPath(rect.x, rect.y, rect.w, rect.h, 7);
    ctx.fillStyle = hardMode
      ? "rgba(255, 107, 107, 0.16)"
      : hover
      ? "rgba(255, 255, 255, 0.06)"
      : "rgba(255, 255, 255, 0.03)";
    ctx.fill();
    ctx.strokeStyle = hardMode
      ? "rgba(255, 107, 107, 0.75)"
      : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = hardMode ? 1.8 : 1;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${rect.h >= 40 ? 11 : 9}px ${FONT}`;
    ctx.fillStyle = hardMode
      ? "rgba(255, 225, 225, 0.95)"
      : "rgba(198, 226, 210, 0.6)";
    ctx.fillText(
      hardMode ? "HARD ON" : "HARD OFF",
      rect.x + rect.w / 2,
      rect.y + rect.h / 2 + 1
    );
    ctx.restore();
  }

  function drawAiButton() {
    const rect = MENU.ai;
    const hover = pointInRect(mouse.x, mouse.y, rect);
    ctx.save();
    roundRectPath(rect.x, rect.y, rect.w, rect.h, 7);
    ctx.fillStyle = aiMode
      ? "rgba(125, 211, 252, 0.16)"
      : hover
      ? "rgba(255, 255, 255, 0.06)"
      : "rgba(255, 255, 255, 0.03)";
    ctx.fill();
    ctx.strokeStyle = aiMode
      ? "rgba(125, 211, 252, 0.75)"
      : "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = aiMode ? 1.8 : 1;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${rect.h >= 40 ? 11 : 9}px ${FONT}`;
    ctx.fillStyle = aiMode
      ? "rgba(225, 248, 255, 0.95)"
      : "rgba(198, 226, 210, 0.6)";
    ctx.fillText(aiMode ? "AI ON" : "AI OFF", rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
    ctx.restore();
  }

  function drawMapButton() {
    const rect = MENU.map;
    const hover = pointInRect(mouse.x, mouse.y, rect);
    ctx.save();
    roundRectPath(rect.x, rect.y, rect.w, rect.h, 7);
    ctx.fillStyle = hover
      ? "rgba(255, 255, 255, 0.07)"
      : "rgba(255, 255, 255, 0.03)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${rect.h >= 40 ? 13 : 10}px ${FONT}`;
    ctx.fillStyle = "rgba(239, 255, 246, 0.9)";
    ctx.fillText(
      `MAP ${mapIndex + 1} · ${MAPS[mapIndex].name}`,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2 + 1
    );
    ctx.restore();
  }

  function drawControlCard(x, y, w, h, color, title, rows, footer) {
    ctx.save();
    roundRectPath(x, y, w, h, 16);
    ctx.fillStyle = "rgba(13, 26, 19, 0.92)";
    ctx.fill();
    ctx.strokeStyle = color + "4a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = color;
    fillRoundRect(x + 22, y + 20, 34, 4, 2, color);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `800 18px ${FONT}`;
    ctx.fillStyle = color;
    ctx.fillText(title, x + 22, y + 50);

    let ry = y + 82;
    for (const row of rows) {
      const key = row[0];
      const what = row[1];
      const rowColor = row[2];
      ctx.font = `700 13px ${FONT}`;
      ctx.fillStyle = rowColor || "rgba(236, 250, 242, 0.9)";
      ctx.fillText(key, x + 22, ry);
      const kw = ctx.measureText(key).width;
      ctx.font = `500 13px ${FONT}`;
      ctx.fillStyle = "rgba(170, 203, 183, 0.7)";
      ctx.fillText("— " + what, x + 22 + kw + 8, ry);
      ry += 24;
    }

    ctx.font = `500 12px ${FONT}`;
    ctx.fillStyle = color + "b0";
    ctx.fillText(footer, x + 22, y + h - 20);
    ctx.restore();
  }

  function drawEndScreen() {
    const fade = clamp((overSince - 0.15) / 0.4, 0, 1);
    if (fade <= 0) return;

    const seekerWon = winner === "seeker";
    const color = seekerWon ? RED : GREEN;

    ctx.save();
    ctx.globalAlpha = fade;
    drawOverlayBackdrop(0.68);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.font = `800 58px ${FONT}`;
    ctx.fillStyle = color;
    ctx.shadowColor = color + "55";
    ctx.shadowBlur = 24;
    ctx.fillText(seekerWon ? "SEEKER WON" : "HIDER WON", CW / 2, 270);
    ctx.shadowBlur = 0;

    ctx.font = `500 16px ${FONT}`;
    ctx.fillStyle = "rgba(198, 226, 210, 0.8)";
    ctx.fillText(endReason, CW / 2, 310);

    const a = 0.55 + 0.45 * Math.sin(time * 3.4);
    ctx.font = `800 20px ${FONT}`;
    ctx.fillStyle = `rgba(239, 255, 246, ${a})`;
    ctx.fillText(
      aiMode ? "NEXT ROUND STARTING..." : "PRESS SPACE FOR NEXT ROUND",
      CW / 2,
      474
    );

    ctx.font = `500 12px ${FONT}`;
    ctx.fillStyle = "rgba(160, 196, 176, 0.5)";
    ctx.fillText("ESC for menu", CW / 2, 520);
    ctx.restore();
  }

  function drawPauseOverlay() {
    ctx.save();
    drawOverlayBackdrop(0.66);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `800 54px ${FONT}`;
    ctx.fillStyle = "#effff6";
    ctx.fillText("PAUSED", CW / 2, CH / 2 - 12);
    ctx.font = `500 16px ${FONT}`;
    ctx.fillStyle = "rgba(198, 226, 210, 0.75)";
    ctx.fillText("Press P or ESC to resume", CW / 2, CH / 2 + 30);
    ctx.font = `500 12px ${FONT}`;
    ctx.fillStyle = "rgba(160, 196, 176, 0.45)";
    ctx.fillText("M toggles sound", CW / 2, CH / 2 + 58);
    ctx.restore();
  }

  function drawMuteBadge() {
    if (!muted) return;
    ctx.save();
    ctx.font = `700 10px ${FONT}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(200, 225, 210, 0.35)";
    ctx.fillText("MUTED", CW - 22, HUD_H - 14);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Frame
  // ---------------------------------------------------------------------------

  function draw() {
    const shakeX = shake > 0 ? rand(-shake, shake) * 0.6 : 0;
    const shakeY = shake > 0 ? rand(-shake, shake) * 0.6 : 0;

    if (shake > 0) {
      ctx.fillStyle = "#060b08";
      ctx.fillRect(0, 0, CW, CH);
    }

    ctx.save();
    ctx.translate(shakeX, HUD_H + shakeY);
    ctx.drawImage(staticArena, 0, 0, VIEW_W, VIEW_H);
    if (hardMode) ctx.drawImage(spikeArena, 0, 0, VIEW_W, VIEW_H);
    ctx.scale(VIEW_SCALE, VIEW_SCALE);
    drawWorld();
    ctx.restore();

    drawDarkness(shakeX, shakeY);
    drawAboveDarkness(shakeX, shakeY);

    drawBottomHints();
    drawHud();
    drawMuteBadge();

    if (phase === PHASE.READY) {
      if (menuScreen === "controls") drawControlsScreen();
      else drawStartScreen();
    } else if (phase === PHASE.OVER || phase === PHASE.MATCH) {
      drawEndScreen();
    }

    if (phase === PHASE.MATCH) drawConfetti();

    if (paused && (phase === PHASE.HIDE || phase === PHASE.SEEK)) {
      drawPauseOverlay();
    }
  }

  let last = 0;
  let lastRender = 0;

  function loop(now) {
    requestAnimationFrame(loop);
    if (!last) last = now;
    // Menus and pause screens are mostly static: redraw them at 30 fps.
    const minGap =
      phase === PHASE.READY ||
      phase === PHASE.OVER ||
      phase === PHASE.MATCH ||
      paused
        ? 32
        : 11;
    if (now - lastRender < minGap) return;

    let dt = (now - last) / 1000;
    last = now;
    lastRender = now;
    if (!isFinite(dt) || dt < 0) dt = 0;
    dt = Math.min(dt, 0.05);

    time += dt;
    if (!paused) update(dt);
    draw();
  }

  // Kick things off at spawn so the menu has a nice backdrop.
  resetEntities();
  requestAnimationFrame(loop);
})();
