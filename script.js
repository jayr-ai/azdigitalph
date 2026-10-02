/* AZ Digital PH: site behaviour. No analytics, no cookies, no storage. */
const CONFIG = {
  // Set this to the booking tool link when it is ready.
  // While it is "#book", every Book a Call button scrolls to the final call-to-action.
  BOOKING_URL: '#book',
  // Path to your photo once you have saved it, for example 'assets/img/jayvee.jpg'. Leave empty to show the placeholder.
  PHOTO_URL: '',
};

(function () {
  document.documentElement.classList.remove('no-js');

  // Wire every Book a Call button to the single config value.
  document.querySelectorAll('[data-book]').forEach(function (a) {
    a.setAttribute('href', CONFIG.BOOKING_URL);
    if (CONFIG.BOOKING_URL !== '#book') {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });

  // Reveal on scroll.
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Gold glow that follows the mouse. Skipped for touch screens and reduced motion.
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    var tick = function () {
      cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
      glow.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) requestAnimationFrame(tick); else running = false;
    };
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!glow.classList.contains('on')) { cx = tx; cy = ty; glow.classList.add('on'); }
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
  }

  // Live demo frames load lazily: the hero preview after first interaction, the full demo near the viewport.
  function loadFrame(f) { if (f && !f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src')); }
  var heroBox = document.getElementById('hero-demo');
  if (heroBox) {
    var heroFrame = heroBox.querySelector('iframe');
    var fit = function () {
      var s = heroBox.clientWidth / 1280;
      heroFrame.style.transform = 'scale(' + s + ')';
      heroBox.style.height = Math.round(700 * s) + 'px';
    };
    fit();
    window.addEventListener('resize', fit);
    heroFrame.addEventListener('load', function () { heroFrame.classList.add('ready'); });
    // The static preview shows first. The live preview starts on the first interaction, or after 6 seconds.
    var heroStarted = false;
    var startHero = function () {
      if (heroStarted) return; heroStarted = true;
      ['pointerdown', 'scroll', 'keydown', 'mousemove', 'touchstart'].forEach(function (ev) { window.removeEventListener(ev, startHero); });
      loadFrame(heroFrame);
    };
    ['pointerdown', 'scroll', 'keydown', 'mousemove', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, startHero, { passive: true }); });
    window.addEventListener('load', function () { setTimeout(startHero, 6000); });
  }
  var demoFrame = document.getElementById('demo-frame');
  if (demoFrame) {
    if ('IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { loadFrame(demoFrame); fio.disconnect(); } }, { rootMargin: '600px 0px' });
      fio.observe(demoFrame);
    } else { loadFrame(demoFrame); }
  }

  // Photo: when CONFIG.PHOTO_URL is set it replaces the initials placeholder. No HTML edit needed.
  var photoBox = document.getElementById('photo');
  if (photoBox && CONFIG.PHOTO_URL) {
    var probe = new Image();
    probe.onload = function () {
      probe.alt = 'Jayvee Respeto, founder of AZ Digital PH, in a professional portrait';
      probe.width = probe.naturalWidth; probe.height = probe.naturalHeight; probe.decoding = 'async';
      photoBox.removeAttribute('role'); photoBox.removeAttribute('aria-label');
      photoBox.innerHTML = ''; photoBox.appendChild(probe);
    };
    probe.src = CONFIG.PHOTO_URL;
  }

  // FAQ: keep one answer open at a time.
  var faq = document.querySelectorAll('.faq details');
  faq.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faq.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
