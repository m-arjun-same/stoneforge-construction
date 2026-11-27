/* ================================================================
   FORGE MOTION — STONEFORGE's own motion system.
   Site-machinery language, layered on top of the exact UI:
   · a tape-measure scroll bar with a travelling hook + % readout
   · hoist reveals — blocks rise and settle with a crane sway
   · stamp-ins for slogans / review cards
   · level-beam sweeps across section tops as you cross the site
   · discipline-panel image drift inside the horizontal strip
   · scroll-velocity skew on the intro strips
   · magnetic pull on the main call-to-action buttons
   · hero site film that wakes on view, sleeps off-screen
   No layout changes: transforms / opacity / clip only. No-JS or
   reduced-motion visitors keep the full static site.
   ================================================================ */
(function () {
  "use strict";
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = false;
  try { saveData = !!(navigator.connection && navigator.connection.saveData); } catch (e) {}

  /* ---------- hero / ambient films ---------- */
  var vids = Array.prototype.slice.call(document.querySelectorAll("[data-fm-video]"));
  vids.forEach(function (v) {
    if (RM || saveData) return; /* poster frame stays — the still site */
    v.src = v.getAttribute("data-src");
    v.addEventListener("playing", function () {
      v.classList.add("is-live");
      var sec = v.closest("section");
      if (sec) sec.classList.add("fm-vid-live"); /* fade the still floor-strip so the film shows */
    });
    if (!("IntersectionObserver" in window)) { v.play().catch(function () {}); return; }
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { var p = v.play(); if (p) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.05 });
    vio.observe(v);
    /* if an early play() was refused or interrupted, keep retrying briefly */
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (!v.paused || tries > 10) { clearInterval(iv); return; }
      var r = v.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) { var p = v.play(); if (p) p.catch(function () {}); }
    }, 1500);
    v.addEventListener("playing", function () { clearInterval(iv); });
  });

  if (RM) return;
  document.documentElement.classList.add("fm-arm");

  /* ---------- tape-measure progress ---------- */
  var tape = document.createElement("div");
  tape.className = "fm-tape";
  tape.setAttribute("aria-hidden", "true");
  tape.innerHTML = '<span class="fm-tape__fill"></span><span class="fm-tape__hook"></span><i class="fm-tape__pct">0%</i>';
  document.body.appendChild(tape);
  var fill = tape.querySelector(".fm-tape__fill"),
      hook = tape.querySelector(".fm-tape__hook"),
      pct = tape.querySelector(".fm-tape__pct");

  /* ---------- scroll-driven loop: tape, strip skew, panel drift ---------- */
  var strips = Array.prototype.slice.call(document.querySelectorAll(".tbr-intro__strip"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".qq__panel"));
  var techSec = document.getElementById("tech");
  var lastY = window.scrollY, vel = 0, lastPct = -1, lastSkew = 0;
  function frame() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY;
    var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    if (Math.abs(p - lastPct) > 0.0004) {
      lastPct = p;
      fill.style.transform = "scaleX(" + p + ")";
      hook.style.left = (p * 100) + "%";
      pct.textContent = Math.round(p * 100) + "%";
    }
    vel += ((y - lastY) - vel) * 0.1;
    lastY = y;
    var sk = Math.max(-3.2, Math.min(3.2, vel * 0.055));
    if (Math.abs(sk - lastSkew) > 0.02) {
      lastSkew = sk;
      for (var i = 0; i < strips.length; i++) strips[i].style.transform = "skewX(" + (-sk).toFixed(2) + "deg)";
    }
    if (techSec && panels.length) {
      var r = techSec.getBoundingClientRect();
      if (r.bottom > -80 && r.top < window.innerHeight + 80) {
        var tp = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
        var speeds = [30, -18, 26, -14]; /* scroll-5 drift: each panel falls at its own rate */
        for (var j = 0; j < panels.length; j++) {
          var pr = panels[j].getBoundingClientRect();
          var off = Math.max(-0.6, Math.min(0.6, (pr.left + pr.width / 2 - window.innerWidth / 2) / window.innerWidth));
          var img = panels[j].querySelector(".qq__img");
          if (img) img.style.translate = (-off * 26).toFixed(1) + "px " + ((tp - 0.5) * speeds[j % speeds.length]).toFixed(1) + "px";
        }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- hoist + stamp reveals ---------- */
  var fmPending = [];
  function reveal(sel, cls, stagger) {
    var els = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add(cls); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting || en.boundingClientRect.bottom < 0) { en.target.classList.add(cls); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px" });
    els.forEach(function (el, i) {
      if (stagger) el.style.transitionDelay = Math.min(i * 85, 510) + "ms";
      io.observe(el);
      fmPending.push({ el: el, cls: cls });
    });
  }
  /* guarantee: nothing armed stays hidden — sweep by real position
     (edge items at the document's last pixels can miss IO thresholds) */
  setInterval(function () {
    for (var i = fmPending.length - 1; i >= 0; i--) {
      var it = fmPending[i];
      if (it.el.classList.contains(it.cls)) { fmPending.splice(i, 1); continue; }
      var r = it.el.getBoundingClientRect();
      if (r.bottom > -40 && r.top < window.innerHeight + 40 && r.right > -40 && r.left < window.innerWidth + 40) { it.el.classList.add(it.cls); fmPending.splice(i, 1); }
    }
  }, 400);
  reveal(".foot__legal > *, .foot__nav > *", "fm-in", true);
  reveal(".foot__slogan", "fm-stamp-in", false);
  reveal(".q", "fm-in", true);              /* faq questions ride the hoist */
  reveal(".rev", "fm-stamp-in", false);     /* faq review card stamps in */
  reveal(".ksec", "fm-in", true);           /* consultation-room sections */
  reveal(".studio-card", "fm-in", true);    /* consultation-room lead cards */

  /* ---------- level-beam sweep on section entry ---------- */
  var beamSecs = [];
  ["tech", "team", "testimonials", "finale", "footer"].forEach(function (id) {
    var s = document.getElementById(id);
    if (!s) return;
    s.classList.add("fm-beam");
    beamSecs.push(s);
    if (!("IntersectionObserver" in window)) { s.classList.add("fm-lit"); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting || en.boundingClientRect.bottom < 0) { s.classList.add("fm-lit"); io.disconnect(); } });
    }, { threshold: 0.1 });
    io.observe(s);
  });
  /* belt + braces: the scroll loop lights any beam the observer missed
     (pinned sections can confuse IO) once its top crosses the level line */
  (function beamWatch() {
    for (var i = 0; i < beamSecs.length; i++) {
      var s = beamSecs[i];
      if (s.classList.contains("fm-lit")) continue;
      var r = s.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.62 && r.bottom > 0) s.classList.add("fm-lit");
    }
    requestAnimationFrame(beamWatch);
  })();

  /* ---------- lime block-wipe title reveals (text-15, rebuilt in own code) ---------- */
  (function wipeReveals() {
    var targets = Array.prototype.slice.call(document.querySelectorAll(".qq__name, .court__title"));
    if (!targets.length) return;
    targets.forEach(function (el) {
      el.classList.add("fm-wipe");
      var text = document.createElement("span");
      text.className = "fm-wipe-text";
      while (el.firstChild) text.appendChild(el.firstChild);
      el.appendChild(text);
      var block = document.createElement("span");
      block.className = "fm-wipe-block";
      block.setAttribute("aria-hidden", "true");
      el.appendChild(block);
      /* NOTE: wipe targets are NOT pushed to fmPending — the sweep would
         fire them the moment a sliver appears; the observer below waits
         until the title is substantially in view. */
    });
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("fm-wiped"); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting || en.boundingClientRect.bottom < 0) {
          en.target.classList.add("fm-wiped");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- magnetic CTAs (fine pointers only) ---------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    Array.prototype.slice.call(document.querySelectorAll(".hero__cta-row .btn, .kit__cta .btn, .kit__cta")).forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.13).toFixed(1) + "px " +
                            ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + "px";
      });
      b.addEventListener("pointerleave", function () { b.style.translate = "0px 0px"; });
    });
  }
})();
