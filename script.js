/* AZ Digital PH: site behaviour. No analytics, no cookies, no storage. */
const CONFIG = {
  // Set this to the booking tool link when it is ready.
  // While it is "#book", every Book a Call button scrolls to the final call-to-action.
  BOOKING_URL: '#book',
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
  var narrow = window.matchMedia('(max-width: 819px)');
  // Fit a device screen: wide screens show a scaled desktop window (laptop); narrow screens show a phone.
  function fitDevice(screen, view, frame, o) {
    var w = screen.clientWidth, s, h;
    if (!narrow.matches) {
      s = w / o.laptopVw; h = Math.round(w * 0.625 - 30);
      view.style.height = h + 'px'; frame.style.width = o.laptopVw + 'px';
      frame.style.height = Math.round(h / s) + 'px'; frame.style.transform = 'scale(' + s + ')';
    } else if (o.phoneVw) {
      s = w / o.phoneVw; h = o.phoneH;
      view.style.height = h + 'px'; frame.style.width = o.phoneVw + 'px';
      frame.style.height = Math.round(h / s) + 'px'; frame.style.transform = 'scale(' + s + ')';
    } else {
      view.style.height = o.phoneRealH + 'px'; frame.style.width = '100%'; frame.style.height = '100%'; frame.style.transform = 'none';
    }
  }
  var devices = [];
  var heroScreen = document.getElementById('hero-screen'), heroView = document.getElementById('hero-demo');
  var heroFrame = heroView && heroView.querySelector('iframe');
  if (heroScreen && heroFrame) {
    devices.push(function () { fitDevice(heroScreen, heroView, heroFrame, { laptopVw: 1180, phoneVw: 390, phoneH: 470 }); });
    heroFrame.addEventListener('load', function () { heroFrame.classList.add('ready'); });
    // The static preview shows first. The live preview starts on the first interaction, or after 6 seconds.
    var heroStarted = false;
    var heroEvents = ['pointerdown', 'scroll', 'keydown', 'mousemove', 'touchstart'];
    var startHero = function () {
      if (heroStarted) return; heroStarted = true;
      heroEvents.forEach(function (ev) { window.removeEventListener(ev, startHero); });
      loadFrame(heroFrame);
    };
    heroEvents.forEach(function (ev) { window.addEventListener(ev, startHero, { passive: true }); });
    window.addEventListener('load', function () { setTimeout(startHero, 6000); });
  }
  var demoFrame = document.getElementById('demo-frame');
  var mbScreen = document.getElementById('mb-screen'), mbView = document.getElementById('mb-view');
  if (demoFrame && mbScreen && mbView) {
    devices.push(function () { fitDevice(mbScreen, mbView, demoFrame, { laptopVw: 1100, phoneRealH: 620 }); });
    if ('IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { loadFrame(demoFrame); fio.disconnect(); } }, { rootMargin: '600px 0px' });
      fio.observe(demoFrame);
    } else { loadFrame(demoFrame); }
  }
  function fitAll() { devices.forEach(function (f) { f(); }); }
  fitAll();
  window.addEventListener('resize', fitAll);

  // Header: scrolled state and a thin gold progress bar.
  var header = document.getElementById('site-header'), bar = document.getElementById('progress'), ticking = false;
  function onScroll() {
    var y = window.scrollY || 0, max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 8);
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Cards: a soft gold spotlight that follows the cursor (fine pointers only).
  if (fine && !reduce) {
    document.querySelectorAll('.card, .steps li').forEach(function (el) {
      el.classList.add('spot');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  // Count-up for the dashboards-built figure.
  var counter = document.querySelector('[data-count]');
  if (counter && 'IntersectionObserver' in window && !reduce) {
    var target = parseInt(counter.getAttribute('data-count'), 10);
    var cio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      cio.disconnect();
      var t0 = performance.now(), dur = 1100;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = Math.round(target * eased) + (p < 1 ? '' : '+');
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.6 });
    cio.observe(counter);
  }

  // Mobile sticky Book a Call bar: shown once the hero button has scrolled away, hidden again at the closing section.
  var stickyBar = document.getElementById('sticky-cta');
  var heroBtn = document.querySelector('.hero .cta-row .btn');
  var closing = document.getElementById('book');
  if (stickyBar && heroBtn && closing && 'IntersectionObserver' in window) {
    var heroSeen = true, closingSeen = false;
    var stickyLink = stickyBar.querySelector('a');
    var updateSticky = function () {
      var show = !heroSeen && !closingSeen;
      stickyBar.classList.toggle('show', show);
      stickyBar.setAttribute('aria-hidden', show ? 'false' : 'true');
      stickyLink.setAttribute('tabindex', show ? '0' : '-1');
    };
    new IntersectionObserver(function (es) { heroSeen = es[0].isIntersecting; updateSticky(); }).observe(heroBtn);
    new IntersectionObserver(function (es) { closingSeen = es[0].isIntersecting; updateSticky(); }, { threshold: 0.15 }).observe(closing);
  }

  // FAQ: keep one answer open at a time.
  var faq = document.querySelectorAll('.faq details');
  faq.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faq.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
