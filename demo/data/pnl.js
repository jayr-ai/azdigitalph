/* Profit and loss data (cash basis): cash collected less ad spend, fulfilment, team, software and other costs.
   Costs are modelled from the Summit dataset. Sample data only. */
(function (g) {
  var C = g.DemoCore, S = g.Summit;
  var rr = C.rng(77123);
  var cost = S.days.map(function (d, i) {
    var t = i / S.days.length;
    return {
      n: d.n,
      adSpend: d.spend,
      fulfilment: d.cashAds * 0.14 + d.cashOrg * 0.14,
      team: (18500 + 5500 * t) / 30.4,
      software: 1850 / 30.4 + rr() * 6,
      other: (d.cashAds + d.cashOrg) * 0.029 + 1200 / 30.4 + rr() * 8,
      revenue: d.cashAds + d.cashOrg
    };
  });
  var KEYS = ['revenue', 'adSpend', 'fulfilment', 'team', 'software', 'other'];
  function fin(o) {
    o.costs = o.adSpend + o.fulfilment + o.team + o.software + o.other;
    o.net = o.revenue - o.costs;
    return o;
  }
  g.PnlData = {
    keys: KEYS,
    totals: function (from, to) { return fin(C.sum(cost, from, to, KEYS)); },
    query: function (from, to, gran) {
      var pr = C.prevRange(from, to);
      return {
        tot: g.PnlData.totals(from, to), prev: g.PnlData.totals(pr.from, pr.to),
        series: C.series(cost, from, to, gran, KEYS).map(fin)
      };
    }
  };
})(window);
