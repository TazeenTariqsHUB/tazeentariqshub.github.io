// Boot sequence — quick, skippable "OS starting up" overlay shown once per
// browser session before the Home interface is revealed
(function () {
  const overlay = document.getElementById('bootOverlay');
  if (!overlay) return;
  const linesEl = document.getElementById('bootLines');
  const heroInner = document.querySelector('.sys-hero-inner');

  if (sessionStorage.getItem('bootSeen')) {
    overlay.remove();
    if (heroInner) heroInner.style.animationDelay = '0s';
    return;
  }

  const lines = ['INITIALIZING...', 'IDENTITY VERIFIED', 'SECURITY PROFILE LOADED', 'WELCOME, TAZEEN'];
  let done = false;
  const timers = [];

  function finishBoot() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    sessionStorage.setItem('bootSeen', '1');
    overlay.classList.add('fade-out');
    if (heroInner) heroInner.style.animationDelay = '0s';
    setTimeout(() => overlay.remove(), 500);
  }

  lines.forEach((text, i) => {
    timers.push(setTimeout(() => {
      const p = document.createElement('p');
      p.textContent = text;
      linesEl.appendChild(p);
    }, i * 300));
  });
  timers.push(setTimeout(finishBoot, lines.length * 300 + 400));

  ['click', 'keydown', 'touchstart'].forEach(evt =>
    overlay.addEventListener(evt, finishBoot, { once: true })
  );
})();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Hero typing effect — types the full role line, holds, erases, retypes,
// continuously
const heroTyped = document.getElementById('heroTyped');
if (heroTyped) {
  const fullRole = 'Junior SQA Engineer and Bug Bounty Specialist';

  async function typeRoleLoop() {
    while (true) {
      for (let c = 0; c <= fullRole.length; c++) {
        heroTyped.textContent = fullRole.slice(0, c);
        await new Promise(r => setTimeout(r, 40 + Math.random() * 35));
      }
      await new Promise(r => setTimeout(r, 1800));
      for (let c = fullRole.length; c >= 0; c--) {
        heroTyped.textContent = fullRole.slice(0, c);
        await new Promise(r => setTimeout(r, 18 + Math.random() * 18));
      }
      await new Promise(r => setTimeout(r, 500));
    }
  }
  typeRoleLoop();
}

// Page-title typing effect — used on subpage headings ("Experience",
// "Education", "Projects", "About"): types out once on load, then stays
async function typeHeadingOnce(el, speed) {
  const text = el.textContent.trim();
  el.textContent = '';
  el.classList.add('is-typing');
  for (let c = 0; c <= text.length; c++) {
    el.textContent = text.slice(0, c);
    await new Promise(r => setTimeout(r, speed || 55));
  }
  el.classList.remove('is-typing');
}
document.querySelectorAll('.page-title').forEach(el => typeHeadingOnce(el, 60));

// Hero background box grid — assembles left-to-right, breaks apart in the middle
const heroBoxGrid = document.getElementById('heroBoxGrid');
if (heroBoxGrid) {
  function buildBoxGrid() {
    heroBoxGrid.innerHTML = '';
    const narrow = window.innerWidth < 700;
    const cols = narrow ? 8 : 14;
    const rows = narrow ? 6 : 8;
    heroBoxGrid.style.setProperty('--cols', cols);
    heroBoxGrid.style.setProperty('--rows', rows);

    const midStart = Math.floor(cols * 0.35);
    const midEnd = Math.ceil(cols * 0.65);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const box = document.createElement('div');
        box.className = 'hero-box';
        box.style.setProperty('--delay', `${(c * 0.05 + r * 0.02).toFixed(2)}s`);
        if (c >= midStart && c < midEnd && Math.random() < 0.5) {
          box.classList.add('breaking');
          box.style.setProperty('--break-delay', `${(0.6 + Math.random() * 1.2).toFixed(2)}s`);
        }
        heroBoxGrid.appendChild(box);
      }
    }
  }

  buildBoxGrid();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildBoxGrid, 300);
  });
}

