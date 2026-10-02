/* Demo hub controller: navigation, date range, granularity and rendering. Sample data only. */
(function (g) {
  var C = g.DemoCore, U = g.UI, S = g.Summit;
  var q = new URLSearchParams(location.search);
  if (q.get('embed') === '1') document.body.classList.add('embed');
  var HERO = q.get('hero') === '1';
  if (HERO) document.body.classList.add('embed', 'hero');

  var SUMMIT = 'Summit Growth Academy', HARBOR = 'Harbor & Pine Co.';
  var DASH = [
    { id: 'executive', nav: 'Executive Summary', brand: SUMMIT, ctl: true },
    { id: 'marketing', nav: 'Marketing', brand: SUMMIT + ' · Meta Ads and cash attribution', ctl: true },
    { id: 'sales', nav: 'Sales / Pipeline', brand: SUMMIT, ctl: true },
    { id: 'revenue', nav: 'Revenue', brand: SUMMIT, ctl: true },
    { id: 'masterclass', nav: 'Masterclass Funnel', brand: SUMMIT + ' · Webinar', ctl: false },
    { id: 'assessment', nav: 'Lead Quiz', brand: SUMMIT + ' · Assessment', ctl: true },
    { id: 'ceo', nav: 'CEO Dashboard', brand: HARBOR + ' · Multi-channel e-commerce', ctl: true },
    { id: 'pnl', nav: 'Profit & Loss', brand: SUMMIT, ctl: true },
    { id: 'audit', nav: 'Meta Ads Audit', brand: SUMMIT + ' · Free audit report', ctl: false }
  ];
  var PRESETS = [
    { id: '7', label: 'Last 7 days', len: 7, gran: 'day' }, { id: '30', label: 'Last 30 days', len: 30, gran: 'week' },
    { id: '90', label: 'Last 90 days', len: 90, gran: 'week' }, { id: '182', label: 'Last 6 months', len: 182, gran: 'month' },
    { id: '365', label: 'Last 12 months', len: 365, gran: 'month' }, { id: 'custom', label: 'Custom range' }
  ];
  var GRANS = [['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year']];
  var state = { view: 'executive', preset: '30', from: S.END - 29, to: S.END, gran: 'week', extra: {} };

  var $ = function (id) { return document.getElementById(id); };
  var viewEl = $('view');
  var renderToken = 0;

  function byId(id) { return DASH.filter(function (d) { return d.id === id; })[0]; }
  function applyPreset(id) {
    var p = PRESETS.filter(function (x) { return x.id === id; })[0];
    state.preset = id;
    if (p && p.len) { state.to = S.END; state.from = Math.max(S.START, S.END - p.len + 1); state.gran = p.gran; }
  }
  function buildChrome() {
    $('nav').innerHTML = DASH.map(function (d, i) {
      return '<a href="#' + d.id + '" data-id="' + d.id + '"><span class="n">' + (i + 1) + '</span>' + U.esc(d.nav) + '</a>';
    }).join('');
    $('preset').innerHTML = PRESETS.map(function (p) { return '<option value="' + p.id + '">' + p.label + '</option>'; }).join('');
    $('gran').innerHTML = GRANS.map(function (x) {
      return '<button type="button" data-g="' + x[0] + '" aria-pressed="false"' + (x[0] === 'week' ? ' title="Weeks run Monday to Sunday"' : '') + '>' + x[1] + '</button>';
    }).join('');
    ['from', 'to'].forEach(function (id) { $(id).min = C.toISO(S.START); $(id).max = C.toISO(S.END); });
  }
  function syncControls() {
    $('preset').value = state.preset;
    $('from').value = C.toISO(state.from); $('to').value = C.toISO(state.to);
    Array.prototype.forEach.call($('gran').children, function (b) { b.setAttribute('aria-pressed', b.dataset.g === state.gran ? 'true' : 'false'); });
    Array.prototype.forEach.call($('nav').children, function (a) {
      if (a.dataset.id === state.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function render() {
    var d = byId(state.view) || DASH[0];
    U.destroyAll();
    var token = ++renderToken;
    $('title').textContent = d.nav === 'CEO Dashboard' ? 'CEO Dashboard' : d.nav;
    $('brandline').textContent = d.brand;
    $('ctl-range').classList.toggle('hidden', !d.ctl);
    syncControls();
    var out;
    try {
      out = g.Views[d.id]({ from: state.from, to: state.to, gran: state.gran, extra: state.extra });
    } catch (e) {
      out = { html: U.empty('This view could not be drawn', 'Please reload the page.') };
      if (g.console) console.error(e);
    }
    viewEl.innerHTML = out.html;
    bindView();
    // Charts are drawn in a separate task so the numbers and tables paint first.
    if (out.mount) {
      setTimeout(function () {
        if (token !== renderToken) return;
        try { out.mount(); } catch (e2) { if (g.console) console.error(e2); }
      }, 0);
    }
  }
  function bindView() {
    var run = $('mc-run');
    if (run) run.addEventListener('change', function () { state.extra.run = +run.value; render(); });
    Array.prototype.forEach.call(viewEl.querySelectorAll('[data-win]'), function (b) {
      b.addEventListener('click', function () { state.extra.win = b.dataset.win; render(); });
    });
    Array.prototype.forEach.call(viewEl.querySelectorAll('[data-go]'), function (b) {
      b.addEventListener('click', function () { var el = document.getElementById(b.dataset.go); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    });
  }

  function route() {
    var id = (location.hash || '#executive').slice(1);
    if (!byId(id)) id = 'executive';
    if (id !== state.view) { state.view = id; window.scrollTo(0, 0); }
    render();
  }

  buildChrome();
  $('preset').addEventListener('change', function (e) { var v = e.target.value; if (v !== 'custom') applyPreset(v); else state.preset = 'custom'; render(); });
  function dateChange() {
    var f = C.toN($('from').value || C.toISO(state.from)), t = C.toN($('to').value || C.toISO(state.to));
    f = C.clamp(f, S.START, S.END); t = C.clamp(t, S.START, S.END);
    if (f > t) { var x = f; f = t; t = x; }
    state.from = f; state.to = t; state.preset = 'custom';
    var len = t - f + 1; state.gran = len <= 45 ? 'day' : (len <= 120 ? 'week' : 'month');
    render();
  }
  $('from').addEventListener('change', dateChange); $('to').addEventListener('change', dateChange);
  $('gran').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; state.gran = b.dataset.g; render(); });
  window.addEventListener('hashchange', route);

  if (HERO) {
    var order = ['executive', 'marketing', 'sales'], k = 0;
    state.view = order[0]; render();
    setInterval(function () { k = (k + 1) % order.length; state.view = order[k]; render(); }, 5500);
  } else {
    route();
  }
})(window);
