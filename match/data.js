/* 매치 · 전 세계 데모 후보 풀 (서버 연결 전까지 사용하는 생성 데이터) + 국가/언어 정보 */
(function (g) {
  'use strict';
  // code, 한글, 영어, 언어코드, 위도, 경도, 시간대, 이름군, 국기
  const COUNTRIES = [
    ['KR','한국','Korea','ko',37.57,126.98,9,'kr','🇰🇷'], ['JP','일본','Japan','ja',35.68,139.69,9,'jp','🇯🇵'],
    ['CN','중국','China','zh',39.9,116.4,8,'cn','🇨🇳'], ['TW','대만','Taiwan','zh',25.03,121.56,8,'cn','🇹🇼'],
    ['VN','베트남','Vietnam','vi',21.03,105.85,7,'vn','🇻🇳'], ['TH','태국','Thailand','th',13.76,100.5,7,'th','🇹🇭'],
    ['ID','인도네시아','Indonesia','id',-6.2,106.85,7,'id','🇮🇩'], ['PH','필리핀','Philippines','en',14.6,120.98,8,'ph','🇵🇭'],
    ['IN','인도','India','hi',28.61,77.21,5.5,'in','🇮🇳'], ['AU','호주','Australia','en',-33.87,151.21,10,'en','🇦🇺'],
    ['NZ','뉴질랜드','New Zealand','en',-41.29,174.78,12,'en','🇳🇿'], ['US','미국','USA','en',40.71,-74.01,-5,'en','🇺🇸'],
    ['CA','캐나다','Canada','en',43.65,-79.38,-5,'en','🇨🇦'], ['MX','멕시코','Mexico','es',19.43,-99.13,-6,'es','🇲🇽'],
    ['BR','브라질','Brazil','pt',-23.55,-46.63,-3,'pt','🇧🇷'], ['AR','아르헨티나','Argentina','es',-34.6,-58.38,-3,'es','🇦🇷'],
    ['GB','영국','UK','en',51.51,-0.13,0,'en','🇬🇧'], ['FR','프랑스','France','fr',48.86,2.35,1,'fr','🇫🇷'],
    ['DE','독일','Germany','de',52.52,13.4,1,'de','🇩🇪'], ['ES','스페인','Spain','es',40.42,-3.7,1,'es','🇪🇸'],
    ['IT','이탈리아','Italy','it',41.9,12.5,1,'it','🇮🇹'], ['NL','네덜란드','Netherlands','nl',52.37,4.9,1,'de','🇳🇱'],
    ['SE','스웨덴','Sweden','sv',59.33,18.07,1,'de','🇸🇪'], ['PL','폴란드','Poland','pl',52.23,21.01,1,'pl','🇵🇱'],
    ['RU','러시아','Russia','ru',55.76,37.62,3,'ru','🇷🇺'], ['TR','튀르키예','Türkiye','tr',41.01,28.98,3,'tr','🇹🇷'],
    ['EG','이집트','Egypt','ar',30.04,31.24,2,'ar','🇪🇬'], ['SA','사우디','Saudi Arabia','ar',24.71,46.68,3,'ar','🇸🇦'],
    ['AE','UAE','UAE','ar',25.2,55.27,4,'ar','🇦🇪'], ['NG','나이지리아','Nigeria','en',6.52,3.38,1,'ng','🇳🇬'],
    ['KE','케냐','Kenya','en',-1.29,36.82,3,'ng','🇰🇪'], ['ZA','남아공','South Africa','en',-26.2,28.04,2,'en','🇿🇦'],
    ['MN','몽골','Mongolia','mn',47.92,106.92,8,'mn','🇲🇳'], ['KZ','카자흐스탄','Kazakhstan','ru',51.17,71.45,5,'ru','🇰🇿'],
    ['PE','페루','Peru','es',-12.05,-77.04,-5,'es','🇵🇪'], ['CL','칠레','Chile','es',-33.45,-70.67,-4,'es','🇨🇱']
  ].map(c => ({ code: c[0], ko: c[1], en: c[2], lang: c[3], lat: c[4], lon: c[5], tz: c[6], names: c[7], flag: c[8] }));

  const LANG_NAME = { ko:'한국어', ja:'日本語', zh:'中文', vi:'Tiếng Việt', th:'ไทย', id:'Bahasa Indonesia', hi:'हिन्दी', en:'English', es:'Español', pt:'Português', fr:'Français', de:'Deutsch', it:'Italiano', nl:'Nederlands', sv:'Svenska', pl:'Polski', ru:'Русский', tr:'Türkçe', ar:'العربية', mn:'Монгол' };

  const NAMES = {
    kr: { m: ['민준','서준','도윤','예준','시우','하준','지호','준서','건우','현우','우진','선우','유찬','정우','승현'], f: ['서연','지우','하은','서윤','지민','수아','하윤','민서','지유','윤서','채원','다은','은서','예은','수빈'], last: ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권'] , order: 'last-first', sep: '' },
    jp: { m: ['Haruto','Yuto','Sota','Ren','Hinata','Riku','Kaito','Takumi'], f: ['Yui','Aoi','Hina','Sakura','Rin','Mio','Yuna','Honoka'], last: ['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura'], order: 'last-first', sep: ' ' },
    cn: { m: ['Wei','Jun','Hao','Ming','Lei','Yang','Zhi','Feng'], f: ['Li','Mei','Xin','Yan','Jing','Ying','Fang','Yu'], last: ['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhou','Lin'], order: 'last-first', sep: ' ' },
    vn: { m: ['Minh','Anh','Huy','Khang','Phuc','Duc','Nam','Tuan'], f: ['Linh','Thao','Ngoc','Mai','Huong','Trang','Lan','Phuong'], last: ['Nguyen','Tran','Le','Pham','Hoang','Vu','Dang'], order: 'last-first', sep: ' ' },
    th: { m: ['Somchai','Anan','Kittipong','Nattapong','Chai','Peerapat'], f: ['Nicha','Pim','Kanya','Siriporn','Malee','Ploy'], last: ['Srisuk','Chaiyasit','Wong','Rattana','Thongdee'], order: 'first-last', sep: ' ' },
    id: { m: ['Budi','Agus','Rizky','Dimas','Fajar','Adi'], f: ['Siti','Dewi','Putri','Ayu','Rina','Intan'], last: ['Santoso','Wijaya','Pratama','Saputra','Kusuma'], order: 'first-last', sep: ' ' },
    ph: { m: ['Jose','Juan','Miguel','Carlo','Paolo','Marco'], f: ['Maria','Angel','Joy','Grace','Nicole','Andrea'], last: ['Santos','Reyes','Cruz','Garcia','Bautista','Dela Cruz'], order: 'first-last', sep: ' ' },
    in: { m: ['Aarav','Vihaan','Arjun','Rohan','Karan','Aditya','Raj'], f: ['Ananya','Priya','Diya','Isha','Neha','Kavya','Riya'], last: ['Sharma','Patel','Singh','Kumar','Gupta','Reddy','Mehta'], order: 'first-last', sep: ' ' },
    en: { m: ['James','Liam','Noah','Oliver','Ethan','Lucas','Henry','Jack','Leo','Daniel'], f: ['Emma','Olivia','Ava','Mia','Sophie','Chloe','Grace','Lily','Zoe','Ella'], last: ['Smith','Johnson','Brown','Taylor','Wilson','Davis','Clark','Walker','Hall','Young'], order: 'first-last', sep: ' ' },
    es: { m: ['Mateo','Santiago','Diego','Alejandro','Pablo','Javier','Carlos'], f: ['Sofia','Valentina','Lucia','Camila','Martina','Isabella','Elena'], last: ['Garcia','Rodriguez','Martinez','Lopez','Gonzalez','Perez','Sanchez'], order: 'first-last', sep: ' ' },
    pt: { m: ['Gabriel','Lucas','Pedro','Rafael','Thiago','Bruno'], f: ['Julia','Ana','Beatriz','Larissa','Camila','Mariana'], last: ['Silva','Santos','Oliveira','Souza','Lima','Costa'], order: 'first-last', sep: ' ' },
    fr: { m: ['Louis','Hugo','Arthur','Jules','Theo','Nathan'], f: ['Louise','Emma','Jade','Chloe','Lea','Manon'], last: ['Martin','Bernard','Dubois','Petit','Moreau','Laurent'], order: 'first-last', sep: ' ' },
    de: { m: ['Lukas','Finn','Jonas','Leon','Paul','Felix','Lars'], f: ['Mia','Hannah','Lena','Anna','Lea','Sofia','Freja'], last: ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','de Vries','Johansson'], order: 'first-last', sep: ' ' },
    it: { m: ['Leonardo','Francesco','Alessandro','Lorenzo','Matteo','Marco'], f: ['Giulia','Sofia','Aurora','Alice','Giorgia','Martina'], last: ['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano'], order: 'first-last', sep: ' ' },
    pl: { m: ['Jakub','Kacper','Antoni','Jan','Filip','Szymon'], f: ['Zuzanna','Julia','Maja','Zofia','Hanna','Lena'], last: ['Nowak','Kowalski','Wisniewski','Wojcik','Kaminski'], order: 'first-last', sep: ' ' },
    ru: { m: ['Ivan','Dmitri','Alexei','Nikita','Maxim','Artem','Timur'], f: ['Anastasia','Maria','Daria','Polina','Elena','Alina','Aigerim'], last: ['Ivanov','Smirnov','Kuznetsov','Popov','Volkov','Petrov'], order: 'first-last', sep: ' ' },
    tr: { m: ['Mehmet','Emir','Yusuf','Ahmet','Kerem','Can'], f: ['Zeynep','Elif','Defne','Ayse','Ecrin','Selin'], last: ['Yilmaz','Kaya','Demir','Sahin','Celik','Aydin'], order: 'first-last', sep: ' ' },
    ar: { m: ['Omar','Ali','Youssef','Ahmed','Khaled','Hassan'], f: ['Fatima','Mariam','Nour','Layla','Sara','Hana'], last: ['Hassan','Ibrahim','Al-Sayed','Mahmoud','Al-Farsi','Khalil'], order: 'first-last', sep: ' ' },
    ng: { m: ['Chinedu','Emeka','Tunde','Kwame','Baraka','Juma'], f: ['Ngozi','Adaeze','Amara','Zainab','Wanjiru','Amani'], last: ['Okafor','Adeyemi','Okoro','Mwangi','Otieno','Bello'], order: 'first-last', sep: ' ' },
    mn: { m: ['Bat','Temuulen','Ganbold','Nergui','Tuguldur'], f: ['Saruul','Nomin','Oyuna','Khulan','Anu'], last: ['Batbayar','Erdene','Dorj','Tsend'], order: 'last-first', sep: ' ' }
  };

  const BIOS_KO = [
    '주말엔 산을 걷고 평일엔 책을 읽어요.', '요리하는 걸 좋아해서 친구들을 자주 초대합니다.', '혼자 여행 다니는 게 취미. 다음은 어디로 갈까요.',
    '영화를 하루에 한 편씩 봅니다. 추천 받아요.', '커피보다 차. 느린 대화를 좋아합니다.', '달리기 10km, 아직 느리지만 꾸준히.',
    '사진 찍는 걸 좋아해요. 필름 카메라도 씁니다.', '음악 없이는 못 살아요. 플레이리스트 교환하실 분.', '새로운 언어 배우는 중. 서툴러도 대화해요.',
    '고양이 두 마리랑 살아요.', '보드게임 밤을 자주 열어요.', '그림을 그려요. 작은 스케치북이 늘 가방에.', '밤에 글을 씁니다. 아직은 저만 읽는 글.',
    '바다 근처에서 자랐어요. 파도 소리가 고향.', '수요일마다 요가. 몸보다 마음이 가벼워져요.', '길고양이 밥 주는 게 하루의 시작.',
    '빵 굽는 주말. 발효는 기다림의 연습.', '별 보는 걸 좋아해서 가끔 시외로 나가요.', '오래된 물건을 고치는 걸 좋아합니다.', '웃음이 많다고들 해요.'
  ];
  // 상대가 보내는 첫 인사 — 원문(자기 언어) + 한국어 번역
  const GREETING = {
    ko: ['안녕하세요! 점수가 높게 나와서 먼저 인사드려요.', '안녕하세요! 점수가 높게 나와서 먼저 인사드려요.'],
    ja: ['はじめまして！相性スコアが高くて、先に挨拶しました。', '처음 뵙겠습니다! 궁합 점수가 높아서 먼저 인사했어요.'],
    zh: ['你好！我们的匹配分数很高，所以先来打个招呼。', '안녕! 우리 매칭 점수가 높아서 먼저 인사해요.'],
    vi: ['Xin chào! Điểm hợp của chúng ta cao nên mình chào trước nhé.', '안녕하세요! 우리 궁합 점수가 높아서 제가 먼저 인사해요.'],
    th: ['สวัสดี! คะแนนความเข้ากันของเราสูงมาก เลยทักก่อนเลย', '안녕! 우리 궁합 점수가 아주 높아서 먼저 말 걸어요.'],
    id: ['Halo! Skor kecocokan kita tinggi, jadi aku menyapa duluan.', '안녕! 우리 궁합 점수가 높아서 내가 먼저 인사해.'],
    hi: ['नमस्ते! हमारा मैच स्कोर बहुत अच्छा है, इसलिए पहले नमस्ते कह रहा/रही हूँ।', '안녕하세요! 우리 매치 점수가 아주 좋아서 먼저 인사드려요.'],
    en: ['Hi! Our match score came out high, so I thought I\'d say hello first.', '안녕! 우리 매치 점수가 높게 나와서 먼저 인사하려고.'],
    es: ['¡Hola! Nuestra compatibilidad salió muy alta, así que te saludo primero.', '안녕! 우리 궁합이 아주 높게 나와서 먼저 인사해.'],
    pt: ['Oi! Nossa compatibilidade deu alta, então vim dizer olá primeiro.', '안녕! 우리 궁합이 높게 나와서 먼저 인사하러 왔어.'],
    fr: ['Salut ! Notre score de compatibilité est élevé, alors je te dis bonjour en premier.', '안녕! 우리 궁합 점수가 높아서 먼저 인사해.'],
    de: ['Hallo! Unser Match-Score ist hoch, also sage ich zuerst Hallo.', '안녕! 우리 매치 점수가 높아서 먼저 인사할게.'],
    it: ['Ciao! Il nostro punteggio di compatibilità è alto, quindi ti saluto per primo.', '안녕! 우리 궁합 점수가 높아서 먼저 인사해.'],
    nl: ['Hoi! Onze matchscore is hoog, dus ik zeg eerst hallo.', '안녕! 우리 매치 점수가 높아서 먼저 인사해.'],
    sv: ['Hej! Vår matchpoäng blev hög, så jag hälsar först.', '안녕! 우리 매치 점수가 높게 나와서 먼저 인사해.'],
    pl: ['Cześć! Nasz wynik dopasowania jest wysoki, więc witam się pierwszy.', '안녕! 우리 매치 점수가 높아서 먼저 인사해.'],
    ru: ['Привет! У нас высокий балл совместимости, поэтому пишу первым.', '안녕! 우리 궁합 점수가 높아서 먼저 연락해.'],
    tr: ['Merhaba! Uyum puanımız yüksek çıktı, o yüzden önce ben selam veriyorum.', '안녕! 우리 궁합 점수가 높게 나와서 내가 먼저 인사해.'],
    ar: ['مرحباً! نتيجة التوافق بيننا عالية، لذلك أردت أن أسلّم أولاً.', '안녕하세요! 우리 궁합 결과가 높아서 먼저 인사하고 싶었어요.'],
    mn: ['Сайн уу! Бидний нийцлийн оноо өндөр гарсан тул эхлээд мэндчилж байна.', '안녕! 우리 궁합 점수가 높게 나와서 먼저 인사해.']
  };
  const REPLIES = {
    ko: [['반가워요. 사주 얘기 재밌네요, 제 일간은 뭐였죠?', null], ['주말에 보통 뭐 하세요?', null], ['저도 그 영화 좋아해요!', null]],
    ja: [['よろしくね。週末はいつも何してる？', '잘 부탁해. 주말엔 보통 뭐 해?'], ['韓国に一度行ってみたいです。', '한국에 한 번 가보고 싶어요.'], ['それ、私も好き！', '그거 나도 좋아해!']],
    zh: [['很高兴认识你。你平时喜欢做什么？', '만나서 반가워. 평소에 뭐 하는 걸 좋아해?'], ['我也喜欢看电影。', '나도 영화 보는 거 좋아해.'], ['有机会一起喝杯茶吧。', '기회 되면 같이 차 한잔 하자.']],
    en: [['Nice to meet you! What do you usually do on weekends?', '만나서 반가워! 주말엔 보통 뭐 해?'], ['That\'s so interesting about the day master thing.', '일간 얘기 정말 흥미롭다.'], ['Same here, honestly.', '솔직히 나도 그래.']],
    es: [['¡Encantado! ¿Qué haces los fines de semana?', '반가워! 주말엔 뭐 해?'], ['Me encantaría visitar Corea algún día.', '언젠가 한국에 꼭 가보고 싶어.'], ['¡Yo también!', '나도!']],
    fr: [['Enchanté ! Tu fais quoi le week-end ?', '반가워! 주말엔 뭐 해?'], ['J\'adore cette idée.', '그 아이디어 정말 좋아.'], ['Moi aussi, vraiment.', '나도 정말 그래.']],
    de: [['Freut mich! Was machst du am Wochenende?', '반가워! 주말엔 뭐 해?'], ['Das klingt wirklich spannend.', '그거 정말 흥미롭게 들려.'], ['Ich auch, ehrlich.', '나도 솔직히 그래.']],
    _: [['🙂', null], ['👍', null], ['😄', null]]
  };

  // 시드 난수 (항상 같은 후보 풀)
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const MBTI = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
  const BLOODS = ['A','B','O','AB'];
  const SHAPES = ['circle','triangle','square','s'];

  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function makeName(r, pool, gender) {
    const n = NAMES[pool] || NAMES.en;
    let first = pick(r, gender === 'M' ? n.m : n.f), last = pick(r, n.last);
    if (first === last) last = n.last[(n.last.indexOf(last) + 1) % n.last.length];
    return n.order === 'last-first' ? last + n.sep + first : first + n.sep + last;
  }
  function generate(count) {
    const r = rng(20261102);
    const out = [];
    for (let i = 0; i < count; i++) {
      // 한국 비중 35%, 나머지 세계
      const c = r() < 0.35 ? COUNTRIES[0] : pick(r, COUNTRIES);
      const gender = r() < 0.5 ? 'M' : 'F';
      const y = 1975 + Math.floor(r() * 32), m = 1 + Math.floor(r() * 12), d = 1 + Math.floor(r() * 28);
      const hh = Math.floor(r() * 24), mm = Math.floor(r() * 60);
      out.push({
        id: 'd' + i, demo: true, name: makeName(r, c.names, gender), gender, country: c.code,
        y, m, d, hh, mm, tz: c.tz,
        blood: pick(r, BLOODS), mbti: pick(r, MBTI), ennea: 1 + Math.floor(r() * 9), shape: pick(r, SHAPES),
        bio: pick(r, BIOS_KO),
        // 도시 근처로 살짝 흩기
        lat: c.lat + (r() - .5) * 6, lon: c.lon + (r() - .5) * 6
      });
    }
    return out;
  }

  g.MatchData = { COUNTRIES, LANG_NAME, NAMES, GREETING, REPLIES, MBTI, BLOODS, SHAPES, generate, countryOf: code => COUNTRIES.find(c => c.code === code) || COUNTRIES[0] };
})(typeof window !== 'undefined' ? window : globalThis);
