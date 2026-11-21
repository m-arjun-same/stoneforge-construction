/* STONEFORGE — Forge-Rise footer: the six ridges rise with the scroll
   (far ridges settle first, the ground ridge last) + Forge Notes form. */
(function () {
  var ridges = document.querySelectorAll(".foot__hills .fridge");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (ridges.length && window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    ridges.forEach(function (r, i) {
      gsap.fromTo(r,
        { y: (ridges.length - i) * 16 },
        { y: 0, ease: "none",
          scrollTrigger: { trigger: ".foot", start: "top bottom", end: "top 25%", scrub: 0.6 } });
    });
  }
  var form = document.getElementById("footForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("footEmail");
      if (!email || !email.value || email.value.indexOf("@") < 0) { if (email) email.focus(); return; }
      form.hidden = true;
      var thanks = document.getElementById("footThanks");
      if (thanks) thanks.hidden = false;
    });
  }
})();
