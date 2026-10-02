/* Revenue dashboard data: transaction-based revenue, cash collected and payment-plan mix. Sample data only. */
(function (g) {
  var C = g.DemoCore, S = g.Summit;
  g.RevenueData = {
    query: function (from, to, gran) {
      var pr = C.prevRange(from, to);
      var tx = S.txIn(from, to);
      var byProduct = S.products.map(function (p) { return { name: p.name, deals: 0, rev: 0, cash: 0 }; });
      var byPlan = S.plans.map(function (p) { return { name: p.name, deals: 0, rev: 0, cash: 0 }; });
      tx.forEach(function (x) {
        var a = byProduct.filter(function (p) { return p.name === x.product; })[0];
        var b = byPlan.filter(function (p) { return p.name === x.plan; })[0];
        a.deals++; a.rev += x.amount; a.cash += x.cash;
        b.deals++; b.rev += x.amount; b.cash += x.cash;
      });
      /* cash by product per bucket (stacked bars) */
      var buckets = C.series(S.days, from, to, gran, ['revAds', 'revOrg', 'cashAds', 'cashOrg', 'wonAds', 'wonOrg']);
      var idx = {};
      buckets.forEach(function (b, i) { idx[b.n] = i; b.prod = S.products.map(function () { return 0; }); });
      tx.forEach(function (x) {
        var b = buckets[idx[C.bucketStart(x.n, gran)]];
        var pi = S.products.findIndex(function (p) { return p.name === x.product; });
        b.prod[pi] += x.cash;
      });
      return {
        tot: S.totals(from, to), prev: S.totals(pr.from, pr.to), series: buckets,
        byProduct: byProduct, byPlan: byPlan,
        tx: tx.slice().sort(function (a, b) { return b.n - a.n; })
      };
    }
  };
})(window);
