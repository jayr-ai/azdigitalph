/* Executive summary data: headline KPIs plus a plain-English narrative comparing to the previous period. */
(function (g) {
  var C = g.DemoCore, S = g.Summit, M = g.PnlData;
  function mv(cur, prev, noun) {
    var d = C.delta(cur, prev);
    if (d == null) return 'no prior-period figure is available for ' + noun;
    var a = Math.abs(d * 100).toFixed(1) + '%';
    if (Math.abs(d) < 0.005) return noun + ' was flat';
    return noun + (d > 0 ? ' rose ' : ' fell ') + a;
  }
  g.ExecutiveData = {
    query: function (from, to, gran) {
      var pr = C.prevRange(from, to);
      var tot = S.totals(from, to), prev = S.totals(pr.from, pr.to);
      var pl = g.PnlData.totals(from, to), plPrev = g.PnlData.totals(pr.from, pr.to);
      var narrative = null;
      if (tot.spend > 0 || tot.cash > 0) {
        narrative = 'Between ' + C.fmtDay(from, true) + ' and ' + C.fmtDay(to, true) + ', Summit Growth Academy spent ' + C.money(tot.spend) +
          ' on ads, generated ' + C.int(tot.leads) + ' leads and booked ' + C.int(tot.bk) + ' calls (' + C.int(tot.bkAds) + ' from ads, ' + C.int(tot.bkOrg) +
          ' organic). Those calls produced ' + C.int(tot.won) + ' sales and ' + C.money(tot.cash) + ' in cash collected, ' +
          'a return of ' + C.num(tot.roas, 2) + 'x on ad spend from ads-sourced cash. ' +
          'Compared with the previous period, ' + mv(tot.spend, prev.spend, 'ad spend') + ', ' + mv(tot.cash, prev.cash, 'cash collected') +
          ', and ' + mv(tot.bk, prev.bk, 'booked calls') + '. ' +
          (pl.net != null ? 'After costs, net profit was ' + C.money(pl.net) + ' (' + C.pct(C.div(pl.net, pl.revenue), 1) + ' margin).' : '');
      }
      return {
        tot: tot, prev: prev, pl: pl, plPrev: plPrev, narrative: narrative,
        series: C.series(S.days, from, to, gran, ['spend', 'cashAds', 'cashOrg', 'bkAds', 'bkOrg', 'leads'])
      };
    }
  };
})(window);
