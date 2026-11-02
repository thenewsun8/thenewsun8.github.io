/* 매치 · 명리(사주) 엔진
   - 절기(태양 황경) 기준 연주·월주, 1900-01-01 甲戌 기준 일주, 2시간 단위 시주
   - 결과: 네 기둥, 오행 분포, 일간 성격, 신강/신약, 용신(간이), 십신 분포 */
(function (g) {
  'use strict';
  const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const STEM_KO = ['갑','을','병','정','무','기','경','신','임','계'];
  const STEM_ELEM = [0,0,1,1,2,2,3,3,4,4];           // 목화토금수
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const BRANCH_KO = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  const BRANCH_ELEM = [4,2,0,0,2,1,1,2,3,3,2,4];
  const ANIMALS = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
  const ANIMALS_EN = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  const ELEM = ['목','화','토','금','수'];
  const ELEM_HANJA = ['木','火','土','金','水'];
  const ELEM_EN = ['Wood','Fire','Earth','Metal','Water'];
  const ELEM_COLOR = ['#58C27D','#FF6B6B','#E2B04A','#D8D8E0','#5AA9F9'];
  // 지장간(본기만) — 지지의 숨은 천간 중 대표 하나
  const HIDDEN_MAIN = [9,5,0,1,4,2,3,5,6,7,4,8];

  const gen = e => (e + 1) % 5;     // e가 생하는 오행
  const ctrl = e => (e + 2) % 5;    // e가 극하는 오행

  function julianDay(y, m, d, hourUTC) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + hourUTC / 24;
  }
  // 태양 겉보기 황경(도) — Meeus 간이식, 절기 판정용(오차 수 분 이내)
  function sunLongitude(jd) {
    const T = (jd - 2451545) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    const omega = (125.04 - 1934.136 * T) * Math.PI / 180;
    const lam = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
    return ((lam % 360) + 360) % 360;
  }

  /* 입력: {y,m,d,hh,mm, tz(시간, 예 9), solarFix(분, 예 -32)} */
  function compute(p) {
    const tz = Number.isFinite(p.tz) ? p.tz : 9;
    const fix = Number.isFinite(p.solarFix) ? p.solarFix : 0;
    // 보정된 지방 시각
    let local = new Date(Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm + fix));
    const ly = local.getUTCFullYear(), lm = local.getUTCMonth() + 1, ld = local.getUTCDate();
    const lhh = local.getUTCHours(), lmm = local.getUTCMinutes();
    const hourUTC = lhh + lmm / 60 - tz;
    const jd = julianDay(ly, lm, ld, hourUTC);
    const lon = sunLongitude(jd);

    // 연주 (입춘 315° 기준)
    const sajuYear = ly - ((lm <= 2 && lon < 315) ? 1 : 0);
    const yS = ((sajuYear - 4) % 10 + 10) % 10, yB = ((sajuYear - 4) % 12 + 12) % 12;
    // 월주 (寅月 = 0)
    const mi = Math.floor((((lon - 315) % 360) + 360) % 360 / 30);
    const mS = ((yS % 5) * 2 + 2 + mi) % 10, mB = (mi + 2) % 12;
    // 일주 (1900-01-01 = 甲戌, 60갑자 index 10), 23시 이후는 다음 날
    let dayShift = lhh >= 23 ? 1 : 0;
    const days = Math.round((Date.UTC(ly, lm - 1, ld) - Date.UTC(1900, 0, 1)) / 86400000) + dayShift;
    const dIdx = ((10 + days) % 60 + 60) % 60;
    const dS = dIdx % 10, dB = dIdx % 12;
    // 시주
    const slot = Math.floor(((lhh * 60 + lmm) + 60) / 120) % 12;
    const hS = ((dS % 5) * 2 + slot) % 10, hB = slot;

    const pillars = [
      { key: 'hour', s: hS, b: hB }, { key: 'day', s: dS, b: dB },
      { key: 'month', s: mS, b: mB }, { key: 'year', s: yS, b: yB }
    ];
    // 오행 분포 (천간 1, 지지 1 — 월지는 1.5 가중)
    const elems = [0,0,0,0,0];
    let yin = 0, total = 0;
    pillars.forEach(pl => {
      const wB = pl.key === 'month' ? 1.5 : 1;
      elems[STEM_ELEM[pl.s]] += 1; elems[BRANCH_ELEM[pl.b]] += wB;
      total += 1 + wB;
      yin += (pl.s % 2) + (pl.b % 2) * wB;
    });
    const dm = STEM_ELEM[dS];
    const support = elems[dm] + elems[(dm + 4) % 5];   // 비겁 + 인성
    const drain = total - support;
    const strengthRatio = support / total;
    const strength = strengthRatio >= 0.55 ? 'strong' : strengthRatio <= 0.35 ? 'weak' : 'balanced';
    // 용신(간이): 신약→인성/비겁 중 적은 것, 신강→식상·재·관 중 적은 것, 중화→가장 적은 오행
    let cand = strength === 'weak' ? [(dm + 4) % 5, dm]
             : strength === 'strong' ? [gen(dm), ctrl(dm), (dm + 3) % 5]
             : [0,1,2,3,4];
    let yong = cand[0];
    cand.forEach(e => { if (elems[e] < elems[yong]) yong = e; });
    // 십신 분포 (일간 제외 7글자 + 지지 본기)
    const tenGods = { 비겁:0, 식상:0, 재성:0, 관성:0, 인성:0 };
    pillars.forEach(pl => {
      const list = [];
      if (pl.key !== 'day') list.push(pl.s);
      list.push(HIDDEN_MAIN[pl.b]);
      list.forEach(st => {
        const e = STEM_ELEM[st];
        if (e === dm) tenGods.비겁++;
        else if (e === gen(dm)) tenGods.식상++;
        else if (e === ctrl(dm)) tenGods.재성++;
        else if (gen(e) === dm) tenGods.인성++;
        else tenGods.관성++;
      });
    });
    return {
      pillars, dayMaster: dS, dayMasterElem: dm, elems, total, yinRatio: yin / total,
      strength, strengthRatio, yong, tenGods, animal: yB, sajuYear, monthIndex: mi, solarLongitude: lon,
      ganji: pillars.map(pl => STEMS[pl.s] + BRANCHES[pl.b])
    };
  }

  const DAY_MASTER_TEXT = {
    ko: [
      ['큰 나무 · 甲木','곧게 위로 자라는 큰 나무. 리더십과 추진력이 있고, 먼저 나서서 길을 내는 사람. 고집이 세지만 책임감이 깊다.'],
      ['풀과 덩굴 · 乙木','유연하고 적응력이 좋은 풀. 사람 사이를 부드럽게 이어주고, 환경을 읽어 살아남는 생활력이 있다.'],
      ['태양 · 丙火','모두를 비추는 태양. 밝고 솔직하며 열정이 크다. 감정이 잘 드러나고 주변을 따뜻하게 만든다.'],
      ['촛불 · 丁火','조용히 오래 타는 불. 섬세하고 집중력이 깊어 한 분야를 깊게 파고든다. 속정이 깊다.'],
      ['큰 산 · 戊土','묵직한 산. 신뢰감과 포용력이 있고 흔들리지 않는다. 느리지만 끝까지 간다.'],
      ['논밭 · 己土','길러내는 땅. 꼼꼼하고 현실적이며 보살피는 능력이 뛰어나다. 속으로 생각이 많다.'],
      ['바위와 쇠 · 庚金','단단한 원석. 결단력과 의리가 강하고, 옳다고 믿는 것에 직진한다. 거칠지만 뒷말이 없다.'],
      ['보석 · 辛金','다듬어진 보석. 예민하고 세련되며 완벽을 추구한다. 자존심이 강하고 미감이 좋다.'],
      ['큰 바다 · 壬水','넓고 깊은 물. 지혜롭고 자유로우며 큰 그림을 본다. 틀에 갇히는 걸 싫어한다.'],
      ['이슬과 비 · 癸水','스며드는 물. 상상력과 감수성이 풍부하고 사람 마음을 잘 읽는다. 혼자만의 시간이 필요하다.']
    ],
    en: [
      ['Great Tree · Yang Wood','Grows straight upward. Natural leader with drive; the first to open a path. Stubborn but deeply responsible.'],
      ['Vine · Yin Wood','Flexible and adaptive. Connects people gently and survives by reading the room.'],
      ['Sun · Yang Fire','Shines on everyone. Bright, honest, passionate; wears feelings openly and warms a room.'],
      ['Candle · Yin Fire','Burns quietly and long. Delicate, deeply focused; digs into one field. Warm inside.'],
      ['Mountain · Yang Earth','Steady and trustworthy. Embraces others and never wavers. Slow but goes to the end.'],
      ['Field · Yin Earth','Nurturing soil. Careful, practical, a natural caretaker who thinks a lot inside.'],
      ['Raw Metal · Yang Metal','Decisive and loyal. Goes straight at what feels right. Rough edges, no grudges.'],
      ['Jewel · Yin Metal','Refined and sensitive. Seeks perfection, proud, with a fine sense of beauty.'],
      ['Ocean · Yang Water','Wide and deep. Wise, free, sees the big picture; dislikes being boxed in.'],
      ['Dew · Yin Water','Seeps in quietly. Imaginative, sensitive, reads hearts well. Needs time alone.']
    ]
  };
  const ELEM_TEXT = {
    ko: ['성장·시작·인정', '열정·표현·확산', '안정·신뢰·중재', '결단·원칙·정리', '지혜·유연·소통'],
    en: ['growth · beginnings · kindness', 'passion · expression · spread', 'stability · trust · mediation', 'decision · principle · order', 'wisdom · flexibility · communication']
  };
  const STRENGTH_TEXT = {
    ko: { strong: '신강(身强) — 자기 힘이 강해, 밖으로 쓰는 기운(식상·재성·관성)이 필요합니다.', balanced: '중화(中和) — 균형이 좋아 어떤 짝과도 무난하게 맞춥니다.', weak: '신약(身弱) — 자기 힘이 약해, 받쳐주는 기운(인성·비겁)을 가진 사람이 힘이 됩니다.' },
    en: { strong: 'Strong self — needs outlets (output, wealth, authority elements).', balanced: 'Balanced — fits well with most partners.', weak: 'Weak self — benefits from supporters (resource and peer elements).' }
  };
  const TEN_TEXT = {
    ko: { 비겁: '주체성·동료', 식상: '표현·창작', 재성: '현실·결과', 관성: '규율·책임', 인성: '학습·사유' },
    en: { 비겁: 'self · peers', 식상: 'expression · creation', 재성: 'realism · results', 관성: 'discipline · duty', 인성: 'learning · thought' }
  };

  g.Saju = { STEMS, STEM_KO, STEM_ELEM, BRANCHES, BRANCH_KO, BRANCH_ELEM, ANIMALS, ANIMALS_EN, ELEM, ELEM_HANJA, ELEM_EN, ELEM_COLOR,
    gen, ctrl, compute, sunLongitude, julianDay, DAY_MASTER_TEXT, ELEM_TEXT, STRENGTH_TEXT, TEN_TEXT };
})(typeof window !== 'undefined' ? window : globalThis);
