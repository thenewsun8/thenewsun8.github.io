/* 안상욱 홈페이지 — 테마 · 메뉴 · 현재 섹션 · 스크롤 진행 · 작품 필터 · 메일 복사 · 등장 효과 */
(function () {
  "use strict";
  var root = document.documentElement, body = document.body;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* 테마 (시스템 설정 따르되, 버튼으로 바꾸면 기억) */
  var saved = store.get("ahn-theme");
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  var themeBtn = document.getElementById("theme");
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncMeta() {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", isDark() ? "#0E0E0F" : "#F6F3EC");
    if (themeBtn) themeBtn.setAttribute("aria-label", isDark() ? "밝은 화면으로" : "어두운 화면으로");
  }
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next); store.set("ahn-theme", next); syncMeta();
  });
  syncMeta();

  /* 모바일 메뉴 */
  var burger = document.getElementById("burger"), menu = document.getElementById("menu");
  function closeNav() { body.classList.remove("nav-open"); if (burger) burger.setAttribute("aria-expanded", "false"); }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* 현재 섹션 표시 */
  var links = Array.prototype.slice.call(document.querySelectorAll("#menu a[href^='#']"));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  function setCurrent(id) {
    links.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  if ("IntersectionObserver" in window && secs.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setCurrent(en.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* 스크롤 진행 · 맨 위로 */
  var bar = document.getElementById("progress"), totop = document.getElementById("totop"), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
      if (totop) totop.classList.toggle("show", h.scrollTop > 600);
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (totop) totop.addEventListener("click", function () { scrollTo({ top: 0, behavior: "smooth" }); });

  /* 작품 필터 */
  var filters = document.querySelectorAll(".filters button"), films = document.querySelectorAll(".films .film");
  var count = document.getElementById("filmCount");
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-f"), n = 0;
      filters.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      films.forEach(function (f) {
        var show = k === "all" || f.getAttribute("data-k") === k;
        f.hidden = !show; if (show) n++;
      });
      if (count) count.textContent = n + "편";
    });
  });

  /* 메일 복사 */
  var copy = document.getElementById("copyMail");
  if (copy) copy.addEventListener("click", function () {
    var mail = copy.getAttribute("data-mail");
    function done() { copy.textContent = "복사됨 ✓"; copy.classList.add("ok"); setTimeout(function () { copy.textContent = "복사"; copy.classList.remove("ok"); }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(done, function () {});
    else { var t = document.createElement("textarea"); t.value = mail; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); done(); } catch (e) {} document.body.removeChild(t); }
  });

  /* 등장 효과 */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        /* 화면에 들어왔거나, 앵커 점프로 이미 지나친 요소는 바로 보이기 */
        if (en.isIntersecting || en.boundingClientRect.bottom < 0) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
    reveals.forEach(function (el) { ro.observe(el); });
    /* 안전장치: 3초 뒤에는 무조건 모두 보이기 */
    setTimeout(function () { reveals.forEach(function (el) { el.classList.add("in"); }); }, 3000);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* 연도 */
  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
