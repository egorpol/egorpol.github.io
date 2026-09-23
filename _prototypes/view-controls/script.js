(function () {
  "use strict";

  function updateDemo(demo) {
    var skin = demo.dataset.skin;
    var theme = demo.dataset.theme;

    demo.querySelectorAll("[data-set-skin]").forEach(function (button) {
      var active = button.dataset.setSkin === skin;
      button.setAttribute("aria-pressed", String(active));
    });

    demo.querySelectorAll("[data-toggle-skin]").forEach(function (button) {
      var pixel = skin === "pixel";
      button.setAttribute("aria-pressed", String(pixel));
      button.setAttribute("aria-label", pixel ? "Switch to plain view" : "Switch to pixel view");
    });

    demo.querySelectorAll("[data-skin-name]").forEach(function (label) {
      label.textContent = skin === "pixel" ? "Pixel" : "Plain";
    });

    demo.querySelectorAll("[data-state-label]").forEach(function (label) {
      label.textContent = (skin === "pixel" ? "Pixel" : "Plain") + " · " + theme;
    });

    demo.querySelectorAll("[data-check]").forEach(function (check) {
      check.textContent = check.dataset.check === skin ? "✓" : "";
    });

    demo.querySelectorAll("[data-opposite-theme]").forEach(function (label) {
      label.textContent = theme === "dark" ? "light" : "dark";
    });
  }

  document.querySelectorAll("[data-demo]").forEach(function (demo) {
    updateDemo(demo);

    demo.addEventListener("click", function (event) {
      var skinChoice = event.target.closest("[data-set-skin]");
      var skinToggle = event.target.closest("[data-toggle-skin]");
      var themeToggle = event.target.closest("[data-toggle-theme]");
      var menuTrigger = event.target.closest("[data-menu-trigger]");
      var menu = demo.querySelector("[data-menu]");
      var persistentMenuTrigger = demo.querySelector("[data-menu-trigger]");

      if (skinChoice) {
        demo.dataset.skin = skinChoice.dataset.setSkin;
        if (menu) {
          menu.hidden = true;
          if (persistentMenuTrigger) persistentMenuTrigger.setAttribute("aria-expanded", "false");
        }
      } else if (skinToggle) {
        demo.dataset.skin = demo.dataset.skin === "pixel" ? "plain" : "pixel";
      } else if (themeToggle) {
        demo.dataset.theme = demo.dataset.theme === "dark" ? "light" : "dark";
      } else if (menuTrigger && menu) {
        menu.hidden = !menu.hidden;
        menuTrigger.setAttribute("aria-expanded", String(!menu.hidden));
      } else {
        return;
      }

      updateDemo(demo);
    });
  });
}());
