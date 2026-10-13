/* Theme toggle: follows the system setting until the visitor picks one. */
(function () {
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;

  function currentTheme() {
    var chosen = root.getAttribute("data-theme");
    if (chosen) return chosen;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function label() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " theme");
  }

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* Storage can be blocked; the choice then lasts for this visit only. */
    }
    label();
  });

  label();
})();

/* Scroll reveal: each block fades up once, the first time it enters the screen. */
(function () {
  var blocks = document.querySelectorAll(".reveal");
  window.revealReady = true;

  if (!("IntersectionObserver" in window)) {
    document.documentElement.classList.remove("reveal-on");
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" }
  );

  blocks.forEach(function (block) {
    observer.observe(block);
  });
})();
