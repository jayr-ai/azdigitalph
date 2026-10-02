/* Sales / pipeline dashboard data: per-rep funnel and progress against target. Sample data only. */
(function (g) {
  var C = g.DemoCore, S = g.Summit;
  function repTotals(from, to) {
    var out = S.reps.map(function (p) { return { id: p.id, name: p.name, target: p.target, bk: 0, held: 0, won: 0, rev: 0, cash: 0 }; });
    S.days.forEach(function (d) {
      if (d.n < from || d.n > to) return;
      d.rep.forEach(function (x, i) { var o = out[i]; o.bk += x.bk; o.held += x.held; o.won += x.won; o.rev += x.rev; o.cash += x.cash; });
    });
    out.forEach(function (o) {
      o.show = C.div(o.held, o.bk); o.close = C.div(o.won, o.held); o.revPerBk = C.div(o.rev, o.bk);
      o.score = o.cash;
    });
    return out;
  }
  g.SalesData = {
    query: function (from, to, gran) {
      var pr = C.prevRange(from, to);
      return {
        tot: S.totals(from, to),
        prev: S.totals(pr.from, pr.to),
        reps: repTotals(from, to),
        prevReps: repTotals(pr.from, pr.to),
        series: C.series(S.days, from, to, gran, ['revAds', 'revOrg', 'cashAds', 'cashOrg', 'bkAds', 'bkOrg', 'heldAds', 'heldOrg', 'wonAds', 'wonOrg'])
      };
    }
  };
})(window);
