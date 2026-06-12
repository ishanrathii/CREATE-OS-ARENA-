/* CreateOS Arena — frontend logic
 * Static SPA. Stores predictions, login, favourite team in localStorage.
 * Replace mock data sources with real APIs when wiring backend.
 */

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const STORAGE_KEY = 'coa_state_v1';

  // ---------- mock data ----------
  const TEAMS = [
    { c: 'Brazil', f: '🇧🇷' }, { c: 'Argentina', f: '🇦🇷' }, { c: 'France', f: '🇫🇷' },
    { c: 'Germany', f: '🇩🇪' }, { c: 'England', f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, { c: 'Spain', f: '🇪🇸' },
    { c: 'Portugal', f: '🇵🇹' }, { c: 'Netherlands', f: '🇳🇱' }, { c: 'Italy', f: '🇮🇹' },
    { c: 'Belgium', f: '🇧🇪' }, { c: 'Croatia', f: '🇭🇷' }, { c: 'Uruguay', f: '🇺🇾' },
    { c: 'Mexico', f: '🇲🇽' }, { c: 'USA', f: '🇺🇸' }, { c: 'Japan', f: '🇯🇵' },
    { c: 'Korea', f: '🇰🇷' }, { c: 'Senegal', f: '🇸🇳' }, { c: 'Cameroon', f: '🇨🇲' },
    { c: 'Morocco', f: '🇲🇦' }, { c: 'Poland', f: '🇵🇱' }, { c: 'Australia', f: '🇦🇺' },
    { c: 'Canada', f: '🇨🇦' }, { c: 'Saudi Arabia', f: '🇸🇦' }, { c: 'India', f: '🇮🇳' },
  ];

  const today = new Date();
  const fmtTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST';
  const at = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d; };

  // Matches for today
  const MATCHES = [
    {
      id: 'm1', group: 'B', venue: 'MetLife Stadium',
      kickoff: at(18, 0),
      home: { c: 'Brazil', f: '🇧🇷' }, away: { c: 'Cameroon', f: '🇨🇲' },
      favSide: 'home', status: 'open',
    },
    {
      id: 'm2', group: 'D', venue: 'Estadio Azteca',
      kickoff: at(21, 30),
      home: { c: 'France', f: '🇫🇷' }, away: { c: 'Poland', f: '🇵🇱' },
      favSide: 'home', status: 'open',
      lineup: 'Lineups dropping ~1 hr before kickoff.',
    },
    {
      id: 'm3', group: 'A', venue: 'Toronto BMO',
      kickoff: at(0, 30),
      home: { c: 'Argentina', f: '🇦🇷' }, away: { c: 'Mexico', f: '🇲🇽' },
      favSide: 'home', status: 'live', minute: 67, score: { h: 2, a: 0 },
      lineup: 'Argentina XI: Martinez · Molina, Romero, Otamendi, Tagliafico · De Paul, Paredes, Mac Allister · Messi, Alvarez, Di Maria',
    },
  ];

  const LEADERBOARD = [
    { name: 'Rahul K.',  pts: 61, streak: 5, acc: 71 },
    { name: 'Priya S.',  pts: 58, streak: 3, acc: 68 },
    { name: 'Arjun M.',  pts: 55, streak: 4, acc: 65 },
    { name: 'Neha K.',   pts: 49, streak: 2, acc: 62 },
    { name: 'Vikram R.', pts: 46, streak: 6, acc: 60 },
    { name: 'Sameer J.', pts: 42, streak: 1, acc: 58 },
    { name: 'Ananya T.', pts: 41, streak: 2, acc: 57 },
    { name: 'Karan P.',  pts: 39, streak: 1, acc: 55 },
    { name: 'Riya M.',   pts: 37, streak: 3, acc: 56 },
    { name: 'Aditya G.', pts: 36, streak: 2, acc: 54 },
  ];

  const BREAKDOWN = [
    { match: 'BRA vs SRB', pick: 'BRA wins', result: '2-0 BRA', type: 'fav', pts: 1 },
    { match: 'GER vs JPN', pick: 'Draw',      result: '1-1',     type: 'draw', pts: 2 },
    { match: 'ENG vs USA', pick: 'USA wins',  result: '1-0 USA', type: 'under', pts: 3 },
    { match: 'FRA vs DEN', pick: 'FRA wins',  result: '2-1 FRA', type: 'fav', pts: 1 },
    { match: 'ARG vs KSA', pick: 'ARG wins',  result: '1-2 KSA', type: 'under', pts: 0 },
    { match: 'POR vs URU', pick: 'POR wins',  result: '2-0 POR', type: 'fav', pts: 1 },
    { match: 'ESP vs MAR', pick: 'Draw',      result: '0-0',     type: 'draw', pts: 2 },
    { match: 'NED vs ECU', pick: 'NED wins',  result: '1-1',     type: 'fav', pts: 0 },
    { match: 'BEL vs CRO', pick: 'CRO wins',  result: '0-1 CRO', type: 'under', pts: 3 },
    { match: 'MEX vs CAN', pick: 'MEX wins',  result: '2-0 MEX', type: 'fav', pts: 1 },
    { match: 'SEN vs ITA', pick: 'SEN wins',  result: '2-1 SEN', type: 'under', pts: 3 },
    { match: 'ARG vs MEX', pick: 'ARG wins',  result: 'PENDING', type: 'fav', pts: null },
  ];

  const NEWS = {
    Brazil: [ '🇧🇷 Vinicius Jr returns from suspension — expected to start.', '🇧🇷 Last match: BRA 2-0 SRB · MOTM Casemiro.', '🇧🇷 Training session moved to evening due to heat.' ],
    Argentina: [ '🇦🇷 Messi confirmed fit for the Mexico clash.', '🇦🇷 Argentina XI shape: 4-3-3, Di Maria on the right.', '🇦🇷 Tactical preview: high press in the first 20 minutes.' ],
    France: [ '🇫🇷 Mbappé hat-trick vs Denmark in the warm-up.', '🇫🇷 Lineup leak: Tchouaméni starts at the base.', '🇫🇷 Camavinga ruled in after a minor knock.' ],
  };

  // ---------- state ----------
  const defaultState = {
    user: null,            // { name, email, picture, initials }
    favTeam: null,         // 'Brazil' etc.
    predictions: {},       // matchId -> 'home' | 'draw' | 'away'
    streakDays: 4,
    points: 34,
    rank: 47,
    accuracy: 64,
    totalUsers: 512,
    lbView: 'all',
  };
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      return { ...defaultState, ...JSON.parse(raw) };
    } catch (e) { return { ...defaultState }; }
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  // ---------- header ----------
  function renderHeader() {
    $('#streakDays').textContent = state.streakDays;
    $('#streakHeadDays').textContent = Math.max(state.streakDays + 1, 5);
    $('#avatarInitials').textContent = state.user ? state.user.initials : 'ZT';
  }

  // ---------- countdown (always running) ----------
  function tickCountdown() {
    // pick a rolling target 14 days out, refreshes every 14 days so it never ends.
    const now = Date.now();
    const cycle = 14 * 24 * 60 * 60 * 1000;
    const target = Math.ceil(now / cycle) * cycle;
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000); diff %= 60000;
    const s = Math.floor(diff / 1000);
    const txt = `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const el = $('#regCountdown'); if (el) el.textContent = txt;
  }

  // ---------- matches ----------
  function lockLabel(m) {
    if (m.status === 'live') return { cls: 'live', txt: `LIVE ${m.minute}'` };
    if (m.status === 'locked') return { cls: 'lock', txt: '🔒 Locked' };
    const diff = m.kickoff.getTime() - Date.now();
    if (diff <= 0) return { cls: 'lock', txt: '🔒 Locked' };
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return { cls: 'lock-soon', txt: `⏱ Locks in ${mins}m` };
    const h = Math.floor(mins / 60), rest = mins % 60;
    return { cls: '', txt: `Locks in ${h}h ${rest}m` };
  }

  function renderMatches() {
    const list = $('#matchList'); list.innerHTML = '';
    MATCHES.forEach((m) => {
      const ll = lockLabel(m);
      const pick = state.predictions[m.id];
      const isLive = m.status === 'live';
      const isLocked = m.status === 'locked' || isLive;
      const home = m.home, away = m.away;
      const favSide = m.favSide; // 'home' | 'away'
      const card = document.createElement('div');
      card.className = `match ${isLive ? 'live' : ''} ${isLocked ? 'locked' : ''} ${pick ? 'selected' : ''}`.trim();
      const liveHeader = isLive
        ? `<div class="muted">🔒 Match in progress · Your pick: ${pick ? labelFor(m, pick) : '—'} · Result pending</div>`
        : '';
      card.innerHTML = `
        ${liveHeader ? `<div class="live-banner">${liveHeader}</div>` : ''}
        <div class="match-head">
          <span>⏰ ${fmtTime(m.kickoff)} · Group ${m.group} · ${m.venue}</span>
          <span class="right ${ll.cls}">${ll.txt}</span>
        </div>
        <div class="match-body">
          <div class="team">
            <div class="flag">${home.f}</div>
            <div class="name">${home.c}</div>
            <div class="role ${favSide === 'home' ? 'fav' : 'under'}">${favSide === 'home' ? 'Favourite' : 'Underdog'}</div>
          </div>
          <div class="vs-circle ${isLive ? 'score' : ''}">${isLive ? `${m.score.h}-${m.score.a}` : 'vs'}</div>
          <div class="team">
            <div class="flag">${away.f}</div>
            <div class="name">${away.c}</div>
            <div class="role ${favSide === 'away' ? 'fav' : 'under'}">${favSide === 'away' ? 'Favourite' : 'Underdog'}</div>
          </div>
        </div>
        <div class="pick-row">
          ${pickBtn(m, 'home', pick, isLocked)}
          ${pickBtn(m, 'draw', pick, isLocked)}
          ${pickBtn(m, 'away', pick, isLocked)}
        </div>
        ${m.lineup && !isLocked ? `<div class="lineup">📋 <b>Lineups</b>: ${m.lineup}</div>` : ''}
        ${m.lineup && isLive ? `<div class="lineup">📋 <b>Confirmed XI</b>: ${m.lineup}</div>` : ''}
      `;
      list.appendChild(card);
    });

    $$('.pick').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const mid = btn.dataset.match; const side = btn.dataset.side;
        state.predictions[mid] = side; save();
        const m = MATCHES.find((x) => x.id === mid);
        toast(`Locked in: ${labelFor(m, side)}`);
        renderMatches(); renderStats();
      });
    });
  }

  function labelFor(m, side) {
    if (side === 'draw') return 'Draw';
    return `${(side === 'home' ? m.home : m.away).c} wins`;
  }

  function pickBtn(m, side, picked, disabled) {
    const isFav = m.favSide === side;
    const isDraw = side === 'draw';
    const pts = isDraw ? 2 : (isFav ? 1 : 3);
    const top = side === 'home' ? `${m.home.c} wins` : side === 'away' ? `${m.away.c} wins` : 'Draw';
    const tag = isDraw ? 'Neutral' : isFav ? 'Favourite' : 'Underdog';
    const sel = picked === side ? 'picked' : '';
    return `<button class="pick ${sel}" data-match="${m.id}" data-side="${side}" ${disabled ? 'disabled' : ''}>
      <div class="top">${top}</div>
      <div class="mid">${pts} pt${pts > 1 ? 's' : ''}</div>
      <div class="bot">${tag}</div>
    </button>`;
  }

  // ---------- stats ----------
  function renderStats() {
    const predCount = Object.keys(state.predictions).length;
    const total = 12;
    $('#statPoints').textContent = state.points;
    $('#statRank').textContent = state.rank;
    $('#statTotal').textContent = state.totalUsers;
    $('#statPredCount').textContent = predCount;
    $('#statPredTotal').textContent = total;
    $('#statPending').textContent = Math.max(0, total - predCount);
    $('#statAcc').textContent = state.accuracy;
    $('#myRank').textContent = state.rank;
    $('#myPoints').textContent = state.points;
    $('#rcRank').textContent = state.rank;
    $('#rcTotal').textContent = state.totalUsers;
    $('#rcPoints').textContent = state.points;
    $('#rcAcc').textContent = state.accuracy;
    $('#rcDay').textContent = state.streakDays + 8;
    $('#cardDayNum').textContent = state.streakDays + 6;
    $('#matchDayNum').textContent = 12;
    $('#totalPreds').textContent = BREAKDOWN.filter((x) => x.pts !== null).length;
    $('#totalPts').textContent = state.points;
    $('#todayCount').textContent = MATCHES.length;
    $('#todayLabel').textContent = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
    $('#lbTotal').textContent = state.totalUsers;
  }

  // ---------- leaderboard widget ----------
  function renderLBWidget() {
    const list = $('#lbTop'); list.innerHTML = '';
    LEADERBOARD.slice(0, 6).forEach((p, i) => {
      const rank = i + 1;
      const rankCls = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
      const li = document.createElement('li'); li.className = 'lb-row';
      li.innerHTML = `
        <span class="rank ${rankCls}">${rank}</span>
        <span class="avatar small" style="background:${avatarColor(p.name)};color:#fff;">${initials(p.name)}</span>
        <span class="name">${p.name} ${p.streak >= 5 ? `<span class="badge">${p.streak}-day</span>` : ''}</span>
        <span class="pts">${p.pts}</span>
      `;
      list.appendChild(li);
    });
  }

  function renderLBFull() {
    const tbody = $('#lbFullBody'); tbody.innerHTML = '';
    const me = { name: state.user ? state.user.name : 'You', pts: state.points, streak: state.streakDays, acc: state.accuracy };
    const data = [...LEADERBOARD].sort((a, b) => b.pts - a.pts);
    data.splice(state.rank - 1, 0, { ...me, me: true });
    data.slice(0, 50).forEach((p, i) => {
      const tr = document.createElement('tr');
      if (p.me) tr.className = 'me';
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td><span class="avatar small" style="background:${avatarColor(p.name)};color:#fff;margin-right:8px;">${initials(p.name)}</span>${p.name}${p.me ? ' (you)' : ''}</td>
        <td class="hide-sm">${p.streak}🔥</td>
        <td class="hide-sm">${p.acc}%</td>
        <td><b>${p.pts}</b></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderBreakdown() {
    const tbody = $('#breakdownBody'); tbody.innerHTML = '';
    BREAKDOWN.forEach((b) => {
      const tr = document.createElement('tr');
      const ptsTxt = b.pts === null ? '<span class="muted">—</span>' : `<b>${b.pts}</b>`;
      const typeTxt = b.type === 'fav' ? '☆ Favourite' : b.type === 'under' ? '⚡ Underdog' : '— Draw';
      tr.innerHTML = `<td>${b.match}</td><td>${b.pick}</td><td>${b.result}</td><td class="hide-sm">${typeTxt}</td><td>${ptsTxt}</td>`;
      tbody.appendChild(tr);
    });
  }

  function initials(name) { return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(); }
  function avatarColor(name) {
    const colors = ['#f59e0b', '#a78bfa', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#6366f1', '#14b8a6'];
    let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
    return colors[h];
  }

  // ---------- streak ----------
  function renderStreak() {
    const dots = $('#streakDots'); dots.innerHTML = '';
    const targetDay = state.streakDays >= 5 ? Math.min(state.streakDays + 2, 7) : 5;
    for (let i = 1; i <= 5; i++) {
      const d = document.createElement('div');
      const label = `D${i}`;
      if (i < state.streakDays + 1) { d.className = 'streak-dot done'; d.textContent = '✓'; }
      else if (i === state.streakDays + 1) { d.className = 'streak-dot today'; d.textContent = label; }
      else { d.className = 'streak-dot'; d.textContent = label; }
      dots.appendChild(d);
    }
  }

  // ---------- favourite team ----------
  function renderFav() {
    const cur = $('#favCurrent'); const sub = $('#favSub'); const btn = $('#favPick');
    if (state.favTeam) {
      const t = TEAMS.find((x) => x.c === state.favTeam);
      cur.hidden = false; $('#favFlag').textContent = t ? t.f : '🏳️'; $('#favName').textContent = state.favTeam;
      sub.textContent = `News, lineups and theme follow ${state.favTeam}.`;
      btn.textContent = 'Change';
      renderNews();
    } else {
      cur.hidden = true; sub.textContent = 'Pick a team to theme your card & follow their news';
      btn.textContent = 'Choose team';
      $('#newsCard').hidden = true;
    }
  }

  function renderNews() {
    const card = $('#newsCard'); const list = $('#newsList');
    const items = NEWS[state.favTeam] || [];
    if (!items.length) { card.hidden = true; return; }
    card.hidden = false; $('#newsTeam').textContent = state.favTeam;
    list.innerHTML = items.map((n) => `<li>${n}</li>`).join('');
  }

  function openFavModal() {
    const grid = $('#teamGrid'); grid.innerHTML = '';
    TEAMS.forEach((t) => {
      const cell = document.createElement('button'); cell.className = 'team-cell' + (state.favTeam === t.c ? ' selected' : '');
      cell.innerHTML = `<span class="flag">${t.f}</span><span>${t.c}</span>`;
      cell.addEventListener('click', () => {
        state.favTeam = t.c; save();
        $$('.team-cell').forEach((c) => c.classList.remove('selected'));
        cell.classList.add('selected');
        renderFav(); renderVoteBars();
        toast(`Cheering for ${t.c} ${t.f}`);
      });
      grid.appendChild(cell);
    });
    renderVoteBars();
    $('#favModal').hidden = false;
  }

  function renderVoteBars() {
    // Deterministic pseudo-random vote distribution
    const baseTeams = ['Brazil', 'Argentina', 'France', 'India', 'Germany'];
    const seeds = [38, 24, 14, 12, 12];
    const bars = $('#voteBars'); bars.innerHTML = '';
    baseTeams.forEach((name, i) => {
      const t = TEAMS.find((x) => x.c === name);
      const pct = seeds[i];
      const row = document.createElement('div'); row.className = 'vote-row';
      row.innerHTML = `<span class="flag">${t ? t.f : '🏳️'}</span><div class="vote-bar"><div style="width:${pct}%"></div></div><span class="pct">${pct}%</span>`;
      bars.appendChild(row);
    });
  }

  // ---------- login ----------
  function openLogin() { $('#loginModal').hidden = false; }
  function fakeLogin() {
    // Real wiring point: Google Identity Services / CreateOS OAuth
    const user = { name: 'Ishan R.', email: 'you@createos.app', initials: 'IR' };
    state.user = user; save();
    renderHeader();
    $('#loginModal').hidden = true;
    toast('Signed in via CreateOS');
  }
  function logout() { state.user = null; save(); renderHeader(); toast('Signed out'); }

  // ---------- share ----------
  function shareCardText() {
    const team = state.favTeam ? ` · cheering for ${state.favTeam}` : '';
    return `I'm ranked #${state.rank} of ${state.totalUsers} on CreateOS Arena — ${state.points} pts, ${state.streakDays}-day streak${team}. Predict with me 👉 https://createos.sh/arena`;
  }
  function openShare(channel) {
    const text = encodeURIComponent(shareCardText());
    const links = {
      x:  `https://twitter.com/intent/tweet?text=${text}`,
      ig: `https://www.instagram.com/`,
      wa: `https://wa.me/?text=${text}`,
    };
    const url = links[channel];
    if (channel === 'ig') {
      navigator.clipboard?.writeText(decodeURIComponent(text));
      toast('Caption copied — open Instagram to paste');
    }
    if (url) window.open(url, '_blank', 'noopener');
  }

  function openShareModal() {
    const text = shareCardText();
    const enc = encodeURIComponent(text);
    $('#shareLinks').innerHTML = `
      <a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${enc}">𝕏 Share on X</a>
      <a target="_blank" rel="noopener" href="https://wa.me/?text=${enc}">💬 Share on WhatsApp</a>
      <a target="_blank" rel="noopener" href="https://www.instagram.com/">📷 Open Instagram (caption copied)</a>
    `;
    navigator.clipboard?.writeText(text);
    $('#shareModal').hidden = false;
  }

  // ---------- download card as PNG (canvas) ----------
  function downloadCard() {
    const W = 1080, H = 1350;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0f5132'); grad.addColorStop(1, '#0a1f17');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#a7f3d0'; ctx.font = '600 36px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('CreateOS Arena · World Cup 2026', W / 2, 140);
    ctx.fillStyle = '#fff'; ctx.font = '800 220px "Space Grotesk", Inter, sans-serif';
    ctx.fillText(`#${state.rank}`, W / 2, 480);
    ctx.font = '500 36px Inter, sans-serif'; ctx.fillStyle = '#a7f3d0';
    ctx.fillText(`of ${state.totalUsers}`, W / 2, 540);
    ctx.fillStyle = '#fff'; ctx.font = '600 44px Inter, sans-serif';
    ctx.fillText(`${state.points} pts · Accuracy ${state.accuracy}% · Day ${state.streakDays + 8}`, W / 2, 700);
    if (state.favTeam) {
      const t = TEAMS.find((x) => x.c === state.favTeam);
      ctx.font = '700 56px Inter, sans-serif'; ctx.fillStyle = '#fcd34d';
      ctx.fillText(`${t ? t.f : ''}  cheering for ${state.favTeam}`, W / 2, 830);
    }
    ctx.fillStyle = '#a7f3d0'; ctx.font = '500 28px Inter, sans-serif';
    ctx.fillText('CREATEOS.SH/ARENA', W / 2, H - 80);
    const url = c.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = `createos-arena-rank-${state.rank}.png`; a.click();
    toast('Card downloaded');
  }

  // ---------- tabs ----------
  function switchTab(name) {
    $$('.tab, .m-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    $$('.tab').forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === name));
    $$('.panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
    if (name === 'leaderboard') { renderLBFull(); renderBreakdown(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- wire up ----------
  function wire() {
    $$('.tab, .m-tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

    $('#avatarBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      const m = $('#userMenu'); const willOpen = m.hidden;
      m.hidden = !willOpen;
      $('#avatarBtn').setAttribute('aria-expanded', String(willOpen));
    });
    document.addEventListener('click', (e) => {
      const m = $('#userMenu');
      if (!m.hidden && !m.contains(e.target) && e.target !== $('#avatarBtn')) m.hidden = true;
    });

    $$('.menu-item').forEach((it) => it.addEventListener('click', () => {
      $('#userMenu').hidden = true;
      const a = it.dataset.action;
      if (a === 'login') openLogin();
      if (a === 'favourite') openFavModal();
      if (a === 'share') openShareModal();
      if (a === 'logout') logout();
    }));

    $('#favPick').addEventListener('click', openFavModal);
    $('#googleLogin').addEventListener('click', fakeLogin);
    $('#downloadCard').addEventListener('click', downloadCard);
    $$('[data-share]').forEach((b) => b.addEventListener('click', () => openShare(b.dataset.share)));
    $$('[data-close]').forEach((b) => b.addEventListener('click', () => {
      b.closest('.modal').hidden = true;
    }));
    $$('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) m.hidden = true; }));

    $$('[data-lb]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-lb]').forEach((x) => x.classList.toggle('active', x === b));
    }));
    $$('[data-lb-full]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-lb-full]').forEach((x) => x.classList.toggle('active', x === b));
      renderLBFull();
    }));

    $('#disclaimerClose').addEventListener('click', () => { $('#disclaimerBar').classList.add('hidden'); });

    $('#claimPerks').addEventListener('click', () => toast('🎁 Perks claim opens with your next streak milestone'));

    // Simulate a live score tick on the live match
    setInterval(() => {
      const live = MATCHES.find((m) => m.status === 'live');
      if (!live) return;
      live.minute = Math.min(90, live.minute + 1);
      renderMatches();
    }, 60_000);
  }

  function renderAll() {
    renderHeader();
    renderStats();
    renderMatches();
    renderLBWidget();
    renderStreak();
    renderFav();
    renderLBFull();
    renderBreakdown();
  }

  // ---------- boot ----------
  document.addEventListener('DOMContentLoaded', () => {
    wire();
    renderAll();
    tickCountdown();
    setInterval(tickCountdown, 1000);
  });
})();
