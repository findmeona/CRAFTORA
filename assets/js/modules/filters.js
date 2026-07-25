/**
 * Craftora — Filters (Collection page)
 *
 * Client-side demo filtering: checkboxes toggle visibility of product
 * cards in the grid via `data-filter-*` attributes. Mobile opens the same
 * filter set inside a modal (data-modal="filters").
 * Keyboard/pointer/touch: native checkbox and select semantics throughout;
 * chip removal is a real <button> so it's reachable by keyboard.
 */
(function (window, document) {
  "use strict";

  var dom = window.Craftora.dom;
  var a11y = window.Craftora.a11y;

  function init() {
    var grid = dom.qs("[data-product-grid]");
    var checkboxes = dom.qsa("[data-filter-input]");
    var activeFiltersEl = dom.qs("[data-active-filters]");
    var countEl = dom.qs("[data-result-count]");
    var emptyState = dom.qs("[data-grid-empty]");
    var sortSelect = dom.qs("[data-sort-select]");
    var clearAllBtn = dom.qs("[data-clear-filters]");

    if (!grid || checkboxes.length === 0) return;

    var cards = dom.qsa("[data-card-category]", grid);

    function getActiveFilters() {
      return checkboxes.filter(function (cb) { return cb.checked; });
    }

    function applyFilters() {
      var active = getActiveFilters();
      var activeValues = active.map(function (cb) { return cb.value; });
      var visibleCount = 0;

      cards.forEach(function (card) {
        var cat = card.getAttribute("data-card-category");
        var visible = activeValues.length === 0 || activeValues.indexOf(cat) !== -1;
        card.hidden = !visible;
        if (visible) visibleCount++;
      });

      if (countEl) countEl.textContent = String(visibleCount);
      if (emptyState) emptyState.hidden = visibleCount !== 0;
      grid.hidden = visibleCount === 0;

      renderChips(active);
      a11y.announce(visibleCount + " products found");
    }

    function renderChips(active) {
      if (!activeFiltersEl) return;
      activeFiltersEl.innerHTML = "";
      active.forEach(function (cb) {
        var chip = document.createElement("span");
        chip.className = "chip";
        chip.innerHTML =
          "<span>" +
          cb.getAttribute("data-filter-label") +
          '</span><button type="button" class="chip__remove" aria-label="Remove ' +
          cb.getAttribute("data-filter-label") +
          ' filter">' +
          '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>' +
          "</button>";
        dom.on(dom.qs(".chip__remove", chip), "click", function () {
          cb.checked = false;
          applyFilters();
        });
        activeFiltersEl.appendChild(chip);
      });
    }

    checkboxes.forEach(function (cb) {
      dom.on(cb, "change", applyFilters);
    });

    if (clearAllBtn) {
      dom.on(clearAllBtn, "click", function () {
        checkboxes.forEach(function (cb) { cb.checked = false; });
        applyFilters();
      });
    }

    if (sortSelect) {
      dom.on(sortSelect, "change", function () {
        var value = sortSelect.value;
        var visibleCards = cards.filter(function (c) { return !c.hidden; });
        var sorted = visibleCards.slice().sort(function (a, b) {
          var priceA = parseFloat(a.getAttribute("data-card-price"));
          var priceB = parseFloat(b.getAttribute("data-card-price"));
          if (value === "price-asc") return priceA - priceB;
          if (value === "price-desc") return priceB - priceA;
          return 0; // "featured" — keep source order
        });
        sorted.forEach(function (card) { grid.appendChild(card); });
        a11y.announce("Sorted by " + sortSelect.options[sortSelect.selectedIndex].text);
      });
    }

    applyFilters();
  }

  window.Craftora = window.Craftora || {};
  window.Craftora.filters = { init: init };
})(window, document);
