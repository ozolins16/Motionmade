/* MotionMade — main.js */

// ── Hero load animation ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const heroEls = document.querySelectorAll('.hero-animate');
  heroEls.forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add('visible');
    }, 120 + i * 110);
  });

  // ── Ticker infinite clone ──────────────────────────────────
  var track = document.querySelector('.ticker-track');
  if (track) {
    var clone = track.innerHTML;
    // Repeat enough times so it never visibly ends
    track.innerHTML = clone + clone + clone + clone;
  }
});

// ── Scroll reveal (IntersectionObserver) ────────────────────
(function () {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();
