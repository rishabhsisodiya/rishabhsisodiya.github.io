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

/* Changelog filter: show only one kind of work (Shipped, Automated, Owned, Led)
   across every release. Escape resets to All. */
(function () {
  var section = document.getElementById("releases");
  if (!section) return;

  var chips = section.querySelectorAll(".chip");
  var releases = section.querySelectorAll("[data-release]");
  var status = section.querySelector(".filter-status");
  var names = {
    shipped: "Shipped",
    automated: "Automated",
    owned: "Owned",
    led: "Led",
  };
  var active = "all";

  function apply(kind) {
    active = kind;
    var filtered = kind !== "all";
    var total = 0;

    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", String(chip.dataset.filter === kind));
    });
    section.classList.toggle("is-filtered", filtered);

    releases.forEach(function (release) {
      var items = release.querySelectorAll(".changes li");
      var shown = 0;
      items.forEach(function (item) {
        var match = !filtered || item.dataset.kind === kind;
        item.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      total += shown;

      /* Matching items inside "Show more" must be visible while filtering. */
      var more = release.querySelector(".more");
      if (more) {
        if (filtered) {
          if (!more.dataset.wasOpen) more.dataset.wasOpen = String(more.open);
          more.open = true;
        } else if (more.dataset.wasOpen) {
          more.open = more.dataset.wasOpen === "true";
          delete more.dataset.wasOpen;
        }
      }

      var empty = release.querySelector(".empty-note");
      if (empty) {
        empty.hidden = !(filtered && shown === 0);
        empty.textContent = filtered
          ? "No " + names[kind] + " items in this role."
          : "";
      }
    });

    status.textContent = filtered
      ? "Showing " + total + " " + names[kind] + " item" + (total === 1 ? "" : "s") +
        ". Press Escape or choose All to see everything."
      : "";
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      apply(chip.dataset.filter === active ? "all" : chip.dataset.filter);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && active !== "all") {
      apply("all");
      section.querySelector('.chip[data-filter="all"]').focus();
    }
  });
})();

/* Copy email: writes the address to the clipboard and confirms on the button. */
(function () {
  var buttons = document.querySelectorAll(".copy-email");

  buttons.forEach(function (button) {
    var label = button.querySelector(".copy-label");
    var timer;

    function show(state, text) {
      button.dataset.state = state;
      label.textContent = text;
      clearTimeout(timer);
      timer = setTimeout(function () {
        delete button.dataset.state;
        label.textContent = "Copy";
      }, 2200);
    }

    /* Older browsers and unfocused tabs reject the Clipboard API. */
    function fallbackCopy(text) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {}
      field.remove();
      return ok;
    }

    function finish(ok) {
      if (ok) show("copied", "Copied");
      else show("failed", "Copy failed, select the address");
    }

    button.addEventListener("click", function () {
      var email = button.dataset.email;
      if (!navigator.clipboard) {
        finish(fallbackCopy(email));
        return;
      }
      navigator.clipboard.writeText(email).then(
        function () {
          finish(true);
        },
        function () {
          finish(fallbackCopy(email));
        }
      );
    });
  });
})();
