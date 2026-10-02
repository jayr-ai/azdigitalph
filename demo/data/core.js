/* Shared helpers for the demo data modules: seeded random numbers, dates, formatting.
   All demo data is fictional and generated from fixed seeds, so it is identical on every load. */
(function (g) {
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function rng(seed) {
    var r = mulberry32(seed);
    r.int = function (a, b) { return Math.floor(r() * (b - a + 1)) + a; };
    r.range = function (a, b) { return a + r() * (b - a); };
    r.pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
    r.chance = function (p) { return r() < p; };
    r.weighted = function (items) {
      var total = 0, i;
      for (i = 0; i < items.length; i++) total += items[i].w;
      var x = r() * total;
      for (i = 0; i < items.length; i++) { x -= items[i].w; if (x <= 0) return items[i]; }
      return items[items.length - 1];
    };
    return r;
  }

  /* Dates are handled as whole days since 1970-01-01 (UTC). */
  function toN(iso) { var p = iso.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }
  function toISO(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function dow(n) { return (n + 3) % 7; }                 // Monday = 0 ... Sunday = 6
  function weekStart(n) { return n - dow(n); }            // weeks run Monday to Sunday
  function parts(n) { var d = new Date(n * 864e5); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }; }
  function monthStart(n) { var p = parts(n); return Math.round(Date.UTC(p.y, p.m, 1) / 864e5); }
  function quarterStart(n) { var p = parts(n); return Math.round(Date.UTC(p.y, Math.floor(p.m / 3) * 3, 1) / 864e5); }
  function yearStart(n) { var p = parts(n); return Math.round(Date.UTC(p.y, 0, 1) / 864e5); }
  function bucketStart(n, gran) {
    switch (gran) {
      case 'week': return weekStart(n);
      case 'month': return monthStart(n);
      case 'quarter': return quarterStart(n);
      case 'year': return yearStart(n);
      default: return n;
    }
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDay(n, withYear) { var p = parts(n); return p.d + ' ' + MON[p.m] + (withYear ? ' ' + p.y : ''); }
  function bucketLabel(n, gran) {
    var p = parts(n);
    switch (gran) {
      case 'week': return fmtDay(n);
      case 'month': return MON[p.m] + ' ' + String(p.y).slice(2);
      case 'quarter': return 'Q' + (Math.floor(p.m / 3) + 1) + ' ' + p.y;
      case 'year': return String(p.y);
      default: return fmtDay(n);
    }
  }
  function prevRange(fromN, toN_) { var len = toN_ - fromN + 1; return { from: fromN - len, to: fromN - 1, len: len }; }

  /* Formatting */
  function money(v, dec) {
    if (v == null || isNaN(v)) return '–';
    var neg = v < 0, a = Math.abs(v);
    var s = a.toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
    return (neg ? '-$' : '$') + s;
  }
  function compact(v, prefix) {
    if (v == null || isNaN(v)) return '–';
    var a = Math.abs(v), s;
    if (a >= 1e6) s = (a / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
    else if (a >= 1e3) s = (a / 1e3).toFixed(a >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
    else s = String(Math.round(a));
    return (v < 0 ? '-' : '') + (prefix || '') + s;
  }
  function int(v) { return v == null || isNaN(v) ? '–' : Math.round(v).toLocaleString('en-US'); }
  function pct(v, dec) { return v == null || !isFinite(v) ? '–' : (v * 100).toFixed(dec == null ? 1 : dec) + '%'; }
  function num(v, dec) { return v == null || !isFinite(v) ? '–' : v.toFixed(dec == null ? 2 : dec); }
  function div(a, b) { return b ? a / b : null; }
  function delta(cur, prev) { return prev ? (cur - prev) / prev : null; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* Sum numeric fields of rows whose date falls in [fromN, toN_]. rows[i].n is the day number. */
  function sum(rows, fromN, toN_, keys) {
    var o = { days: 0 }, i, k;
    for (k = 0; k < keys.length; k++) o[keys[k]] = 0;
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.n < fromN || r.n > toN_) continue;
      o.days++;
      for (k = 0; k < keys.length; k++) o[keys[k]] += r[keys[k]] || 0;
    }
    return o;
  }
  /* Bucket rows by granularity inside the range. Returns contiguous buckets with summed keys. */
  function series(rows, fromN, toN_, gran, keys) {
    var map = {}, order = [], i, k;
    for (var n = fromN; n <= toN_; n++) {
      var b = bucketStart(n, gran);
      if (!map[b]) { map[b] = { n: b, label: bucketLabel(b, gran), days: 0 }; for (k = 0; k < keys.length; k++) map[b][keys[k]] = 0; order.push(b); }
    }
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.n < fromN || r.n > toN_) continue;
      var bb = map[bucketStart(r.n, gran)];
      bb.days++;
      for (k = 0; k < keys.length; k++) bb[keys[k]] += r[keys[k]] || 0;
    }
    return order.map(function (b) { return map[b]; });
  }

  g.DemoCore = {
    rng: rng, toN: toN, toISO: toISO, dow: dow, weekStart: weekStart, bucketStart: bucketStart, bucketLabel: bucketLabel,
    fmtDay: fmtDay, prevRange: prevRange, money: money, compact: compact, int: int, pct: pct, num: num, div: div,
    delta: delta, clamp: clamp, sum: sum, series: series, MON: MON
  };
})(window);
