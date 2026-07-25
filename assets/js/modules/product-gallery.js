/**
 * Craftora — Product Gallery & PDP interactions
 *
 * Gallery keyboard/pointer: thumbnails are real buttons; click or
 * Enter/Space swaps the main image; aria-current marks the active thumb.
 * Swatches: aria-pressed toggles selection; disabled swatches (out of
 * stock for that variant) are unclickable and visually struck through.
 * Accordions: aria-expanded/hidden pair, toggled by click or Enter/Space
 * (native <button> handles that already).
 */
(function (window, document) {
  "use strict";

  var dom = window.Craftora.dom;

  function initGallery() {
    var main = dom.qs("[data-gallery-main]");
    var thumbs = dom.qsa("[data-gallery-thumb]");
    if (!main || thumbs.length === 0) return;

    thumbs.forEach(function (thumb) {
      dom.on(thumb, "click", function () {
        var newSrc = thumb.getAttribute("data-full-src");
        var newAlt = thumb.getAttribute("data-full-alt") || "";
        main.setAttribute("src", newSrc);
        main.setAttribute("alt", newAlt);
        thumbs.forEach(function (t) { t.setAttribute("aria-current", "false"); });
        thumb.setAttribute("aria-current", "true");
      });
    });
  }

  function initSwatches() {
    dom.qsa("[data-swatch-group]").forEach(function (group) {
      var swatches = dom.qsa("[data-swatch]", group);
      swatches.forEach(function (swatch) {
        if (swatch.disabled) return;
        dom.on(swatch, "click", function () {
          swatches.forEach(function (s) { s.setAttribute("aria-pressed", "false"); });
          swatch.setAttribute("aria-pressed", "true");
          var label = dom.qs("[data-swatch-selected-label]");
          if (label) label.textContent = swatch.textContent.trim();
        });
      });
    });
  }

  function initAccordions() {
    dom.qsa("[data-accordion-trigger]").forEach(function (trigger) {
      dom.on(trigger, "click", function () {
        var panelId = trigger.getAttribute("aria-controls");
        var panel = document.getElementById(panelId);
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
  }

  function init() {
    initGallery();
    initSwatches();
    initAccordions();
  }

  window.Craftora = window.Craftora || {};
  window.Craftora.productGallery = { init: init };
})(window, document);
