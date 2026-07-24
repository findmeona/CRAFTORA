/**
 * Craftora — Mega Navigation & Mobile Menu
 *
 * Mega nav keyboard contract:
 *  - Enter/Space on trigger toggles its panel.
 *  - Escape closes the open panel and returns focus to its trigger.
 *  - Clicking outside an open panel closes it.
 *  - Only one panel is open at a time.
 *
 * Mobile menu contract:
 *  - Opens as an off-canvas dialog with a trapped focus.
 *  - Escape or overlay/close-button click closes it and returns focus
 *    to the toggle button that opened it.
 *  - Category groups are accordions (aria-expanded on trigger).
 */
(function (window, document) {
  "use strict";

  var dom = window.Craftora.dom;
  var a11y = window.Craftora.a11y;

  function initMegaNav() {
    var triggers = dom.qsa("[data-mega-trigger]");
    if (!triggers.length) return;

    var openPanel = null;

    function closePanel() {
      if (!openPanel) return;
      openPanel.trigger.setAttribute("aria-expanded", "false");
      openPanel.panel.setAttribute("data-open", "false");
      openPanel = null;
    }

    function openTrigger(trigger, panel) {
      if (openPanel && openPanel.trigger !== trigger) closePanel();
      var isOpen = trigger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closePanel();
        return;
      }
      trigger.setAttribute("aria-expanded", "true");
      panel.setAttribute("data-open", "true");
      openPanel = { trigger: trigger, panel: panel };
    }

    triggers.forEach(function (trigger) {
      var id = trigger.getAttribute("data-mega-trigger");
      var panel = dom.qs('[data-mega-panel="' + id + '"]');
      if (!panel) return;

      dom.on(trigger, "click", function () {
        openTrigger(trigger, panel);
      });
    });

    dom.on(document, "keydown", function (event) {
      if (event.key === "Escape" && openPanel) {
        var trigger = openPanel.trigger;
        closePanel();
        trigger.focus();
      }
    });

    dom.on(document, "click", function (event) {
      if (!openPanel) return;
      var target = event.target;
      var withinTrigger = openPanel.trigger.contains(target);
      var withinPanel = openPanel.panel.contains(target);
      if (!withinTrigger && !withinPanel) closePanel();
    });
  }

  function initMobileMenu() {
    var menu = dom.qs("[data-mobile-menu]");
    var toggle = dom.qs("[data-mobile-menu-toggle]");
    if (!menu || !toggle) return;

    var closeEls = dom.qsa("[data-mobile-menu-close]", menu);
    var panel = dom.qs(".mobile-menu__panel", menu);
    var trap = a11y.createFocusTrap(panel);
    var isOpen = false;

    function open() {
      isOpen = true;
      menu.setAttribute("data-open", "true");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      trap.activate();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      menu.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      trap.deactivate();
    }

    dom.on(toggle, "click", open);
    closeEls.forEach(function (el) {
      dom.on(el, "click", close);
    });
    dom.on(document, "keydown", function (event) {
      if (event.key === "Escape" && isOpen) close();
    });

    // Accordion behavior for mobile category groups
    var accordionTriggers = dom.qsa(".mobile-menu__accordion-trigger[aria-controls]", menu);
    accordionTriggers.forEach(function (trigger) {
      dom.on(trigger, "click", function () {
        var panelId = trigger.getAttribute("aria-controls");
        var accordionPanel = document.getElementById(panelId);
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!expanded));
        if (accordionPanel) accordionPanel.hidden = expanded;
      });
    });
  }

  function init() {
    initMegaNav();
    initMobileMenu();
  }

  window.Craftora = window.Craftora || {};
  window.Craftora.megaNav = { init: init };
})(window, document);
