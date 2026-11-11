/* Interactive diagrams. Plain JS, no dependencies. Everything here is illustrative:
   it explains how each system works and never shows measured or live data. */
(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  // Motion is off if the OS asks for reduced motion or the visitor pauses it with the footer toggle.
  let manualOff = false;
  try { manualOff = localStorage.getItem('motion') === 'off'; } catch (e) { /* storage unavailable */ }
  const root = document.documentElement;
  if (manualOff) root.dataset.motion = 'off';
  const reduce = () => RM.matches || manualOff;
  const bus = () => document.dispatchEvent(new Event('motionchange'));
  if (RM.addEventListener) RM.addEventListener('change', bus);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const onView = (el, cb) => {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(es => cb(es[es.length - 1].isIntersecting), { threshold: .3 }).observe(el);
  };
  const press = (btns, test) => btns.forEach(b => b.setAttribute('aria-pressed', test(b)));
  // Demos never compete with an active scroll: they pause or wait until the page has been still for a moment.
  let lastScroll = -1e9; addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true });
  const scrolling = () => performance.now() - lastScroll < 160;
  const whenIdle = cb => { const tick = () => (scrolling() ? setTimeout(tick, 120) : cb()); tick(); };

  /* ---------- XENOM: claim -> source tracing ---------- */
  (() => {
    const f = $('[data-viz=xenom]'); if (!f) return;
    const cap = $('[data-cap]', f), L = { 1: 'A', 2: 'B', 3: 'C' };
    let user = false, t, vis = false;
    const pick = (n, byUser) => {
      if (byUser) { user = true; clearInterval(t); }
      cap.parentElement.setAttribute('aria-live', byUser ? 'polite' : 'off'); // no chatter while it auto-cycles
      f.dataset.active = n;
      press($$('button[data-pick]', f), b => b.dataset.pick == n);
      cap.textContent = `Claim ${n} → Source ${L[n]}. Every insight keeps a link to the source that supports it, so a reader can check it.`;
    };
    $$('button[data-pick]', f).forEach(b => b.addEventListener('click', () => pick(b.dataset.pick, true)));
    $$('.cl', f).forEach(r => r.addEventListener('click', () => pick(r.dataset.pick, true)));
    pick(1);
    let played = false;
    const sched = () => { // the demo walks through the three claims once, then rests
      clearInterval(t); if (!vis || user || played || reduce()) return;
      played = true; let n = 0;
      t = setInterval(() => { pick(f.dataset.active % 3 + 1); if (++n >= 2) clearInterval(t); }, 3400);
    };
    onView(f, v => { vis = v; sched(); });
    document.addEventListener('motionchange', sched);
  })();

  /* ---------- Footer: pause animations ---------- */
  (() => {
    const b = $('[data-motion-toggle]'); if (!b || RM.matches) return; // the OS setting already covers it
    b.hidden = false;
    const sync = () => { b.setAttribute('aria-pressed', manualOff); b.textContent = manualOff ? 'Resume animations' : 'Pause animations'; };
    b.addEventListener('click', () => {
      manualOff = !manualOff; root.dataset.motion = manualOff ? 'off' : 'on';
      try { localStorage.setItem('motion', manualOff ? 'off' : 'on'); } catch (e) { /* storage unavailable */ }
      sync(); bus();
    });
    sync();
  })();

  /* ---------- Rooftop Rush: annotated real screenshot ---------- */
  (() => {
    const f = $('[data-viz=rooftop]'); if (!f) return;
    const tip = $('[data-tip]', f);
    const T = {
      ghost: 'Ghost Rival: your last run (8 s or longer) is saved in the browser and replayed as a translucent cyan car.',
      status: 'The HUD tells you whether you are ahead of or behind your previous run.',
      lanes: 'Three lanes. Switch with the arrow keys or A and D, or swipe on mobile. Traffic, bikes, trucks, barriers and crates fill them.',
      flight: 'Tesla flight: Space lifts the car to a 4 m hover. The meter drains while airborne and recharges on the ground.',
      nitro: 'Nitro: hold Shift to use it. Purple orbs refill the meter.',
      car: 'The 3D car model was made with Vi3W. The game code, roads, districts and effects are my own work.'
    };
    const show = k => { tip.textContent = T[k]; press($$('.hot', f), b => b.dataset.h === k); };
    $$('.hot', f).forEach(b => ['click', 'focus', 'mouseenter'].forEach(ev => b.addEventListener(ev, () => show(b.dataset.h))));
    show('ghost');
  })();

  /* ---------- Rooftop Rush: flight and landing safety ---------- */
  (() => {
    const f = $('[data-viz=flight]'); if (!f) return;
    const X = $('.fx', f), Y = $('.fy', f), sl = $('input', f), btn = $('[data-fly]', f), st = $('[data-st]', f), mt = $('.mtr i', f);
    const OB = [[170, 50], [350, 74], [520, 44]], CW = 36; // obstacles as [x, width]; car width
    const xOf = p => 20 + p * 5.4;
    let want = false, alt = 0, m = 100, pos = +sl.value, crashed = false;
    const upd = () => {
      const x = xOf(pos), over = OB.some(o => x + CW > o[0] && x < o[0] + o[1]);
      let msg;
      if (want) { alt = 1; crashed = false; msg = 'FLYING. The meter drains while you are airborne.'; }
      else if (alt && over) msg = 'HOLD. Something is below the descent path, so the car stays up until the road is clear.';
      else if (crashed || (!alt && over)) msg = 'COLLISION. On the ground you cannot pass an obstacle: fly over it.';
      else { alt = 0; msg = 'ON GROUND. The meter recharges.'; }
      X.setAttribute('transform', `translate(${x},0)`);
      Y.style.transform = `translateY(${-alt * 58}px)`;
      f.classList.toggle('crash', !alt && (crashed || over));
      btn.setAttribute('aria-pressed', want); btn.textContent = want ? 'Land (Space)' : 'Take off (Space)';
      st.textContent = msg;
    };
    // One movement path for the slider and the arrow keys. On the ground the car cannot pass an
    // obstacle: it stops at the obstacle's face and shows the collision. In the air it passes freely.
    const move = p => {
      p = Math.max(0, Math.min(100, p)); crashed = false;
      if (!alt) {
        const x0 = xOf(pos), x1 = xOf(p), e = 1e-6;
        const faces = x1 > x0
          ? OB.map(o => o[0] - CW).filter(fc => x0 <= fc + e && x1 > fc).sort((a, b) => a - b)
          : OB.map(o => o[0] + o[1]).filter(fc => x0 >= fc - e && x1 < fc).sort((a, b) => b - a);
        if (faces.length) { p = (faces[0] - 20) / 5.4; crashed = true; }
      }
      pos = p; sl.value = p; upd();
    };
    btn.addEventListener('click', () => { if (m > 0 || want) { want = !want; upd(); } });
    sl.addEventListener('input', () => move(+sl.value));
    f.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (e.target === sl) return; // the slider already handles its own arrow keys
        e.preventDefault(); move(pos + (e.key === 'ArrowRight' ? 2 : -2)); // and the page does not scroll
      } else if (e.key === ' ' && e.target === sl) { e.preventDefault(); btn.click(); } // the button handles its own Space
    });
    $('svg', f).addEventListener('click', () => btn.focus({ preventScroll: true })); // gives the arrow keys a target
    sl.setAttribute('aria-valuetext', 'position along the road');
    let iv;
    onView(f, v => { // the meter only ticks while the diagram is on screen
      clearInterval(iv);
      if (v) iv = setInterval(() => {
        m = alt ? Math.max(0, m - 2.2) : Math.min(100, m + 3);
        mt.style.width = m + '%';
        if (!m && want) { want = false; upd(); }
      }, 120);
    });
    upd();
  })();

  /* ---------- Email Triage: 200 -> 15 ---------- */
  (() => {
    const f = $('[data-viz=email]'); if (!f) return;
    const sq = $$('.o', f), sl = $('input', f), n = $('[data-n]', f), pc = $('[data-pc]', f);
    const rank = sq.map((_, i) => i).sort((a, b) => ((a * 97 + 13) % 185) - ((b * 97 + 13) % 185));
    const order = new Array(sq.length); rank.forEach((idx, r) => order[idx] = r);
    const draw = p => {
      const gone = Math.round(185 * p);
      sq.forEach((e, i) => e.classList.toggle('x', order[i] < gone));
      const calls = 200 - gone;
      n.textContent = calls; pc.textContent = calls === 15 ? '92.5%' : Math.round(gone / 2) / 1 + '%';
      sl.value = Math.round(p * 100);
      sl.setAttribute('aria-valuetext', `${calls} API calls`);
    };
    let done = false, touched = false;
    sl.addEventListener('input', () => { touched = true; draw(sl.value / 100); });
    $$('[data-set]', f).forEach(b => b.addEventListener('click', () => { touched = true; draw(+b.dataset.set); }));
    draw(1);
    onView(f, v => {
      if (!v || done || touched || reduce()) return; done = true;
      whenIdle(() => { if (touched) return;
      let s; const dur = 2200;
      let q = -1; // the grid is redrawn in ~10 coarse steps, not on every frame
      const step = ts => { if (touched) return; s = s || ts; const p = Math.min(1, (ts - s) / dur), e = p * p * (3 - 2 * p), k = Math.round(e * 10); if (k !== q) { q = k; draw(k / 10); } if (p < 1) requestAnimationFrame(step); };
      draw(0); requestAnimationFrame(step);
      });
    });
  })();

  /* ---------- LoadPulse: request flow simulation ---------- */
  (() => {
    const f = $('[data-viz=load]'); if (!f) return;
    const layer = $('.pts', f), tk = $$('.tk rect', f), hb = $$('.hb', f), pb = $('[data-pause]', f), bb = $('[data-burst]', f);
    const GATE = 228, LX = 284, LW = 236, LY = i => 52 + i * 38, BINS = 14, MAXMS = 600, MU = Math.log(120), SG = .55;
    const counts = new Array(BINS).fill(0), pool = [], load = new Array(6).fill(0);
    for (let i = 0; i < 70; i++) pool.push({ el: mk('circle', { r: 4, transform: 'translate(-20 0)', fill: '#e7e9df' }, layer), s: 'idle' });
    let litTokens = -1, tokens = 10, last = 0, acc = 0, run = true, raf = 0, vis = false, lastH = 0;
    const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    const spawn = (dx = 0) => {
      const p = pool.find(q => q.s === 'idle'); if (!p) return;
      Object.assign(p, { s: 'in', x: -dx, y: 30 + Math.random() * 232, ty: 0, lat: Math.exp(MU + SG * gauss()), life: 1, lane: 0 });
      p.el.setAttribute('fill', '#e7e9df'); p.el.setAttribute('stroke', 'none'); p.el.style.opacity = 1;
    };
    const rec = ms => { counts[Math.min(BINS - 1, Math.floor(ms / MAXMS * BINS))]++; };
    const drawHist = () => {
      const mx = Math.max(6, ...counts);
      hb.forEach((b, i) => { const h = counts[i] / mx * 96; b.setAttribute('y', 126 - h); b.setAttribute('height', h); });
    };
    const frame = ts => {
      raf = 0; if (!vis || !run) return;
      if (scrolling()) { last = ts; raf = requestAnimationFrame(frame); return; } // stay out of the way of an active scroll
      const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts;
      tokens = Math.min(10, tokens + 8 * dt); acc += dt * 9;
      while (acc >= 1) { acc -= 1; spawn(); }
      for (const p of pool) {
        if (p.s === 'idle') continue;
        if (p.s === 'in') {
          p.x += 170 * dt;
          if (p.x >= GATE) {
            if (tokens >= 1) { tokens--; p.s = 'lane'; p.lane = load.indexOf(Math.min(...load)); load[p.lane]++; p.ty = LY(p.lane) + 10; p.dur = Math.max(.5, Math.min(3, p.lat / 150)); p.t = 0; p.x = GATE; }
            else { p.s = 'rej'; p.el.setAttribute('fill', 'none'); p.el.setAttribute('stroke', '#ff4f1f'); p.el.setAttribute('stroke-width', 2); }
          }
        } else if (p.s === 'lane') {
          if (p.x < LX) p.x = Math.min(LX, p.x + 170 * dt);
          else { p.t += dt; p.x = LX + LW * Math.min(1, p.t / p.dur); if (p.t >= p.dur) { rec(p.lat); load[p.lane]--; p.s = 'idle'; p.el.setAttribute('transform', 'translate(-20 0)'); continue; } }
          p.y += (p.ty - p.y) * Math.min(1, dt * 9);
        } else if (p.s === 'rej') { p.x -= 150 * dt; p.life -= dt * 1.5; p.el.style.opacity = Math.max(0, p.life); if (p.life <= 0) { p.s = 'idle'; p.el.setAttribute('transform', 'translate(-20 0)'); continue; } }
        p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      }
      const lit = Math.ceil(tokens); if (lit !== litTokens) { litTokens = lit; tk.forEach((r, i) => r.style.opacity = i < lit ? 1 : .18); }
      if (ts - lastH > 160) { lastH = ts; drawHist(); }
      raf = requestAnimationFrame(frame);
    };
    const go = () => { if (!raf && vis && run && !reduce()) { last = 0; raf = requestAnimationFrame(frame); } };
    for (let i = 0; i < 260; i++) rec(Math.exp(MU + SG * gauss())); drawHist();
    bb.addEventListener('click', () => {
      if (reduce()) { for (let i = 0; i < 30; i++) rec(Math.exp(MU + SG * gauss())); drawHist(); return; }
      for (let i = 0; i < 30; i++) spawn(i * 6);
      if (!run) { run = true; pb.setAttribute('aria-pressed', false); pb.textContent = 'Pause'; } go();
    });
    pb.addEventListener('click', () => { run = !run; pb.setAttribute('aria-pressed', !run); pb.textContent = run ? 'Pause' : 'Resume'; go(); });
    onView(f, v => { vis = v; if (v) go(); });
    const sync = () => { pb.hidden = reduce(); if (reduce()) { cancelAnimationFrame(raf); raf = 0; } else go(); };
    document.addEventListener('motionchange', sync); sync();
  })();

  /* ---------- AgentForge: orchestration ---------- */
  (() => {
    const f = $('[data-viz=agent]'); if (!f) return;
    const cap = $('[data-cap]', f), steps = $$('[data-step]', f);
    const C = ['', 'A goal arrives at the CEO agent.', 'The CEO decomposes the goal and delegates to six specialist agents.', 'The specialists work on their sub-tasks.', 'Agents read and write shared memory in Redis and PostgreSQL.', 'Results flow into the digital-twin dashboard: MRR, revenue, burn rate and runway.'];
    let n = 0, user = false, t, vis = false;
    const set = (k, byUser) => {
      if (byUser) { user = true; clearInterval(t); }
      cap.parentElement.setAttribute('aria-live', byUser ? 'polite' : 'off'); // quiet during the auto-run
      n = k; f.dataset.s = k;
      $$('[data-s]', f).forEach(e => e.classList.toggle('on', +e.dataset.s <= k));
      press(steps, b => +b.dataset.step === k); cap.textContent = k + '. ' + C[k];
      $$('.ag', f).forEach(a => a.classList.remove('sel'));
    };
    steps.forEach(b => b.addEventListener('click', () => set(+b.dataset.step, true)));
    $$('[data-agent]', f).forEach(b => b.addEventListener('click', () => {
      user = true; clearInterval(t); set(5);
      $$('.ag', f).forEach(a => a.classList.toggle('sel', a.dataset.n === b.dataset.agent));
      press($$('[data-agent]', f), x => x === b);
      cap.textContent = `${b.dataset.agent} agent: one of the six specialists the CEO delegates to.`;
    }));
    set(5);
    let played = false;
    const sched = () => { // the five steps play once, then the diagram rests on the finished picture
      clearInterval(t); if (user) return;
      if (reduce()) { set(5); return; }
      if (!vis || played) return;
      played = true;
      whenIdle(() => {
        if (user) return; set(1);
        t = setInterval(() => { if (n >= 5) { clearInterval(t); return; } if (!scrolling()) set(n + 1); }, 1900);
      });
    };
    onView(f, v => { vis = v; sched(); });
    document.addEventListener('motionchange', sched);
  })();

  /* ---------- Projects page ---------- */
  // DermaCam: majority voting
  (() => {
    const f = $('[data-viz=derma]'); if (!f) return;
    const chips = $$('.vote', f), res = $('[data-res]', f), run = $('[data-run]', f);
    const v = [1, 1, 0, 1, 0, 1, 1];
    const tally = () => {
      const a = chips.filter(c => c.dataset.v === '1').length, winA = a >= 4; // 7 votes, so there is always a strict majority
      res.textContent = `${winA ? a : 7 - a} of 7 models agree on ${winA ? 'class A' : 'class B'}. Majority wins.`; f.dataset.win = winA ? 'A' : 'B';
    };
    chips.forEach((c, i) => { c.dataset.v = v[i]; c.textContent = v[i] ? 'A' : 'B'; c.setAttribute('aria-label', `Model ${i + 1} votes ${v[i] ? 'A' : 'B'}. Click to flip.`);
      c.addEventListener('click', () => { c.dataset.v = c.dataset.v === '1' ? '0' : '1'; c.textContent = c.dataset.v === '1' ? 'A' : 'B'; c.setAttribute('aria-label', `Model ${i + 1} votes ${c.textContent}. Click to flip.`); tally(); }); });
    run.addEventListener('click', () => {
      f.classList.remove('play'); void f.offsetWidth; if (!reduce()) f.classList.add('play'); tally();
    });
    tally();
  })();

  // LLM Gate: policy path
  (() => {
    const f = $('[data-viz=gate]'); if (!f) return;
    const nodes = $$('.gn', f), cap = $('[data-cap]', f); let tm = [];
    const clear = () => { tm.forEach(clearTimeout); tm = []; nodes.forEach(n => n.className = 'gn'); };
    const T = { ok: 'Compliant request: it passes the policy checks, the orchestrator routes it, and it reaches the model.', bad: 'Violating request: stopped at the policy checks, before it ever reaches the model.', retry: 'Upstream failure: the retry-aware orchestrator retries, then routes the request on.' };
    const go = (kind) => {
      clear(); press($$('[data-go]', f), b => b.dataset.go === kind); cap.textContent = T[kind];
      const seq = kind === 'bad' ? [0, 1] : [0, 1, 2, 3];
      seq.forEach((i, k) => { const run = () => { nodes[i].classList.add(kind === 'bad' && i === 1 ? 'blk' : 'ok'); if (kind === 'retry' && i === 2) { nodes[i].classList.add('rty'); } };
        reduce() ? run() : tm.push(setTimeout(run, k * 650)); });
    };
    $$('[data-go]', f).forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
    go('ok');
  })();

  // Nudge: many tasks -> one next action
  (() => {
    const f = $('[data-viz=nudge]'); if (!f) return; const b = $('[data-ask]', f);
    const set = on => { f.dataset.one = on; b.setAttribute('aria-pressed', on); b.textContent = on ? 'Show all the options' : 'Ask Nudge'; };
    b.addEventListener('click', () => set(f.dataset.one !== 'true')); set(false);
    onView(f, v => { if (v && !reduce()) setTimeout(() => { if (!b.dataset.t) set(true); }, 900); });
    b.addEventListener('click', () => b.dataset.t = 1);
  })();

  // H.E.R.C.S: voice in, action, voice out
  (() => {
    const f = $('[data-viz=hercs]'); if (!f) return; const b = $('[data-speak]', f), nodes = $$('.gn', f); let tm = [];
    b.addEventListener('click', () => {
      const on = f.dataset.on !== 'true'; f.dataset.on = on; b.setAttribute('aria-pressed', on); b.textContent = on ? 'Stop' : 'Speak';
      tm.forEach(clearTimeout); tm = []; nodes.forEach(n => n.className = 'gn');
      if (on) nodes.forEach((n, i) => { const r = () => n.classList.add('ok'); reduce() ? r() : tm.push(setTimeout(r, i * 700)); });
    });
  })();

  // VitalAI: streak + XP
  (() => {
    const f = $('[data-viz=vital]'); if (!f) return;
    const days = $$('.day', f), out = $('[data-out]', f), xp = $('.xp i', f), wr = $('[data-wrap]', f); let shown = false;
    const calc = () => {
      let best = 0, cur = 0, n = 0; days.forEach(d => { if (d.getAttribute('aria-pressed') === 'true') { n++; cur++; best = Math.max(best, cur); } else cur = 0; });
      out.textContent = `${n} check-ins · longest streak ${best} · ${n * 10} XP (illustrative)`; xp.style.width = Math.min(100, n * 100 / 28) + '%';
      if (shown) wr.textContent = `Health Wrapped: ${n} of 28 days checked in, longest streak ${best} days.`;
    };
    days.forEach((d, i) => { d.setAttribute('aria-pressed', [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 20].includes(i)); d.setAttribute('aria-label', `Day ${i + 1}`); d.addEventListener('click', () => { d.setAttribute('aria-pressed', d.getAttribute('aria-pressed') !== 'true'); calc(); }); });
    $('[data-recap]', f).addEventListener('click', () => { shown = true; calc(); });
    calc();
  })();
})();
