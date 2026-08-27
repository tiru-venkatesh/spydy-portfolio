gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 640px)').matches;

/* ============ NAVBAR ============ */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ============ BACKGROUND MUSIC ============
   Goal: music plays through the whole page, landing to end, with no
   "press play" button — just a floating stop/mute toggle.
   Browsers block audio-with-sound autoplay until the user has interacted
   with the page at least once, so: try to play immediately, and if that's
   blocked, start on the very first scroll/click/keydown/touch instead. */
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
let userStopped = false;
let unlocked = false;

function startMusic() {
  if (userStopped || unlocked) return;
  bgMusic.play()
    .then(() => { unlocked = true; })
    .catch(() => { /* still blocked — next gesture will retry */ });
}

startMusic();

// Real user-gesture events only (per browser autoplay policy — plain
// `scroll` does NOT count as a gesture in Chrome/Safari, so it can't be
// relied on alone to unlock sound).
['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
  window.addEventListener(evt, startMusic, { passive: true });
});

// Scroll kept as a soft retry too, in case the browser is more lenient —
// harmless no-op once `unlocked` is true.
window.addEventListener('scroll', startMusic, { passive: true });

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) startMusic();
});

musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    userStopped = false;
    bgMusic.play().then(() => { unlocked = true; }).catch(() => {});
  } else {
    userStopped = true;
    bgMusic.pause();
  }
});

function syncMusicToggleUI() {
  const stopped = bgMusic.paused;
  musicToggle.classList.toggle('muted', stopped);
  musicToggle.setAttribute('aria-pressed', String(stopped));
  musicToggle.setAttribute('aria-label', stopped ? 'Play background music' : 'Stop background music');
}
bgMusic.addEventListener('play', syncMusicToggleUI);
bgMusic.addEventListener('pause', syncMusicToggleUI);
syncMusicToggleUI();

