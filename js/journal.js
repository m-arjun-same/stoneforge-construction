/* STONEFORGE — journal-spread carousel (own code, section 2).
   An open spread in the centre; earlier/later spreads stand edge-on in
   receding stacks. Drag, flick, click a stack/page or use arrow keys to
   turn: the leaf on the turning side folds shut over the spread while
   the next spread swings in. Auto-advances until first touched. */
(function () {
  var book = document.getElementById("jbook");
  if (!book) return;
  var SPREADS = [
    { main: "assets/img/court-site.webp", mainAlt: "STONEFORGE crew pouring a high-rise deck, towers rising behind them",
      print: "assets/img/film-tower.jpg",
      note: "First pour at dawn — deck three, no shortcuts.",
      no: "Spread 01 — The Pour", h: "Concrete, poured at first light",
      txt: "Every Stoneforge frame starts before sunrise. The crew sets the deck, the pump rolls in, and one long shift later the building has a spine.",
      meta: [["400 m\u00B3", "poured in one shift"], ["06:10", "first truck on site"]], sign: "— A.V., site lead" },
    { main: "assets/img/film-villa.jpg", mainAlt: "A Stoneforge villa frame rising among trees",
      print: "assets/img/j3.webp",
      note: "Villa row, plot nine — the courtyard stays.",
      no: "Spread 02 — The Frame", h: "Columns up, courtyard kept",
      txt: "Nine villas, one shared green heart. We framed around the old rain tree instead of through it — the plan bent, the tree stands.",
      meta: [["9 villas", "one shared courtyard"], ["38 yrs", "the rain tree, kept"]], sign: "— D.R., design lead" },
    { main: "assets/img/finale-tower.webp", mainAlt: "Glass tower facade finished by Stoneforge catching the light",
      print: "assets/img/film-site.jpg",
      note: "Glass day. Level 21 — check the reflections.",
      no: "Spread 03 — The Skin", h: "A blue glass skin, panel by panel",
      txt: "1,900 panels, each numbered, each hung from the inside so the street below never stops. From the road the tower reads as sky.",
      meta: [["1,900", "panels, zero breakage"], ["L21–40", "hung from inside"]], sign: "— A.V., site lead" },
    { main: "assets/img/finale-studio.webp", mainAlt: "Finished Stoneforge interior with teal and timber finishes",
      print: "assets/img/film-model.jpg",
      note: "Handover eve — teal, timber, quiet rooms.",
      no: "Spread 04 — The Handover", h: "Interiors, finished by hand",
      txt: "The last week belongs to the finishers: teak, stone and silence. We hand over keys only when the building sounds right with the door shut.",
      meta: [["100%", "snag-free at handover"], ["7 days", "of hand finishing"]], sign: "— D.R., design lead" }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var els = { main: $("jimgMain"), print: $("jimgPrint"), note: $("jnote"), no: $("jno"), h: $("jh"),
              txt: $("jtxt"), meta: $("jmeta"), sign: $("jsign"), cur: $("jcur"),
              spread: $("jspread"), leaf: $("jleaf"), leafF: $("jleafFront"), leafB: $("jleafBack"),
              prevStack: $("jstackPrev"), nextStack: $("jstackNext"), stage: $("jbookStage") };
  var i = 0, busy = false, touched = false, timer = null;
  var pad = function (n) { return String(n + 1).padStart(2, "0"); };

  function renderStacks() {
    [[els.prevStack, -1], [els.nextStack, 1]].forEach(function (pair) {
      var host = pair[0]; if (!host) return;
      host.innerHTML = "";
      for (var k = 1; k <= 3; k++) {
        var idx = ((i + pair[1] * k) % SPREADS.length + SPREADS.length) % SPREADS.length;
        var d = document.createElement("div");
        d.className = "jstack__page";
        d.style.zIndex = String(4 - k);
        if (pair[1] < 0) d.style.right = (k - 1) * 0.85 + "em"; else d.style.left = (k - 1) * 0.85 + "em";
        d.style.opacity = String(1 - k * 0.22);
        d.innerHTML = '<img src="' + SPREADS[idx].main + '" alt="">';
        host.appendChild(d);
      }
    });
  }
  function fill(idx) {
    var s = SPREADS[idx];
    els.main.src = s.main; els.main.alt = s.mainAlt;
    els.print.src = s.print;
    els.note.textContent = s.note; els.no.textContent = s.no;
    els.h.textContent = s.h; els.txt.textContent = s.txt; els.sign.textContent = s.sign;
    els.meta.innerHTML = s.meta.map(function (m) { return "<li><b>" + m[0] + "</b><span>" + m[1] + "</span></li>"; }).join("");
    els.cur.textContent = pad(idx);
  }
  function turn(dir) {
    if (busy) return;
    var next = ((i + dir) % SPREADS.length + SPREADS.length) % SPREADS.length;
    busy = true;
    var leaf = els.leaf;
    leaf.className = "jleaf " + (dir > 0 ? "jleaf--r" : "jleaf--l");
    els.leafF.src = SPREADS[i].main;
    els.leafB.src = SPREADS[next].main;
    var done = function () {
      fill(next); i = next; renderStacks();
      leaf.className = "jleaf"; leaf.style.transform = "";
      busy = false;
    };
    if (window.gsap && !document.documentElement.classList.contains("is-motion-paused")) {
      gsap.fromTo(els.spread, { rotationY: 0 }, { rotationY: dir * -3.5, duration: 0.28, ease: "power2.in", transformOrigin: "50% 50%" });
      gsap.fromTo(leaf, { rotationY: 0 },
        { rotationY: dir > 0 ? -178 : 178, duration: 0.62, delay: 0.1, ease: "power3.inOut",
          onComplete: function () {
            gsap.fromTo(els.spread, { rotationY: dir * 3.5, opacity: 0.35 }, { rotationY: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
            done();
          } });
    } else { done(); }
  }
  function stopAuto() { touched = true; if (timer) { clearInterval(timer); timer = null; } }
  function startAuto() {
    if (timer) return;
    timer = setInterval(function () {
      if (!document.hidden && !touched && !document.documentElement.classList.contains("is-motion-paused")) {
        var r = book.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) turn(1);
      }
    }, 5200);
  }
  /* controls */
  $("jnext").addEventListener("click", function () { stopAuto(); turn(1); });
  $("jprev").addEventListener("click", function () { stopAuto(); turn(-1); });
  els.nextStack.addEventListener("click", function () { stopAuto(); turn(1); });
  els.prevStack.addEventListener("click", function () { stopAuto(); turn(-1); });
  [ [els.nextStack, 1], [els.prevStack, -1] ].forEach(function (p) {
    p[0].addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stopAuto(); turn(p[1]); } });
  });
  /* drag / flick */
  var sx = null;
  els.stage.addEventListener("pointerdown", function (e) { if (!e.target.closest("button")) sx = e.clientX; });
  els.stage.addEventListener("pointerup", function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 42) { stopAuto(); turn(dx < 0 ? 1 : -1); }
  });
  /* arrow keys while the journal is on screen */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var r = book.getBoundingClientRect();
    if (r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4) { stopAuto(); turn(e.key === "ArrowRight" ? 1 : -1); }
  });
  fill(0); renderStacks(); startAuto();
})();
