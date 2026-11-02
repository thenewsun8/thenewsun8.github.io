/* 매치 · 앱 로직: 1 나를 알기 → 2 매칭 프렌즈 → 3 매칭 데이트 → 4 매칭 그룹
   원칙: 얼굴 없음 · 생년월일은 계산에만 · 상대에겐 별명/나이대/기질/좋아하는 것만 */
(function () {
  'use strict';
  const S = window.Saju, C = window.Compat, D = window.MatchData;
  const $ = (q, el) => (el || document).querySelector(q);
  const $$ = (q, el) => Array.from((el || document).querySelectorAll(q));

  /* ---------- 다국어 UI (ko / en) ---------- */
  const I18N = {
    ko: {
      brand: '매치', 'tab.me': '나를 알기', 'tab.friend': '매칭 프렌즈', 'tab.date': '매칭 데이트', 'tab.group': '매칭 그룹',
      'me.eyebrow': 'Step 1 · Know yourself', 'me.title': '나를 알기',
      'me.lead': '태어난 연·월·일·시를 넣으면 사주 명식(四柱)을 세워 당신의 기질을 읽습니다. 혈액형·MBTI·애니어그램·도형까지 함께 넣을수록 매칭 점수가 정확해집니다.',
      'f.name': '별명', 'f.gender': '성별', 'g.M': '남', 'g.F': '여', 'f.birth': '생년월일', 'f.solar': '(양력 · 비공개)', 'f.time': '태어난 시각', 'f.timeReq': '(필수 · 비공개)',
      'f.country': '태어난 나라', 'f.tz': '(시간대·언어)', 'f.solarFix': '진태양시 보정', 'f.blood': '혈액형', 'f.ennea': '애니어그램', 'f.shape': '도형심리', 'f.bio': '한 줄 소개', 'f.opt': '(선택)',
      'f.interests': '내가 좋아하는 것', 'f.interestsMax': '(최대 5개 · 상대에게 보여요)',
      'opt.unknown': '모름', 'me.local': '입력한 정보는 이 기기(브라우저)에만 저장됩니다.', 'me.submit': '명식 세우기 →',
      'me.privacy': '🔒 생년월일과 시각은 명식 계산에만 쓰이고 상대에게는 보이지 않습니다. 상대가 보는 것은 별명·나이대·나라·기질(일간)·좋아하는 것뿐입니다. 사진은 없습니다 — 내면으로 먼저 친해지는 앱입니다.',
      'm.needMe': '먼저 1단계에서 당신의 명식을 세워야 매칭을 시작할 수 있어요.', 'm.goMe': '1단계로 가기',
      'fl.age': '나이', 'fl.gender': '성별', 'fl.any': '전체', 'fl.country': '나라', 'fl.sort': '정렬', 'fl.sortScore': '점수 높은 순', 'fl.sortAge': '나이 가까운 순', 'fl.sortNear': '거리 가까운 순',
      'm.dateNote': '매칭 데이트는 지금은 남↔여 매칭만 열려 있습니다. 성별은 자동으로 상대 성별로 고정됩니다.',
      'gl.tip': '지구본을 돌려 나라를 누르면 그 나라만 봅니다', 'gl.note': '점 색 = 궁합 점수', 'm.codePh': '친구 코드 붙이기', 'm.codeAdd': '코드로 추가',
      'm.demo': '지금 보이는 사람들은 서버 연결 전 데모용 생성 프로필입니다. 실제 친구는 서로 "내 코드"를 주고받아 추가할 수 있어요. 코드에는 생년월일이 아니라 사주 여덟 글자만 담깁니다.',
      'c.ph': '메시지 (자동 번역되어 전달돼요)', 'c.send': '보내기',
      'friend.eyebrow': 'Step 2 · Matching Friends · 전 세계', 'friend.title': '매칭 프렌즈', 'friend.lead': '내면(인사이드)이 가장 잘 맞는 사람을 찾습니다. 명리·혈액형·MBTI·애니어그램·도형을 모두 따져 점수로 보여주고, 나라가 달라도 자동 번역으로 대화합니다.',
      'date.eyebrow': 'Step 3 · Matching Date', 'date.title': '매칭 데이트', 'date.lead': '연애 궁합입니다. 일간의 합(合)과 일지의 육합·삼합, 음양의 짝을 더 무겁게 봅니다. 얼굴 없이 내면으로 먼저 친해진 뒤, 만남은 두 사람이 정합니다.',
      'group.eyebrow': 'Step 4 · Matching Group', 'group.title': '매칭 그룹', 'group.lead': '혼자 말고 여럿이서. 사주궁합이 서로서로 높은 사람끼리 앱이 모임을 짜 줍니다. 관심사로 묶을 수도, 궁합만으로 묶을 수도 있어요.',
      'gr.size': '모임 인원', 'gr.theme': '묶는 기준', 'gr.onlySaju': '궁합만 (관심사 무관)', 'gr.help': '모임 안의 모든 짝(1:1) 궁합을 계산해 가장 낮은 짝 점수가 높은 조합부터 고릅니다.', 'gr.reroll': '다시 짜기 🎲',
      'gr.name': '모임', 'gr.avg': '평균 궁합', 'gr.min': '최저 짝', 'gr.elems': '모임 오행 균형', 'gr.talk': '그룹 대화', 'gr.none': '조건에 맞는 사람이 모자라요. 나이·나라를 넓히거나 기준을 "궁합만"으로 바꿔 보세요.', 'gr.me': '나', 'gr.sys': '그룹 데모 대화입니다. 멤버 답장은 자동 생성되고 내 언어로 번역돼 보입니다.',
      'reco.title': '앱이 고른 오늘의 추천', 'reco.sub': '점수가 가장 높은 세 사람. 누르면 바로 대화가 열립니다.', 'reco.go': '바로 대화 →',
      'all': '전 세계 🌍', 'score.friend': '궁합 점수', 'score.date': '인연 점수', 'people': '명', 'talk': '대화하기', 'detail': '자세히', 'close': '닫기', 'shared': '공통',
      'r.title': '명식 (四柱八字)', 'r.hour': '시주', 'r.day': '일주', 'r.month': '월주', 'r.year': '연주', 'r.dm': '일간(나)', 'r.elem': '오행 분포', 'r.strength': '신강·신약', 'r.yong': '용신(필요한 기운)', 'r.animal': '띠', 'r.ten': '십신 키워드',
      'r.save': '저장하고 매칭하러 가기 →', 'r.code': '내 코드 복사', 'r.edit': '다시 입력', 'r.copied': '내 코드를 복사했어요. 친구에게 보내세요. (생일 없이 사주 여덟 글자만 담겨요)', 'r.public': '상대에게 보이는 내 모습',
      'yin': '음', 'yang': '양', 'pol': '음양', 'stem.harmony': '천간합', 'stem.gen': '상생', 'stem.peer': '같은 오행', 'stem.same': '같은 일간', 'stem.ctrl': '상극', 'stem.clash': '천간충',
      'br.six': '육합', 'br.tri': '삼합', 'br.same': '같은 지지', 'br.none': '무난', 'br.punish': '형(刑)', 'br.wonjin': '원진', 'br.clash': '충(沖)',
      'd.stem': '일간 관계', 'd.dayB': '일지 관계', 'd.yearB': '띠(연지) 관계', 'd.comp': '오행 보완', 'd.yy': '음양 조화',
      'p.saju': '명리', 'p.mbti': 'MBTI', 'p.ennea': '애니어', 'p.blood': '혈액형', 'p.shape': '도형', 'w': '비중',
      'code.bad': '코드를 읽을 수 없어요', 'code.added': '추가했어요: ', 'code.dup': '이미 추가된 사람이에요',
      'c.sub': '자동 번역 · {me} ↔ {them}', 'c.sys': '데모 대화입니다. 상대 답장은 자동 생성되고, 번역은 무료 번역 서버(MyMemory)를 사용합니다.', 'c.fail': '번역 서버에 연결하지 못해 원문으로 보냈어요',
      'quick': ['안녕하세요! 점수 보고 인사드려요 🙂', '뭘 좋아하세요?', '주말엔 보통 뭐 하세요?', '요즘 빠져 있는 게 있나요?', '제 일간은 {dm}이에요. 어떤 사람 같나요?'],
      'shape.circle': '○ 동그라미 — 관계·배려·조화', 'shape.triangle': '△ 세모 — 목표·추진·리더', 'shape.square': '□ 네모 — 원칙·꼼꼼·성실', 'shape.s': 'S 물결 — 자유·창의·감성',
      'shape.help': '도형심리: 네 도형 중 가장 끌리는 것이 당신의 기질입니다. ○ 관계형 · △ 목표형 · □ 원칙형 · S 창의형',
      'ennea.names': ['개혁가','조력가','성취자','예술가','탐구자','충실가','열정가','도전자','평화주의자'],
      'nomatch': '조건에 맞는 사람이 없어요. 나이·나라 범위를 넓혀 보세요.', 'me.gender': '성별을 선택해 주세요', 'dist': 'km', 'maxInterests': '좋아하는 것은 5개까지만 고를 수 있어요',
      'ageBand': a => `${Math.floor(a / 10) * 10}대 ${a % 10 < 4 ? '초반' : a % 10 < 7 ? '중반' : '후반'}`,
      'solarNote': (city, min) => `(${city} ${min > 0 ? '+' : '−'}${Math.abs(min)}분)`
    },
    en: {
      brand: 'Match', 'tab.me': 'Know Me', 'tab.friend': 'Match Friends', 'tab.date': 'Match Date', 'tab.group': 'Match Group',
      'me.eyebrow': 'Step 1 · Know yourself', 'me.title': 'Know Me',
      'me.lead': 'Enter your birth year, month, day and hour to build your Four Pillars (Saju) chart. Add blood type, MBTI, Enneagram and shape type for a more accurate match score.',
      'f.name': 'Nickname', 'f.gender': 'Gender', 'g.M': 'Male', 'g.F': 'Female', 'f.birth': 'Birth date', 'f.solar': '(solar · private)', 'f.time': 'Birth time', 'f.timeReq': '(required · private)',
      'f.country': 'Birth country', 'f.tz': '(time zone · language)', 'f.solarFix': 'True solar time fix', 'f.blood': 'Blood type', 'f.ennea': 'Enneagram', 'f.shape': 'Shape type', 'f.bio': 'One-line intro', 'f.opt': '(optional)',
      'f.interests': 'Things I love', 'f.interestsMax': '(up to 5 · visible to others)',
      'opt.unknown': 'Unknown', 'me.local': 'Your data stays on this device only.', 'me.submit': 'Build my chart →',
      'me.privacy': '🔒 Your birth date and time are used only to compute the chart and are never shown to others. Others see only your nickname, age range, country, temperament (day master) and what you love. No photos — this app lets you get close from the inside first.',
      'm.needMe': 'Build your chart in Step 1 first to start matching.', 'm.goMe': 'Go to Step 1',
      'fl.age': 'Age', 'fl.gender': 'Gender', 'fl.any': 'Any', 'fl.country': 'Country', 'fl.sort': 'Sort', 'fl.sortScore': 'Highest score', 'fl.sortAge': 'Closest age', 'fl.sortNear': 'Nearest',
      'm.dateNote': 'Match Date is currently open for man↔woman matching only. Gender is fixed to the opposite of yours.',
      'gl.tip': 'Spin the globe and tap a country to filter', 'gl.note': 'dot color = match score', 'm.codePh': 'Paste a friend code', 'm.codeAdd': 'Add by code',
      'm.demo': 'People shown here are generated demo profiles until a server is connected. Real friends can be added by exchanging "my code", which carries only the eight Saju characters, not a birth date.',
      'c.ph': 'Message (auto-translated)', 'c.send': 'Send',
      'friend.eyebrow': 'Step 2 · Matching Friends · Worldwide', 'friend.title': 'Match Friends', 'friend.lead': 'Finds the people whose inner self fits yours best. Saju, blood type, MBTI, Enneagram and shape type combine into one score, and auto-translation lets you talk across countries.',
      'date.eyebrow': 'Step 3 · Matching Date', 'date.title': 'Match Date', 'date.lead': 'Romantic compatibility. Day-master harmony, day-branch unions and yin–yang pairing weigh more. Get close from the inside first; meeting is up to the two of you.',
      'group.eyebrow': 'Step 4 · Matching Group', 'group.title': 'Match Group', 'group.lead': 'Not alone, together. The app forms groups of people whose Saju compatibility is high with each other. Group by a shared interest, or by compatibility alone.',
      'gr.size': 'Group size', 'gr.theme': 'Group by', 'gr.onlySaju': 'Compatibility only', 'gr.help': 'Every pair inside the group is scored; groups whose weakest pair is strongest come first.', 'gr.reroll': 'Reshuffle 🎲',
      'gr.name': 'Group', 'gr.avg': 'avg match', 'gr.min': 'weakest pair', 'gr.elems': 'Group element balance', 'gr.talk': 'Group chat', 'gr.none': 'Not enough people for these filters. Widen age or country, or switch to "Compatibility only".', 'gr.me': 'me', 'gr.sys': 'Demo group chat. Member replies are auto-generated and shown translated into your language.',
      'reco.title': 'Picked for you today', 'reco.sub': 'The three highest scores. Tap one to start talking right away.', 'reco.go': 'Talk now →',
      'all': 'Worldwide 🌍', 'score.friend': 'Match score', 'score.date': 'Destiny score', 'people': 'people', 'talk': 'Talk', 'detail': 'Details', 'close': 'Close', 'shared': 'shared',
      'r.title': 'Four Pillars chart', 'r.hour': 'Hour', 'r.day': 'Day', 'r.month': 'Month', 'r.year': 'Year', 'r.dm': 'Day master (you)', 'r.elem': 'Five elements', 'r.strength': 'Strength', 'r.yong': 'Needed element', 'r.animal': 'Zodiac', 'r.ten': 'Ten-gods keywords',
      'r.save': 'Save and start matching →', 'r.code': 'Copy my code', 'r.edit': 'Edit', 'r.copied': 'Your code is copied. Send it to a friend. (It holds only the eight Saju characters, not your birthday.)', 'r.public': 'What others see of you',
      'yin': 'Yin', 'yang': 'Yang', 'pol': 'Yin/Yang', 'stem.harmony': 'Stem union', 'stem.gen': 'Generating', 'stem.peer': 'Same element', 'stem.same': 'Same day master', 'stem.ctrl': 'Controlling', 'stem.clash': 'Stem clash',
      'br.six': 'Six harmony', 'br.tri': 'Trine', 'br.same': 'Same branch', 'br.none': 'Neutral', 'br.punish': 'Punishment', 'br.wonjin': 'Resentment', 'br.clash': 'Clash',
      'd.stem': 'Day masters', 'd.dayB': 'Day branches', 'd.yearB': 'Zodiac (year branch)', 'd.comp': 'Element complement', 'd.yy': 'Yin–yang balance',
      'p.saju': 'Saju', 'p.mbti': 'MBTI', 'p.ennea': 'Ennea', 'p.blood': 'Blood', 'p.shape': 'Shape', 'w': 'weight',
      'code.bad': 'Could not read that code', 'code.added': 'Added: ', 'code.dup': 'Already added',
      'c.sub': 'Auto-translate · {me} ↔ {them}', 'c.sys': 'Demo chat. Replies are auto-generated; translation uses the free MyMemory service.', 'c.fail': 'Translation server unreachable — sent original text',
      'quick': ['Hi! Saw our score and wanted to say hello 🙂', 'What do you love doing?', 'What do you usually do on weekends?', 'Anything you\'re into lately?', 'My day master is {dm}. What does that say about me?'],
      'shape.circle': '○ Circle — relationships · care · harmony', 'shape.triangle': '△ Triangle — goals · drive · leadership', 'shape.square': '□ Square — principles · precision · diligence', 'shape.s': 'S Wave — freedom · creativity · feeling',
      'shape.help': 'Shape psychology: the shape you are drawn to most reflects your temperament. ○ relational · △ goal-driven · □ principled · S creative',
      'ennea.names': ['Reformer','Helper','Achiever','Individualist','Investigator','Loyalist','Enthusiast','Challenger','Peacemaker'],
      'nomatch': 'Nobody matches these filters. Try widening age or country.', 'me.gender': 'Please choose a gender', 'dist': 'km', 'maxInterests': 'You can pick up to 5',
      'ageBand': a => `${a % 10 < 4 ? 'early' : a % 10 < 7 ? 'mid' : 'late'} ${Math.floor(a / 10) * 10}s`,
      'solarNote': (city, min) => `(${city} ${min > 0 ? '+' : '−'}${Math.abs(min)} min)`
    }
  };
  const state = { lang: localStorage.getItem('match.lang') || 'ko', me: null, mode: 'friend', pool: [], added: [], open: null, scoreCache: new Map(), friendGender: 'any', groupSeed: 0, groups: [] };
  const t = (k, ...a) => { const v = I18N[state.lang][k] ?? I18N.ko[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
  const L = () => state.lang;
  const cName = c => L() === 'ko' ? c.ko : c.en;
  const iName = id => { const i = D.interestOf(id); return i ? `${i.icon} ${L() === 'ko' ? i.ko : i.en}` : id; };

  function applyI18n() {
    $$('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n, small = el.querySelector('small');
      if (small) el.firstChild.nodeValue = t(k) + ' ';
      else el.textContent = t(k);
    });
    $$('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
    $('#langBtn').textContent = L() === 'ko' ? 'EN' : '한국어';
    document.documentElement.lang = L();
    fillSelects(); setSolarNote(); renderInterestChips();
    if (state.me) renderMe();
    if (!$('#tab-match').hidden) renderMatch();
    if (!$('#tab-group').hidden) renderGroups(false);
  }

  /* ---------- 폼 ---------- */
  const form = $('#meForm');
  let myInterests = [];
  function countryOptions(all) { return (all ? `<option value="ALL">${t('all')}</option>` : '') + D.COUNTRIES.map(c => `<option value="${c.code}">${c.flag} ${cName(c)}</option>`).join(''); }
  function keepValue(sel, html, def) { const cur = sel.value || def; sel.innerHTML = html; sel.value = cur; if (sel.selectedIndex < 0) sel.value = def; }
  function fillSelects() {
    keepValue($('#meCountry'), countryOptions(false), 'KR');
    keepValue($('#meMbti'), `<option value="">${t('opt.unknown')}</option>` + D.MBTI.map(m => `<option>${m}</option>`).join(''), '');
    keepValue($('#meEnnea'), `<option value="">${t('opt.unknown')}</option>` + t('ennea.names').map((n, i) => `<option value="${i + 1}">${i + 1} · ${n}</option>`).join(''), '');
    keepValue($('#meShape'), `<option value="">${t('opt.unknown')}</option>` + D.SHAPES.map(s => `<option value="${s}">${t('shape.' + s)}</option>`).join(''), '');
    $('#shapeHelp').textContent = t('shape.help');
    keepValue($('#countryFilter'), countryOptions(true), 'ALL');
    keepValue($('#gCountry'), countryOptions(true), 'ALL');
    keepValue($('#gTheme'), `<option value="">${t('gr.onlySaju')}</option>` + D.INTERESTS.map(i => `<option value="${i.id}">${i.icon} ${L() === 'ko' ? i.ko : i.en}</option>`).join(''), '');
  }
  function renderInterestChips() {
    $('#meInterests').innerHTML = D.INTERESTS.map(i => `<button type="button" data-i="${i.id}" aria-pressed="${myInterests.includes(i.id)}">${i.icon} ${L() === 'ko' ? i.ko : i.en}</button>`).join('');
  }
  $('#meInterests').addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b) return;
    const id = b.dataset.i;
    if (myInterests.includes(id)) myInterests = myInterests.filter(x => x !== id);
    else if (myInterests.length >= 5) { toast(t('maxInterests')); return; }
    else myInterests.push(id);
    b.setAttribute('aria-pressed', String(myInterests.includes(id)));
  });
  const solarFixFor = c => Math.round((c.lon - c.tz * 15) * 4);
  function setSolarNote() { const c = D.countryOf($('#meCountry').value); $('#solarFixNote').textContent = t('solarNote', cName(c), solarFixFor(c)); }
  $('#meCountry').addEventListener('change', setSolarNote);
  $$('#genderSeg button').forEach(b => b.addEventListener('click', () => {
    $$('#genderSeg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    form.gender.value = b.dataset.v;
  }));

  function sajuOf(p) {
    if (p.arr) return S.analyze(p.arr);                      // 코드로 받은 사람: 여덟 글자만 있음
    const c = D.countryOf(p.country);
    return S.compute({ y: p.y, m: p.m, d: p.d, hh: p.hh, mm: p.mm, tz: c.tz, solarFix: p.solar === false ? 0 : solarFixFor(c) });
  }
  function personOf(p) {
    if (!p._saju) p._saju = sajuOf(p);
    return { saju: p._saju, mbti: p.mbti || null, ennea: p.ennea ? +p.ennea : null, blood: p.blood || null, shape: p.shape || null };
  }
  const ageOf = p => { if (p.age) return p.age; const n = new Date(); let a = n.getFullYear() - p.y; if (n.getMonth() + 1 < p.m || (n.getMonth() + 1 === p.m && n.getDate() < p.d)) a--; return a; };

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.gender.value) { toast(t('me.gender')); return; }
    const [y, m, d] = form.birth.value.split('-').map(Number), [hh, mm] = form.time.value.split(':').map(Number);
    const c = D.countryOf(form.country.value);
    state.me = { id: 'me', name: form.name.value.trim(), gender: form.gender.value, y, m, d, hh, mm, country: c.code, solar: form.solar.checked,
      blood: form.blood.value, mbti: form.mbti.value, ennea: form.ennea.value ? +form.ennea.value : '', shape: form.shape.value, bio: form.bio.value.trim(), interests: myInterests.slice(), lat: c.lat, lon: c.lon };
    state.scoreCache.clear(); state.groups = [];
    saveMe(); renderMe(); $('#meResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const noCache = (k, v) => k === '_saju' ? undefined : v;
  function saveMe() { localStorage.setItem('match.me', JSON.stringify(state.me, noCache)); }
  function loadMe() {
    try { state.me = JSON.parse(localStorage.getItem('match.me')); } catch (e) { state.me = null; }
    try { state.added = JSON.parse(localStorage.getItem('match.added')) || []; } catch (e) { state.added = []; }
    if (state.me) {
      const p = state.me; myInterests = (p.interests || []).slice();
      form.name.value = p.name; form.gender.value = p.gender; $$('#genderSeg button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === p.gender)));
      form.birth.value = `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`; form.time.value = `${String(p.hh).padStart(2, '0')}:${String(p.mm).padStart(2, '0')}`;
      form.country.value = p.country; form.solar.checked = p.solar !== false; form.blood.value = p.blood || ''; form.mbti.value = p.mbti || ''; form.ennea.value = p.ennea || ''; form.shape.value = p.shape || ''; form.bio.value = p.bio || '';
      setSolarNote(); renderInterestChips();
    }
  }

  /* ---------- 공통 조각 ---------- */
  const elemColor = e => S.ELEM_COLOR[e];
  const elemName = e => L() === 'ko' ? S.ELEM[e] + S.ELEM_HANJA[e] : S.ELEM_EN[e];
  const avatar = (sj, cls) => `<div class="ava ${cls || ''}" style="color:${elemColor(sj.dayMasterElem)};border-color:${elemColor(sj.dayMasterElem)}">${S.STEMS[sj.dayMaster]}</div>`;
  const interestTags = (p, mine) => (p.interests || []).map(id => `<span class="tag ${mine && mine.includes(id) ? 'shared' : ''}">${iName(id)}</span>`).join('');
  const ebar = elems => { const tot = elems.reduce((s, x) => s + x, 0) || 1; return `<div class="ebar">${elems.map((v, i) => `<i style="width:${v / tot * 100}%;background:${elemColor(i)}" title="${elemName(i)} ${v.toFixed(1)}"></i>`).join('')}</div>`; };

  /* ---------- 명식 렌더 ---------- */
  function renderMe() {
    const p = state.me; p._saju = null; const r = personOf(p).saju;
    const labels = { hour: t('r.hour'), day: t('r.day'), month: t('r.month'), year: t('r.year') };
    const pil = r.pillars.map(pl => `<div class="pil ${pl.key}"><div class="lb">${labels[pl.key]}</div>
      <div class="hz" style="color:${elemColor(S.STEM_ELEM[pl.s])}">${S.STEMS[pl.s]}</div><div class="rd">${S.STEM_KO[pl.s]} · ${elemName(S.STEM_ELEM[pl.s])} · ${pl.s % 2 ? t('yin') : t('yang')}</div>
      <div class="hz" style="color:${elemColor(S.BRANCH_ELEM[pl.b])}">${S.BRANCHES[pl.b]}</div><div class="rd">${S.BRANCH_KO[pl.b]} · ${elemName(S.BRANCH_ELEM[pl.b])}</div></div>`).join('');
    const bars = [0,1,2,3,4].map(e => `<div class="bar"><span style="color:${elemColor(e)}">${elemName(e)}</span><i><b style="width:${Math.round(r.elems[e] / r.total * 160)}%;background:${elemColor(e)}"></b></i><em>${r.elems[e].toFixed(1)}</em></div>`).join('');
    const dmText = S.DAY_MASTER_TEXT[L()][r.dayMaster];
    const tens = Object.entries(r.tenGods).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => `<span class="tag gold">${L() === 'ko' ? k : ''} ${S.TEN_TEXT[L()][k]} ×${v}</span>`).join('');
    const animal = L() === 'ko' ? S.ANIMALS[r.animal] + '띠' : S.ANIMALS_EN[r.animal];
    const c = D.countryOf(p.country);
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
      <div class="card fade" style="border-color:var(--ok)">
        <div class="eyebrow" style="color:var(--ok)">${t('r.public')}</div>
        <div class="person" style="border:0;padding:10px 0 0;background:none"><div class="who">${avatar(r)}<div class="txt"><div class="nm"><b>${c.flag} ${p.name}</b><span>${t('ageBand', ageOf(p))} · ${cName(c)} · ${D.LANG_NAME[c.lang]}</span></div>
          <div class="tags"><span class="tag" style="border-color:${elemColor(r.dayMasterElem)};color:${elemColor(r.dayMasterElem)}">${S.STEMS[r.dayMaster]}${S.ELEM_HANJA[r.dayMasterElem]}</span>${p.mbti ? `<span class="tag">${p.mbti}</span>` : ''}${p.ennea ? `<span class="tag">E${p.ennea}</span>` : ''}${p.blood ? `<span class="tag">${p.blood}</span>` : ''}${p.shape ? `<span class="tag">${t('shape.' + p.shape).slice(0, 1)}</span>` : ''}</div>
          <div class="tags">${interestTags(p)}</div><div class="bio">${p.bio || ''}</div></div></div></div>
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

  /* ---------- 코드 공유 (v2: 생일 대신 사주 여덟 글자) ---------- */
  const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4))));
  function encodeProfile(p) {
    const sj = personOf(p).saju;
    return 'MATCH2.' + b64(JSON.stringify({ n: p.name, g: p.gender, a: ageOf(p), p: sj.arr, c: p.country, b: p.blood || '', t: p.mbti || '', e: p.ennea || '', f: p.shape || '', o: p.bio || '', i: p.interests || [] }));
  }
  function decodeProfile(code) {
    const m = /MATCH([12])\.([A-Za-z0-9_-]+)/.exec(code.trim()); if (!m) return null;
    try {
      const o = JSON.parse(unb64(m[2])); const c = D.countryOf(o.c); const id = 'c' + m[2].slice(0, 12);
      if (!o.n) return null;
      if (m[1] === '2') return { id, name: o.n, gender: o.g, age: +o.a, arr: o.p, country: c.code, blood: o.b, mbti: o.t, ennea: o.e, shape: o.f, bio: o.o, interests: o.i || [], lat: c.lat, lon: c.lon, real: true };
      return { id, name: o.n, gender: o.g, y: +o.y, m: +o.m, d: +o.d, hh: +o.h, mm: +o.i, country: c.code, solar: !!o.s, blood: o.b, mbti: o.t, ennea: o.e, shape: o.f, bio: o.o, interests: [], lat: c.lat, lon: c.lon, real: true };
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
    $('#tab-me').hidden = name !== 'me'; $('#tab-match').hidden = !(name === 'friend' || name === 'date'); $('#tab-group').hidden = name !== 'group';
    if (name === 'friend' || name === 'date') { state.mode = name; renderMatch(); }
    if (name === 'group') renderGroups(false);
    window.scrollTo({ top: 0 });
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) showTab(b.dataset.tab); });
  $('#langBtn').onclick = () => { state.lang = L() === 'ko' ? 'en' : 'ko'; localStorage.setItem('match.lang', state.lang); applyI18n(); };

  /* ---------- 매칭 (프렌즈 / 데이트) ---------- */
  const scoreOf = (p, mode) => {
    const k = p.id + mode; if (state.scoreCache.has(k)) return state.scoreCache.get(k);
    const r = C.match(personOf(state.me), personOf(p), mode); state.scoreCache.set(k, r); return r;
  };
  const km = (a, b) => { const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180, la = a.lat * Math.PI / 180, lb = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const allPeople = () => state.pool.concat(state.added);
  let scored = [];
  function personCard(p, r, dist, mode) {
    const c = D.countryOf(p.country), sj = p._saju, cls = r.total >= 80 ? 'hi' : r.total >= 65 ? 'mid' : 'lo';
    const shared = C.sharedInterests(state.me.interests, p.interests);
    const chips = [`<span class="tag" style="border-color:${elemColor(sj.dayMasterElem)};color:${elemColor(sj.dayMasterElem)}">${S.STEMS[sj.dayMaster]}${S.ELEM_HANJA[sj.dayMasterElem]}</span>`,
      p.mbti ? `<span class="tag">${p.mbti}</span>` : '', p.ennea ? `<span class="tag">E${p.ennea}</span>` : '', p.blood ? `<span class="tag">${p.blood}</span>` : '', p.shape ? `<span class="tag">${t('shape.' + p.shape).slice(0, 1)}</span>` : '',
      p.real ? `<span class="tag gold">REAL</span>` : ''].join('');
    const mini = ['saju','mbti','ennea','blood','shape'].map(k => `<div><b>${r.parts[k].weight ? r.parts[k].score : '–'}</b>${t('p.' + k)}<br><span style="font-size:10px">${t('w')} ${r.parts[k].weight}%</span></div>`).join('');
    return `<article class="person fade" data-id="${p.id}">
      <div class="who">${avatar(sj)}<div class="txt"><div class="nm"><b>${c.flag} ${p.name}</b><span>${t('ageBand', ageOf(p))} · ${cName(c)} · ${D.LANG_NAME[c.lang]}${dist != null ? ` · ${Math.round(dist)}${t('dist')}` : ''}</span></div>
        <div class="tags">${chips}</div><div class="tags">${interestTags(p, state.me.interests)}${shared.length ? `<span class="tag shared">${t('shared')} ${shared.length}</span>` : ''}</div><div class="bio">${p.bio || ''}</div></div></div>
      <div class="score ${cls}"><b>${r.total}</b><small>${t('score.' + mode)}</small></div>
      <div class="mini">${mini}</div>
      <div class="more" hidden></div>
      <div class="acts"><button class="btn s" data-more>${t('detail')}</button><button class="btn p s" data-talk>${t('talk')}</button></div></article>`;
  }
  function renderMatch() {
    const mode = state.mode;
    $('#mEyebrow').textContent = t(mode + '.eyebrow'); $('#mTitle').textContent = t(mode + '.title'); $('#mLead').textContent = t(mode + '.lead');
    const need = !state.me; $('#needMe').hidden = !need; $('#matchBody').hidden = need; if (need) return;
    const isDate = mode === 'date';
    $('#dateNote').hidden = !isDate; $('#genderFilterWrap').style.opacity = isDate ? .45 : 1; $('#genderFilter').disabled = isDate;
    $('#genderFilter').value = isDate ? (state.me.gender === 'M' ? 'F' : 'M') : (state.friendGender || 'any');
    const aMin = +$('#ageMin').value || 0, aMax = +$('#ageMax').value || 200, g = $('#genderFilter').value, cf = $('#countryFilter').value, sort = $('#sortSel').value;
    scored = allPeople().filter(p => { const a = ageOf(p); return a >= aMin && a <= aMax && (g === 'any' || p.gender === g) && (cf === 'ALL' || p.country === cf); })
      .map(p => ({ p, r: scoreOf(p, mode), age: ageOf(p), dist: km(state.me, p) }));
    const myAge = ageOf(state.me);
    scored.sort((a, b) => sort === 'age' ? Math.abs(a.age - myAge) - Math.abs(b.age - myAge) || b.r.total - a.r.total
                        : sort === 'near' ? a.dist - b.dist || b.r.total - a.r.total : b.r.total - a.r.total);
    $('#mCount').textContent = `${scored.length} ${t('people')} · ${t('score.' + mode)}`;
    // 앱이 고른 추천 TOP 3 — 한 번 누르면 바로 대화
    const top = scored.slice().sort((a, b) => b.r.total - a.r.total).slice(0, 3);
    $('#reco').hidden = !top.length;
    $('#reco').innerHTML = `<div class="eyebrow" style="color:var(--gold)">✦ ${t('reco.title')}</div><p class="help">${t('reco.sub')}</p>
      <div class="top">${top.map(x => { const c = D.countryOf(x.p.country), sj = x.p._saju; return `<button class="pick" data-pick="${x.p.id}">${avatar(sj)}<b>${c.flag} ${x.p.name}</b><span class="sc">${x.r.total}</span><small>${t('ageBand', x.age)} · ${cName(c)}<br>${S.STEMS[sj.dayMaster]}${S.ELEM_HANJA[sj.dayMasterElem]}${x.p.mbti ? ' · ' + x.p.mbti : ''}</small><span class="go">${t('reco.go')}</span></button>`; }).join('')}</div>`;
    const list = $('#mList');
    if (!scored.length) { list.innerHTML = `<div class="empty">${t('nomatch')}</div>`; drawGlobe(); return; }
    const shown = scored.filter(x => x.p.real).concat(scored.filter(x => !x.p.real)).slice(0, 60);   // 실제 친구(코드로 추가)는 항상 위에
    list.innerHTML = shown.map(x => personCard(x.p, x.r, x.dist, mode)).join('');
    drawGlobe();
  }
  $('#reco').addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (!b) return; const item = scored.find(x => x.p.id === b.dataset.pick); if (item) openChat(item); });
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

  /* ---------- 매칭 그룹 ---------- */
  function renderGroups(reshuffle) {
    const need = !state.me; $('#needMe2').hidden = !need; $('#groupBody').hidden = need; if (need) return;
    const size = +$('#gSize').value, theme = $('#gTheme').value, cf = $('#gCountry').value, aMin = +$('#gAgeMin').value || 0, aMax = +$('#gAgeMax').value || 200;
    if (reshuffle) state.groupSeed++;
    let cands = allPeople().filter(p => { const a = ageOf(p); return a >= aMin && a <= aMax && (cf === 'ALL' || p.country === cf) && (!theme || (p.interests || []).includes(theme)); })
      .map(p => ({ id: p.id, p, person: personOf(p), s: scoreOf(p, 'friend').total }))
      .sort((a, b) => b.s - a.s).slice(state.groupSeed * 6, state.groupSeed * 6 + 48);   // 나와의 궁합 상위권에서 묶는다 (다시 짜기 = 다음 구간)
    if (cands.length < size - 1) { if (state.groupSeed > 0) { state.groupSeed = 0; return renderGroups(false); } $('#gList').innerHTML = `<div class="empty">${t('gr.none')}</div>`; state.groups = []; return; }
    state.groups = C.formGroups(personOf(state.me), cands, size, 3);
    const themeName = theme ? iName(theme) : t('gr.onlySaju');
    $('#gList').innerHTML = state.groups.map((g, gi) => {
      const elems = [0,0,0,0,0]; g.members.forEach(m => { const sj = m.id === 'me' ? state.me._saju : m.p._saju; sj.elems.forEach((v, i) => elems[i] += v); });
      const mems = g.members.map(m => {
        if (m.id === 'me') return `<div class="mem me">${avatar(state.me._saju)}<div><b>${state.me.name}</b> <small>${t('gr.me')}</small></div></div>`;
        const c = D.countryOf(m.p.country);
        return `<div class="mem">${avatar(m.p._saju)}<div><b>${c.flag} ${m.p.name}</b><small>${t('ageBand', ageOf(m.p))} · ${S.STEMS[m.p._saju.dayMaster]}${S.ELEM_HANJA[m.p._saju.dayMasterElem]}${m.p.mbti ? ' · ' + m.p.mbti : ''} · ${m.s}</small></div></div>`;
      }).join('');
      return `<section class="group fade" data-g="${gi}">
        <div class="hd"><div><div class="eyebrow">${t('gr.name')} ${gi + 1} · ${themeName}</div><h3>${g.members.length}${L() === 'ko' ? '명' : ' people'} · ${t('gr.avg')} <span style="color:var(--ok)">${g.avg}</span> · ${t('gr.min')} ${g.min}</h3></div>
          <button class="btn p s" data-gtalk>${t('gr.talk')}</button></div>
        <div class="members">${mems}</div>
        <div><div class="help" style="margin-bottom:4px">${t('gr.elems')}</div>${ebar(elems)}</div>
      </section>`;
    }).join('');
  }
  ['gSize','gTheme','gCountry','gAgeMin','gAgeMax'].forEach(id => $('#' + id).addEventListener('change', () => { state.groupSeed = 0; renderGroups(false); }));
  $('#gReroll').onclick = () => renderGroups(true);
  $('#gList').addEventListener('click', e => { const b = e.target.closest('[data-gtalk]'); if (!b) return; const g = state.groups[+e.target.closest('.group').dataset.g]; if (g) openGroupChat(g); });

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
    gctx.strokeStyle = 'rgba(255,255,255,.07)'; gctx.lineWidth = 1;
    for (let lon = -180; lon < 180; lon += 30) { gctx.beginPath(); let on = false; for (let lat = -90; lat <= 90; lat += 3) { const p = project(lat, lon, R, cx, cy); if (p.z > 0) { on ? gctx.lineTo(p.x, p.y) : gctx.moveTo(p.x, p.y); on = true; } else on = false; } gctx.stroke(); }
    for (let lat = -60; lat <= 60; lat += 30) { gctx.beginPath(); let on = false; for (let lon = -180; lon <= 180; lon += 3) { const p = project(lat, lon, R, cx, cy); if (p.z > 0) { on ? gctx.lineTo(p.x, p.y) : gctx.moveTo(p.x, p.y); on = true; } else on = false; } gctx.stroke(); }
    gctx.restore();
    gctx.strokeStyle = 'rgba(255,107,91,.5)'; gctx.lineWidth = 2; gctx.beginPath(); gctx.arc(cx, cy, R, 0, Math.PI * 2); gctx.stroke();
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
    if (state.me) { const me = project(state.me.lat, state.me.lon, R, cx, cy); if (me.z > 0) { gctx.strokeStyle = '#FF6B5B'; gctx.lineWidth = 3; gctx.beginPath(); gctx.arc(me.x, me.y, 9, 0, Math.PI * 2); gctx.stroke(); } }
  }
  function pos(e) { const b = GLOBE.getBoundingClientRect(); const s = GLOBE.width / b.width; return { x: (e.clientX - b.left) * s, y: (e.clientY - b.top) * s }; }
  GLOBE.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, moved: false, lon: rot.lon, lat: rot.lat }; auto = false; GLOBE.setPointerCapture(e.pointerId); });
  GLOBE.addEventListener('pointermove', e => {
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 4) drag.moved = true;
      rot.lon = drag.lon + dx * 0.5; rot.lat = Math.max(-80, Math.min(80, drag.lat + dy * 0.5)); drawGlobe(); return; }
    const p = pos(e), d = dots.find(o => Math.hypot(o.x - p.x, o.y - p.y) < o.r + 4);
    GLOBE.style.cursor = d ? 'pointer' : 'grab';
    if (d) { const c = D.countryOf(d.code); $('#globeTip').textContent = `${c.flag} ${cName(c)} · ${d.n}${t('people')} · ${L() === 'ko' ? '최고' : 'best'} ${d.best}`; }
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
  function addMsg(cls, text, sub, who) {
    const el = document.createElement('div'); el.className = 'msg ' + cls;
    el.innerHTML = cls === 'sys' ? text : `${who ? '<div class="nm"></div>' : ''}<div class="b"></div>${sub !== undefined ? '<div class="tr"></div>' : ''}`;
    if (cls !== 'sys') { if (who) $('.nm', el).textContent = who; $('.b', el).textContent = text; if (sub !== undefined) $('.tr', el).textContent = sub; }
    $('#msgs').appendChild(el); $('#msgs').scrollTop = 1e9; return el;
  }
  function renderQuick() {
    const dm = state.me ? S.STEMS[state.me._saju.dayMaster] + S.ELEM_HANJA[state.me._saju.dayMasterElem] : '';
    $('#quick').innerHTML = t('quick').map(q => `<button type="button" data-q="${q.replace('{dm}', dm).replace(/"/g, '&quot;')}">${q.replace('{dm}', dm)}</button>`).join('');
  }
  $('#quick').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (!b) return; $('#msgIn').value = b.dataset.q; $('#compose').requestSubmit(); });
  function openChat(item) {
    state.open = { kind: 'one', item }; const c = D.countryOf(item.p.country);
    $('#chatName').textContent = `${c.flag} ${item.p.name} · ${item.r.total}`;
    $('#chatSub').textContent = t('c.sub').replace('{me}', D.LANG_NAME[L()]).replace('{them}', D.LANG_NAME[c.lang]);
    $('#msgs').innerHTML = ''; addMsg('sys', t('c.sys')); renderQuick();
    const gr = D.GREETING[c.lang] || D.GREETING.en;
    const g = addMsg('them', gr[0], c.lang === L() ? undefined : (L() === 'ko' ? gr[1] : '…'));
    if (L() !== 'ko' && c.lang !== L()) translate(gr[0], c.lang, 'en').then(x => $('.tr', g).textContent = x).catch(() => $('.tr', g).textContent = '');
    $('#chat').hidden = false; setTimeout(() => $('#msgIn').focus(), 50);
  }
  function openGroupChat(g) {
    state.open = { kind: 'group', g, n: 0 };
    const others = g.members.filter(m => m.id !== 'me');
    $('#chatName').textContent = `${t('gr.name')} · ${g.members.length}${L() === 'ko' ? '명' : ''} · ${t('gr.avg')} ${g.avg}`;
    $('#chatSub').textContent = others.map(m => D.countryOf(m.p.country).flag + ' ' + m.p.name).join(' · ');
    $('#msgs').innerHTML = ''; addMsg('sys', t('gr.sys')); renderQuick();
    const first = others[0], lines = D.GROUP_LINES[L()] || D.GROUP_LINES.ko;
    addMsg('them', lines[0], undefined, D.countryOf(first.p.country).flag + ' ' + first.p.name);
    $('#chat').hidden = false; setTimeout(() => $('#msgIn').focus(), 50);
  }
  $('#chatClose').onclick = () => { $('#chat').hidden = true; state.open = null; };
  $('#chat').addEventListener('click', e => { if (e.target === $('#chat')) $('#chatClose').onclick(); });
  let replyN = 0;
  $('#compose').addEventListener('submit', async e => {
    e.preventDefault(); const text = $('#msgIn').value.trim(); if (!text || !state.open) return;
    $('#msgIn').value = '';
    if (state.open.kind === 'group') {
      addMsg('me', text);
      const g = state.open.g, others = g.members.filter(m => m.id !== 'me'), lines = D.GROUP_LINES[L()] || D.GROUP_LINES.ko;
      const who = others[(++state.open.n) % others.length];
      setTimeout(() => { if (state.open && state.open.kind === 'group') addMsg('them', lines[state.open.n % lines.length], undefined, D.countryOf(who.p.country).flag + ' ' + who.p.name); }, 900 + Math.random() * 800);
      return;
    }
    const c = D.countryOf(state.open.item.p.country), mine = addMsg('me', text, '…');
    try { const tr = await translate(text, L(), c.lang); $('.tr', mine).textContent = (c.lang === L() ? '' : `→ ${D.LANG_NAME[c.lang]}: ${tr}`); }
    catch (err) { $('.tr', mine).textContent = c.lang === L() ? '' : t('c.fail'); }
    const set = D.REPLIES[c.lang] || null, i = replyN++ % 3;
    setTimeout(async () => {
      if (!state.open || state.open.kind !== 'one') return;
      if (set) { const [orig, ko] = set[i]; const el = addMsg('them', orig, c.lang === L() ? undefined : (L() === 'ko' ? (ko || '') : '…'));
        if (L() !== 'ko' && c.lang !== L()) translate(orig, c.lang, 'en').then(x => $('.tr', el).textContent = x).catch(() => $('.tr', el).textContent = ''); }
      else { const [en, ko] = D.REPLIES.en[i]; const el = addMsg('them', '…', L() === 'ko' ? ko : '');
        try { $('.b', el).textContent = await translate(en, 'en', c.lang); } catch (err) { $('.b', el).textContent = en; } }
    }, 900 + Math.random() * 800);
  });

  /* ---------- 공통 ---------- */
  let toastT; function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600); }

  /* ---------- 시작 ---------- */
  state.pool = D.generate(240);
  fillSelects(); loadMe(); applyI18n();
  if (['friend', 'date', 'group'].includes(location.hash.slice(1))) showTab(location.hash.slice(1));
})();
