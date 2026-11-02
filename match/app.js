/* 매치 · 앱 로직: 1 나를 알기 → 2 매칭 프렌즈 → 3 매칭 데이트 */
(function () {
  'use strict';
  const S = window.Saju, C = window.Compat, D = window.MatchData;
  const $ = (q, el) => (el || document).querySelector(q);
  const $$ = (q, el) => Array.from((el || document).querySelectorAll(q));

  /* ---------- 다국어 UI (ko / en) ---------- */
  const I18N = {
    ko: {
      brand: '매치', 'tab.me': '나를 알기', 'tab.friend': '매칭 프렌즈', 'tab.date': '매칭 데이트',
      'me.eyebrow': 'Step 1 · Know yourself', 'me.title': '나를 알기',
      'me.lead': '태어난 연·월·일·시를 넣으면 사주 명식(四柱)을 세워 당신의 기질을 읽습니다. 혈액형·MBTI·애니어그램·도형까지 함께 넣을수록 매칭 점수가 정확해집니다.',
      'f.name': '이름(닉네임)', 'f.gender': '성별', 'g.M': '남', 'g.F': '여', 'f.birth': '생년월일', 'f.solar': '(양력)', 'f.time': '태어난 시각', 'f.timeReq': '(필수 · 시주)',
      'f.country': '태어난 나라', 'f.tz': '(시간대·언어)', 'f.solarFix': '진태양시 보정', 'f.blood': '혈액형', 'f.ennea': '애니어그램', 'f.shape': '도형심리', 'f.bio': '한 줄 소개', 'f.opt': '(선택)',
      'opt.unknown': '모름', 'me.local': '입력한 정보는 이 기기(브라우저)에만 저장됩니다.', 'me.submit': '명식 세우기 →',
      'm.needMe': '먼저 1단계에서 당신의 명식을 세워야 매칭을 시작할 수 있어요.', 'm.goMe': '1단계로 가기',
      'fl.age': '나이', 'fl.gender': '성별', 'fl.any': '전체', 'fl.country': '나라', 'fl.sort': '정렬', 'fl.sortScore': '점수 높은 순', 'fl.sortAge': '나이 가까운 순', 'fl.sortNear': '거리 가까운 순',
      'm.dateNote': '매칭 데이트는 지금은 남↔여 매칭만 열려 있습니다. 성별은 자동으로 상대 성별로 고정됩니다.',
      'gl.tip': '지구본을 돌려 나라를 누르면 그 나라만 봅니다', 'gl.note': '점 색 = 궁합 점수', 'm.codePh': '친구 코드 붙이기', 'm.codeAdd': '코드로 추가',
      'm.demo': '지금 보이는 사람들은 서버 연결 전 데모용 생성 프로필입니다. 실제 친구는 서로 "내 코드"를 주고받아 추가할 수 있어요.',
      'c.ph': '메시지 (자동 번역되어 전달돼요)', 'c.send': '보내기',
      // 동적 문구
      'friend.eyebrow': 'Step 2 · Matching Friends · 전 세계', 'friend.title': '매칭 프렌즈', 'friend.lead': '내면(인사이드)이 가장 잘 맞는 사람을 찾습니다. 명리·혈액형·MBTI·애니어그램·도형을 모두 따져 점수로 보여주고, 나라가 달라도 자동 번역으로 대화합니다.',
      'date.eyebrow': 'Step 3 · Matching Date', 'date.title': '매칭 데이트', 'date.lead': '연애 궁합입니다. 일간의 합(合)과 일지의 육합·삼합, 음양의 짝을 더 무겁게 봅니다. 인연 점수가 높은 순으로 보여줍니다.',
      'all': '전 세계 🌍', 'score.friend': '궁합 점수', 'score.date': '인연 점수', 'people': '명', 'age': '세', 'talk': '대화하기', 'detail': '자세히', 'close': '닫기',
      'r.title': '명식 (四柱八字)', 'r.hour': '시주', 'r.day': '일주', 'r.month': '월주', 'r.year': '연주', 'r.dm': '일간(나)', 'r.elem': '오행 분포', 'r.strength': '신강·신약', 'r.yong': '용신(필요한 기운)', 'r.animal': '띠', 'r.ten': '십신 키워드',
      'r.save': '저장하고 매칭하러 가기 →', 'r.code': '내 코드 복사', 'r.edit': '다시 입력', 'r.copied': '내 코드를 복사했어요. 친구에게 보내세요.', 'r.saved': '저장했어요',
      'yin': '음', 'yang': '양', 'pol': '음양', 'stem.harmony': '천간합', 'stem.gen': '상생', 'stem.peer': '같은 오행', 'stem.same': '같은 일간', 'stem.ctrl': '상극', 'stem.clash': '천간충',
      'br.six': '육합', 'br.tri': '삼합', 'br.same': '같은 지지', 'br.none': '무난', 'br.punish': '형(刑)', 'br.wonjin': '원진', 'br.clash': '충(沖)',
      'd.stem': '일간 관계', 'd.dayB': '일지 관계', 'd.yearB': '띠(연지) 관계', 'd.comp': '오행 보완', 'd.yy': '음양 조화',
      'p.saju': '명리', 'p.mbti': 'MBTI', 'p.ennea': '애니어', 'p.blood': '혈액형', 'p.shape': '도형', 'w': '비중',
      'code.bad': '코드를 읽을 수 없어요', 'code.added': '추가했어요: ', 'code.dup': '이미 추가된 사람이에요',
      'c.sub': '자동 번역 · {me} ↔ {them}', 'c.sys': '데모 대화입니다. 상대 답장은 자동 생성되고, 번역은 무료 번역 서버(MyMemory)를 사용합니다.', 'c.trans': '번역', 'c.fail': '번역 서버에 연결하지 못해 원문으로 보냈어요',
      'shape.circle': '○ 동그라미 — 관계·배려·조화', 'shape.triangle': '△ 세모 — 목표·추진·리더', 'shape.square': '□ 네모 — 원칙·꼼꼼·성실', 'shape.s': 'S 물결 — 자유·창의·감성',
      'shape.help': '도형심리: 네 도형 중 가장 끌리는 것이 당신의 기질입니다. ○ 관계형 · △ 목표형 · □ 원칙형 · S 창의형',
      'ennea.names': ['개혁가','조력가','성취자','예술가','탐구자','충실가','열정가','도전자','평화주의자'],
      'nomatch': '조건에 맞는 사람이 없어요. 나이·나라 범위를 넓혀 보세요.', 'me.gender': '성별을 선택해 주세요', 'dist': 'km',
      'solarNote': (city, min) => `(${city} ${min > 0 ? '+' : '−'}${Math.abs(min)}분)`
    },
    en: {
      brand: 'Match', 'tab.me': 'Know Me', 'tab.friend': 'Match Friends', 'tab.date': 'Match Date',
      'me.eyebrow': 'Step 1 · Know yourself', 'me.title': 'Know Me',
      'me.lead': 'Enter your birth year, month, day and hour to build your Four Pillars (Saju) chart. Add blood type, MBTI, Enneagram and shape type for a more accurate match score.',
      'f.name': 'Name (nickname)', 'f.gender': 'Gender', 'g.M': 'Male', 'g.F': 'Female', 'f.birth': 'Birth date', 'f.solar': '(solar)', 'f.time': 'Birth time', 'f.timeReq': '(required · hour pillar)',
      'f.country': 'Birth country', 'f.tz': '(time zone · language)', 'f.solarFix': 'True solar time fix', 'f.blood': 'Blood type', 'f.ennea': 'Enneagram', 'f.shape': 'Shape type', 'f.bio': 'One-line intro', 'f.opt': '(optional)',
      'opt.unknown': 'Unknown', 'me.local': 'Your data stays on this device only.', 'me.submit': 'Build my chart →',
      'm.needMe': 'Build your chart in Step 1 first to start matching.', 'm.goMe': 'Go to Step 1',
      'fl.age': 'Age', 'fl.gender': 'Gender', 'fl.any': 'Any', 'fl.country': 'Country', 'fl.sort': 'Sort', 'fl.sortScore': 'Highest score', 'fl.sortAge': 'Closest age', 'fl.sortNear': 'Nearest',
      'm.dateNote': 'Match Date is currently open for man↔woman matching only. Gender is fixed to the opposite of yours.',
      'gl.tip': 'Spin the globe and tap a country to filter', 'gl.note': 'dot color = match score', 'm.codePh': 'Paste a friend code', 'm.codeAdd': 'Add by code',
      'm.demo': 'People shown here are generated demo profiles until a server is connected. Real friends can be added by exchanging "my code".',
      'c.ph': 'Message (auto-translated)', 'c.send': 'Send',
      'friend.eyebrow': 'Step 2 · Matching Friends · Worldwide', 'friend.title': 'Match Friends', 'friend.lead': 'Finds the people whose inner self fits yours best. Saju, blood type, MBTI, Enneagram and shape type combine into one score, and auto-translation lets you talk across countries.',
      'date.eyebrow': 'Step 3 · Matching Date', 'date.title': 'Match Date', 'date.lead': 'Romantic compatibility. Day-master harmony, day-branch unions and yin–yang pairing weigh more. Sorted by destiny score.',
      'all': 'Worldwide 🌍', 'score.friend': 'Match score', 'score.date': 'Destiny score', 'people': 'people', 'age': '', 'talk': 'Talk', 'detail': 'Details', 'close': 'Close',
      'r.title': 'Four Pillars chart', 'r.hour': 'Hour', 'r.day': 'Day', 'r.month': 'Month', 'r.year': 'Year', 'r.dm': 'Day master (you)', 'r.elem': 'Five elements', 'r.strength': 'Strength', 'r.yong': 'Needed element', 'r.animal': 'Zodiac', 'r.ten': 'Ten-gods keywords',
      'r.save': 'Save and start matching →', 'r.code': 'Copy my code', 'r.edit': 'Edit', 'r.copied': 'Your code is copied. Send it to a friend.', 'r.saved': 'Saved',
      'yin': 'Yin', 'yang': 'Yang', 'pol': 'Yin/Yang', 'stem.harmony': 'Stem union', 'stem.gen': 'Generating', 'stem.peer': 'Same element', 'stem.same': 'Same day master', 'stem.ctrl': 'Controlling', 'stem.clash': 'Stem clash',
      'br.six': 'Six harmony', 'br.tri': 'Trine', 'br.same': 'Same branch', 'br.none': 'Neutral', 'br.punish': 'Punishment', 'br.wonjin': 'Resentment', 'br.clash': 'Clash',
      'd.stem': 'Day masters', 'd.dayB': 'Day branches', 'd.yearB': 'Zodiac (year branch)', 'd.comp': 'Element complement', 'd.yy': 'Yin–yang balance',
      'p.saju': 'Saju', 'p.mbti': 'MBTI', 'p.ennea': 'Ennea', 'p.blood': 'Blood', 'p.shape': 'Shape', 'w': 'weight',
      'code.bad': 'Could not read that code', 'code.added': 'Added: ', 'code.dup': 'Already added',
      'c.sub': 'Auto-translate · {me} ↔ {them}', 'c.sys': 'Demo chat. Replies are auto-generated; translation uses the free MyMemory service.', 'c.trans': 'translated', 'c.fail': 'Translation server unreachable — sent original text',
      'shape.circle': '○ Circle — relationships · care · harmony', 'shape.triangle': '△ Triangle — goals · drive · leadership', 'shape.square': '□ Square — principles · precision · diligence', 'shape.s': 'S Wave — freedom · creativity · feeling',
      'shape.help': 'Shape psychology: the shape you are drawn to most reflects your temperament. ○ relational · △ goal-driven · □ principled · S creative',
      'ennea.names': ['Reformer','Helper','Achiever','Individualist','Investigator','Loyalist','Enthusiast','Challenger','Peacemaker'],
      'nomatch': 'Nobody matches these filters. Try widening age or country.', 'me.gender': 'Please choose a gender', 'dist': 'km',
      'solarNote': (city, min) => `(${city} ${min > 0 ? '+' : '−'}${Math.abs(min)} min)`
    }
  };
  const state = { lang: localStorage.getItem('match.lang') || 'ko', me: null, mode: 'friend', pool: [], added: [], open: null, scoreCache: new Map() };
  const t = (k, ...a) => { const v = I18N[state.lang][k] ?? I18N.ko[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
  const L = () => state.lang;

  function applyI18n() {
    $$('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n, small = el.querySelector('small');
      if (small) { const txt = t(k); el.firstChild.nodeValue = txt + ' '; }
      else el.textContent = t(k);
    });
    $$('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
    $('#langBtn').textContent = L() === 'ko' ? 'EN' : '한국어';
    document.documentElement.lang = L();
    fillSelects(); setSolarNote();
    if (state.me) renderMe();
    if (!$('#tab-match').hidden) renderMatch();
  }

  /* ---------- 폼 ---------- */
  const form = $('#meForm');
  function fillSelects() {
    const cur = $('#meCountry').value || 'KR';
    $('#meCountry').innerHTML = D.COUNTRIES.map(c => `<option value="${c.code}">${c.flag} ${L() === 'ko' ? c.ko : c.en}</option>`).join('');
    $('#meCountry').value = cur;
    const curM = $('#meMbti').value;
    $('#meMbti').innerHTML = `<option value="">${t('opt.unknown')}</option>` + D.MBTI.map(m => `<option>${m}</option>`).join('');
    $('#meMbti').value = curM;
    const curE = $('#meEnnea').value;
    $('#meEnnea').innerHTML = `<option value="">${t('opt.unknown')}</option>` + t('ennea.names').map((n, i) => `<option value="${i + 1}">${i + 1} · ${n}</option>`).join('');
    $('#meEnnea').value = curE;
    const curS = $('#meShape').value;
    $('#meShape').innerHTML = `<option value="">${t('opt.unknown')}</option>` + D.SHAPES.map(s => `<option value="${s}">${t('shape.' + s)}</option>`).join('');
    $('#meShape').value = curS;
    $('#shapeHelp').textContent = t('shape.help');
    const cf = $('#countryFilter'), curF = cf.value || 'ALL';
    cf.innerHTML = `<option value="ALL">${t('all')}</option>` + D.COUNTRIES.map(c => `<option value="${c.code}">${c.flag} ${L() === 'ko' ? c.ko : c.en}</option>`).join('');
    cf.value = curF;
  }
  const solarFixFor = c => Math.round((c.lon - c.tz * 15) * 4);
  function setSolarNote() {
    const c = D.countryOf($('#meCountry').value);
    $('#solarFixNote').textContent = t('solarNote', L() === 'ko' ? c.ko : c.en, solarFixFor(c));
  }
  $('#meCountry').addEventListener('change', setSolarNote);
  $$('#genderSeg button').forEach(b => b.addEventListener('click', () => {
    $$('#genderSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    form.gender.value = b.dataset.v;
  }));

  function sajuOf(p) {
    const c = D.countryOf(p.country);
    return S.compute({ y: p.y, m: p.m, d: p.d, hh: p.hh, mm: p.mm, tz: c.tz, solarFix: p.solar === false ? 0 : solarFixFor(c) });
  }
  function personOf(p) {
    if (!p._saju) p._saju = sajuOf(p);
    return { saju: p._saju, mbti: p.mbti || null, ennea: p.ennea ? +p.ennea : null, blood: p.blood || null, shape: p.shape || null };
  }
  const ageOf = p => { const n = new Date(); let a = n.getFullYear() - p.y; if (n.getMonth() + 1 < p.m || (n.getMonth() + 1 === p.m && n.getDate() < p.d)) a--; return a; };

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.gender.value) { toast(t('me.gender')); return; }
    const [y, m, d] = form.birth.value.split('-').map(Number), [hh, mm] = form.time.value.split(':').map(Number);
    const c = D.countryOf(form.country.value);
    state.me = { id: 'me', name: form.name.value.trim(), gender: form.gender.value, y, m, d, hh, mm, country: c.code, solar: form.solar.checked,
      blood: form.blood.value, mbti: form.mbti.value, ennea: form.ennea.value ? +form.ennea.value : '', shape: form.shape.value, bio: form.bio.value.trim(), lat: c.lat, lon: c.lon };
    state.scoreCache.clear();
    saveMe(); renderMe(); $('#meResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const noCache = (k, v) => k === '_saju' ? undefined : v;
  function saveMe() { localStorage.setItem('match.me', JSON.stringify(state.me, noCache)); }
  function loadMe() {
    try { state.me = JSON.parse(localStorage.getItem('match.me')); } catch (e) { state.me = null; }
    try { state.added = JSON.parse(localStorage.getItem('match.added')) || []; } catch (e) { state.added = []; }
    if (state.me) {
      const p = state.me;
      form.name.value = p.name; form.gender.value = p.gender; $$('#genderSeg button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === p.gender)));
      form.birth.value = `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`; form.time.value = `${String(p.hh).padStart(2, '0')}:${String(p.mm).padStart(2, '0')}`;
      form.country.value = p.country; form.solar.checked = p.solar !== false; form.blood.value = p.blood || ''; form.mbti.value = p.mbti || ''; form.ennea.value = p.ennea || ''; form.shape.value = p.shape || ''; form.bio.value = p.bio || '';
      setSolarNote();
    }
  }

  /* ---------- 명식 렌더 ---------- */
  const elemColor = e => S.ELEM_COLOR[e];
  const elemName = e => L() === 'ko' ? S.ELEM[e] + S.ELEM_HANJA[e] : S.ELEM_EN[e];
  function renderMe() {
    const p = state.me; p._saju = null; const r = personOf(p).saju;
    const labels = { hour: t('r.hour'), day: t('r.day'), month: t('r.month'), year: t('r.year') };
    const pil = r.pillars.map(pl => `<div class="pil ${pl.key}"><div class="lb">${labels[pl.key]}</div>
      <div class="hz" style="color:${elemColor(S.STEM_ELEM[pl.s])}">${S.STEMS[pl.s]}</div><div class="rd">${S.STEM_KO[pl.s]} · ${elemName(S.STEM_ELEM[pl.s])} · ${pl.s % 2 ? t('yin') : t('yang')}</div>
      <div class="hz" style="color:${elemColor(S.BRANCH_ELEM[pl.b])}">${S.BRANCHES[pl.b]}</div><div class="rd">${S.BRANCH_KO[pl.b]} · ${elemName(S.BRANCH_ELEM[pl.b])}</div></div>`).join('');
    const bars = [0,1,2,3,4].map(e => `<div class="bar"><span style="color:${elemColor(e)}">${elemName(e)}</span><i><b style="width:${Math.round(r.elems[e] / r.total * 100 * 1.6)}%;background:${elemColor(e)}"></b></i><em>${r.elems[e].toFixed(1)}</em></div>`).join('');
    const dmText = S.DAY_MASTER_TEXT[L()][r.dayMaster];
    const tens = Object.entries(r.tenGods).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => `<span class="tag gold">${L() === 'ko' ? k : ''} ${S.TEN_TEXT[L()][k]} ×${v}</span>`).join('');
    const animal = L() === 'ko' ? S.ANIMALS[r.animal] + '띠' : S.ANIMALS_EN[r.animal];
    $('#meResult').innerHTML = `
      <div class="card hi fade">
        <div class="eyebrow">${t('r.title')} · ${p.name}</div>
        <h2 style="margin:4px 0 12px">${r.ganji.slice().reverse().join(' ')} <span style="font-family:var(--fm);font-size:13px;color:var(--mute);font-weight:400">${r.sajuYear}</span></h2>
        <div class="pillars">${pil}</div>
      </div>
      <div class="card fade">
        <div class="eyebrow">${t('r.dm')} · ${S.STEMS[r.dayMaster]}${S.ELEM_HANJA[r.dayMasterElem]}</div>
        <h3 style="margin:6px 0 8px;color:${elemColor(r.dayMasterElem)}">${dmText[0]}</h3>
        <p class="lead" style="font-size:14px">${dmText[1]}</p>
        <div class="tags" style="margin-top:12px"><span class="tag">${t('r.animal')} · ${animal}</span><span class="tag">${t('pol')} ${Math.round((1 - r.yinRatio) * 100)}:${Math.round(r.yinRatio * 100)}</span>${tens}</div>
      </div>
      <div class="card fade grid2 wide" style="gap:18px">
        <div><div class="eyebrow" style="margin-bottom:10px">${t('r.elem')}</div><div class="bars">${bars}</div></div>
        <dl class="kv" style="align-content:start"><dt>${t('r.strength')}</dt><dd>${S.STRENGTH_TEXT[L()][r.strength]}</dd>
          <dt>${t('r.yong')}</dt><dd><b style="color:${elemColor(r.yong)}">${elemName(r.yong)}</b> — ${S.ELEM_TEXT[L()][r.yong]}</dd></dl>
      </div>
      <div class="row" style="justify-content:flex-end">
        <button class="btn" id="editMe">${t('r.edit')}</button><button class="btn g" id="copyCode">${t('r.code')}</button><button class="btn p" data-tab="friend">${t('r.save')}</button>
      </div>`;
    $('#meResult').hidden = false;
    $('#editMe').onclick = () => form.scrollIntoView({ behavior: 'smooth' });
    $('#copyCode').onclick = async () => {
      const code = encodeProfile(p);
      try { await navigator.clipboard.writeText(code); toast(t('r.copied')); }
      catch (e) { prompt(t('r.code'), code); }
    };
  }

  /* ---------- 코드 공유 ---------- */
  const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4))));
  function encodeProfile(p) {
    return 'MATCH1.' + b64(JSON.stringify({ n: p.name, g: p.gender, y: p.y, m: p.m, d: p.d, h: p.hh, i: p.mm, c: p.country, s: p.solar === false ? 0 : 1, b: p.blood || '', t: p.mbti || '', e: p.ennea || '', f: p.shape || '', o: p.bio || '' }));
  }
  function decodeProfile(code) {
    const m = /MATCH1\.([A-Za-z0-9_-]+)/.exec(code.trim()); if (!m) return null;
    try {
      const o = JSON.parse(unb64(m[1])); const c = D.countryOf(o.c);
      if (!o.n || !o.y) return null;
      return { id: 'c' + m[1].slice(0, 12), name: o.n, gender: o.g, y: +o.y, m: +o.m, d: +o.d, hh: +o.h, mm: +o.i, country: c.code, solar: !!o.s, blood: o.b, mbti: o.t, ennea: o.e, shape: o.f, bio: o.o, lat: c.lat, lon: c.lon, real: true };
    } catch (e) { return null; }
  }
  $('#codeAdd').onclick = () => {
    const p = decodeProfile($('#codeIn').value); if (!p) { toast(t('code.bad')); return; }
    if (state.added.some(x => x.id === p.id)) { toast(t('code.dup')); return; }
    state.added.push(p); localStorage.setItem('match.added', JSON.stringify(state.added, noCache));
    $('#codeIn').value = ''; toast(t('code.added') + p.name); renderMatch();
  };

  /* ---------- 탭 ---------- */
  function showTab(name) {
    $$('.steps button').forEach(b => b.dataset.tab === name ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
    $('#tab-me').hidden = name !== 'me'; $('#tab-match').hidden = name === 'me';
    if (name !== 'me') { state.mode = name; renderMatch(); }
    window.scrollTo({ top: 0 });
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
  $('#langBtn').onclick = () => { state.lang = L() === 'ko' ? 'en' : 'ko'; localStorage.setItem('match.lang', state.lang); applyI18n(); };

  /* ---------- 매칭 ---------- */
  const scoreOf = (p, mode) => {
    const k = p.id + mode; if (state.scoreCache.has(k)) return state.scoreCache.get(k);
    const r = C.match(personOf(state.me), personOf(p), mode); state.scoreCache.set(k, r); return r;
  };
  const km = (a, b) => { const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180, la = a.lat * Math.PI / 180, lb = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  let scored = [];
  function renderMatch() {
    const mode = state.mode;
    $('#mEyebrow').textContent = t(mode + '.eyebrow'); $('#mTitle').textContent = t(mode + '.title'); $('#mLead').textContent = t(mode + '.lead');
    const need = !state.me; $('#needMe').hidden = !need; $('#matchBody').hidden = need; if (need) return;
    const isDate = mode === 'date';
    $('#dateNote').hidden = !isDate; $('#genderFilterWrap').style.opacity = isDate ? .45 : 1; $('#genderFilter').disabled = isDate;
    if (isDate) $('#genderFilter').value = state.me.gender === 'M' ? 'F' : 'M';
    else $('#genderFilter').value = state.friendGender || 'any';
    const aMin = +$('#ageMin').value || 0, aMax = +$('#ageMax').value || 200, g = $('#genderFilter').value, cf = $('#countryFilter').value, sort = $('#sortSel').value;
    const all = state.pool.concat(state.added);
    scored = all.filter(p => { const a = ageOf(p); return a >= aMin && a <= aMax && (g === 'any' || p.gender === g) && (cf === 'ALL' || p.country === cf); })
      .map(p => ({ p, r: scoreOf(p, mode), age: ageOf(p), dist: km(state.me, p) }));
    const myAge = ageOf(state.me);
    scored.sort((a, b) => sort === 'age' ? Math.abs(a.age - myAge) - Math.abs(b.age - myAge) || b.r.total - a.r.total
                        : sort === 'near' ? a.dist - b.dist || b.r.total - a.r.total : b.r.total - a.r.total);
    $('#mCount').textContent = `${scored.length} ${t('people')} · ${t('score.' + mode)}`;
    const list = $('#mList');
    if (!scored.length) { list.innerHTML = `<div class="empty">${t('nomatch')}</div>`; drawGlobe(); return; }
    const shown = scored.filter(x => x.p.real).concat(scored.filter(x => !x.p.real)).slice(0, 60);   // 실제 친구(코드로 추가)는 항상 위에
    list.innerHTML = shown.map(({ p, r, age, dist }) => {
      const c = D.countryOf(p.country), sj = p._saju, cls = r.total >= 80 ? 'hi' : r.total >= 65 ? 'mid' : 'lo';
      const chips = [`<span class="tag" style="border-color:${elemColor(sj.dayMasterElem)};color:${elemColor(sj.dayMasterElem)}">${S.STEMS[sj.dayMaster]}${S.ELEM_HANJA[sj.dayMasterElem]}</span>`,
        p.mbti ? `<span class="tag">${p.mbti}</span>` : '', p.ennea ? `<span class="tag">E${p.ennea}</span>` : '', p.blood ? `<span class="tag">${p.blood}</span>` : '', p.shape ? `<span class="tag">${t('shape.' + p.shape).slice(0, 1)}</span>` : '',
        p.real ? `<span class="tag gold">REAL</span>` : ''].join('');
      const mini = ['saju','mbti','ennea','blood','shape'].map(k => `<div><b>${r.parts[k].weight ? r.parts[k].score : '–'}</b>${t('p.' + k)}<br><span style="font-size:10px">${t('w')} ${r.parts[k].weight}%</span></div>`).join('');
      return `<article class="person fade" data-id="${p.id}">
        <div class="who"><div class="nm"><b>${c.flag} ${p.name}</b><span>${age}${t('age')} · ${L() === 'ko' ? c.ko : c.en} · ${D.LANG_NAME[c.lang]} · ${Math.round(dist)}${t('dist')}</span></div>
          <div class="tags">${chips}</div><div class="bio">${p.bio || ''}</div></div>
        <div class="score ${cls}"><b>${r.total}</b><small>${t('score.' + mode)}</small></div>
        <div class="mini">${mini}</div>
        <div class="more" hidden></div>
        <div class="acts"><button class="btn s" data-more>${t('detail')}</button><button class="btn p s" data-talk>${t('talk')}</button></div></article>`;
    }).join('');
    drawGlobe();
  }
  $('#mList').addEventListener('click', e => {
    const art = e.target.closest('.person'); if (!art) return;
    const item = scored.find(x => x.p.id === art.dataset.id); if (!item) return;
    if (e.target.closest('[data-talk]')) openChat(item);
    if (e.target.closest('[data-more]')) {
      const box = $('.more', art); box.hidden = !box.hidden;
      if (!box.hidden) {
        const d = item.r.raw.saju.detail, o = item.p._saju, me = state.me._saju;
        const rel = (k, v) => `<dt>${t(k)}</dt><dd>${v}</dd>`;
        box.innerHTML = `<div class="eyebrow">${t('p.saju')} ${item.r.raw.saju.score}/100</div>
          <dl class="kv">${rel('d.stem', `${S.STEMS[me.dayMaster]} × ${S.STEMS[o.dayMaster]} · ${t('stem.' + d.stem.rel)} (${d.stem.score})`)}
          ${rel('d.dayB', `${S.BRANCHES[me.pillars[1].b]} × ${S.BRANCHES[o.pillars[1].b]} · ${t('br.' + d.dayBranch.rel)} (${d.dayBranch.score})`)}
          ${rel('d.yearB', `${L() === 'ko' ? S.ANIMALS[me.animal] : S.ANIMALS_EN[me.animal]} × ${L() === 'ko' ? S.ANIMALS[o.animal] : S.ANIMALS_EN[o.animal]} · ${t('br.' + d.yearBranch.rel)} (${d.yearBranch.score})`)}
          ${rel('d.comp', `${Math.round(d.complement.value * 100)}% (${d.complement.score})`)}${rel('d.yy', d.yinyang.score)}</dl>
          <div class="eyebrow" style="margin-top:4px">${t('r.elem')}</div>
          <div class="bars">${[0,1,2,3,4].map(el => `<div class="bar"><span style="color:${elemColor(el)}">${elemName(el)}</span><i><b style="width:${Math.round(o.elems[el] / o.total * 160)}%;background:${elemColor(el)}"></b></i><em>${o.elems[el].toFixed(1)}</em></div>`).join('')}</div>
          <p class="help">${S.DAY_MASTER_TEXT[L()][o.dayMaster][0]} — ${S.DAY_MASTER_TEXT[L()][o.dayMaster][1]}</p>`;
      }
    }
  });
  ['ageMin','ageMax','genderFilter','countryFilter','sortSel'].forEach(id => $('#' + id).addEventListener('change', () => {
    if (id === 'genderFilter' && state.mode === 'friend') state.friendGender = $('#genderFilter').value;
    renderMatch();
  }));

  /* ---------- 지구본 ---------- */
  const GLOBE = $('#globe'), gctx = GLOBE.getContext('2d');
  const CONT = [
    [[-168,66],[-156,71],[-140,70],[-125,72],[-95,74],[-80,74],[-62,66],[-78,62],[-72,58],[-64,47],[-70,42],[-75,36],[-81,30],[-80,25],[-84,30],[-90,29],[-97,26],[-97,20],[-90,21],[-87,16],[-84,10],[-79,8],[-85,12],[-92,15],[-105,20],[-110,24],[-114,30],[-118,34],[-124,40],[-124,48],[-130,55],[-140,60],[-152,59],[-165,55]],
    [[-45,60],[-40,65],[-22,70],[-20,80],[-40,83],[-60,82],[-70,78],[-55,70],[-50,65]],
    [[-79,8],[-75,11],[-70,12],[-62,10],[-52,5],[-50,0],[-44,-2],[-35,-5],[-35,-10],[-39,-14],[-41,-22],[-48,-26],[-52,-33],[-58,-38],[-65,-42],[-68,-50],[-68,-55],[-73,-50],[-74,-42],[-72,-30],[-70,-18],[-76,-14],[-81,-6],[-80,0],[-77,4]],
    [[-17,21],[-17,15],[-15,11],[-8,5],[0,5],[8,4],[10,2],[9,-1],[12,-6],[13,-12],[12,-17],[15,-27],[18,-34],[26,-34],[32,-29],[35,-24],[40,-15],[40,-10],[39,-5],[42,0],[49,6],[51,11],[44,12],[43,15],[38,20],[36,23],[33,30],[30,31],[25,32],[20,31],[10,37],[0,36],[-6,35],[-10,30],[-15,26]],
    [[-9,43],[-9,38],[-6,36],[0,38],[3,43],[8,44],[12,42],[16,40],[18,40],[13,45],[20,41],[22,37],[24,38],[27,41],[29,41],[30,37],[36,36],[35,33],[35,30],[34,27],[38,22],[43,13],[45,13],[52,16],[57,19],[59,23],[56,27],[50,30],[48,30],[50,26],[52,24],[56,24],[60,25],[66,25],[72,21],[73,16],[77,8],[80,13],[80,16],[87,21],[90,22],[92,20],[94,16],[98,10],[100,4],[103,1],[104,3],[100,7],[100,13],[106,9],[109,12],[107,20],[110,21],[115,23],[120,27],[122,30],[120,35],[122,38],[118,39],[121,41],[125,40],[127,35],[130,36],[129,42],[133,43],[140,48],[141,53],[137,54],[140,58],[150,59],[156,51],[160,56],[163,62],[180,65],[180,70],[160,70],[140,72],[130,71],[110,74],[100,77],[90,75],[80,73],[70,72],[60,70],[50,68],[40,66],[42,69],[30,70],[25,71],[15,68],[10,63],[5,58],[8,57],[11,54],[8,54],[4,52],[1,50],[-2,48],[-5,48],[-1,45],[-2,43]],
    [[130,31],[132,34],[136,35],[140,36],[142,40],[141,45],[144,44],[145,43],[141,41],[140,38],[138,35],[135,33],[131,31]],
    [[-5,50],[1,51],[2,53],[-2,56],[-3,58],[-6,57],[-5,54],[-3,53]],
    [[114,-22],[114,-34],[118,-35],[125,-33],[130,-31],[137,-35],[140,-38],[146,-39],[150,-37],[153,-30],[153,-25],[146,-18],[142,-11],[137,-12],[136,-15],[132,-11],[126,-14],[122,-18]],
    [[95,5],[104,-5],[106,-6],[100,0]], [[109,1],[117,7],[119,1],[116,-4],[110,-3]], [[131,-1],[141,-2],[150,-10],[140,-9],[132,-4]], [[44,-12],[50,-15],[47,-25],[44,-20]], [[172,-34],[178,-38],[174,-41],[168,-46],[166,-45],[172,-40]],
    [[-180,-70],[-150,-72],[-120,-73],[-90,-71],[-60,-68],[-30,-70],[0,-69],[30,-68],[60,-66],[90,-66],[120,-66],[150,-68],[180,-70],[180,-90],[-180,-90]]
  ];
  let rot = { lon: -127, lat: 25 }, auto = true, drag = null, dots = [];
  function project(lat, lon, R, cx, cy) {
    const la = lat * Math.PI / 180, lo = (lon + rot.lon) * Math.PI / 180, la0 = rot.lat * Math.PI / 180;
    const x = Math.cos(la) * Math.sin(lo), y = Math.cos(la0) * Math.sin(la) - Math.sin(la0) * Math.cos(la) * Math.cos(lo), z = Math.sin(la0) * Math.sin(la) + Math.cos(la0) * Math.cos(la) * Math.cos(lo);
    return { x: cx + R * x, y: cy - R * y, z };
  }
  function drawGlobe() {
    if ($('#tab-match').hidden) return;
    const W = GLOBE.width, cx = W / 2, cy = W / 2, R = W * 0.44;
    gctx.clearRect(0, 0, W, W);
    const grd = gctx.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R);
    grd.addColorStop(0, '#2b2142'); grd.addColorStop(1, '#14101f');
    gctx.fillStyle = grd; gctx.beginPath(); gctx.arc(cx, cy, R, 0, Math.PI * 2); gctx.fill();
    gctx.save(); gctx.beginPath(); gctx.arc(cx, cy, R, 0, Math.PI * 2); gctx.clip();
    // 대륙
    gctx.fillStyle = 'rgba(255,200,87,.22)'; gctx.strokeStyle = 'rgba(255,200,87,.45)'; gctx.lineWidth = 1.2;
    CONT.forEach(poly => {
      gctx.beginPath(); let vis = false;
      poly.forEach(([lon, lat], i) => {
        let p = project(lat, lon, R, cx, cy);
        if (p.z < 0) { const dx = p.x - cx, dy = p.y - cy, l = Math.hypot(dx, dy) || 1; p = { x: cx + dx / l * R, y: cy + dy / l * R, z: 0 }; } else vis = true;
        i ? gctx.lineTo(p.x, p.y) : gctx.moveTo(p.x, p.y);
      });
      if (vis) { gctx.closePath(); gctx.fill(); gctx.stroke(); }
    });
    // 경위선
    gctx.strokeStyle = 'rgba(255,255,255,.07)'; gctx.lineWidth = 1;
    for (let lon = -180; lon < 180; lon += 30) { gctx.beginPath(); let on = false; for (let lat = -90; lat <= 90; lat += 3) { const p = project(lat, lon, R, cx, cy); if (p.z > 0) { on ? gctx.lineTo(p.x, p.y) : gctx.moveTo(p.x, p.y); on = true; } else on = false; } gctx.stroke(); }
    for (let lat = -60; lat <= 60; lat += 30) { gctx.beginPath(); let on = false; for (let lon = -180; lon <= 180; lon += 3) { const p = project(lat, lon, R, cx, cy); if (p.z > 0) { on ? gctx.lineTo(p.x, p.y) : gctx.moveTo(p.x, p.y); on = true; } else on = false; } gctx.stroke(); }
    gctx.restore();
    gctx.strokeStyle = 'rgba(255,107,91,.5)'; gctx.lineWidth = 2; gctx.beginPath(); gctx.arc(cx, cy, R, 0, Math.PI * 2); gctx.stroke();
    // 후보 점 (나라별 집계)
    dots = [];
    const byC = {};
    scored.forEach(x => { (byC[x.p.country] = byC[x.p.country] || []).push(x); });
    Object.entries(byC).forEach(([code, arr]) => {
      const c = D.countryOf(code), best = Math.max(...arr.map(x => x.r.total)), p = project(c.lat, c.lon, R, cx, cy);
      if (p.z <= 0) return;
      const col = best >= 80 ? '#58C27D' : best >= 65 ? '#FFC857' : '#8E819C', r = 6 + Math.min(10, arr.length);
      gctx.fillStyle = col + '55'; gctx.beginPath(); gctx.arc(p.x, p.y, r * 1.8, 0, Math.PI * 2); gctx.fill();
      gctx.fillStyle = col; gctx.beginPath(); gctx.arc(p.x, p.y, r, 0, Math.PI * 2); gctx.fill();
      gctx.fillStyle = '#120C1A'; gctx.font = 'bold 13px IBM Plex Mono, monospace'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle'; gctx.fillText(arr.length, p.x, p.y + 1);
      dots.push({ x: p.x, y: p.y, r: r + 6, code, n: arr.length, best });
    });
    // 나
    if (state.me) { const me = project(state.me.lat, state.me.lon, R, cx, cy); if (me.z > 0) { gctx.strokeStyle = '#FF6B5B'; gctx.lineWidth = 3; gctx.beginPath(); gctx.arc(me.x, me.y, 9, 0, Math.PI * 2); gctx.stroke(); } }
  }
  function pos(e) { const b = GLOBE.getBoundingClientRect(); const s = GLOBE.width / b.width; return { x: (e.clientX - b.left) * s, y: (e.clientY - b.top) * s }; }
  GLOBE.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, moved: false, lon: rot.lon, lat: rot.lat }; auto = false; GLOBE.setPointerCapture(e.pointerId); });
  GLOBE.addEventListener('pointermove', e => {
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 4) drag.moved = true;
      rot.lon = drag.lon + dx * 0.5; rot.lat = Math.max(-80, Math.min(80, drag.lat + dy * 0.5)); drawGlobe(); return; }
    const p = pos(e), d = dots.find(o => Math.hypot(o.x - p.x, o.y - p.y) < o.r + 4);
    GLOBE.style.cursor = d ? 'pointer' : 'grab';
    if (d) { const c = D.countryOf(d.code); $('#globeTip').textContent = `${c.flag} ${L() === 'ko' ? c.ko : c.en} · ${d.n}${t('people')} · ${L() === 'ko' ? '최고' : 'best'} ${d.best}`; }
    else $('#globeTip').textContent = t('gl.tip');
  });
  GLOBE.addEventListener('pointerup', e => {
    if (drag && !drag.moved) { const p = pos(e), d = dots.find(o => Math.hypot(o.x - p.x, o.y - p.y) < o.r + 4);
      if (d) { $('#countryFilter').value = $('#countryFilter').value === d.code ? 'ALL' : d.code; renderMatch(); } }
    drag = null; setTimeout(() => auto = true, 4000);
  });
  GLOBE.addEventListener('pointercancel', () => { drag = null; });
  (function spin() { if (auto && !drag && !$('#tab-match').hidden && $('#chat').hidden) { rot.lon += 0.15; drawGlobe(); } requestAnimationFrame(spin); })();

  /* ---------- 채팅 + 자동 번역 ---------- */
  const MM_LANG = { zh: 'zh-CN' };
  async function translate(text, from, to) {
    if (from === to) return text;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${MM_LANG[from] || from}|${MM_LANG[to] || to}`;
    const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 7000);
    try {
      const j = await (await fetch(url, { signal: ctrl.signal })).json();
      const out = j && j.responseData && j.responseData.translatedText;
      if (j.responseStatus == 200 && out && !/MYMEMORY WARNING|QUERY LENGTH/i.test(out)) return out;
      throw new Error('mt');
    } finally { clearTimeout(tm); }
  }
  function addMsg(cls, text, sub) {
    const el = document.createElement('div'); el.className = 'msg ' + cls;
    el.innerHTML = cls === 'sys' ? text : `<div class="b"></div>${sub !== undefined ? '<div class="tr"></div>' : ''}`;
    if (cls !== 'sys') { $('.b', el).textContent = text; if (sub !== undefined) $('.tr', el).textContent = sub; }
    $('#msgs').appendChild(el); $('#msgs').scrollTop = 1e9; return el;
  }
  function openChat(item) {
    state.open = item; const c = D.countryOf(item.p.country);
    $('#chatName').textContent = `${c.flag} ${item.p.name} · ${item.r.total}`;
    $('#chatSub').textContent = t('c.sub').replace('{me}', D.LANG_NAME[L()]).replace('{them}', D.LANG_NAME[c.lang]);
    $('#msgs').innerHTML = ''; addMsg('sys', t('c.sys'));
    const gr = D.GREETING[c.lang] || D.GREETING.en;
    const g = addMsg('them', gr[0], c.lang === L() ? undefined : (L() === 'ko' ? gr[1] : '…'));
    if (L() !== 'ko' && c.lang !== L()) translate(gr[0], c.lang, 'en').then(x => $('.tr', g).textContent = x).catch(() => $('.tr', g).textContent = '');
    $('#chat').hidden = false; setTimeout(() => $('#msgIn').focus(), 50);
  }
  $('#chatClose').onclick = () => { $('#chat').hidden = true; state.open = null; };
  $('#chat').addEventListener('click', e => { if (e.target === $('#chat')) $('#chatClose').onclick(); });
  let replyN = 0;
  $('#compose').addEventListener('submit', async e => {
    e.preventDefault(); const text = $('#msgIn').value.trim(); if (!text || !state.open) return;
    $('#msgIn').value = '';
    const c = D.countryOf(state.open.p.country), mine = addMsg('me', text, '…');
    try { const tr = await translate(text, L(), c.lang); $('.tr', mine).textContent = (c.lang === L() ? '' : `→ ${D.LANG_NAME[c.lang]}: ${tr}`); }
    catch (err) { $('.tr', mine).textContent = t('c.fail'); }
    // 데모 답장
    const set = D.REPLIES[c.lang] || null, i = replyN++ % 3;
    setTimeout(async () => {
      if (set) { const [orig, ko] = set[i]; const el = addMsg('them', orig, c.lang === L() ? undefined : (L() === 'ko' ? (ko || '') : '…'));
        if (L() !== 'ko' && c.lang !== L()) translate(orig, c.lang, 'en').then(x => $('.tr', el).textContent = c.lang === 'en' ? '' : x).catch(() => $('.tr', el).textContent = ''); }
      else { const [en, ko] = D.REPLIES.en[i]; const el = addMsg('them', '…', L() === 'ko' ? ko : '');
        try { $('.b', el).textContent = await translate(en, 'en', c.lang); } catch (err) { $('.b', el).textContent = en; } }
    }, 900 + Math.random() * 800);
  });

  /* ---------- 공통 ---------- */
  let toastT; function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2400); }

  /* ---------- 시작 ---------- */
  state.pool = D.generate(240);
  fillSelects(); loadMe(); applyI18n();
  if (location.hash === '#friend' || location.hash === '#date') showTab(location.hash.slice(1));
})();
