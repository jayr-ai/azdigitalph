/* Views: CEO Dashboard (e-commerce), Profit & Loss, Meta Ads Audit Report. Sample data only. */
(function (g) {
  var C = g.DemoCore, U = g.UI, P = U.PAL;
  var V = g.Views = g.Views || {};
  function dlt(a, b) { return C.delta(a, b); }

  /* ---------- 7. CEO dashboard (Harbor & Pine Co.) ---------- */
  V.ceo = function (ctx) {
    var d = g.CeoData.query(ctx.from, ctx.to, ctx.gran), t = d.cur, p = d.prev;
    if (!t.total) return { html: U.empty() };
    var ids = { all: U.chartBox(56), shop: U.chartBox(56), amz: U.chartBox(56), wmt: U.chartBox(56) };
    var donut = U.chartBox(150), cAds = U.chartBox(230), cZone = U.chartBox(230), cSales = U.chartBox(260);
    function sp(label, val, prev, box, hl) {
      return '<div class="kpi sp' + (hl ? ' hl' : '') + '"><div class="k-top"><span class="k-l">' + label + '</span>' + (val ? U.deltaHtml(dlt(val, prev)) : '') + '</div>' +
        '<div class="k-v">' + (val ? C.money(val, 0) : '<span class="nodata">No data</span>') + '</div><div class="spk">' + box.html + '</div></div>';
    }
    var mixTot = t.shop + t.amz + t.wmt;
    var html =
      U.section('Sales across channels', 'Harbor &amp; Pine Co. · fictional outdoor-goods brand',
        '<div class="grid-ch">' +
        sp('Overall sales', t.total, p.total, ids.all, true) + sp('Store sales', t.shop, p.shop, ids.shop) + sp('Marketplace A sales', t.amz, p.amz, ids.amz) + sp('Marketplace B sales', t.wmt, p.wmt, ids.wmt) +
        '<div class="cd mix"><div class="cd-h"><h3>Channel mix</h3></div>' + donut.html +
        '<div class="legend">' + [['Store', t.shop, P.gold], ['Marketplace A', t.amz, P.blue], ['Marketplace B', t.wmt, P.teal]].map(function (x) {
          return '<div><i style="background:' + x[2] + '"></i>' + x[0] + '<b>' + C.pct(C.div(x[1], mixTot), 1) + '</b></div>';
        }).join('') + '</div></div></div>') +
      U.section('Store tracker', '',
        U.kpis([
          { label: 'Orders', value: C.int(t.orders), d: dlt(t.orders, p.orders) }, { label: 'Average order value', value: C.money(t.aov, 2), d: dlt(t.aov, p.aov) },
          { label: 'Store orders', value: C.int(t.shopOrd), d: dlt(t.shopOrd, p.shopOrd) }, { label: 'Marketplace orders', value: C.int(t.amzOrd + t.wmtOrd), d: dlt(t.amzOrd + t.wmtOrd, p.amzOrd + p.wmtOrd) }
        ], 'k4')) +
      U.section('Marketing metrics', 'Meta Ads',
        U.kpis([
          { label: 'Ad spend', value: C.compact(t.adSpend, '$'), d: dlt(t.adSpend, p.adSpend), inv: true }, { label: 'Purchase value', value: C.compact(t.adPV, '$'), d: dlt(t.adPV, p.adPV) },
          { label: 'Cost per purchase', value: C.money(t.cpa, 2), d: dlt(t.cpa, p.cpa), inv: true }, { label: 'ROAS', value: C.num(t.roas, 2), d: dlt(t.roas, p.roas), hl: true }
        ], 'k4') + '<div class="grid1">' + U.card('Ad spend and purchase value', cAds.html, { sub: 'by ' + ctx.gran }) + '</div>') +
      U.section('Shipping', '',
        U.kpis([
          { label: 'Shipments', value: C.int(t.ship), d: dlt(t.ship, p.ship) }, { label: 'Shipping spend', value: C.money(t.shipCost), d: dlt(t.shipCost, p.shipCost), inv: true },
          { label: 'Average cost per shipment', value: C.money(t.avgShip, 2), d: dlt(t.avgShip, p.avgShip), inv: true }, { label: 'Express share', value: C.pct(t.expressShare, 1), d: dlt(t.expressShare, p.expressShare) }
        ], 'k4') + '<div class="grid1">' + U.card('Shipments by zone', cZone.html, {}) + '</div>') +
      U.section('Sales report', 'by category · variance against the prior period plus 4%',
        '<div class="grid1">' + U.card('Sales by channel', cSales.html, { sub: 'by ' + ctx.gran }) + '</div>' +
        U.card('Category performance', U.table([
          { label: 'Category', cell: function (x) { return '<strong>' + x.name + '</strong>'; } }, { label: 'Sales', align: 'r', cell: function (x) { return C.money(x.sales); } },
          { label: 'Plan', align: 'r', cell: function (x) { return C.money(x.prev * 1.04); } },
          { label: 'Variance', align: 'r', cell: function (x) { var v = x.sales - x.prev * 1.04; return '<span class="' + (v >= 0 ? 'pos' : 'neg') + '">' + C.money(v) + '</span>'; } },
          { label: 'Variance %', align: 'r', cell: function (x) { var v = C.div(x.sales, x.prev * 1.04); return v == null ? 'No data' : '<span class="' + (v >= 1 ? 'pos' : 'neg') + '">' + ((v - 1) * 100).toFixed(1) + '%</span>'; } },
          { label: 'Share', cell: function (x) { return U.bar(C.div(x.sales, t.total) * 3, { cls: 'gold' }); } }
        ], d.cats, { total: ['Total', C.money(t.total), C.money(p.total * 1.04), '', '', ''] }))) +
      U.section('Catalog usage', 'units requested via the printed catalog · sample data',
        U.card('Top catalog items', U.table([
          { label: 'SKU', cell: function (x) { return x.sku; } }, { label: 'Item', cell: function (x) { return U.esc(x.name); } },
          { label: 'Units', align: 'r', cell: function (x) { return C.int(x.units); } }, { label: 'Share', align: 'r', cell: function (x) { return C.pct(x.share, 1); } },
          { label: '', cell: function (x) { return U.bar(x.share * 5, { cls: 'blue' }); } }
        ], d.items)));
    return {
      html: html, mount: function () {
        var s = d.spark, labels = s.map(function (x) { return x.label; });
        U.spark(ids.all.id, labels, s.map(function (x) { return x.shop + x.amz + x.wmt; }), P.gold);
        U.spark(ids.shop.id, labels, s.map(function (x) { return x.shop; }), P.blue);
        U.spark(ids.amz.id, labels, s.map(function (x) { return x.amz; }), P.teal);
        U.spark(ids.wmt.id, labels, s.map(function (x) { return x.wmt; }), P.plum);
        U.donut(donut.id, ['Store', 'Marketplace A', 'Marketplace B'], [t.shop, t.amz, t.wmt], [P.gold, P.blue, P.teal], { legend: false, tip: { label: function (c) { return c.label + ': ' + C.money(c.parsed); } } });
        var ser = d.series, L = ser.map(function (x) { return x.label; });
        U.mount(cAds.id, 'line', L, [U.ds('Ad spend', ser.map(function (x) { return Math.round(x.adSpend); }), P.gold), U.ds('Purchase value', ser.map(function (x) { return Math.round(x.adPV); }), P.teal)],
          { money: true, tip: { label: function (c) { return c.dataset.label + ': ' + C.money(c.parsed.y); } } });
        U.mount(cZone.id, 'bar', d.zones.map(function (z) { return z.zone; }), [U.ds('Shipments', d.zones.map(function (z) { return z.shipments; }), P.blue, { borderWidth: 0, borderRadius: 3 })], { legend: false });
        U.mount(cSales.id, 'bar', L, [
          U.ds('Store', ser.map(function (x) { return Math.round(x.shop); }), P.gold, { stack: 's', borderWidth: 0 }),
          U.ds('Marketplace A', ser.map(function (x) { return Math.round(x.amz); }), P.blue, { stack: 's', borderWidth: 0 }),
          U.ds('Marketplace B', ser.map(function (x) { return Math.round(x.wmt); }), P.teal, { stack: 's', borderWidth: 0 })
        ], { stack: true, money: true, tip: { label: function (c) { return c.dataset.label + ': ' + C.money(c.parsed.y); } } });
      }
    };
  };

  /* ---------- 8. Profit & Loss ---------- */
  V.pnl = function (ctx) {
    var d = g.PnlData.query(ctx.from, ctx.to, ctx.gran), t = d.tot, p = d.prev;
    if (!t.revenue) return { html: U.empty() };
    var cW = U.chartBox(280), cN = U.chartBox(240);
    var margin = C.div(t.net, t.revenue), pMargin = C.div(p.net, p.revenue);
    var rows = [['Cash collected', t.revenue], ['Ad spend', t.adSpend], ['Fulfilment', t.fulfilment], ['Team', t.team], ['Software', t.software], ['Other costs', t.other]];
    var html =
      U.section('Profit and loss', 'cash basis · Summit Growth Academy · compared with the equal-length period before',
        U.kpis([
          { label: 'Cash collected', value: C.money(t.revenue), d: dlt(t.revenue, p.revenue) }, { label: 'Total costs', value: C.money(t.costs), d: dlt(t.costs, p.costs), inv: true },
          { label: 'Net profit', value: C.money(t.net), d: dlt(t.net, p.net), hl: true }, { label: 'Net margin', value: C.pct(margin, 1), d: dlt(margin, pMargin) },
          { label: 'Ad spend share of cash', value: C.pct(C.div(t.adSpend, t.revenue), 1), d: dlt(C.div(t.adSpend, t.revenue), C.div(p.adSpend, p.revenue)), inv: true }
        ], 'k5')) +
      '<div class="grid2">' +
      U.card('From cash to net profit', cW.html, { sub: 'selected period' }) +
      U.card('Net profit over time', cN.html, { sub: 'by ' + ctx.gran }) + '</div>' +
      U.section('Statement', 'by ' + ctx.gran,
        U.card('Profit and loss by period', U.table([
          { label: 'Period', cell: function (x) { return '<strong>' + x.label + '</strong>'; } }, { label: 'Cash collected', align: 'r', cell: function (x) { return C.money(x.revenue); } },
          { label: 'Ad spend', align: 'r', cell: function (x) { return C.money(x.adSpend); } }, { label: 'Fulfilment', align: 'r', cell: function (x) { return C.money(x.fulfilment); } },
          { label: 'Team', align: 'r', cell: function (x) { return C.money(x.team); } }, { label: 'Software', align: 'r', cell: function (x) { return C.money(x.software); } },
          { label: 'Other', align: 'r', cell: function (x) { return C.money(x.other); } },
          { label: 'Net profit', align: 'r', cell: function (x) { return '<span class="' + (x.net >= 0 ? 'pos' : 'neg') + '">' + C.money(x.net) + '</span>'; } },
          { label: 'Margin', align: 'r', cell: function (x) { return C.pct(C.div(x.net, x.revenue), 1); } }
        ], d.series, { scroll: 360, total: ['Total', C.money(t.revenue), C.money(t.adSpend), C.money(t.fulfilment), C.money(t.team), C.money(t.software), C.money(t.other), C.money(t.net), C.pct(margin, 1)] })));
    return {
      html: html, mount: function () {
        var run = 0, data = [], cols = [];
        rows.forEach(function (r, i) {
          if (i === 0) { data.push([0, r[1]]); run = r[1]; cols.push(P.gold); }
          else { data.push([run - r[1], run]); run -= r[1]; cols.push(P.coral); }
        });
        data.push([0, t.net]); cols.push(t.net >= 0 ? P.teal : P.coral);
        U.mount(cW.id, 'bar', rows.map(function (r) { return r[0]; }).concat(['Net profit']), [{ data: data, backgroundColor: cols, borderWidth: 0, borderRadius: 3 }],
          { legend: false, money: true, yMax: Math.ceil(t.revenue * 1.06 / 1000) * 1000, tip: { label: function (c) { var v = c.raw; return C.money(Math.abs(v[1] - v[0])); } } });
        var s = d.series;
        U.mount(cN.id, 'bar', s.map(function (x) { return x.label; }), [{ label: 'Net profit', data: s.map(function (x) { return Math.round(x.net); }), borderWidth: 0, borderRadius: 2,
          backgroundColor: s.map(function (x) { return x.net >= 0 ? P.teal : P.coral; }) }], { legend: false, money: true, tip: { label: function (c) { return 'Net profit: ' + C.money(c.parsed.y); } } });
      }
    };
  };

  /* ---------- 9. Meta Ads audit report ---------- */
  var NAV = ['Executive summary', 'Account snapshot', 'Campaigns', 'Ads', 'Creative & fatigue', 'Placement & platform', 'Device', 'Demographics', 'Geography', 'Dayparting', 'Data trust', 'Opportunities', 'Action list'];
  function head(i, accent) {
    var words = NAV[i].split(' ');
    var first = words.shift();
    return '<div class="rp-e">' + (i < 2 ? 'Overview' : i < 5 ? 'Performance' : i < 10 ? 'Audience &amp; delivery' : 'Data &amp; actions') + '<span>' + (i < 10 ? '0' : '') + i + '</span></div>' +
      '<h2 class="rp-h">' + first + (words.length ? ' <em>' + words.join(' ') + '</em>' : '') + '</h2>';
  }
  V.audit = function (ctx) {
    var A = g.AuditData, key = ctx.extra.win || 'lastWeek', d = A.query(key), w = d.w, t = d.tot;
    var days = w.to - w.from + 1;
    function tone(cpl) { if (cpl == null) return 'na'; return cpl <= t.cpl * 0.9 ? 'good' : (cpl <= t.cpl * 1.15 ? 'warn' : 'bad'); }
    function cplPill(cpl) { return cpl == null ? '–' : U.pill(C.money(cpl, 2), tone(cpl)); }
    var camps = d.camps.slice(0, 7), other = d.camps[7];
    var named = d.camps.filter(function (x) { return x.leads >= 5 && x.label !== 'All other campaigns'; });
    var best = named.slice().sort(function (a, b) { return a.cpl - b.cpl; })[0], worst = named.slice().sort(function (a, b) { return b.cpl - a.cpl; })[0];
    var top = d.camps[0];
    var summary = 'Summit Growth Academy spent ' + C.money(t.spend, 2) + ' across ' + w.label.toLowerCase() + ' (' + C.fmtDay(w.from) + ' to ' + C.fmtDay(w.to, true) + ', ' + C.money(t.spend / days, 2) + ' per day), delivering ' + C.int(t.leads) +
      ' leads at a blended cost per lead of ' + C.money(t.cpl, 2) + ' and ' + C.int(t.bkAds) + ' calls booked from ads. ' + top.label + ' led spend (' + C.money(top.spend, 2) + ', ' + C.int(top.leads) + ' leads), while ' +
      (best ? best.label + ' (' + C.money(best.cpl, 2) + ' per lead) was the efficiency standout. ' : '') + (worst ? worst.label + ' (' + C.money(worst.cpl, 2) + ' per lead) is the weakest on real spend and worth a direct review.' : '');
    function brk(label, rows, extraCols) {
      return U.table([{ label: label, cell: function (x) { return x.label; } }, { label: 'Spend', align: 'r', cell: function (x) { return C.money(x.spend, 2); } },
        { label: 'CTR', align: 'r', cell: function (x) { return C.pct(x.ctr, 2); } }, { label: 'CPC', align: 'r', cell: function (x) { return C.money(x.cpc, 2); } }].concat(extraCols || []), rows);
    }
    var cpm = { label: 'CPM', align: 'r', cell: function (x) { return C.money(x.cpm, 2); } };
    var seg = Object.keys(A.WINDOWS).map(function (k) {
      var x = A.WINDOWS[k];
      return '<button class="seg-b' + (k === key ? ' on' : '') + '" data-win="' + k + '"><b>' + x.label + '</b><small>' + C.fmtDay(x.from) + ' to ' + C.fmtDay(x.to) + '</small></button>';
    }).join('');
    var chips = NAV.map(function (n, i) { return '<button class="chip-nav" data-go="rp-' + i + '">' + n + '</button>'; }).join('');
    var html = '<div class="rp">' +
      '<div class="rp-top"><h2 class="rp-title">Paid Media <em>Report</em></h2><p class="rp-lead">Summit Growth Academy, Meta ad account (fictional). Lead-generation business, so the headline is cost per lead and booked calls. Use the range selector to switch the window; every section updates.</p></div>' +
      '<div class="seg" role="group" aria-label="Report window">' + seg + '</div>' +
      '<div class="rp-pills"><span><b>' + C.money(t.spend / days, 2) + '</b> per day</span><span><b>' + C.int(t.leads) + '</b> leads</span><span><b>' + C.int(t.bkAds) + '</b> calls booked from ads</span><span><b>' + C.money(t.cpl, 2) + '</b> blended cost per lead</span><span><b>' + C.money(t.cpb, 2) + '</b> per booked call</span></div>' +
      U.note(w.settled ? '<strong>' + w.label + ' is a fully settled period.</strong> This window is complete, so the figures are final aside from minor late attribution.' : '<strong>' + w.label + ' is still in progress</strong> (through ' + C.fmtDay(w.to, true) + '). Figures will change as the period completes.', 'info') +
      U.note('<strong>Scope.</strong> Every number is a snapshot of sample data for a fictional account. Switching ranges swaps between pre-loaded snapshots. Breakdown tables show spend and engagement only, because attribution differs across campaign objectives.', 'info') +
      '<div class="chip-nav-row">' + chips + '</div>' +
      '<section id="rp-0" class="rps">' + head(0) + '<p class="rp-p">' + summary + '</p></section>' +
      '<section id="rp-1" class="rps">' + head(1) + U.kpis([
        { label: 'Total spend', value: C.money(t.spend, 2), note: C.money(t.spend / days, 2) + ' / day over ' + days + ' days', cmp: false }, { label: 'Impressions', value: C.int(t.impr), note: C.int(t.clicks) + ' clicks · ' + C.pct(t.ctr, 2) + ' CTR', cmp: false },
        { label: 'Leads', value: C.int(t.leads), note: C.money(t.cpl, 2) + ' per lead', cmp: false, hl: true }, { label: 'Calls booked (ads)', value: C.int(t.bkAds), note: C.money(t.cpb, 2) + ' per booking', cmp: false }
      ], 'k4') + '<p class="rp-p sm">Currency USD. Reach ' + C.int(t.reach) + ' at ' + C.num(t.impr / Math.max(1, t.reach), 2) + ' frequency, CPM ' + C.money(t.cpm, 2) + ', CPC ' + C.money(t.spend / t.clicks, 2) + '.</p></section>' +
      '<section id="rp-2" class="rps">' + head(2) + '<p class="rp-p sm">Top 7 campaigns by spend for the selected window. &ldquo;All other campaigns&rdquo; groups the rest.</p>' + U.table([
        { label: 'Campaign', cell: function (x) { return x.label; } }, { label: 'Leads', align: 'r', cell: function (x) { return C.int(x.leads); } },
        { label: 'Cost / lead', align: 'r', cell: function (x) { return cplPill(x.cpl); } }, { label: 'Spend', align: 'r', cell: function (x) { return C.money(x.spend, 2); } },
        { label: 'CTR', align: 'r', cell: function (x) { return C.pct(x.ctr, 2); } }, { label: 'CPC', align: 'r', cell: function (x) { return C.money(x.cpc, 2); } }
      ], camps.concat([{ label: 'All other campaigns', leads: other.leads, cpl: null, spend: other.spend, ctr: null, cpc: null }]),
        { total: ['Account total', C.int(t.leads), C.money(t.cpl, 2), C.money(t.spend, 2), C.pct(t.ctr, 2), C.money(t.spend / t.clicks, 2)] }) + '</section>' +
      '<section id="rp-3" class="rps">' + head(3) + '<p class="rp-p sm">Top 8 ads by spend for the selected window.</p>' + U.table([
        { label: 'Ad', cell: function (x) { return '<strong>' + U.esc(x.label) + '</strong>'; } }, { label: 'Spend', align: 'r', cell: function (x) { return C.money(x.spend, 2); } },
        { label: 'Leads', align: 'r', cell: function (x) { return C.int(x.leads); } }, { label: 'Cost / lead', align: 'r', cell: function (x) { return cplPill(x.cpl); } },
        { label: 'CTR', align: 'r', cell: function (x) { return C.pct(x.ctr, 2); } }
      ], d.ads) + '</section>' +
      '<section id="rp-4" class="rps">' + head(4) + '<p class="rp-p sm">Creative health, read against click-through rate and ad frequency. A falling CTR on rising frequency usually means the creative is tiring.</p>' + U.table([
        { label: 'Ad', cell: function (x) { return U.esc(x.ad); } }, { label: 'CTR now', align: 'r', cell: function (x) { return C.pct(x.ctr, 2); } },
        { label: 'CTR prior period', align: 'r', cell: function (x) { return C.pct(x.prevCtr, 2); } }, { label: 'Frequency', align: 'r', cell: function (x) { return C.num(x.freq, 1); } },
        { label: 'Signal', align: 'r', cell: function (x) { return U.badge(x.signal, x.signal === 'Refresh candidate' ? 'warn' : (x.signal === 'Stable' ? 'ok' : '')); } }
      ], d.fatigue) + '</section>' +
      '<section id="rp-5" class="rps">' + head(5) + brk('Platform', d.platforms, [cpm]) + '<div class="gap"></div>' + brk('Top positions', d.positions) + '</section>' +
      '<section id="rp-6" class="rps">' + head(6) + brk('Device', d.devices) + '</section>' +
      '<section id="rp-7" class="rps">' + head(7) + brk('Age', d.ages) + '<div class="gap"></div>' + brk('Gender', d.genders) + '</section>' +
      '<section id="rp-8" class="rps">' + head(8) + '<p class="rp-p sm">Top 10 states by spend.</p>' + brk('State', d.states.slice(0, 10)) + '</section>' +
      '<section id="rp-9" class="rps">' + head(9) + '<p class="rp-p sm">Full 24 hours, advertiser time zone (Pacific).</p>' + U.table([
        { label: 'Hour (PT)', cell: function (x) { return x.label; } }, { label: 'Spend', align: 'r', cell: function (x) { return C.money(x.spend, 2); } },
        { label: '', cell: function (x) { return U.bar(x.spend / (t.spend / 24) / 2.2, { cls: 'blue' }); } },
        { label: 'CTR', align: 'r', cell: function (x) { return C.pct(x.ctr, 2); } }, { label: 'CPC', align: 'r', cell: function (x) { return C.money(x.cpc, 2); } }
      ], d.hours, { scroll: 380 }) + '</section>' +
      '<section id="rp-10" class="rps">' + head(10) + '<p class="rp-p sm">Account-level, current state (does not change with the range selector). The sample pixel is active and firing browser-side, but its <strong>server-side Conversions API signal has not fired for several months</strong>. Conversions blocked in the browser are not being recovered, so leads and booked calls in every range above are understated floors.</p>' +
      U.table([{ label: 'Dataset / pixel', cell: function (x) { return x[0]; } }, { label: 'Browser signal', cell: function (x) { return x[1]; } }, { label: 'Server (CAPI) signal', cell: function (x) { return x[2]; } }, { label: 'Verdict', align: 'r', cell: function (x) { return U.badge(x[3], 'warn'); } }],
        [['Summit Growth Pixel', 'Active, fired today', 'Stale since 2026-03-12', 'Under-tracked']]) + '</section>' +
      '<section id="rp-11" class="rps">' + head(11) + '<p class="rp-p sm">Account-level, current state. Meta opportunity score: <strong>62 / 100</strong>. Recommendations sorted by score lift.</p>' +
      U.table([{ label: 'Fix', cell: function (x) { return x[0]; } }, { label: 'Estimated impact', align: 'r', cell: function (x) { return x[1]; } }, { label: 'Points', align: 'r', cell: function (x) { return x[2]; } }], [
        ['Set up Conversions API gateway (server-side tracking)', 'Median 14% lower cost per result', '22'], ['Raise budget on 4 budget-limited ad sets', 'More results for the budget', '5'],
        ['Turn on Advantage+ creative across 8 ads', '9% lower cost per result', '3'], ['Add 9:16 sound-on video to Reels placements', '7% lower cost per result', '2'],
        ['Fix 2 ad sets not delivering', 'Delivery re-enabled', '1']]) + '</section>' +
      '<section id="rp-12" class="rps">' + head(12) + '<ol class="actions">' +
      ['<strong>Fix conversion tracking first.</strong> The server-side signal has been dark since March; the gateway is the single biggest opportunity. Every lead figure here is measured through an under-reporting pixel.',
        '<strong>Refresh the founder-story creative.</strong> It is the top spender, but CTR is softening on rising frequency. Queue a new variant while it still performs.',
        '<strong>Scale the retargeting winners.</strong> The retargeting campaigns sit well below the blended cost per lead and several are budget-limited.',
        '<strong>Prune or consolidate the tail.</strong> Low-volume campaigns repeatedly spend with little return. Fold them into the best performers.',
        '<strong>Trim desktop and dead placements.</strong> Desktop and the right-hand column run on weak CTR. Shift toward mobile Feed and Reels.',
        '<strong>Push delivery into the cheaper evening hours.</strong> The evening block is consistently the best value; the late-morning block is the most expensive.',
        '<strong>Fix the two non-delivering ad sets.</strong> A targeting error is stalling delivery at no extra cost to resolve.'
      ].map(function (x, i) { return '<li><span>' + (i + 1) + '</span><div>' + x + '</div></li>'; }).join('') + '</ol>' +
      '<p class="rp-foot"><strong>Summit Growth Academy &middot; Meta Ads report.</strong> Selected window ' + C.fmtDay(w.from) + ' to ' + C.fmtDay(w.to, true) + ', advertiser time zone America/Los_Angeles. Sample data for a fictional account. Read only: nothing in an ad account is changed by this report.</p></section></div>';
    return { html: html };
  };
})(window);
