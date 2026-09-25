/* ==========================================================================
   WISDOM VAULT — script.js
   ========================================================================== */

/* ==========================================================================
   ADD YOUR OWN QUOTES HERE
   --------------------------------------------------------------------------
   Fill this array with objects shaped like:
     { text: "The unexamined life is not worth living.", author: "Socrates" }

   You can add as many as you like — the chamber will cycle through them
   with the arrow buttons. Leave it empty to show the placeholder state.
   ========================================================================== */
const quotes = [
  // { text: "Your quote here.", author: "Author name" },
];
/* ======================= END OF EDITABLE QUOTES ========================= */


document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     0. LOADING SCREEN
     ------------------------------------------------------------------ */
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');

  requestAnimationFrame(() => { loaderFill.style.width = '100%'; });

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('is-hidden');
      playHeroEntrance();
    }, 900);
  });
  // Fallback in case 'load' already fired or takes too long
  setTimeout(() => {
    if (!loader.classList.contains('is-hidden')) {
      loader.classList.add('is-hidden');
      playHeroEntrance();
    }
  }, 3200);
   setTimeout(() => {
  loader.classList.add('is-hidden');
}, 1000);


  /* ------------------------------------------------------------------
     1. HERO ENTRANCE (single orchestrated reveal)
     ------------------------------------------------------------------ */
  // Wrap each title line's text in an inner span so it can rise from a mask
  document.querySelectorAll('.hero__title-line').forEach(line => {
    const inner = document.createElement('span');
    inner.className = 'mask-inner';
    inner.textContent = line.textContent;
    line.textContent = '';
    line.appendChild(inner);
  });

  let heroPlayed = false;
  function playHeroEntrance(){
    if (heroPlayed) return;
    heroPlayed = true;
    const items = [
      document.querySelector('.hero__eyebrow'),
      ...document.querySelectorAll('.hero__title-line'),
      document.querySelector('.hero__subtitle'),
      document.getElementById('revealBtn'),
    ];
    items.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => el.classList.add('is-in'), 120 * i);
    });
  }


  /* ------------------------------------------------------------------
     2. REVEAL WISDOM BUTTON — scroll to the chamber
     ------------------------------------------------------------------ */
  const revealBtn = document.getElementById('revealBtn');
  const chamber = document.getElementById('chamber');
  revealBtn.addEventListener('click', () => {
    chamber.scrollIntoView({ behavior: 'smooth' });
  });


  /* ------------------------------------------------------------------
     3. QUOTE CHAMBER LOGIC
     ------------------------------------------------------------------ */
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const quoteIndexEl = document.getElementById('quoteIndex');
  const prevBtn = document.getElementById('prevQuote');
  const nextBtn = document.getElementById('nextQuote');

  let currentQuote = 0;

  function renderQuote(){
    if (quotes.length === 0){
      quoteText.textContent = 'Your quote will appear here.';
      quoteAuthor.textContent = '— Add quotes to the `quotes` array in script.js';
      quoteIndexEl.textContent = '0 / 0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    const q = quotes[currentQuote];
    quoteText.style.opacity = 0;
    quoteAuthor.style.opacity = 0;
    setTimeout(() => {
      quoteText.textContent = q.text;
      quoteAuthor.textContent = '— ' + q.author;
      quoteIndexEl.textContent = `${currentQuote + 1} / ${quotes.length}`;
      quoteText.style.opacity = 1;
      quoteAuthor.style.opacity = 1;
    }, 220);
  }

  prevBtn.addEventListener('click', () => {
    if (quotes.length === 0) return;
    currentQuote = (currentQuote - 1 + quotes.length) % quotes.length;
    renderQuote();
  });
  nextBtn.addEventListener('click', () => {
    if (quotes.length === 0) return;
    currentQuote = (currentQuote + 1) % quotes.length;
    renderQuote();
  });

  renderQuote();


  /* ------------------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS
     ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll('.reveal-on-scroll, .chamber__frame');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach(el => io.observe(el));

  // Stagger gallery items slightly
  document.querySelectorAll('.gallery__item').forEach((el, i) => {
    el.style.transitionDelay = `${i * 120}ms`;
  });


  /* ------------------------------------------------------------------
     5. CUSTOM CURSOR + MOUSE GLOW
     ------------------------------------------------------------------ */
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorRing = document.getElementById('cursorRing');

  if (!isTouch){
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorGlow.classList.add('is-active');
      cursorRing.classList.add('is-active');
      cursorGlow.style.transform = `translate(${mx}px, ${my}px)`;
    });

    function animateRing(){
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .gallery__item').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
    });

    document.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('is-active');
      cursorRing.classList.remove('is-active');
    });
  }


  /* ------------------------------------------------------------------
     6. FLOATING PARTICLES (lightweight canvas)
     ------------------------------------------------------------------ */
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight * 2; // covers scroll a bit
  }

  function makeParticles(){
    const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.35 + 0.08,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15,
    }));
  }

  function drawParticles(){
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#c9a24b';
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10){ p.y = h + 10; p.x = Math.random() * w; }
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y % h, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
  }

  if (!prefersReducedMotion){
    resizeCanvas();
    makeParticles();
    drawParticles();
    window.addEventListener('resize', () => { resizeCanvas(); makeParticles(); });
  }


  /* ------------------------------------------------------------------
     7. NAV BACKGROUND ON SCROLL
     ------------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 60
      ? 'linear-gradient(to bottom, rgba(3,2,3,0.9), rgba(3,2,3,0.3))'
      : 'linear-gradient(to bottom, rgba(3,2,3,0.65), transparent)';
  });

});
