// tinyGist landing page: gossip field, Gist Lab, pillars, counters, citation helpers.
(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Importance ramp shared by the field and the lab: dim (unimportant) -> vivid tinyGist magenta.
  const RAMP = [[59, 51, 72], [135, 0, 116], [226, 91, 203], [247, 196, 236]];
  function ramp(t) {
    const x = Math.min(Math.max(t, 0), 1) * (RAMP.length - 1), i = Math.min(Math.floor(x), RAMP.length - 2), f = x - i;
    return `rgb(${RAMP[i].map((v, k) => Math.round(v + (RAMP[i + 1][k] - v) * f)).join(',')})`;
  }

  // Deterministic randomness so every visitor sees the same toy model.
  let seed = 20261026;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());

  /* ------------------------------------------------------------------ nav */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('solid', scrollY > 4);                      // opaque as soon as content can slide under it
    nav.classList.toggle('show-logo', scrollY > innerHeight * 0.45); // small logo once the hero logo is gone
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------- gossip field */
  // Chips on a jittered grid; every few frames one sends a segment to a neighbor along an arc.
  // Important segments (vivid) are sent more often than unimportant ones (dim), as in tinyGist.
  const cvs = document.getElementById('field');
  const ctx = cvs.getContext('2d');
  let chips = [], packets = [], W = 0, H = 0, dpr = 1, running = false, last = 0, acc = 0;

  function layout() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = W * dpr; cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const step = W < 600 ? 74 : 104;
    // Keep the title block and the hint clear: no chips (and so no traffic) behind text.
    const base = cvs.getBoundingClientRect();
    const zones = ['.hero-inner', '.hero-hint'].map(sel => {
      const r = document.querySelector(sel).getBoundingClientRect(), pad = 26;
      return [r.left - base.left - pad, r.top - base.top - pad, r.right - base.left + pad, r.bottom - base.top + pad];
    });
    const clear = (x, y) => !zones.some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 && y < y1);
    chips = [];
    for (let y = step / 2; y < H; y += step)
      for (let x = step / 2; x < W; x += step) {
        const c = { x: x + (rand() - .5) * step * .45, y: y + (rand() - .5) * step * .45, glow: 0, seg: Math.floor(rand() * 3) };
        if (clear(c.x, c.y)) chips.push(c);
      }
    for (const c of chips)
      c.nb = chips.filter(o => o !== c && Math.hypot(o.x - c.x, o.y - c.y) < step * 1.9);
    packets = [];
  }

  function send(from, to) {
    const r = rand(), imp = r < .5 ? 2 : r < .8 ? 1 : 0;   // probabilistic sharing
    const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2, dx = to.x - from.x, dy = to.y - from.y;
    const bend = (rand() - .5) * .8;
    packets.push({ from, to, t: 0, dur: 900 + rand() * 700, imp, cx: mx - dy * bend, cy: my + dx * bend });
  }

  function drawChip(c) {
    const s = 18, g = c.glow;
    ctx.globalAlpha = .16 + g * .84;
    ctx.strokeStyle = g > .05 ? ramp(.55 + g * .3) : '#6b5a70';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (const o of [-4, 4]) {
      ctx.moveTo(c.x + o, c.y - s / 2 - 4); ctx.lineTo(c.x + o, c.y - s / 2);
      ctx.moveTo(c.x + o, c.y + s / 2); ctx.lineTo(c.x + o, c.y + s / 2 + 4);
      ctx.moveTo(c.x - s / 2 - 4, c.y + o); ctx.lineTo(c.x - s / 2, c.y + o);
      ctx.moveTo(c.x + s / 2, c.y + o); ctx.lineTo(c.x + s / 2 + 4, c.y + o);
    }
    ctx.stroke();
    ctx.fillStyle = g > .05 ? `rgba(135,0,116,${.25 + g * .6})` : '#120d15';
    ctx.beginPath(); ctx.roundRect(c.x - s / 2, c.y - s / 2, s, s, 4); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function bez(p, t) {
    const u = 1 - t;
    return [u * u * p.from.x + 2 * u * t * p.cx + t * t * p.to.x, u * u * p.from.y + 2 * u * t * p.cy + t * t * p.to.y];
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(now - (last || now), 50); last = now;
    acc += dt;
    while (acc > 140) {                                  // a new gist every ~140 ms
      acc -= 140;
      const c = chips[Math.floor(rand() * chips.length)];
      if (c && c.nb.length) send(c, c.nb[Math.floor(rand() * c.nb.length)]);
    }
    ctx.clearRect(0, 0, W, H);
    for (const c of chips) { c.glow *= .965; drawChip(c); }
    packets = packets.filter(p => {
      p.t += dt / p.dur;
      if (p.t >= 1) { p.to.glow = 1; return false; }
      const color = ramp([.12, .45, .78][p.imp]), size = [4, 5.5, 7][p.imp];
      for (let k = 3; k >= 0; k--) {                      // short fading trail
        const [x, y] = bez(p, Math.max(p.t - k * .025, 0));
        ctx.globalAlpha = (1 - k / 4) * (p.imp === 0 ? .6 : 1);
        ctx.fillStyle = color;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      return true;
    });
    requestAnimationFrame(frame);
  }

  function start() { if (!running && !reduceMotion) { running = true; last = 0; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  layout();
  if (reduceMotion) {                                    // one calm still frame
    for (let i = 0; i < 40; i++) { const c = chips[Math.floor(rand() * chips.length)]; c.glow = .6; }
    ctx.clearRect(0, 0, W, H); chips.forEach(drawChip);
  }
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(cvs);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
  addEventListener('load', layout);   // the title block's final size is known once fonts and the logo load

  // Click: the nearest chip starts a round with all of its neighbors.
  document.querySelector('.hero').addEventListener('click', e => {
    if (e.target.closest('a, button')) return;
    const r = cvs.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null, bd = Infinity;
    for (const c of chips) { const d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = c; } }
    if (!best) return;
    best.glow = 1;
    best.nb.forEach(n => send(best, n));
    start();
  });

  /* -------------------------------------------------------------- Gist Lab */
  // Mirrors the implementation (firmware SEGMENT_COUNT / SHARE_COUNT, simulator defaults):
  // equal-size segments by |w| percentile, P(segment) = mean|w| / sum, 6 sends per round to
  // uniformly random peers, and a peer aggregates once 5 segments have arrived.
  const N = 160, SENDS_PER_ROUND = 6, AGG_THRESHOLD = 5, PEERS = 3;
  const grid = document.getElementById('labGrid');
  const bars = document.getElementById('labBars');
  const slider = document.getElementById('segSlider');
  const segOut = document.getElementById('segOut');
  let w = Array.from({ length: N }, () => Math.abs(gauss()) * (0.4 + rand()));
  let S = 3, seg = [], P = [], tally = [], auto = null, busy = false;

  const cells = Array.from({ length: N }, () => {
    const d = document.createElement('div'); d.className = 'cell'; grid.appendChild(d); return d;
  });
  const peers = Array.from({ length: PEERS }, (_, i) => {
    const el = document.createElement('div');
    el.className = 'peer';
    el.innerHTML = `<div class="chip-icon" aria-hidden="true"></div><div><span class="who">Peer ${i + 1}</span>` +
      `<div class="inbox">${'<i></i>'.repeat(AGG_THRESHOLD)}</div><span class="agg">Aggregated</span></div>`;
    document.getElementById('labPeers').appendChild(el);
    return { el, icon: el.querySelector('.chip-icon'), dots: [...el.querySelectorAll('.inbox i')], inbox: 0 };
  });
  const segColor = k => ramp(S === 1 ? 1 : 0.08 + 0.84 * k / (S - 1));

  function segment() {
    // Equal-size segments by magnitude rank: segment S-1 holds the largest |w|.
    const order = w.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    seg = new Array(N);
    order.forEach(([, i], r) => { seg[i] = Math.min(Math.floor(r * S / N), S - 1); });
    const mean = Array.from({ length: S }, (_, k) => {
      const v = w.filter((_, i) => seg[i] === k); return v.reduce((a, b) => a + b, 0) / v.length;
    });
    const sum = mean.reduce((a, b) => a + b, 0);
    P = mean.map(m => m / sum);
  }

  function render() {
    cells.forEach((c, i) => { c.style.background = segColor(seg[i]); c.style.color = segColor(seg[i]); });
    bars.innerHTML = '';
    for (let k = S - 1; k >= 0; k--) {
      const b = document.createElement('div');
      b.className = 'bar'; b.dataset.k = k;
      const label = k === S - 1 ? 'Top' : k === 0 ? 'Lowest' : `Segment ${k + 1}`;
      b.innerHTML = `<span class="name">${label}</span><span class="track"><span class="fill" style="width:${(P[k] * 100 / Math.max(...P)).toFixed(1)}%;background:${segColor(k)}"></span></span>` +
        `<span class="p" title="selection probability; times sent">${(P[k] * 100).toFixed(0)}% <small>sent ${tally[k] || 0}</small></span>`;
      bars.appendChild(b);
    }
  }

  function reset() {
    S = +slider.value; segOut.textContent = S;
    tally = new Array(S).fill(0);
    segment(); render();
    document.getElementById('statPayload').textContent = '-';
    document.getElementById('statSaving').textContent = '-';
  }

  function sendGist() {
    // Pick a segment with probability P(k) and a uniformly random peer, then fly the segment over.
    let r = Math.random(), k = 0;
    while (k < S - 1 && (r -= P[k]) > 0) k++;
    const peer = peers[Math.floor(Math.random() * PEERS)];
    tally[k]++;
    const members = cells.filter((_, i) => seg[i] === k);
    members.forEach(c => c.classList.add('pick'));
    setTimeout(() => members.forEach(c => c.classList.remove('pick')), 600);
    const bytes = members.length * 4 + N / 8 + 4, full = N * 4;   // values + bitmap + accuracy header
    document.getElementById('statPayload').textContent = `${members.length} of ${N} params`;
    document.getElementById('statSaving').textContent = `${(full / bytes).toFixed(1)}× smaller`;
    render();
    const row = bars.querySelector(`.bar[data-k="${k}"]`);
    row.classList.add('flash'); setTimeout(() => row.classList.remove('flash'), 550);

    const target = peer.icon.getBoundingClientRect();
    const tx = target.left + target.width / 2, ty = target.top + target.height / 2;
    let arrived = 0;
    const done = () => { if (++arrived === members.length) deliver(peer); };
    members.forEach((c, j) => {
      const s = c.getBoundingClientRect();
      if (reduceMotion || s.bottom < 0 || s.top > innerHeight) { done(); return; }
      const f = document.createElement('div');
      f.className = 'fly';
      Object.assign(f.style, { left: `${s.left}px`, top: `${s.top}px`, width: `${s.width}px`, height: `${s.height}px`, background: segColor(k) });
      document.body.appendChild(f);
      const dx = tx - s.left - s.width / 2, dy = ty - s.top - s.height / 2;
      f.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * .55}px, ${dy * .55 - 50}px) scale(.9)`, opacity: 1, offset: .55 },
        { transform: `translate(${dx}px, ${dy}px) scale(.4)`, opacity: .2 },
      ], { duration: 650 + Math.random() * 200, delay: j * 6, easing: 'cubic-bezier(.5,0,.4,1)', fill: 'forwards' })
        .finished.then(() => { f.remove(); done(); });
    });
  }

  const showInbox = peer => peer.dots.forEach((d, i) => d.classList.toggle('full', i < peer.inbox));

  function deliver(peer) {
    peer.inbox++;
    peer.icon.classList.add('hit'); setTimeout(() => peer.icon.classList.remove('hit'), 280);
    if (peer.inbox >= AGG_THRESHOLD) {             // threshold reached: aggregate those 5, keep any extras queued
      peer.inbox -= AGG_THRESHOLD;
      peer.el.classList.add('merged');
      clearTimeout(peer.timer);
      peer.timer = setTimeout(() => { peer.el.classList.remove('merged'); showInbox(peer); }, 1100);
    } else if (!peer.el.classList.contains('merged')) {
      showInbox(peer);
    }
  }

  function runRound() {
    if (busy) return;
    busy = true;
    for (let i = 0; i < SENDS_PER_ROUND; i++) setTimeout(sendGist, i * 320);
    setTimeout(() => { busy = false; }, SENDS_PER_ROUND * 320);
  }

  slider.addEventListener('input', reset);
  document.getElementById('sendBtn').addEventListener('click', sendGist);
  document.getElementById('roundBtn').addEventListener('click', runRound);
  document.getElementById('trainBtn').addEventListener('click', () => {
    w = w.map(v => Math.abs(v + gauss() * 0.35));   // local training changes which weights matter
    segment(); render();
  });
  const autoBtn = document.getElementById('autoBtn');
  autoBtn.addEventListener('click', () => {
    if (auto) { clearInterval(auto); auto = null; }
    else {
      // Auto: train, then run a round, repeatedly, like a device does.
      const step = () => { w = w.map(v => Math.abs(v + gauss() * 0.2)); segment(); render(); runRound(); };
      step(); auto = setInterval(step, SENDS_PER_ROUND * 320 + 900);
    }
    autoBtn.setAttribute('aria-pressed', !!auto);
  });
  reset();

  /* ---------------------------------------------------------------- pillars */
  const temple = document.getElementById('temple');
  const cards = document.querySelector('.pillar-cards');
  function focusPillar(p) {
    temple.classList.toggle('focus', p !== null);
    cards.classList.toggle('focus', p !== null);
    document.querySelectorAll('[data-p]').forEach(el => el.classList.toggle('on', p !== null && el.dataset.p === String(p)));
  }
  document.querySelectorAll('.col-hit, .pcard').forEach(el => {
    el.addEventListener('mouseenter', () => focusPillar(el.dataset.p));
    el.addEventListener('focus', () => focusPillar(el.dataset.p));
    el.addEventListener('click', () => focusPillar(el.dataset.p));
  });
  temple.addEventListener('mouseleave', () => focusPillar(null));
  cards.addEventListener('mouseleave', () => focusPillar(null));

  /* --------------------------------------------------------------- counters */
  const counted = new WeakSet();
  new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting || counted.has(e.target)) return;
    counted.add(e.target);
    e.target.querySelectorAll('[data-count]').forEach(el => {
      const to = +el.dataset.count, dec = +el.dataset.dec;
      if (reduceMotion) return;
      const t0 = performance.now();
      const tick = now => {
        const t = Math.min((now - t0) / 1200, 1), v = to * (1 - Math.pow(1 - t, 3));
        el.textContent = v.toFixed(dec);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }), { threshold: .5 }).observe(document.querySelector('.stats'));

  /* ------------------------------------------------------- copy, tabs, strip */
  document.querySelectorAll('.copy').forEach(btn => btn.addEventListener('click', async () => {
    const text = document.getElementById(btn.dataset.copy).innerText;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    btn.textContent = 'Copied'; btn.classList.add('ok');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1600);
  }));

  document.querySelectorAll('.tabs button').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b === t));
    document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== t.dataset.tab; });
  }));

  // Footer: a model's worth of parameters, colored by importance.
  const strip = document.querySelector('.strip');
  for (let i = 0; i < 96; i++) {
    const s = document.createElement('i');
    s.style.background = ramp(Math.pow(rand(), 1.6));
    strip.appendChild(s);
  }
})();
