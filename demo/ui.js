/* Shared UI helpers for the demo dashboards. Everything shown is sample data. */
(function (g) {
  var C = g.DemoCore;
  var PAL = { gold: '#D4AF37', goldSoft: 'rgba(212,175,55,.25)', blue: '#6C9BD1', teal: '#4FB3A5', plum: '#A68BC9', coral: '#E08A6B', grey: '#7F8896', light: '#C9CED6' };
  var SERIES = [PAL.gold, PAL.blue, PAL.teal, PAL.plum, PAL.coral, PAL.grey];
  var charts = [], uid = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }

  function deltaHtml(d, inv) {
    if (d == null) return '<span class="dl na">No prior data</span>';
    if (Math.abs(d) < 0.0005) return '<span class="dl flat">0.0%</span>';
    var up = d > 0, good = inv ? !up : up;
    return '<span class="dl ' + (good ? 'good' : 'bad') + '">' + (up ? '&#9650; ' : '&#9660; ') + Math.abs(d * 100).toFixed(1) + '%</span>';
  }
  /* KPI tile. value: preformatted string, or null for the explicit "No data" state. */
  function kpi(o) {
    var v = o.value == null ? '<span class="nodata">No data</span>' : o.value;
    var dl = (o.cmp === false || o.value == null) ? '' : deltaHtml(o.d, o.inv);
    return '<div class="kpi' + (o.hl ? ' hl' : '') + '"><div class="k-top"><span class="k-l">' + esc(o.label) + '</span>' + dl + '</div>' +
      '<div class="k-v">' + v + '</div>' + (o.note ? '<div class="k-n">' + o.note + '</div>' : '') + '</div>';
  }
  function kpis(list, cls) { return '<div class="kpis ' + (cls || '') + '">' + list.map(kpi).join('') + '</div>'; }
  function section(title, sub, body) {
    return '<section class="sec"><div class="sec-h"><h2>' + esc(title) + '</h2>' + (sub ? '<span class="sec-s">' + sub + '</span>' : '') + '</div>' + body + '</section>';
  }
  function card(title, body, o) {
    o = o || {};
    return '<div class="cd ' + (o.cls || '') + '"><div class="cd-h"><h3>' + esc(title) + '</h3>' + (o.sub ? '<span class="cd-s">' + o.sub + '</span>' : '') + (o.right || '') + '</div>' + body + '</div>';
  }
  function chartBox(h) { var id = 'ch' + (++uid); return { id: id, html: '<div class="chart" style="height:' + (h || 260) + 'px"><canvas id="' + id + '" role="img" aria-label="Chart"></canvas></div>' }; }
  function note(html, kind) { return '<div class="callout ' + (kind || '') + '">' + html + '</div>'; }
  function empty(title, body) {
    return '<div class="empty"><div class="empty-t">' + esc(title || 'No data') + '</div><p>' + (body || 'Nothing was recorded for this period. Try a wider date range.') + '</p></div>';
  }
  function bar(pct, o) {
    o = o || {};
    var w = C.clamp((pct || 0) * 100, 0, 100);
    return '<div class="bar"><span class="' + (o.cls || '') + '" style="width:' + w.toFixed(1) + '%"></span></div>';
  }
  /* cols: [{label, align, cell: function(row)->html}] */
  function table(cols, rows, o) {
    o = o || {};
    var h = '<div class="tbl-wrap' + (o.scroll ? ' scroll' : '') + '"' + (o.scroll ? ' style="max-height:' + o.scroll + 'px"' : '') + '><table><thead><tr>' +
      cols.map(function (c) { return '<th scope="col"' + (c.align === 'r' ? ' class="r"' : '') + '>' + esc(c.label) + '</th>'; }).join('') + '</tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="' + cols.length + '" class="nodata-row">No data</td></tr>';
    rows.forEach(function (r) {
      h += '<tr>' + cols.map(function (c) { return '<td' + (c.align === 'r' ? ' class="r"' : '') + '>' + c.cell(r) + '</td>'; }).join('') + '</tr>';
    });
    if (o.total) {
      h += '<tr class="tot">' + cols.map(function (c, i) { return '<td' + (c.align === 'r' ? ' class="r"' : '') + '>' + (o.total[i] == null ? '' : o.total[i]) + '</td>'; }).join('') + '</tr>';
    }
    return h + '</tbody></table></div>';
  }
  function badge(text, kind) { return '<span class="bdg ' + (kind || '') + '">' + esc(text) + '</span>'; }
  /* ROAS / CPL style pill coloured relative to a benchmark. higherBetter flips the logic. */
  function pill(text, tone) { return '<span class="pl ' + tone + '">' + text + '</span>'; }

  /* Charts */
  function base(o) {
    o = o || {};
    var yFmt = o.money ? function (v) { return C.compact(v, '$'); } : (o.pct ? function (v) { return (v * 100).toFixed(0) + '%'; } : function (v) { return C.compact(v); });
    var scales = {
      x: { stacked: !!o.stack, grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: o.maxX || 10, color: '#9AA1AC' }, border: { color: '#23282F' } },
      y: { stacked: !!o.stack, beginAtZero: true, grid: { color: '#23282F' }, ticks: { callback: yFmt, color: '#9AA1AC', maxTicksLimit: 6 }, border: { display: false } }
    };
    if (o.y2) scales.y2 = { position: 'right', beginAtZero: true, grid: { display: false }, ticks: { callback: o.y2Money ? function (v) { return C.compact(v, '$'); } : function (v) { return C.compact(v); }, color: '#9AA1AC', maxTicksLimit: 6 }, border: { display: false } };
    if (o.yMax) scales.y.max = o.yMax;
    if (o.horizontal) { scales.x.grid = { color: '#23282F' }; scales.y.grid = { display: false }; }
    return {
      responsive: true, maintainAspectRatio: false, animation: false, indexAxis: o.horizontal ? 'y' : 'x',
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: o.legend !== false, position: 'bottom', labels: { color: '#C9CED6', boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 14 } },
        tooltip: {
          backgroundColor: '#0B0E11', borderColor: '#23282F', borderWidth: 1, titleColor: '#F5F1E8', bodyColor: '#C9CED6',
          callbacks: o.tip || {}
        }
      },
      scales: o.noScales ? { x: { display: false }, y: { display: false, beginAtZero: false } } : scales
    };
  }
  function mount(id, type, labels, datasets, o) {
    var el = document.getElementById(id);
    if (!el || !g.Chart) return null;
    var cfg = { type: type, data: { labels: labels, datasets: datasets }, options: base(o) };
    if (o && o.options) { for (var k in o.options) cfg.options[k] = o.options[k]; }
    var ch = new g.Chart(el, cfg);
    charts.push(ch);
    return ch;
  }
  function destroyAll() { charts.forEach(function (c) { try { c.destroy(); } catch (e) {} }); charts = []; }
  function ds(label, data, color, extra) {
    var o = { label: label, data: data, borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, tension: 0.3 };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  function donut(id, labels, data, colors, o) {
    return mount(id, 'doughnut', labels, [{ data: data, backgroundColor: colors, borderColor: '#14181D', borderWidth: 2 }],
      { noScales: true, legend: !(o && o.legend === false), options: { cutout: '66%', interaction: { mode: 'nearest', intersect: true } }, tip: o && o.tip });
  }
  function spark(id, labels, data, color) {
    return mount(id, 'line', labels, [ds('', data, color, { fill: true, backgroundColor: color + '22', borderWidth: 1.6 })],
      { noScales: true, legend: false, options: { plugins: { legend: { display: false }, tooltip: { enabled: false } }, events: [] } });
  }

  g.UI = {
    PAL: PAL, SERIES: SERIES, esc: esc, kpi: kpi, kpis: kpis, section: section, card: card, chartBox: chartBox, note: note, empty: empty,
    bar: bar, table: table, badge: badge, pill: pill, mount: mount, destroyAll: destroyAll, ds: ds, donut: donut, spark: spark, deltaHtml: deltaHtml
  };
})(window);
