/* 매치 · 궁합 점수 엔진 — 명리 + 혈액형 + MBTI + 애니어그램 + 도형심리를 0~100 수치로 */
(function (g) {
  'use strict';
  const S = g.Saju;
  const WEIGHTS = {
    friend: { saju: 40, mbti: 20, ennea: 15, blood: 10, shape: 15 },
    date:   { saju: 45, mbti: 20, ennea: 10, blood: 10, shape: 15 }
  };

  // ---------- 명리 ----------
  const SIX_HARMONY = { '0-1':1,'2-11':1,'3-10':1,'4-9':1,'5-8':1,'6-7':1 };            // 육합
  const WONJIN = { '0-7':1,'1-6':1,'2-9':1,'3-8':1,'4-11':1,'5-10':1 };                 // 원진
  const PUNISH = { '2-5':1,'5-8':1,'2-8':1,'1-10':1,'1-7':1,'7-10':1,'0-3':1 };          // 형
  const key = (a, b) => a < b ? a + '-' + b : b + '-' + a;

  function branchRel(a, b) {
    if (a === b) return 'same';
    if (SIX_HARMONY[key(a, b)]) return 'six';
    if (a % 4 === b % 4) return 'tri';            // 삼합 (申子辰 · 亥卯未 · 寅午戌 · 巳酉丑)
    if (Math.abs(a - b) === 6) return 'clash';    // 충
    if (WONJIN[key(a, b)]) return 'wonjin';
    if (PUNISH[key(a, b)]) return 'punish';
    return 'none';
  }
  function stemRel(a, b) {
    if (a === b) return 'same';
    if (Math.abs(a - b) === 5) return 'harmony';   // 천간합 甲己 乙庚 丙辛 丁壬 戊癸
    const ea = S.STEM_ELEM[a], eb = S.STEM_ELEM[b];
    if (Math.abs(a - b) === 6 && (S.ctrl(ea) === eb || S.ctrl(eb) === ea)) return 'clash'; // 천간충
    if (ea === eb) return 'peer';
    if (S.gen(ea) === eb || S.gen(eb) === ea) return 'gen';
    return 'ctrl';
  }
  const BR_SCORE = { friend: { six: 1, tri: .9, same: .68, none: .6, punish: .4, wonjin: .3, clash: .22 },
                     date:   { six: 1, tri: .92, same: .6, none: .6, punish: .38, wonjin: .25, clash: .2 } };
  const ST_SCORE = { friend: { harmony: 1, gen: .82, peer: .72, same: .7, ctrl: .42, clash: .25 },
                     date:   { harmony: 1, gen: .85, peer: .6, same: .55, ctrl: .42, clash: .22 } };

  function complement(a, b) {
    // a가 부족한 오행을 b가 얼마나 채우는가 (0~1)
    const ideal = a.total / 5;
    let need = 0, got = 0;
    for (let e = 0; e < 5; e++) {
      const d = Math.max(0, ideal - a.elems[e]);
      need += d; got += Math.min(b.elems[e], d);
    }
    return need === 0 ? .7 : got / need;
  }
  function sajuScore(a, b, mode) {
    const w = mode === 'date' ? { stem: 28, dayB: 27, yearB: 12, comp: 20, yy: 13 } : { stem: 30, dayB: 22, yearB: 15, comp: 23, yy: 10 };
    const detail = {};
    const sr = stemRel(a.dayMaster, b.dayMaster);
    detail.stem = { rel: sr, score: Math.round(w.stem * ST_SCORE[mode][sr]) };
    const dr = branchRel(a.pillars[1].b, b.pillars[1].b);
    detail.dayBranch = { rel: dr, score: Math.round(w.dayB * BR_SCORE[mode][dr]) };
    const yr = branchRel(a.pillars[3].b, b.pillars[3].b);
    detail.yearBranch = { rel: yr, score: Math.round(w.yearB * BR_SCORE[mode][yr]) };
    const c = (complement(a, b) + complement(b, a)) / 2;
    // 용신을 상대가 많이 가지면 가산
    const yongA = Math.min(1, b.elems[a.yong] / (b.total / 5)), yongB = Math.min(1, a.elems[b.yong] / (a.total / 5));
    detail.complement = { value: c, score: Math.round(w.comp * (0.25 + 0.45 * c + 0.3 * (yongA + yongB) / 2)) };
    let yy;
    if (mode === 'date') {
      const oppPolarity = (a.dayMaster % 2) !== (b.dayMaster % 2);
      const balance = 1 - Math.abs((a.yinRatio + b.yinRatio) / 2 - 0.5) * 2;
      yy = w.yy * (0.3 + 0.4 * (oppPolarity ? 1 : 0.4) + 0.3 * balance);
    } else {
      const sim = 1 - Math.abs(a.yinRatio - b.yinRatio);
      yy = w.yy * (0.4 + 0.6 * sim);
    }
    detail.yinyang = { score: Math.round(yy) };
    const total = detail.stem.score + detail.dayBranch.score + detail.yearBranch.score + detail.complement.score + detail.yinyang.score;
    return { score: Math.min(100, total), detail };
  }

  // ---------- MBTI ----------
  function mbtiScore(a, b, mode) {
    if (!a || !b || a.length !== 4 || b.length !== 4) return { score: 62, detail: 'unknown' };
    const same = i => a[i] === b[i];
    let s;
    if (mode === 'date') s = (same(0) ? 15 : 25) + (same(1) ? 35 : 10) + (same(2) ? 20 : 15) + (same(3) ? 15 : 20);
    else                 s = (same(0) ? 15 : 10) + (same(1) ? 35 : 10) + (same(2) ? 25 : 15) + (same(3) ? 25 : 15);
    return { score: s, detail: { ei: same(0), sn: same(1), tf: same(2), jp: same(3) } };
  }

  // ---------- 애니어그램 ----------
  const ENNEA_GOOD = ['1-2','1-7','1-9','2-4','2-8','3-9','3-7','4-5','4-9','5-7','5-8','6-9','7-8','2-3','6-8','3-6'];
  const ENNEA_HARD = ['1-8','4-6','5-6','1-4'];
  const center = t => (t === 8 || t === 9 || t === 1) ? 'gut' : (t <= 4 ? 'heart' : 'head');
  function enneaScore(a, b, mode) {
    if (!a || !b) return { score: 62, detail: 'unknown' };
    let s = 60;
    if (a === b) s = mode === 'date' ? 62 : 72;
    else {
      const k = key(a, b);
      if (ENNEA_GOOD.includes(k)) s += 28;
      if (ENNEA_HARD.includes(k)) s -= 12;
      if (Math.abs(a - b) === 1 || Math.abs(a - b) === 8) s += 6;         // 날개
      if (center(a) === center(b)) s += mode === 'date' ? 2 : 6;
    }
    return { score: Math.max(20, Math.min(100, s)), detail: { a, b } };
  }

  // ---------- 혈액형 ----------
  const BLOOD = { 'A-A': 75, 'A-O': 85, 'A-B': 55, 'A-AB': 72, 'B-B': 70, 'B-O': 80, 'AB-B': 75, 'O-O': 70, 'AB-O': 65, 'AB-AB': 60 };
  function bloodScore(a, b) {
    if (!a || !b) return { score: 65, detail: 'unknown' };
    const k = [a, b].sort().join('-');
    return { score: BLOOD[k] || 65, detail: k };
  }

  // ---------- 도형심리 (○ △ □ S) ----------
  const SHAPE = { 'circle-circle': 76, 'circle-triangle': 82, 'circle-square': 72, 'circle-s': 86,
                  'triangle-triangle': 56, 'square-triangle': 70, 's-triangle': 58,
                  'square-square': 66, 's-square': 54, 's-s': 70 };
  function shapeScore(a, b) {
    if (!a || !b) return { score: 65, detail: 'unknown' };
    const k = [a, b].sort().join('-');
    return { score: SHAPE[k] || 65, detail: k };
  }

  /* person: {saju, mbti, ennea, blood, shape} — 미입력 항목은 가중치를 나머지에 재분배 */
  function match(me, other, mode) {
    mode = mode === 'date' ? 'date' : 'friend';
    const w = Object.assign({}, WEIGHTS[mode]);
    const parts = {
      saju: sajuScore(me.saju, other.saju, mode),
      mbti: mbtiScore(me.mbti, other.mbti, mode),
      ennea: enneaScore(me.ennea, other.ennea, mode),
      blood: bloodScore(me.blood, other.blood),
      shape: shapeScore(me.shape, other.shape)
    };
    let known = 0;
    for (const k in parts) { if (parts[k].detail === 'unknown') w[k] = 0; else known += w[k]; }
    let total = 0;
    const weighted = {};
    for (const k in parts) {
      const share = known ? w[k] / known : 0;
      weighted[k] = { score: parts[k].score, weight: Math.round(share * 100), contrib: parts[k].score * share };
      total += parts[k].score * share;
    }
    return { total: Math.round(total), parts: weighted, raw: parts, mode };
  }

  g.Compat = { match, sajuScore, mbtiScore, enneaScore, bloodScore, shapeScore, branchRel, stemRel, WEIGHTS };
})(typeof window !== 'undefined' ? window : globalThis);
