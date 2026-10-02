/* Masterclass / webinar funnel data: weekly runs from registration to sale. Sample data only.
   One run is marked cancelled to show an honest "No data" state. */
(function (g) {
  var C = g.DemoCore, S = g.Summit;
  var r = C.rng(5150);
  var FIRST = ['Ansel', 'Brielle', 'Caspian', 'Dahlia', 'Emmerich', 'Fenella', 'Griffin', 'Helena', 'Ignatius', 'Juniper', 'Konrad', 'Linnea', 'Maddox', 'Noelle', 'Orson', 'Philippa', 'Reuben', 'Saoirse', 'Tobias', 'Ursula'];
  var LAST = ['Aldridge', 'Brightwell', 'Castellan', 'Drummond', 'Ellsworth', 'Fontaine', 'Gladstone', 'Haverford', 'Islington', 'Jessup', 'Kingsley', 'Langford', 'Merriweather', 'Northcott', 'Oakley', 'Prescott', 'Radcliffe', 'Stanhope', 'Tennant', 'Wetherby'];
  var start = C.toN('2026-04-08'), runs = [], i, k;
  for (i = 0; ; i++) {
    var n = start + i * 7;
    if (n + 6 > S.END) break;
    var run = { id: i, n: n, date: C.toISO(n), label: C.fmtDay(n, true), cancelled: i === 14 };
    if (!run.cancelled) {
      run.spend = Math.round(2200 + r() * 2400 + i * 28);
      run.registered = Math.round(run.spend / (6.5 + r() * 4.5) * 1.15);
      run.adLeads = Math.round(run.registered * (0.72 + r() * 0.12));
      run.attended = Math.round(run.registered * (0.13 + r() * 0.17));
      run.booked = Math.round(run.attended * (0.18 + r() * 0.17));
      var sales = Math.min(run.booked, Math.round(run.booked * (0.28 + r() * 0.2)));
      run.clicks = Math.round(run.spend / (0.55 + r() * 0.3));
      run.impr = Math.round(run.clicks / (0.02 + r() * 0.02));
      run.deals = []; run.rev = 0; run.cash = 0; run.cashAds = 0; run.cashOrg = 0;
      for (k = 0; k < sales; k++) {
        var prod = r.weighted(S.products), plan = r.weighted(S.plans), paid = r.chance(0.58);
        var cash = Math.round(prod.price * plan.cash);
        run.deals.push({
          date: C.toISO(n + r.int(0, 6)), name: r.pick(FIRST) + ' ' + r.pick(LAST), product: prod.name, amount: prod.price,
          cash: cash, source: paid ? 'Paid' : 'Organic', closer: r.weighted(S.reps).name
        });
        run.rev += prod.price; run.cash += cash;
        if (paid) run.cashAds += cash; else run.cashOrg += cash;
      }
      run.deals.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      run.sales = sales;
      run.showRate = C.div(run.attended, run.registered);
      run.roas = C.div(run.cashAds, run.spend);
      run.cpl = C.div(run.spend, run.adLeads);
      run.cpc = C.div(run.spend, run.clicks);
      run.ctr = C.div(run.clicks, run.impr);
    }
    runs.push(run);
  }
  g.MasterclassData = { runs: runs, latest: runs[runs.length - 1] };
})(window);
