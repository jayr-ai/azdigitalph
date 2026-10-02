/* CEO dashboard data for the fictional brand "Harbor & Pine Co.": multi-channel sales, Meta Ads,
   shipping, sales by category and catalog usage. Sample data only. */
(function (g) {
  var C = g.DemoCore, S = g.Summit;
  var r = C.rng(8800);
  var CATS = ['Camp Cookware', 'Rain Shells', 'Trail Packs', 'Hydration', 'Lanterns & Lighting', 'Accessories'];
  var CW = [0.24, 0.22, 0.2, 0.14, 0.12, 0.08];
  var ZONES = [0.04, 0.07, 0.13, 0.33, 0.1, 0.33];
  var ITEMS = [
    { sku: 'HP-1041', name: 'Cast iron skillet, 10 inch', w: 0.16 }, { sku: 'HP-2210', name: 'Storm shell jacket', w: 0.15 },
    { sku: 'HP-3305', name: 'Trail pack 28L', w: 0.14 }, { sku: 'HP-4120', name: 'Insulated bottle 32oz', w: 0.13 },
    { sku: 'HP-5016', name: 'Rechargeable lantern', w: 0.11 }, { sku: 'HP-1108', name: 'Stackable mug set', w: 0.1 },
    { sku: 'HP-6002', name: 'Microfibre towel', w: 0.07 }, { sku: 'HP-2301', name: 'Rain pants', w: 0.07 }, { sku: 'HP-6120', name: 'Carabiner kit', w: 0.07 }
  ];
  var KEYS = ['shop', 'amz', 'wmt', 'shopOrd', 'amzOrd', 'wmtOrd', 'adSpend', 'adPV', 'adPurch', 'adImpr', 'adClicks', 'ship', 'shipCost', 'express',
    'z0', 'z1', 'z2', 'z3', 'z4', 'z5', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
  var rows = S.days.map(function (d, i) {
    var t = i / S.days.length, dw = C.dow(d.n);
    var season = 1 + 0.18 * Math.sin((d.n - S.START) / 365 * 2 * Math.PI + 2.2);
    var f = (0.85 + 0.35 * t) * season * (dw >= 5 ? 0.8 : 1) * (0.88 + r() * 0.24);
    var o = { n: d.n };
    o.shop = Math.round(3900 * f * 100) / 100;
    o.amz = Math.round(o.shop * (0.12 + r() * 0.04) * 100) / 100;
    o.wmt = r() < 0.12 ? 0 : Math.round(o.shop * (0.004 + r() * 0.008) * 100) / 100;
    var aov = 74 + r() * 16;
    o.shopOrd = Math.round(o.shop / aov); o.amzOrd = Math.round(o.amz / (aov * 0.9)); o.wmtOrd = o.wmt ? Math.max(1, Math.round(o.wmt / (aov * 0.85))) : 0;
    o.adSpend = Math.round(o.shop * (0.05 + r() * 0.02) * 100) / 100;
    o.adPV = Math.round(o.adSpend * (2.6 + r() * 0.9) * 100) / 100;
    o.adPurch = Math.round(o.adPV / aov);
    o.adClicks = Math.round(o.adSpend / (0.7 + r() * 0.25));
    o.adImpr = Math.round(o.adClicks / (0.013 + r() * 0.007));
    o.ship = Math.round((o.shopOrd + o.wmtOrd) * 0.97);
    o.shipCost = Math.round(o.ship * (7.4 + r() * 1.4) * 100) / 100;
    o.express = Math.round(o.ship * (0.15 + r() * 0.06));
    var k;
    for (k = 0; k < 6; k++) { o['z' + k] = Math.round(o.ship * ZONES[k] * (0.85 + r() * 0.3)); }
    var tot = o.shop + o.amz + o.wmt, ws = [], sw = 0;
    for (k = 0; k < 6; k++) { ws[k] = CW[k] * (0.85 + r() * 0.3); sw += ws[k]; }
    for (k = 0; k < 6; k++) o['c' + k] = Math.round(tot * ws[k] / sw * 100) / 100;
    return o;
  });
  g.CeoData = {
    CATS: CATS,
    query: function (from, to, gran) {
      var pr = C.prevRange(from, to);
      function t(a, b) {
        var s = C.sum(rows, a, b, KEYS);
        s.total = s.shop + s.amz + s.wmt; s.orders = s.shopOrd + s.amzOrd + s.wmtOrd;
        s.roas = C.div(s.adPV, s.adSpend); s.cpa = C.div(s.adSpend, s.adPurch);
        s.avgShip = C.div(s.shipCost, s.ship); s.expressShare = C.div(s.express, s.ship);
        s.aov = C.div(s.total, s.orders);
        return s;
      }
      var cur = t(from, to), prev = t(pr.from, pr.to);
      var sg = (to - from + 1) > 75 ? 'week' : 'day';
      var spark = C.series(rows, from, to, sg, ['shop', 'amz', 'wmt']);
      var items = ITEMS.map(function (it, i) {
        var jitter = 0.9 + ((i * 37) % 21) / 100;
        return { sku: it.sku, name: it.name, units: Math.round(cur.orders * 1.6 * it.w * jitter) };
      });
      var itemTotal = items.reduce(function (a, b) { return a + b.units; }, 0);
      items.forEach(function (x) { x.share = C.div(x.units, itemTotal); });
      items.sort(function (a, b) { return b.units - a.units; });
      return {
        cur: cur, prev: prev, spark: spark, items: items,
        series: C.series(rows, from, to, gran, ['shop', 'amz', 'wmt', 'adSpend', 'adPV']),
        cats: CATS.map(function (name, k) { return { name: name, sales: cur['c' + k], prev: prev['c' + k] }; }),
        zones: [2, 3, 4, 5, 6, 7].map(function (z, k) { return { zone: 'Zone ' + z, shipments: cur['z' + k] }; })
      };
    }
  };
})(window);
