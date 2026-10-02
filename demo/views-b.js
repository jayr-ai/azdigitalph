/* Views: Revenue, Masterclass / Webinar Funnel, Assessment / Lead Quiz. Sample data only. */
(function (g) {
  var C = g.DemoCore, U = g.UI, P = U.PAL;
  var V = g.Views = g.Views || {};
  function dlt(a, b) { return C.delta(a, b); }

  /* Diagonal hatch pattern, used for "no data" columns so they never look like zero. */
  function hatch(color) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 8;
    var x = cv.getContext('2d');
    x.strokeStyle = color; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-1, 9); x.lineTo(9, -1); x.moveTo(-1, 1); x.lineTo(1, -1); x.moveTo(7, 9); x.lineTo(9, 7); x.stroke();
    return x.createPattern(cv, 'repeat');
  }

  /* ---------- 4. Revenue ---------- */
  V.revenue = function (ctx) {
    var d = g.RevenueData.query(ctx.from, ctx.to, ctx.gran), t = d.tot, p = d.prev;
    if (!t.rev && !t.cash) return { html: U.empty() };
    var outstanding = t.rev - t.cash, pOut = p.rev - p.cash;
    var c1 = U.chartBox(260), c2 = U.chartBox(230), c3 = U.chartBox(260);
    var deals = t.won, pDeals = p.won;
    var html =
      U.section('Revenue', 'transaction-based · sold versus collected',
        U.kpis([
          { label: 'Revenue sold', value: C.money(t.rev), d: dlt(t.rev, p.rev), hl: true },
          { label: 'Cash collected', value: C.money(t.cash), d: dlt(t.cash, p.cash) },
          { label: 'Outstanding on plans', value: C.money(outstanding), d: dlt(outstanding, pOut) },
          { label: 'Collection rate', value: C.pct(C.div(t.cash, t.rev), 1), d: dlt(C.div(t.cash, t.rev), C.div(p.cash, p.rev)) },
          { label: 'Deals closed', value: C.int(deals), d: dlt(deals, pDeals) },
          { label: 'Average deal', value: C.money(C.div(t.rev, deals)), d: dlt(C.div(t.rev, deals), C.div(p.rev, pDeals)) }
        ])) +
      '<div class="grid3">' +
      U.card('Revenue and cash over time', c1.html, { sub: 'by ' + ctx.gran, cls: 'span2' }) +
      U.card('Payment plan mix', c2.html, { sub: 'share of revenue sold' }) + '</div>' +
      '<div class="grid1">' + U.card('Cash collected by product', c3.html, { sub: 'by ' + ctx.gran }) + '</div>' +
      '<div class="grid2 top">' +
      U.card('Revenue by product', U.table([
        { label: 'Product', cell: function (x) { return '<strong>' + x.name + '</strong>'; } }, { label: 'Deals', align: 'r', cell: function (x) { return C.int(x.deals); } },
        { label: 'Revenue', align: 'r', cell: function (x) { return C.money(x.rev); } }, { label: 'Cash', align: 'r', cell: function (x) { return C.money(x.cash); } },
        { label: 'Avg deal', align: 'r', cell: function (x) { return C.money(C.div(x.rev, x.deals)); } }
      ], d.byProduct, { total: ['Total', C.int(deals), C.money(t.rev), C.money(t.cash), C.money(C.div(t.rev, deals))] })) +
      U.card('Transactions', U.table([
        { label: 'Date', cell: function (x) { return x.date; } }, { label: 'Customer', cell: function (x) { return U.esc(x.name); } },
        { label: 'Product', cell: function (x) { return x.product; } }, { label: 'Plan', cell: function (x) { return x.plan; } },
        { label: 'Amount', align: 'r', cell: function (x) { return C.money(x.amount); } }, { label: 'Cash', align: 'r', cell: function (x) { return C.money(x.cash); } }
      ], d.tx, { scroll: 340 }), { sub: C.int(d.tx.length) + ' sales' }) + '</div>';
    return {
      html: html, mount: function () {
        var s = d.series, labels = s.map(function (x) { return x.label; });
        U.mount(c1.id, 'line', labels, [
          U.ds('Revenue sold', s.map(function (x) { return Math.round(x.revAds + x.revOrg); }), P.gold, { fill: true, backgroundColor: P.goldSoft }),
          U.ds('Cash collected', s.map(function (x) { return Math.round(x.cashAds + x.cashOrg); }), P.teal)
        ], { money: true, tip: { label: function (c) { return c.dataset.label + ': ' + C.money(c.parsed.y); } } });
        U.donut(c2.id, d.byPlan.map(function (x) { return x.name; }), d.byPlan.map(function (x) { return x.rev; }), [P.gold, P.blue, P.plum],
          { tip: { label: function (c) { return c.label + ': ' + C.money(c.parsed); } } });
        U.mount(c3.id, 'bar', labels, g.Summit.products.map(function (pr, i) {
          return U.ds(pr.name, s.map(function (x) { return Math.round(x.prod[i]); }), U.SERIES[i], { stack: 's', borderWidth: 0 });
        }), { stack: true, money: true, tip: { label: function (c) { return c.dataset.label + ': ' + C.money(c.parsed.y); } } });
      }
    };
  };

  /* ---------- 5. Masterclass / Webinar funnel ---------- */
  V.masterclass = function (ctx) {
    var M = g.MasterclassData, runs = M.runs;
    var sel = ctx.extra.run != null ? ctx.extra.run : M.latest.id;
    var run = runs[sel], prevRun = sel > 0 ? runs[sel - 1] : null;
    if (prevRun && prevRun.cancelled) prevRun = null;
    var opts = runs.slice().reverse().map(function (r) {
      return '<option value="' + r.id + '"' + (r.id === sel ? ' selected' : '') + '>' + r.label + (r.cancelled ? ' (cancelled)' : '') + '</option>';
    }).join('');
    var picker = '<div class="runpick"><label for="mc-run">Masterclass date</label><select id="mc-run">' + opts + '</select></div>';
    var chartBoxAll = U.chartBox(240);
    var allRuns = U.section('Revenue per masterclass run', 'all tracked runs · not affected by the run selector above',
      U.card('Cash collected per run', chartBoxAll.html, { sub: 'hatched columns are runs with no data' }));
    function mountAll() {
      var vals = runs.map(function (r) { return r.cancelled ? null : r.cash; });
      var maxV = Math.max.apply(null, vals.filter(function (v) { return v != null; }));
      var pat = hatch('rgba(212,175,55,.7)');
      U.mount(chartBoxAll.id, 'bar', runs.map(function (r) { return C.fmtDay(r.n); }), [{
        label: 'Cash collected', data: runs.map(function (r) { return r.cancelled ? maxV * 0.12 : r.cash; }), borderWidth: 0, borderRadius: 2,
        backgroundColor: runs.map(function (r) { return r.cancelled ? pat : (r.id === sel ? P.gold : 'rgba(212,175,55,.45)'); })
      }], { legend: false, money: true, maxX: 13, tip: { label: function (c) { return runs[c.dataIndex].cancelled ? 'Cancelled: no data' : 'Cash: ' + C.money(c.parsed.y); } } });
    }
    if (run.cancelled) {
      return {
        html: picker + U.empty('Run cancelled', 'No masterclass was held on ' + run.label + '. Shown as no data, not zero.') + allRuns,
        mount: mountAll
      };
    }
    var pr = prevRun || {};
    var funnelRows = [['Registered', run.registered], ['Attended', run.attended], ['Booked a call', run.booked], ['Sale', run.sales]];
    var fn = funnelRows.map(function (r, i) {
      return '<div class="fn"><div class="fn-l">' + r[0] + '</div><div class="fn-b">' + U.bar(r[1] / run.registered, { cls: i === 3 ? 'gold' : 'blue' }) + '</div><div class="fn-v">' + C.int(r[1]) + '</div></div>' +
        (i ? '<div class="fn-n">' + C.pct(C.div(r[1], funnelRows[i - 1][1]), 1) + ' of ' + funnelRows[i - 1][0].toLowerCase() + '</div>' : '');
    }).join('');
    var html = picker +
      U.section('This run', 'revenue window: ' + C.fmtDay(run.n) + ' to ' + C.fmtDay(run.n + 6, true) + ' · compared with the previous run',
        U.kpis([
          { label: 'Ad spend', value: C.money(run.spend), d: dlt(run.spend, pr.spend), inv: true }, { label: 'Registered', value: C.int(run.registered), d: dlt(run.registered, pr.registered) },
          { label: 'Show-up rate', value: C.pct(run.showRate, 1), d: dlt(run.showRate, pr.showRate) }, { label: 'Attended', value: C.int(run.attended), d: dlt(run.attended, pr.attended) },
          { label: 'Booked calls', value: C.int(run.booked), d: dlt(run.booked, pr.booked) }, { label: 'Sales closed', value: C.int(run.sales), d: dlt(run.sales, pr.sales) }
        ], 'k6') +
        U.kpis([
          { label: 'Revenue collected for this run', value: C.money(run.cash), d: dlt(run.cash, pr.cash), hl: true }, { label: 'Cash from ads', value: C.money(run.cashAds), d: dlt(run.cashAds, pr.cashAds) },
          { label: 'Cash organic', value: C.money(run.cashOrg), d: dlt(run.cashOrg, pr.cashOrg) }, { label: 'ROAS', value: C.num(run.roas, 2) + 'x', d: dlt(run.roas, pr.roas) }
        ], 'k4')) +
      '<div class="grid2">' +
      U.card('Executive summary', '<div class="narr-box"><p>In the registration window for this run, campaigns generated ' + C.int(run.adLeads) + ' ad registrations from ' + C.int(run.clicks) + ' link clicks (' + C.pct(C.div(run.adLeads, run.clicks), 1) + ' click-to-registration).</p>' +
        '<p>Ad spend was ' + C.money(run.spend) + ', a cost per registration of ' + C.money(run.cpl, 2) + ' and a cost per click of ' + C.money(run.cpc, 2) + '. Click-through rate was ' + C.pct(run.ctr, 2) + '.</p>' +
        '<p>Registrants closed ' + run.sales + ' deals within the window for ' + C.money(run.cash) + ' (' + C.money(run.cashAds) + ' from ads, ' + C.money(run.cashOrg) + ' organic).</p></div>') +
      U.card('Registration to sale', fn) + '</div>' +
      U.section('Marketing performance', 'Meta Ads spend for this run',
        U.kpis([{ label: 'Ad spend', value: C.money(run.spend), cmp: false }, { label: 'Link clicks', value: C.int(run.clicks), cmp: false }, { label: 'CTR', value: C.pct(run.ctr, 2), cmp: false },
          { label: 'Registrations (ads)', value: C.int(run.adLeads), cmp: false }, { label: 'Cost per registration', value: C.money(run.cpl, 2), cmp: false }, { label: 'ROAS', value: C.num(run.roas, 2) + 'x', cmp: false }], 'k6')) +
      U.section('Deals closed', 'matched to this run via the revenue window · ' + run.deals.length + ' transactions',
        U.card('Deals', U.table([
          { label: 'Date', cell: function (x) { return x.date; } }, { label: 'Name', cell: function (x) { return U.esc(x.name); } }, { label: 'Product', cell: function (x) { return x.product; } },
          { label: 'Amount', align: 'r', cell: function (x) { return C.money(x.amount); } }, { label: 'Cash', align: 'r', cell: function (x) { return C.money(x.cash); } },
          { label: 'Type', cell: function (x) { return U.badge(x.source, x.source === 'Paid' ? 'gold' : ''); } }, { label: 'Closer', cell: function (x) { return U.esc(x.closer); } }
        ], run.deals, { scroll: 320 }))) + allRuns;
    return {
      html: html, mount: function () {
        mountAll();
      }
    };
  };

  /* ---------- 6. Assessment / Lead quiz ---------- */
  V.assessment = function (ctx) {
    var A = g.AssessmentData, d = A.query(ctx.from, ctx.to, ctx.gran), t = d.tot, p = d.prev;
    if (!t.live) {
      return { html: U.empty('No data before launch', 'The quiz launched on ' + C.fmtDay(A.LAUNCH, true) + '. Choose a range that includes dates after that.') };
    }
    var pre = (ctx.to - ctx.from + 1) - t.live;
    var c1 = U.chartBox(250), c2 = U.chartBox(240);
    var bins = A.BIN.map(function (b, i) {
      var comps = t['c' + i], bk = t['b' + i], w = t['w' + i];
      return { band: b, comps: comps, share: C.div(comps, t.comps), bk: bk, bkr: C.div(bk, comps), w: w, wr: C.div(w, comps) };
    });
    var html =
      (pre > 0 ? U.note('<strong>' + pre + ' day' + (pre > 1 ? 's' : '') + ' in this range fall before launch (' + C.fmtDay(A.LAUNCH, true) + ').</strong> They show as gaps, not zeros.', 'warn') : '') +
      U.section('Quiz performance', 'assessment funnel · compared with the equal-length period before',
        U.kpis([
          { label: 'Quiz starts', value: C.int(t.starts), d: dlt(t.starts, p.starts) }, { label: 'Completions', value: C.int(t.comps), d: dlt(t.comps, p.comps) },
          { label: 'Completion rate', value: C.pct(t.rate, 1), d: dlt(t.rate, p.rate) }, { label: 'Average score', value: C.num(t.avgScore, 1), d: dlt(t.avgScore, p.avgScore) },
          { label: 'Booked calls', value: C.int(t.booked), d: dlt(t.booked, p.booked) }, { label: 'Quiz to booking %', value: C.pct(t.toBook, 1), d: dlt(t.toBook, p.toBook) },
          { label: 'Sales', value: C.int(t.sales), d: dlt(t.sales, p.sales), hl: true }, { label: 'Quiz to sale %', value: C.pct(t.toSale, 2), d: dlt(t.toSale, p.toSale) }
        ], 'k8')) +
      '<div class="grid2">' +
      U.card('Starts and completions', c1.html, { sub: 'by ' + ctx.gran }) +
      U.card('Score distribution', c2.html, { sub: 'completed quizzes by score band' }) + '</div>' +
      U.section('Conversion by score band', 'higher scores book and buy more often',
        U.card('Bands', U.table([
          { label: 'Score band', cell: function (x) { return '<strong>' + x.band + '</strong>'; } }, { label: 'Completions', align: 'r', cell: function (x) { return C.int(x.comps); } },
          { label: 'Share', align: 'r', cell: function (x) { return C.pct(x.share, 1); } }, { label: 'Booked', align: 'r', cell: function (x) { return C.int(x.bk); } },
          { label: 'Booked %', align: 'r', cell: function (x) { return C.pct(x.bkr, 1); } }, { label: 'Sales', align: 'r', cell: function (x) { return C.int(x.w); } },
          { label: 'Sale %', align: 'r', cell: function (x) { return C.pct(x.wr, 2); } }
        ], bins, { total: ['Total', C.int(t.comps), '100%', C.int(t.booked), C.pct(t.toBook, 1), C.int(t.sales), C.pct(t.toSale, 2)] })));
    return {
      html: html, mount: function () {
        var s = d.series, labels = s.map(function (x) { return x.label; });
        U.mount(c1.id, 'bar', labels, [
          U.ds('Starts', s.map(function (x) { return x.live ? x.starts : null; }), P.blue, { borderWidth: 0, borderRadius: 2 }),
          U.ds('Completions', s.map(function (x) { return x.live ? x.comps : null; }), P.gold, { borderWidth: 0, borderRadius: 2 })
        ], {});
        U.mount(c2.id, 'bar', A.BIN, [U.ds('Completions', bins.map(function (b) { return b.comps; }), P.gold, { borderWidth: 0, borderRadius: 3 })], { legend: false });
      }
    };
  };
})(window);
