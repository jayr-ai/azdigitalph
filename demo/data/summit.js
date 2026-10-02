/* Master dataset for the fictional brand "Summit Growth Academy" (sample data only).
   Every figure is generated from a fixed seed. Consistency rules built in:
   leads <= link clicks, bookings <= leads is not required (organic adds bookings), held <= booked,
   won <= held, cash <= revenue. */
(function (g) {
  var C = g.DemoCore;
  var START = C.toN('2025-10-01'), END = C.toN('2026-09-30');
  var r = C.rng(20261002);

  var REPS = [
    { id: 0, name: 'Marcus Delaney', w: 1.3, skill: 1.15, target: 62000 },
    { id: 1, name: 'Priya Anand', w: 1.1, skill: 1.0, target: 55000 },
    { id: 2, name: 'Tomas Reyes', w: 1.0, skill: 0.9, target: 50000 },
    { id: 3, name: 'Hannah Whitlock', w: 0.9, skill: 1.05, target: 48000 },
    { id: 4, name: 'Jordan Okafor', w: 0.7, skill: 0.8, target: 40000 }
  ];
  var PRODUCTS = [
    { name: 'Summit Starter', price: 2497, w: 0.25 },
    { name: 'Summit Core', price: 4997, w: 0.40 },
    { name: 'Summit Pro', price: 7497, w: 0.25 },
    { name: 'Summit Elite', price: 9997, w: 0.10 }
  ];
  var PLANS = [
    { name: 'Paid in full', cash: 1, w: 0.40 },
    { name: '3-month plan', cash: 1 / 3, w: 0.35 },
    { name: 'Deposit + plan', cash: 0.3, w: 0.25 }
  ];
  var FIRST = ['Adrian', 'Beatrix', 'Callum', 'Delphine', 'Elias', 'Freya', 'Gideon', 'Harriet', 'Idris', 'Jocelyn', 'Kieran', 'Lorna', 'Mateo', 'Nadia', 'Oscar', 'Paloma', 'Quentin', 'Rhea', 'Soren', 'Talia', 'Ulrich', 'Vivian', 'Wesley', 'Xanthe', 'Yusuf', 'Zelda', 'Bram', 'Colette', 'Dario', 'Esme'];
  var LAST = ['Ashworth', 'Beaumont', 'Calloway', 'Dunmore', 'Eastwood', 'Fairbairn', 'Garrity', 'Hollis', 'Ingram', 'Jernigan', 'Kessler', 'Lockhart', 'Marlowe', 'Nightingale', 'Ostrander', 'Pemberton', 'Quigley', 'Rutherford', 'Sinclair', 'Thackeray', 'Underhill', 'Valdez', 'Whitcombe', 'Yarrow', 'Zimmer', 'Abernathy', 'Bellamy', 'Corrigan', 'Dalton', 'Everhart'];

  var days = [], tx = [], i, d;
  var N = END - START + 1;
  for (i = 0; i < N; i++) {
    var n = START + i, dw = C.dow(n);
    var t = i / N;
    var growth = 0.78 + 0.5 * t;
    var dowF = dw >= 5 ? 0.7 : (dw === 0 ? 1.05 : 1.0);
    var noise = 0.86 + r() * 0.28;
    var spend = Math.round(440 * growth * dowF * noise * 100) / 100;
    var cpm = 19 + r() * 5;
    var impr = Math.round(spend / cpm * 1000);
    var reach = Math.round(impr / (1.25 + r() * 0.4));
    var clicks = Math.round(impr * (0.017 + r() * 0.007));
    var leads = Math.round(clicks * (0.055 + r() * 0.03));
    var bkAds = Math.round(leads * (0.075 + r() * 0.04));
    var bkOrg = Math.round(bkAds * (0.35 + r() * 0.3));
    var row = {
      n: n, date: C.toISO(n), spend: spend, impr: impr, reach: reach, clicks: clicks, leads: leads,
      bkAds: bkAds, bkOrg: bkOrg, heldAds: 0, heldOrg: 0, wonAds: 0, wonOrg: 0,
      revAds: 0, revOrg: 0, cashAds: 0, cashOrg: 0, rep: []
    };
    for (var q = 0; q < REPS.length; q++) row.rep.push({ bk: 0, held: 0, won: 0, rev: 0, cash: 0 });
    for (var src = 0; src < 2; src++) {
      var cnt = src === 0 ? bkAds : bkOrg, tag = src === 0 ? 'Ads' : 'Org';
      for (var a = 0; a < cnt; a++) {
        var rep = r.weighted(REPS);
        var rr = row.rep[rep.id];
        rr.bk++;
        if (!r.chance(0.6 + 0.08 * rep.skill)) continue;
        rr.held++; row['held' + tag]++;
        if (!r.chance(0.26 * rep.skill)) continue;
        var prod = r.weighted(PRODUCTS), plan = r.weighted(PLANS);
        var cash = Math.round(prod.price * plan.cash);
        rr.won++; rr.rev += prod.price; rr.cash += cash;
        row['won' + tag]++; row['rev' + tag] += prod.price; row['cash' + tag] += cash;
        tx.push({
          n: n, date: row.date, name: r.pick(FIRST) + ' ' + r.pick(LAST), product: prod.name, plan: plan.name,
          amount: prod.price, cash: cash, source: src === 0 ? 'Paid' : 'Organic', rep: rep.id
        });
      }
    }
    days.push(row);
  }

  g.Summit = {
    START: START, END: END, days: days, tx: tx, reps: REPS, products: PRODUCTS, plans: PLANS,
    keys: ['spend', 'impr', 'reach', 'clicks', 'leads', 'bkAds', 'bkOrg', 'heldAds', 'heldOrg', 'wonAds', 'wonOrg', 'revAds', 'revOrg', 'cashAds', 'cashOrg'],
    /* Totals with the derived metrics every dashboard needs. */
    totals: function (from, to) {
      var s = C.sum(days, from, to, g.Summit.keys);
      s.bk = s.bkAds + s.bkOrg; s.held = s.heldAds + s.heldOrg; s.won = s.wonAds + s.wonOrg;
      s.rev = s.revAds + s.revOrg; s.cash = s.cashAds + s.cashOrg;
      s.ctr = C.div(s.clicks, s.impr); s.ctl = C.div(s.leads, s.clicks); s.l2b = C.div(s.bkAds, s.leads);
      s.cpm = C.div(s.spend, s.impr) == null ? null : C.div(s.spend, s.impr) * 1000;
      s.cpl = C.div(s.spend, s.leads); s.cpb = C.div(s.spend, s.bkAds); s.cps = C.div(s.spend, s.wonAds);
      s.roas = C.div(s.cashAds, s.spend);
      s.show = C.div(s.held, s.bk); s.close = C.div(s.won, s.held);
      return s;
    },
    txIn: function (from, to) { return tx.filter(function (x) { return x.n >= from && x.n <= to; }); }
  };
})(window);