/* ============ AMBIENT WEB-TRAIL CURSOR (desktop only, respects reduced motion) ============ */
if (!isMobile && !prefersReducedMotion) {
  const canvas = document.getElementById('web-trail');
  const ctx = canvas.getContext('2d');
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);
  let points = [];

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    points.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (points.length > 18) points.shift();
  });

  function drawTrail() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(215,38,61,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    points.forEach((p, i) => {
      p.life -= 0.03;
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    points = points.filter((p) => p.life > 0);
    requestAnimationFrame(drawTrail);
  }
  drawTrail();
} else {
  document.getElementById('web-trail').style.display = 'none';
}

/* ============ LANDING AMBIENT PARALLAX (desktop only) ============
   Small mouse-driven drift on the whole photo layer — independent of the
   scroll-triggered flip/focus-pull transforms on the individual bg-layers,
   so it never fights them. Keeps the landing section feeling alive even
   while the visitor is holding still between scroll moves. */
if (!isMobile && !prefersReducedMotion) {
  const landingBg = document.querySelector('.landing-bg');
  const landingSection = document.getElementById('landing');
  landingSection.addEventListener('mousemove', (e) => {
    const rect = landingSection.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(landingBg, { x: px * -24, y: py * -14, duration: 1.1, ease: 'power2.out' });
  });
  landingSection.addEventListener('mouseleave', () => {
    gsap.to(landingBg, { x: 0, y: 0, duration: 0.8, ease: 'power2.out' });
  });
}

/* ============ 01 — LANDING FRAME SEQUENCE ============ */
const landingTl = gsap.timeline({
  scrollTrigger: {
    trigger: '#landing',
    start: 'top top',
    end: '+=200%',
    scrub: 1.2,
    pin: !isMobile,
  },
});

gsap.set(['.bg-1', '.bg-2', '.bg-3'], { transformOrigin: '50% 50%' });

// 1 → 2: "mix" transition — 3D flip on the horizontal axis (rotationX),
// image 1 rotates away like a page folding down, image 2 rotates in from
// behind it. A scale dip mid-flip + a text readout riding along make the
// move feel weightier rather than a flat crossfade.
function flipMix(outSel, inSel, textSel, label) {
  landingTl
    .addLabel(label)
    .to(outSel, { rotationX: 100, scale: 0.88, opacity: 0, filter: 'blur(6px)', duration: 0.9, ease: 'power2.in' }, label)
    .fromTo(inSel,
      { rotationX: -100, scale: 0.88, opacity: 0, filter: 'blur(6px)' },
      { rotationX: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' },
      `${label}+=0.35`)
    .fromTo(textSel, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, `${label}+=0.15`)
    .to(textSel, { opacity: 0, scale: 1.1, duration: 0.25 }, `${label}+=0.55`);
}

// 2 → 3: blur focus-pull — pushed further (bigger blur + bigger zoom) so it
// reads as a deliberate rack-focus rather than a soft fade.
function focusPull(outSel, inSel, position) {
  landingTl
    .to(outSel, { filter: 'blur(28px)', scale: 1.22, opacity: 0, duration: 0.8, ease: 'power2.inOut' }, position)
    .fromTo(inSel,
      { filter: 'blur(28px)', scale: 1.22, opacity: 0 },
      { filter: 'blur(0px)', scale: 1, opacity: 1, duration: 0.8, ease: 'power2.inOut' },
      position);
}

landingTl
  .fromTo('.frame-1', { opacity: 0, y: 55, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.6)' })
  .to('.frame-1', { opacity: 0, y: -55, scale: 1.05, duration: 0.4 }, '+=0.3');

flipMix('.bg-1', '.bg-2', '.mix-text', 'mix1');

landingTl
  .fromTo('.frame-2', { opacity: 0, y: 55, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.6)' }, '+=0.2')
  .to('.frame-2', { opacity: 0, y: -55, scale: 1.05, duration: 0.4 }, '+=0.3');

focusPull('.bg-2', '.bg-3', '<');

landingTl
  .fromTo('.frame-3', { opacity: 0, scale: 0.8, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' });

// Navbar stays hidden through frame 1 and only floats in once frame 2
// ("ROLE / AI ENGINEER") starts — i.e. at the "mix1" label's position in
// the timeline, converted to a scroll-progress fraction of the pin.
const navRevealProgress = landingTl.labels.mix1 / landingTl.duration();

ScrollTrigger.create({
  trigger: '#landing',
  start: 'top top',
  end: '+=200%',
  onUpdate: (self) => {
    navbar.classList.toggle('nav-visible', self.progress >= navRevealProgress);
  },
  onLeaveBack: () => navbar.classList.remove('nav-visible'),
});

/* ============ ABOUT + WEB-PULL VIDEO (side by side) ============ */
gsap.to('.web-strand', {
  strokeDashoffset: 0,
  scrollTrigger: {
    trigger: '#about',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  },
});

gsap.from('.about-copy > *', {
  opacity: 0,
  x: -40,
  stagger: 0.15,
  duration: 0.7,
  scrollTrigger: {
    trigger: '#about',
    start: 'top 70%',
  },
});

gsap.from('.web-shooter-frame', {
  opacity: 0,
  x: 40,
  scale: 0.96,
  duration: 0.8,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '#about',
    start: 'top 70%',
  },
});

/* ============ 03 — PROJECT CARD REVEALS ============
   Scale/blur settle (not a plain fade-up) so the glass cards feel like they're
   racking into focus — matches the HUD-corner-bracket hover treatment in CSS. */
gsap.to('.project-card', {
  opacity: 1,
  y: 0,
  scale: 1,
  filter: 'blur(0px)',
  stagger: 0.18,
  duration: 0.8,
  ease: 'back.out(1.3)',
  scrollTrigger: {
    trigger: '#project-grid',
    start: 'top 75%',
  },
});

/* ============ 03 — WEB-PULL CARD REVEALS (skills + interests) ============
   Reuses the same "web grabs → pulls → settles" motion used in the transition,
   so it reads as one motif rather than a separate effect. Cards stagger fast
   (not one-by-one) so repeat viewing doesn't drag. */
function riggedCardReveal(rigSelector) {
  gsap.to(`${rigSelector} .skill-card`, {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    ease: 'back.out(1.4)',
    stagger: 0.12,
    duration: 0.6,
    scrollTrigger: {
      trigger: rigSelector,
      start: 'top 65%',
    },
  });
}
riggedCardReveal('#skills-rig');
riggedCardReveal('#interests-rig');

/* ============ 04 — ACHIEVEMENTS GATE ============ */
const gate = document.getElementById('ready-gate');
const readyText = document.getElementById('ready-text');
const landingReady = document.getElementById('landing-ready');

function triggerGlitch(el) {
  el.classList.add('glitching');
  setTimeout(() => el.classList.remove('glitching'), 500);
}

gate.addEventListener('mouseenter', () => triggerGlitch(readyText));
gate.addEventListener('focus', () => triggerGlitch(readyText));
gate.addEventListener('touchstart', () => triggerGlitch(readyText), { passive: true });

landingReady.addEventListener('mouseenter', () => triggerGlitch(landingReady));
landingReady.addEventListener('touchstart', () => triggerGlitch(landingReady), { passive: true });

gsap.to('.achv-item', {
  opacity: 1,
  y: 0,
  stagger: 0.1,
  duration: 0.5,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '#achievements',
    start: 'top 60%',
  },
});

/* ============ 06 — CONTACT (quiet fade-in, no scroll-jack) ============ */
gsap.from('#contact > *', {
  opacity: 0,
  y: 20,
  stagger: 0.15,
  duration: 0.8,
  scrollTrigger: {
    trigger: '#contact',
    start: 'top 70%',
  },
});