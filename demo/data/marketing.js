/* Marketing dashboard data: Meta Ads funnel plus cash from ads versus organic. Sample data only. */
(function (g) {
  var C = g.DemoCore, S = g.Summit;
  g.MarketingData = {
    query: function (from, to, gran) {
      var pr = C.prevRange(from, to);
      return {
        tot: S.totals(from, to),
        prev: S.totals(pr.from, pr.to),
        series: C.series(S.days, from, to, gran, S.keys),
        tx: S.txIn(from, to).slice().sort(function (a, b) { return b.n - a.n; })
      };
    }
  };
})(window);
