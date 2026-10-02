/* Assessment / lead quiz data: starts, completions, score distribution and conversions.
   The quiz launched on 2 March 2026; earlier dates are "No data", never zero. Sample data only. */
(function (g) {
  var C = g.DemoCore, S = g.Summit;
  var r = C.rng(31415);
  var LAUNCH = C.toN('2026-03-02');
  var BIN = ['0-20', '21-40', '41-60', '61-80', '81-100'];
  var W = [0.12, 0.24, 0.30, 0.22, 0.12], PB = [0.012, 0.027, 0.048, 0.075, 0.105], PS = [0.10, 0.15, 0.20, 0.25, 0.30];
  var MID = [10, 30, 50, 70, 90];
  var rows = null, i, b;
  function build() {
  rows = [];
  S.days.forEach(function (d, idx) {
    var row = { n: d.n, live: d.n >= LAUNCH ? 1 : 0, starts: 0, comps: 0, scoreSum: 0 };
    for (b = 0; b < 5; b++) { row['c' + b] = 0; row['b' + b] = 0; row['w' + b] = 0; }
    if (row.live) {
      var dw = C.dow(d.n), growth = 0.8 + 0.4 * ((d.n - LAUNCH) / (S.END - LAUNCH));
      row.starts = Math.round((20 + r() * 16) * growth * (dw >= 5 ? 0.75 : 1));
      row.comps = Math.round(row.starts * (0.55 + r() * 0.15));
      for (i = 0; i < row.comps; i++) {
        var x = r(), acc = 0, bin = 4;
        for (b = 0; b < 5; b++) { acc += W[b]; if (x <= acc) { bin = b; break; } }
        row['c' + bin]++;
        row.scoreSum += MID[bin] + (r() - 0.5) * 18;
        if (r() < PB[bin]) { row['b' + bin]++; if (r() < PS[bin]) row['w' + bin]++; }
      }
    }
    rows.push(row);
  });
  }
  var KEYS = ['live', 'starts', 'comps', 'scoreSum'];
  for (b = 0; b < 5; b++) KEYS.push('c' + b, 'b' + b, 'w' + b);
  function tot(from, to) {
    if (!rows) build();
    var s = C.sum(rows, from, to, KEYS);
    s.booked = 0; s.sales = 0;
    for (b = 0; b < 5; b++) { s.booked += s['b' + b]; s.sales += s['w' + b]; }
    s.rate = C.div(s.comps, s.starts); s.avgScore = C.div(s.scoreSum, s.comps);
    s.toBook = C.div(s.booked, s.comps); s.toSale = C.div(s.sales, s.comps);
    return s;
  }
  g.AssessmentData = {
    LAUNCH: LAUNCH, BIN: BIN,
    query: function (from, to, gran) {
      var pr = C.prevRange(from, to);
      return {
        tot: tot(from, to), prev: tot(pr.from, pr.to),
        series: (rows || build(), C.series(rows, from, to, gran, KEYS))
      };
    }
  };
})(window);
