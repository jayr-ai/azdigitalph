/* Meta Ads audit report data for a fictional account (Summit Growth Academy). Sample data only.
   Four reporting windows relative to the last day of sample data. Breakdown tables are generated so
   that spend, impressions and clicks reconcile to the account total. */
(function (g) {
  var C = g.DemoCore, S = g.Summit;
  var END = S.END;
  var mStart = C.bucketStart(END, 'month');
  var WINDOWS = {
    lastWeek: { label: 'Last Week', from: C.weekStart(END) - 7, to: C.weekStart(END) - 1, settled: true, seed: 11 },
    thisWeek: { label: 'This Week', from: C.weekStart(END), to: END, settled: false, seed: 12 },
    thisMonth: { label: 'This Month', from: mStart, to: END, settled: false, seed: 13 },
    lastMonth: { label: 'Last Month', from: C.bucketStart(mStart - 1, 'month'), to: mStart - 1, settled: true, seed: 14 }
  };

  /* Split account totals across rows. Row = {label, sw: spend weight, cm: cost-per-mille factor, cf: ctr factor}. */
  function breakdown(tot, rows, r) {
    var sw = 0, wi = 0, wc = 0;
    rows.forEach(function (x) { x.sw *= 0.9 + r() * 0.2; sw += x.sw; });
    rows.forEach(function (x) { x.spend = tot.spend * x.sw / sw; wi += x.spend / x.cm; });
    rows.forEach(function (x) { x.impr = tot.impr * (x.spend / x.cm) / wi; wc += x.impr * x.cf; });
    rows.forEach(function (x) {
      x.clicks = tot.clicks * (x.impr * x.cf) / wc;
      x.ctr = C.div(x.clicks, x.impr); x.cpc = C.div(x.spend, x.clicks); x.cpm = C.div(x.spend, x.impr) * 1000;
      x.leads = Math.round(x.clicks * tot.ctl * (0.85 + r() * 0.3));
      x.cpl = C.div(x.spend, x.leads);
    });
    return rows;
  }
  function mk(label, sw, cm, cf) { return { label: label, sw: sw, cm: cm, cf: cf }; }

  g.AuditData = {
    WINDOWS: WINDOWS,
    query: function (key) {
      var w = WINDOWS[key], r = C.rng(900 + w.seed);
      var tot = S.totals(w.from, w.to), pr = C.prevRange(w.from, w.to), prev = S.totals(pr.from, pr.to);
      var camps = breakdown(tot, [
        mk('Leads - Free Training Webinar', 0.26, 1, 1.05), mk('Leads - 90-Day Blueprint Guide', 0.19, 0.95, 1.1),
        mk('Retargeting - Video Viewers 30d', 0.13, 0.8, 1.35), mk('Retargeting - Site Visitors 14d', 0.1, 0.85, 1.25),
        mk('Leads - Quiz Funnel', 0.09, 1.05, 1.0), mk('Lookalike - Past Clients 1%', 0.08, 1.15, 0.9),
        mk('Leads - Case Study Carousel', 0.06, 1.1, 0.8), mk('All other campaigns', 0.09, 1.2, 0.7)
      ], r);
      var ads = breakdown(tot, [
        mk('Founder story, 60s video', 0.22, 1.0, 1.1), mk('Client result carousel', 0.17, 0.95, 1.05), mk('Free training, static', 0.14, 1.0, 0.95),
        mk('Quiz: What is your growth score?', 0.12, 1.05, 1.0), mk('Webinar replay, 30s cut', 0.1, 0.9, 1.2), mk('Testimonial montage', 0.09, 1.1, 0.9),
        mk('Checklist PDF, static', 0.08, 1.15, 0.85), mk('Behind the scenes, UGC', 0.08, 1.0, 1.0)
      ], r);
      var platforms = breakdown(tot, [mk('Facebook', 0.62, 0.95, 0.95), mk('Instagram', 0.33, 1.15, 1.05), mk('Audience Network', 0.03, 0.35, 1.6), mk('Messenger', 0.02, 0.9, 0.7)], r);
      var positions = breakdown(tot, [mk('Facebook Feed', 0.4, 1, 1), mk('Instagram Feed', 0.17, 1.1, 1), mk('Instagram Stories', 0.12, 1.15, 1.2), mk('Facebook Reels', 0.1, 0.9, 1.1),
        mk('Instagram Reels', 0.09, 1.05, 1.1), mk('Facebook Stories', 0.05, 0.95, 1.3), mk('Right column', 0.03, 1.6, 0.1), mk('Marketplace', 0.02, 0.8, 0.4), mk('Instream video', 0.02, 0.5, 1.2)], r);
      var devices = breakdown(tot, [mk('iPhone', 0.44, 1.1, 1.0), mk('Android smartphone', 0.36, 0.85, 1.1), mk('Desktop', 0.14, 1.3, 0.3), mk('iPad', 0.04, 1.2, 0.9), mk('Android tablet', 0.02, 0.8, 0.8)], r);
      var ages = breakdown(tot, [mk('18-24', 0.04, 0.9, 0.8), mk('25-34', 0.19, 1, 0.9), mk('35-44', 0.31, 1.05, 1.0), mk('45-54', 0.27, 1.0, 1.15), mk('55-64', 0.15, 0.95, 1.1), mk('65+', 0.04, 0.9, 1.2)], r);
      var genders = breakdown(tot, [mk('Male', 0.52, 1.0, 0.95), mk('Female', 0.48, 1.0, 1.08)], r);
      var stateW = [0.14, 0.11, 0.1, 0.08, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.4];
      var states = breakdown(tot, ['California', 'Texas', 'Florida', 'New York', 'Georgia', 'Arizona', 'Colorado', 'Washington', 'Illinois', 'Ohio', 'Other states'].map(function (s, i) {
        return mk(s, stateW[i], 1 + (i % 4) * 0.05, 1 + ((i * 3) % 5) * 0.04);
      }), r);
      var hours = [];
      for (var h = 0; h < 24; h++) {
        var sw = 0.4 + 1.1 * Math.max(0, Math.sin((h - 4) / 20 * Math.PI)) + (h >= 19 && h <= 23 ? 0.35 : 0);
        hours.push(mk((h < 10 ? '0' : '') + h + ':00', sw, 1.35 - 0.5 * Math.max(0, Math.sin((h - 15) / 9 * Math.PI)) + (h < 5 ? -0.15 : 0), 0.8 + 0.35 * Math.max(0, Math.sin((h - 17) / 8 * Math.PI))));
      }
      hours = breakdown(tot, hours, r);
      var fatigue = [
        { ad: ads[0].label, ctr: ads[0].ctr, prevCtr: ads[0].ctr * 1.26, freq: 2.9, signal: 'Refresh candidate' },
        { ad: ads[1].label, ctr: ads[1].ctr, prevCtr: ads[1].ctr * 1.08, freq: 2.1, signal: 'Watch' },
        { ad: ads[4].label, ctr: ads[4].ctr, prevCtr: ads[4].ctr * 0.99, freq: 1.5, signal: 'Stable' }
      ];
      return { w: w, tot: tot, prev: prev, camps: camps, ads: ads, platforms: platforms, positions: positions, devices: devices, ages: ages, genders: genders, states: states, hours: hours, fatigue: fatigue };
    }
  };
})(window);
