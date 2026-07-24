/**
 * Craftora — Search
 *
 * Keyboard contract:
 *  - Typing filters a small demo product index (client-side; a real build
 *    would call a search endpoint here).
 *  - ArrowDown/ArrowUp move through results; Enter navigates to the
 *    focused/selected result; Escape clears and closes the results list.
 *  - Empty query or no matches shows an explicit empty state, not a blank box.
 */
(function (window, document) {
  "use strict";

  var dom = window.Craftora.dom;

  var DEMO_INDEX = [
    { id: "speckled-mug", title: "Speckled Stoneware Mug", maker: "Alder & Rowe Woodshop" },
    { id: "walnut-board", title: "Walnut Serving Board", maker: "Hearthstone Ceramics" },
    { id: "leather-wallet", title: "Vegetable-Tanned Card Wallet", maker: "Fen & Bramble Leatherworks" },
    { id: "wool-throw", title: "Handwoven Wool Throw", maker: "Loom & Field Textiles" },
    { id: "oak-stool", title: "Turned Oak Stool", maker: "Alder & Rowe Woodshop" },
    { id: "clay-vase", title: "Textured Clay Vase", maker: "Hearthstone Ceramics" }
  ];

  function init() {
    var root = dom.qs("[data-search]");
    if (!root) return;

    var input = dom.qs("[data-search-input]", root);
    var clearBtn = dom.qs("[data-search-clear]", root);
    var resultsEl = dom.qs("[data-search-results]", root);
    var activeIndex = -1;
    var currentResults = [];

    function render(results, query) {
      currentResults = results;
      activeIndex = -1;
      resultsEl.innerHTML = "";

      if (!query) {
        resultsEl.hidden = true;
        return;
      }

      if (results.length === 0) {
        var empty = document.createElement("p");
        empty.className = "search__empty";
        empty.textContent = 'No products match "' + query + '". Try a different search term.';
        resultsEl.appendChild(empty);
        resultsEl.hidden = false;
        return;
      }

      results.forEach(function (item, i) {
        var a = document.createElement("a");
        a.href = "product.html?id=" + encodeURIComponent(item.id);
        a.className = "search__result";
        a.id = "search-result-" + i;
        a.setAttribute("role", "option");
        a.innerHTML =
          "<span>" +
          item.title +
          '<br><span class="text-muted text-xs">' +
          item.maker +
          "</span></span>";
        resultsEl.appendChild(a);
      });
      resultsEl.hidden = false;
    }

    function search(query) {
      var q = query.trim().toLowerCase();
      if (!q) return render([], "");
      var results = DEMO_INDEX.filter(function (item) {
        return (item.title + " " + item.maker).toLowerCase().indexOf(q) !== -1;
      });
      render(results, query.trim());
    }

    var debouncedSearch = dom.debounce(search, 200);

    dom.on(input, "input", function () {
      clearBtn.hidden = input.value.length === 0;
      debouncedSearch(input.value);
    });

    dom.on(clearBtn, "click", function () {
      input.value = "";
      clearBtn.hidden = true;
      render([], "");
      input.focus();
    });

    dom.on(input, "keydown", function (event) {
      var options = dom.qsa(".search__result", resultsEl);
      if (event.key === "ArrowDown") {
        if (!options.length) return;
        event.preventDefault();
        activeIndex = Math.min(activeIndex + 1, options.length - 1);
        options.forEach(function (o, i) { o.setAttribute("aria-selected", String(i === activeIndex)); });
        options[activeIndex].scrollIntoView({ block: "nearest" });
      } else if (event.key === "ArrowUp") {
        if (!options.length) return;
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        options.forEach(function (o, i) { o.setAttribute("aria-selected", String(i === activeIndex)); });
        options[activeIndex].scrollIntoView({ block: "nearest" });
      } else if (event.key === "Enter") {
        if (activeIndex >= 0 && options[activeIndex]) {
          event.preventDefault();
          window.location.href = options[activeIndex].href;
        }
      } else if (event.key === "Escape") {
        input.value = "";
        clearBtn.hidden = true;
        render([], "");
      }
    });

    dom.on(document, "click", function (event) {
      if (!root.contains(event.target)) {
        resultsEl.hidden = true;
      }
    });
  }

  window.Craftora = window.Craftora || {};
  window.Craftora.search = { init: init };
})(window, document);