// Dossier waveform strips — small animated equalizer bars, like the
// reference dossier card's data readout graph
document.querySelectorAll('.dossier-wave').forEach(wave => {
  const count = parseInt(wave.dataset.bars, 10) || 16;
  for (let i = 0; i < count; i++) {
    const bar = document.createElement('span');
    bar.style.animationDelay = `${(Math.random() * 1.2).toFixed(2)}s`;
    bar.style.animationDuration = `${(0.9 + Math.random() * 0.8).toFixed(2)}s`;
    wave.appendChild(bar);
  }
});

// Pixel character — cursor-tracking eye, menu-hover reactions, and a
// click-to-navigate sequence (point → pixel-dissolve → real page load →
// reveal). Runs identically on Home and every subpage; each page has its
// own robot instance and its own pixel-transition overlay.
(function () {
  const stage = document.getElementById('charStage');
  const lean = document.getElementById('charLean');
  const eye = document.getElementById('charEye');
  const armR = document.getElementById('charArmR');
  const armL = document.getElementById('charArmL');
  const legs = document.getElementById('charLegs');
  const speech = document.getElementById('charSpeech');
  const overlay = document.getElementById('pixelTransition');
  const backBtn = document.getElementById('pageBack');
  const fine = window.matchMedia('(pointer: fine)').matches;

  // Eyes subtly track the cursor (desktop only, rAF-throttled)
  if (stage && eye && fine) {
    let ticking = false;
    let lastX = 0, lastY = 0;
    document.addEventListener('mousemove', e => {
      lastX = e.clientX; lastY = e.clientY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.2;
        const dx = Math.max(-1, Math.min(1, (lastX - cx) / 260));
        const dy = Math.max(-1, Math.min(1, (lastY - cy) / 260));
        eye.style.transform = `translate(${(dx * 2.4).toFixed(1)}px, ${(dy * 2.4).toFixed(1)}px)`;
        ticking = false;
      });
    });
  }

  function walkPulse(ms) {
    if (!legs) return;
    legs.classList.add('is-walking');
    setTimeout(() => legs.classList.remove('is-walking'), ms);
  }

  // Home menu hover — character leans toward the tile and taps its feet
  if (lean) {
    document.querySelectorAll('.sys-menu-item').forEach(link => {
      link.addEventListener('mouseenter', () => {
        const rect = link.getBoundingClientRect();
        const side = rect.left + rect.width / 2 < window.innerWidth / 2 ? 'lean-left' : 'lean-right';
        lean.classList.remove('lean-left', 'lean-right');
        lean.classList.add(side);
        walkPulse(420);
      });
      link.addEventListener('mouseleave', () => {
        lean.classList.remove('lean-left', 'lean-right');
      });
    });
  }

  // Pixel wipe grid — blocks converge toward the center to cover the
  // screen, then clear outward from the center to reveal the page,
  // like a chunky retro iris wipe. Built once per page; each block's
  // distance from center is cached so the delay can be flipped between
  // the two phases (converge vs. expand).
  const PT_COLS = 8, PT_ROWS = 5, PT_STEP_MS = 26, PT_FADE_MS = 200;
  let ptBlocks = [];
  function buildPixelGrid() {
    if (!overlay || overlay.childElementCount) return;
    const cx = (PT_COLS - 1) / 2, cy = (PT_ROWS - 1) / 2;
    for (let r = 0; r < PT_ROWS; r++) {
      for (let c = 0; c < PT_COLS; c++) {
        const block = document.createElement('div');
        block.className = 'pt-block';
        const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
        block.dataset.dist = dist.toFixed(2);
        overlay.appendChild(block);
        ptBlocks.push(block);
      }
    }
  }
  buildPixelGrid();
  const ptMaxDist = ptBlocks.length
    ? Math.max(...ptBlocks.map(b => parseFloat(b.dataset.dist)))
    : 0;

  // Cover: outer blocks land first, center lands last — converging in
  function ptSetCoverDelays() {
    ptBlocks.forEach(b => {
      b.style.transitionDelay = `${(ptMaxDist - parseFloat(b.dataset.dist)) * PT_STEP_MS}ms`;
    });
  }
  // Reveal: center clears first, outer blocks clear last — expanding out
  function ptSetRevealDelays() {
    ptBlocks.forEach(b => {
      b.style.transitionDelay = `${parseFloat(b.dataset.dist) * PT_STEP_MS}ms`;
    });
  }
  const PT_TOTAL_MS = ptMaxDist * PT_STEP_MS + PT_FADE_MS;

  // Every page loads already "covered" (see the is-active class in the
  // HTML) — reveal it shortly after the grid is built, so the site always
  // arrives mid-pixelate and resolves outward from the center, whether via
  // a menu click, the browser Back button, or a direct link.
  if (overlay) {
    ptSetRevealDelays();
    setTimeout(() => overlay.classList.remove('is-active'), 60);
  }

  function coverThen(callback) {
    if (!overlay) { callback(); return; }
    ptSetCoverDelays();
    overlay.classList.add('is-active');
    setTimeout(callback, PT_TOTAL_MS);
  }

  // Site menu present on every subpage's top bar — plain navigation
  // through the pixel-wipe, no character choreography needed here
  document.querySelectorAll('.page-nav a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href) return;
      e.preventDefault();
      coverThen(() => { window.location.href = href; });
    });
  });

  // Step-by-step walk — moves the walk-track a real footstep's worth of
  // distance at a time, swapping which leg is forward on EVERY step so
  // the leg pose is always in sync with the movement: left foot forward
  // + move, right foot forward + move, alternating — not an independent
  // animation running on its own clock.
  const WALK_STEP_SIZE = 18; // px covered per footstep
  const WALK_STEP_MS = 120;  // ms between footsteps (one foot plant)
  const WALK_STEP_MAX = 22;  // cap so very long walks don't take forever

  // Reads the track's current translate offset so a new walk can continue
  // from wherever it actually is, instead of restarting from (0, 0)
  function getTrackOffset(track) {
    const m = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\s*\)/.exec(track.style.transform || '');
    return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
  }

  function stepWalk(track, totalDx, totalDy, onDone, shouldAbort) {
    if (!track) { if (onDone) onDone(); return; }
    const start = getTrackOffset(track);
    const dist = Math.hypot(totalDx, totalDy);
    const steps = Math.max(1, Math.min(WALK_STEP_MAX, Math.round(dist / WALK_STEP_SIZE)));
    let i = 0;
    let footLeft = true;
    const nextStep = () => {
      if (shouldAbort && shouldAbort()) return;
      i++;
      const x = (start.x + totalDx * i / steps).toFixed(1);
      const y = (start.y + totalDy * i / steps).toFixed(1);
      track.style.transform = `translate(${x}px, ${y}px)`;
      if (legs) legs.classList.toggle('leg-b', !footLeft);
      footLeft = !footLeft;
      if (i < steps) setTimeout(nextStep, WALK_STEP_MS);
      else {
        if (legs) legs.classList.remove('leg-b');
        if (onDone) onDone();
      }
    };
    setTimeout(nextStep, WALK_STEP_MS);
  }

  // Click a menu tile: a quick "ready" beat, then the character walks
  // down and stands on TOP of the tile, points, and the screen
  // pixel-dissolves into a real page navigation
  const walkTrack = document.getElementById('charWalkTrack');
  const READY_MS = 90;

  // Guards against clicking a second tile while the robot is still
  // walking toward the first one — instead of both walks fighting over
  // the same track transform (the glitch), the in-flight walk is
  // cancelled and the robot just stops where it is and waits for a
  // fresh, deliberate click to actually go anywhere.
  let walkId = 0;
  let walking = false;

  document.querySelectorAll('.sys-menu-item').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href) return;
      e.preventDefault();

      if (walking) {
        walkId++; // invalidates the in-flight stepWalk / ready-beat
        walking = false;
        if (stage) stage.classList.remove('is-walking-bob');
        if (legs) legs.classList.remove('leg-b');
        // Throw both hands up and ask instead of tearing off toward two
        // rooms at once
        if (armR) armR.classList.add('is-despair');
        if (armL) armL.classList.add('is-despair');
        if (speech) {
          speech.textContent = 'WHICH ROOM?';
          speech.classList.add('is-visible');
        }
        setTimeout(() => {
          if (armR) armR.classList.remove('is-despair');
          if (armL) armL.classList.remove('is-despair');
          if (speech) {
            speech.classList.remove('is-visible');
            speech.textContent = 'HI!';
          }
        }, 1100);
        return;
      }

      const myWalkId = ++walkId;
      walking = true;

      if (lean) lean.classList.remove('lean-left', 'lean-right');

      // 1. Quick "ready" beat
      if (stage) stage.classList.add('is-walking-bob');

      setTimeout(() => {
        if (myWalkId !== walkId) return; // cancelled during the ready beat
        let dx = 0, dy = 0;
        if (walkTrack) {
          const from = walkTrack.getBoundingClientRect();
          const to = link.getBoundingClientRect();
          // Land standing on TOP of the tile — feet at its top edge,
          // centered horizontally — not beside it.
          dx = (to.left + to.width / 2) - (from.left + from.width / 2);
          dy = to.top - from.bottom + 6;
        }
        // 2. Walk down, one footstep at a time — leg pose is toggled
        // by stepWalk itself, in lockstep with each move
        stepWalk(walkTrack, dx, dy, () => {
          walking = false;
          if (stage) stage.classList.remove('is-walking-bob');
          if (armR) {
            armR.classList.add('is-pointing');
            setTimeout(() => armR.classList.remove('is-pointing'), 500);
          }
          setTimeout(() => {
            coverThen(() => { window.location.href = href; });
          }, 150);
        }, () => myWalkId !== walkId);
      }, READY_MS);
    });
  });

  // Back button — quick cover, then hand off to the browser's history
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      coverThen(() => window.history.back());
    });
  }

  // Subpages: the robot walks down alongside the page in discrete steps
  // as you scroll — a footstep per threshold crossed — rather than
  // gliding continuously in lockstep with the scroll position.
  const charFollow = document.getElementById('charFollow');
  if (charFollow) {
    const FOLLOW_SCROLL_PER_STEP = 70; // px scrolled before taking a step
    const FOLLOW_STEP_SIZE = 24;       // px the character moves per step
    const FOLLOW_TOP_MIN = 70;
    let followTop = FOLLOW_TOP_MIN;
    let lastStepScrollY = window.scrollY;
    let stepPulseTimer = null;
    let followFootLeft = true;
    charFollow.style.top = `${followTop}px`;

    function takeFollowStep(dir) {
      const max = FOLLOW_TOP_MIN + Math.max(0, window.innerHeight - 150);
      followTop = Math.max(FOLLOW_TOP_MIN, Math.min(max, followTop + dir * FOLLOW_STEP_SIZE));
      charFollow.style.top = `${followTop}px`;
      // One deliberate leg swap per step — same "sync the pose to the
      // move" fix as the click-to-walk sequence, not an independent
      // animation running on its own clock.
      if (legs) legs.classList.toggle('leg-b', !followFootLeft);
      followFootLeft = !followFootLeft;
      if (stage) stage.classList.add('is-walking-bob');
      clearTimeout(stepPulseTimer);
      stepPulseTimer = setTimeout(() => {
        if (stage) stage.classList.remove('is-walking-bob');
      }, 260);
    }

    function onScroll() {
      const scrollY = window.scrollY;
      while (scrollY - lastStepScrollY >= FOLLOW_SCROLL_PER_STEP) {
        lastStepScrollY += FOLLOW_SCROLL_PER_STEP;
        takeFollowStep(1);
      }
      while (lastStepScrollY - scrollY >= FOLLOW_SCROLL_PER_STEP) {
        lastStepScrollY -= FOLLOW_SCROLL_PER_STEP;
        takeFollowStep(-1);
      }
    }
    // Roaming pages (About) skip scroll-stepping entirely — free-roam
    // already covers vertical movement, and the two would otherwise
    // fight over the same left/top transition timing.
    if (!charFollow.classList.contains('roams')) {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // On pages marked "roams" (About), the companion freely wanders the
    // whole screen — walking, running, jumping — and periodically bumps
    // into the About panel and recoils off it, instead of just stepping
    // side to side.
    if (charFollow.classList.contains('roams')) {
      const WALK_SPEED = 32; // px/sec — slow and steady
      const RUN_SPEED = 55;  // px/sec — still unhurried, just a bit quicker

      function roamPos() {
        return {
          x: parseFloat(charFollow.style.left) || 10,
          y: parseFloat(charFollow.style.top) || 90
        };
      }
      function clampToScreen(p) {
        return {
          x: Math.max(6, Math.min(window.innerWidth - 70, p.x)),
          y: Math.max(80, Math.min(window.innerHeight - 90, p.y))
        };
      }
      function aboutPanelRect() {
        const panel = document.querySelector('.about-page-section .win');
        return panel ? panel.getBoundingClientRect() : null;
      }
      function randomWanderTarget() {
        const panel = aboutPanelRect();
        let t, tries = 0;
        do {
          t = clampToScreen({
            x: 20 + Math.random() * (window.innerWidth - 100),
            y: 80 + Math.random() * (window.innerHeight - 170)
          });
          tries++;
        } while (panel && tries < 6 &&
          t.x > panel.left - 30 && t.x < panel.right + 10 &&
          t.y > panel.top - 30 && t.y < panel.bottom + 10);
        return t;
      }
      function panelEdgeTarget() {
        const panel = aboutPanelRect();
        if (!panel) return randomWanderTarget();
        const side = Math.floor(Math.random() * 4);
        const pad = 8;
        const t = side === 0 ? { x: panel.left + Math.random() * panel.width, y: panel.top - pad }
          : side === 1 ? { x: panel.left + Math.random() * panel.width, y: panel.bottom + pad }
          : side === 2 ? { x: panel.left - pad, y: panel.top + Math.random() * panel.height }
          : { x: panel.right + pad, y: panel.top + Math.random() * panel.height };
        return clampToScreen(t);
      }
      function moveRoamTo(target, run) {
        const from = roamPos();
        const dist = Math.hypot(target.x - from.x, target.y - from.y);
        // No upper cap here — a real cap would force long moves to cover
        // more distance per second than WALK_SPEED/RUN_SPEED intend,
        // which is exactly what made this look like running.
        const duration = Math.max(1.2, dist / (run ? RUN_SPEED : WALK_SPEED));
        charFollow.style.transitionDuration = `${duration}s, ${duration}s`;
        charFollow.style.left = `${target.x}px`;
        charFollow.style.top = `${target.y}px`;
        if (legs) legs.classList.add('is-walking');
        if (stage) stage.classList.add('is-walking-bob');
        return duration;
      }

      let roamMoveCount = 0;
      function nextRoamMove() {
        roamMoveCount++;
        const doBump = roamMoveCount % 3 === 0;
        const run = Math.random() < 0.08;
        const target = doBump ? panelEdgeTarget() : randomWanderTarget();
        const duration = moveRoamTo(target, run);

        setTimeout(() => {
          if (legs) legs.classList.remove('is-walking');
          if (stage) stage.classList.remove('is-walking-bob');

          if (doBump) {
            // Ran into the About panel — recoil off it
            if (lean) {
              lean.classList.add('is-hit');
              setTimeout(() => lean.classList.remove('is-hit'), 320);
            }
            setTimeout(nextRoamMove, 1800);
          } else {
            if (Math.random() < 0.25 && stage) {
              stage.classList.add('is-jumping');
              setTimeout(() => stage.classList.remove('is-jumping'), 460);
            }
            setTimeout(nextRoamMove, 3000 + Math.random() * 2500);
          }
        }, duration * 1000);
      }
      // Stay put for a while after the page loads before wandering off
      setTimeout(nextRoamMove, 10000);
    }
  }

  // Projects page: the robot drives its car across the screen on every
  // project click — right-to-left, then left-to-right, alternating.
  // Project links open in a new tab, so there's no navigation to wait
  // on — the drive just plays independently.
  const carScene = document.getElementById('carScene');
  if (carScene) {
    const CAR_MARGIN = 16;
    let carAtRight = false;

    function parkCar(atRight, animate) {
      const x = atRight
        ? window.innerWidth - carScene.offsetWidth - CAR_MARGIN
        : CAR_MARGIN;
      if (!animate) carScene.style.transition = 'none';
      carScene.style.left = `${x}px`;
      carScene.classList.toggle('facing-left', !atRight);
      if (!animate) {
        void carScene.offsetWidth; // force reflow before restoring transition
        carScene.style.transition = '';
      }
    }
    parkCar(false, false);
    window.addEventListener('resize', () => parkCar(carAtRight, false));

    const CAR_DRIVE_MS = 2200; // matches the slower .car-scene "left" transition
    const SCROLL_SETTLE_MS = 550; // rough wait for the smooth scroll-to-top to land

    document.querySelectorAll('.proj-item').forEach(item => {
      item.addEventListener('click', e => {
        const href = item.getAttribute('href');
        e.preventDefault();

        // The car stays pinned near the top of the screen — so scroll the
        // page back to top FIRST (in case the user had scrolled down to
        // read projects), then let the car drive once it's back in view.
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          carAtRight = !carAtRight;
          parkCar(carAtRight, true);
          if (href) {
            setTimeout(() => window.open(href, '_blank', 'noopener'), CAR_DRIVE_MS);
          }
        }, SCROLL_SETTLE_MS);
      });
    });
  }

  // Tap the robot (or the car, on Projects) to say hi and give a wave
  const tapTarget = walkTrack || charFollow || carScene;
  if (tapTarget && speech) {
    let waving = false;
    tapTarget.addEventListener('click', () => {
      if (waving) return;
      waving = true;
      speech.classList.add('is-visible');
      if (armR) armR.classList.add('is-pointing', 'is-waving');
      setTimeout(() => {
        speech.classList.remove('is-visible');
        if (armR) armR.classList.remove('is-pointing', 'is-waving');
        waving = false;
      }, 1100);
    });
  }
})();

// Skills grid — individual boxes glitch often, rotating around the grid,
// like an old loading game's data readout
const skillsGrid = document.getElementById('skillsGrid');
if (skillsGrid) {
  const skillBoxes = skillsGrid.querySelectorAll('.skill-box');

  function triggerSkillGlitch() {
    const box = skillBoxes[Math.floor(Math.random() * skillBoxes.length)];
    box.classList.remove('is-glitching');
    void box.offsetWidth; // restart the animation if it's mid-glitch
    box.classList.add('is-glitching');
  }

  function scheduleSkillGlitch() {
    const delay = 350 + Math.random() * 550;
    setTimeout(() => {
      triggerSkillGlitch();
      if (Math.random() < 0.4) setTimeout(triggerSkillGlitch, 90);
      scheduleSkillGlitch();
    }, delay);
  }
  scheduleSkillGlitch();
}
