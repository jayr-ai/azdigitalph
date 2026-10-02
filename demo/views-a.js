/* Views: Executive Summary, Marketing, Sales. Sample data only (Summit Growth Academy, fictional). */
(function (g) {
  var C = g.DemoCore, U = g.UI, P = U.PAL;
  var V = g.Views = g.Views || {};

  function dlt(cur, prev) { return C.delta(cur, prev); }

  /* ---------- 1. Executive Summary ---------- */
  V.executive = function (ctx) {
    var d = g.ExecutiveData.query(ctx.from, ctx.to, ctx.gran), t = d.tot, p = d.prev, pl = d.pl, plp = d.plPrev;
    if (!t.spend && !t.cash) return { html: U.empty() };
    var c1 = U.chartBox(280);
    var html =
      U.section('Summary', 'Summit Growth Academy · compared with the equal-length period before',
        '<div class="callout narr">' + (d.narrative || 'No data') + '</div>') +
      U.section('Headline numbers', '',
        U.kpis([
          { label: 'Ad spend', value: C.money(t.spend), d: dlt(t.spend, p.spend), inv: true },
          { label: 'Leads', value: C.int(t.leads), d: dlt(t.leads, p.leads) },
          { label: 'Booked calls', value: C.int(t.bk), d: dlt(t.bk, p.bk) },
          { label: 'Sales won', value: C.int(t.won), d: dlt(t.won, p.won) },
          { label: 'Cash collected', value: C.money(t.cash), d: dlt(t.cash, p.cash), hl: true },
          { label: 'ROAS (ads cash)', value: C.num(t.roas, 2) + 'x', d: dlt(t.roas, p.roas) },
          { label: 'Net profit', value: C.money(pl.net), d: dlt(pl.net, plp.net) }
        ])) +
      '<div class="grid2">' +
      U.card('Cash collected and ad spend', c1.html, { sub: 'by ' + ctx.gran }) +
      U.card('Where the leads go', funnel(t), {}) + '</div>';
    return {
      html: html, mount: function () {
        var s = d.series;
        U.mount(c1.id, 'bar', s.map(function (x) { return x.label; }), [
          U.ds('Cash from ads', s.map(function (x) { return Math.round(x.cashAds); }), P.gold, { type: 'bar', stack: 's', borderWidth: 0, borderRadius: 2, order: 2 }),
          U.ds('Cash organic', s.map(function (x) { return Math.round(x.cashOrg); }), P.grey, { type: 'bar', stack: 's', borderWidth: 0, borderRadius: 2, order: 2 }),
          U.ds('Ad spend', s.map(function (x) { return Math.round(x.spend); }), P.blue, { type: 'line', order: 1, pointRadius: s.length < 20 ? 3 : 0 })
        ], { stack: true, money: true, tip: { label: function (c) { return c.dataset.label + ': ' + C.money(c.parsed.y); } } });
      }
    };
  };
  function funnel(t) {
    var rows = [['Leads', t.leads, 'blue'], ['Booked calls', t.bk, 'blue'], ['Calls held', t.held, 'blue'], ['Sales won', t.won, 'gold']];
    var max = Math.max(t.leads, 1), h = '';
    rows.forEach(function (r, i) {
      var prev = i ? rows[i - 1][1] : null;
      h += '<div class="fn"><div class="fn-l">' + r[0] + '</div><div class="fn-b">' + U.bar(r[1] / max, { cls: r[2] }) + '</div><div class="fn-v">' + C.int(r[1]) + '</div></div>' +
        (i ? '<div class="fn-n">' + C.pct(C.div(r[1], prev), 1) + ' of ' + rows[i - 1][0].toLowerCase() + '</div>' : '');
    });
    return h + '<p class="fn-foot">Booked calls include organic bookings, so they are not a strict share of ad leads.</p>';
  }

  /* ---------- 2. Marketing ---------- */
  V.marketing = function (ctx) {
    var d = g.MarketingData.query(ctx.from, ctx.to, ctx.gran), t = d.tot, p = d.prev;
    var cDonut = U.chartBox(240), cCash = U.chartBox(260), cLead = U.chartBox(240);
    var html =
      U.section('Ad performance', 'Meta Ads · sample data',
        U.kpis([
          { label: 'Impressions', value: C.int(t.impr), d: dlt(t.impr, p.impr) },
          { label: 'Reach', value: C.int(t.reach), d: dlt(t.reach, p.reach) },
          { label: 'Link clicks', value: C.int(t.clicks), d: dlt(t.clicks, p.clicks) },
          { label: 'Click-through %', value: C.pct(t.ctr, 2), d: dlt(t.ctr, p.ctr) },
          { label: 'Leads generated', value: C.int(t.leads), d: dlt(t.leads, p.leads) },
          { label: 'Click-to-lead %', value: C.pct(t.ctl, 1), d: dlt(t.ctl, p.ctl) },
          { label: 'Lead-to-book %', value: C.pct(t.l2b, 1), d: dlt(t.l2b, p.l2b) }
        ])) +
      U.section('Cost per result', '',
        U.kpis([
          { label: 'Ad spend', value: C.money(t.spend), d: dlt(t.spend, p.spend), inv: true },
          { label: 'CPM', value: C.money(t.cpm, 2), d: dlt(t.cpm, p.cpm), inv: true, note: 'per 1,000' },
          { label: 'Cost per lead', value: C.money(t.cpl, 2), d: dlt(t.cpl, p.cpl), inv: true },
          { label: 'Cost per booking', value: C.money(t.cpb, 2), d: dlt(t.cpb, p.cpb), inv: true },
          { label: 'Cost per sale', value: C.money(t.cps, 2), d: dlt(t.cps, p.cps), inv: true },
          { label: 'ROAS', value: C.num(t.roas, 2) + 'x', d: dlt(t.roas, p.roas), hl: true, note: 'cash from ads / spend' }
        ])) +
      U.section('Cash attribution', 'calculated from transactions · ads versus organic',
        U.kpis([
          { label: 'Total cash', value: C.money(t.cash), d: dlt(t.cash, p.cash), hl: true },
          { label: 'Cash from ads', value: C.money(t.cashAds), d: dlt(t.cashAds, p.cashAds) },
          { label: 'Cash organic', value: C.money(t.cashOrg), d: dlt(t.cashOrg, p.cashOrg) },
          { label: 'Calls booked from ads', value: C.int(t.bkAds), d: dlt(t.bkAds, p.bkAds) },
          { label: 'Calls booked organic', value: C.int(t.bkOrg), d: dlt(t.bkOrg, p.bkOrg) }
        ])) +
      '<div class="grid3">' +
      U.card('Revenue source mix', cDonut.html, { sub: 'cash, ads vs organic' }) +
      U.card('Cash received', cCash.html, { sub: 'by ' + ctx.gran, cls: 'span2' }) + '</div>' +
      '<div class="grid1">' + U.card('Leads and booked calls', cLead.html, { sub: 'by ' + ctx.gran }) + '</div>' +
      '<div class="grid2 top" id="mk-tables"></div>';
    return {
      html: html, mount: function () {
        var s = d.series, labels = s.map(function (x) { return x.label; });
        U.donut(cDonut.id, ['Ads', 'Organic'], [t.cashAds, t.cashOrg], [P.gold, P.grey], { tip: { label: function (c) { return c.label + ': ' + C.money(c.parsed); } } });
        U.mount(cCash.id, 'bar', labels, [
          U.ds('Ads', s.map(function (x) { return Math.round(x.cashAds); }), P.gold, { stack: 's', borderWidth: 0, borderRadius: 2 }),
          U.ds('Organic', s.map(function (x) { return Math.round(x.cashOrg); }), P.grey, { stack: 's', borderWidth: 0, borderRadius: 2 })
        ], { stack: true, money: true, tip: { label: function (c) { return c.dataset.label + ': ' + C.money(c.parsed.y); } } });
        U.mount(cLead.id, 'line', labels, [
          U.ds('Leads', s.map(function (x) { return x.leads; }), P.blue, { yAxisID: 'y' }),
          U.ds('Calls booked', s.map(function (x) { return x.bkAds + x.bkOrg; }), P.gold, { yAxisID: 'y2' })
        ], { y2: true });
        tables(d, document.getElementById('mk-tables'));
      }
    };
  };
  function tables(d, host) {
    var src = 'All', page = 0, PER = 8;
    function draw() {
      var rows = d.tx.filter(function (x) { return src === 'All' || x.source === src; });
      var pages = Math.max(1, Math.ceil(rows.length / PER)); page = Math.min(page, pages - 1);
      var slice = rows.slice(page * PER, page * PER + PER);
      var total = rows.reduce(function (a, x) { return a + x.cash; }, 0);
      var pills = ['All', 'Paid', 'Organic'].map(function (s) { return '<button class="pillbtn' + (s === src ? ' on' : '') + '" data-src="' + s + '">' + s + '</button>'; }).join('');
      var left = U.card('Sales breakdown by channel', U.table([
        { label: 'Date', cell: function (x) { return x.date; } }, { label: 'Name', cell: function (x) { return U.esc(x.name); } },
        { label: 'Product', cell: function (x) { return x.product; } }, { label: 'Cash', align: 'r', cell: function (x) { return C.money(x.cash); } },
        { label: 'Source', cell: function (x) { return U.badge(x.source, x.source === 'Paid' ? 'gold' : ''); } }
      ], slice, { total: ['', '', 'Total', C.money(total), C.int(rows.length) + ' sales'] }) +
        '<div class="pager"><button class="pillbtn" data-pg="-1"' + (page === 0 ? ' disabled' : '') + '>&larr; Previous</button><span>Page ' + (page + 1) + ' of ' + pages + '</span><button class="pillbtn" data-pg="1"' + (page >= pages - 1 ? ' disabled' : '') + '>Next &rarr;</button></div>',
        { sub: 'paid versus organic', right: '<div class="pills">' + pills + '</div>' });
      var s = d.series.slice().reverse();
      var right = U.card('Cash breakdown', U.table([
        { label: 'Period', cell: function (x) { return x.label; } }, { label: 'Paid', align: 'r', cell: function (x) { return C.money(x.cashAds); } },
        { label: 'Organic', align: 'r', cell: function (x) { return C.money(x.cashOrg); } }, { label: 'Total', align: 'r', cell: function (x) { return '<strong>' + C.money(x.cashAds + x.cashOrg) + '</strong>'; } }
      ], s, { scroll: 330, total: ['Period total', C.money(d.tot.cashAds), C.money(d.tot.cashOrg), C.money(d.tot.cash)] }), { sub: 'from transactions' });
      host.innerHTML = left + right;
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.src) { src = b.dataset.src; page = 0; draw(); }
      else if (b.dataset.pg) { page += +b.dataset.pg; draw(); }
    });
    draw();
  }

  /* ---------- 3. Sales / Pipeline ---------- */
  V.sales = function (ctx) {
    var d = g.SalesData.query(ctx.from, ctx.to, ctx.gran), t = d.tot, p = d.prev;
    var reps = d.reps.slice().sort(function (a, b) { return b.cash - a.cash; });
    var top = reps[0];
    var scale = (ctx.to - ctx.from + 1) / 30.4;
    var cRev = U.chartBox(250);
    var lost1 = t.bk - t.held, lost2 = t.held - t.won;
    var medal = top && top.bk ? '<div class="medal"><div class="m-ic" aria-hidden="true">&#9733;</div><div><div class="m-k">Top performer</div><div class="m-n">' + U.esc(top.name) + '</div>' +
      '<div class="m-v">' + C.money(top.cash) + '</div><div class="chips"><span>Won ' + top.won + '</span><span>Held ' + top.held + '</span><span>Close ' + C.pct(top.close, 1) + '</span></div></div></div>' : U.empty();
    function prog(label, val, tgt, txt) {
      var pctv = C.div(val, tgt) || 0;
      var tag = pctv >= 1 ? U.badge('target hit', 'gold') : (pctv >= 0.85 ? U.badge('on pace', 'ok') : U.badge('behind pace', 'warn'));
      return '<div class="pr"><div class="pr-t"><span>' + label + ' ' + tag + '</span><span>' + txt + ' &middot; ' + Math.round(pctv * 100) + '%</span></div>' + U.bar(pctv, { cls: pctv >= 1 ? 'gold' : 'blue' }) + '</div>';
    }
    var progress = reps.map(function (r) {
      var low = r.held < 5;
      return '<div class="rep-card"><h4>' + U.esc(r.name) + ' <span class="sm">Closer</span></h4>' +
        prog('Cash collected', r.cash, r.target * scale, C.money(r.cash) + ' / ' + C.money(r.target * scale)) +
        (low ? '<div class="pr"><div class="pr-t"><span>Show and close rate ' + U.badge('low volume', '') + '</span><span>–</span></div></div>' :
          prog('Show rate', r.show, 0.62, C.pct(r.show, 1) + ' / 62.0%') + prog('Close rate', r.close, 0.28, C.pct(r.close, 1) + ' / 28.0%')) +
        prog('Sales won', r.won, Math.max(1, Math.round(r.target * scale / 5200)), r.won + ' / ' + Math.max(1, Math.round(r.target * scale / 5200))) + '</div>';
    }).join('');
    var html =
      U.section('Headline', 'all closers · compared with the equal-length period before',
        U.kpis([
          { label: 'Booked', value: C.int(t.bk), d: dlt(t.bk, p.bk) }, { label: 'Held', value: C.int(t.held), d: dlt(t.held, p.held) },
          { label: 'Won', value: C.int(t.won), d: dlt(t.won, p.won) },
          { label: 'Show rate', value: C.pct(t.show, 1), d: dlt(t.show, p.show) }, { label: 'Close rate', value: C.pct(t.close, 1), d: dlt(t.close, p.close) },
          { label: 'Revenue sold', value: C.money(t.rev), d: dlt(t.rev, p.rev), hl: true }, { label: 'Cash collected', value: C.money(t.cash), d: dlt(t.cash, p.cash) }
        ], 'k7')) +
      '<div class="grid2">' +
      U.card('Top performer', medal) +
      U.card('Funnel', '<div class="fn"><div class="fn-l">Booked</div><div class="fn-b">' + U.bar(1, { cls: 'blue' }) + '</div><div class="fn-v">' + C.int(t.bk) + '</div></div>' +
        '<div class="fn-n">' + C.pct(C.div(t.held, t.bk), 1) + ' of booked became held &middot; ' + C.int(lost1) + ' lost here</div>' +
        '<div class="fn"><div class="fn-l">Held</div><div class="fn-b">' + U.bar(C.div(t.held, t.bk) || 0, { cls: 'blue' }) + '</div><div class="fn-v">' + C.int(t.held) + '</div></div>' +
        '<div class="fn-n">' + C.pct(C.div(t.won, t.held), 1) + ' of held became won &middot; ' + C.int(lost2) + ' lost here</div>' +
        '<div class="fn"><div class="fn-l">Won</div><div class="fn-b">' + U.bar(C.div(t.won, t.bk) || 0, { cls: 'gold' }) + '</div><div class="fn-v">' + C.int(t.won) + '</div></div>') +
      '</div>' +
      '<div class="grid1">' + U.card('Revenue sold and cash collected', cRev.html, { sub: 'by ' + ctx.gran }) + '</div>' +
      U.section('Leaderboard', 'ranked by cash collected',
        U.card('Closers', U.table([
          { label: '#', cell: function (r) { return reps.indexOf(r) + 1; } }, { label: 'Closer', cell: function (r) { return '<strong>' + U.esc(r.name) + '</strong>'; } },
          { label: 'Booked', align: 'r', cell: function (r) { return C.int(r.bk); } }, { label: 'Held', align: 'r', cell: function (r) { return C.int(r.held); } },
          { label: 'Won', align: 'r', cell: function (r) { return C.int(r.won); } }, { label: 'Show %', align: 'r', cell: function (r) { return C.pct(r.show, 1); } },
          { label: 'Close %', align: 'r', cell: function (r) { return C.pct(r.close, 1); } }, { label: 'Revenue', align: 'r', cell: function (r) { return C.money(r.rev); } },
          { label: 'Cash', align: 'r', cell: function (r) { return C.money(r.cash); } }, { label: 'Rev / booking', align: 'r', cell: function (r) { return C.money(r.revPerBk); } }
        ], reps, { total: ['', 'Overall', C.int(t.bk), C.int(t.held), C.int(t.won), C.pct(t.show, 1), C.pct(t.close, 1), C.money(t.rev), C.money(t.cash), C.money(C.div(t.rev, t.bk))] }) +
        '<p class="fine">Setters have no sales funnel by design, so they are not ranked here.</p>')) +
      U.section('Progress against target', 'targets scaled to the selected period', '<div class="reps">' + progress + '</div>');
    return {
      html: html, mount: function () {
        var s = d.series;
        U.mount(cRev.id, 'bar', s.map(function (x) { return x.label; }), [
          U.ds('Revenue sold', s.map(function (x) { return Math.round(x.revAds + x.revOrg); }), P.gold, { borderWidth: 0, borderRadius: 2 }),
          U.ds('Cash collected', s.map(function (x) { return Math.round(x.cashAds + x.cashOrg); }), P.teal, { borderWidth: 0, borderRadius: 2 })
        ], { money: true, tip: { label: function (c) { return c.dataset.label + ': ' + C.money(c.parsed.y); } } });
      }
    };
  };
})(window);
