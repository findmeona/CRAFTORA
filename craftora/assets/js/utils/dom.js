/**
 * Craftora — DOM utilities
 * Small, dependency-free helpers reused by every module.
 */
(function (window) {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function on(el, type, handler, options) {
    if (!el) return function noop() {};
    el.addEventListener(type, handler, options);
    return function off() {
      el.removeEventListener(type, handler, options);
    };
  }

  function debounce(fn, wait) {
    var timer;
    return function debounced() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  window.Craftora = window.Craftora || {};
  window.Craftora.dom = { qs: qs, qsa: qsa, on: on, debounce: debounce };
})(window);
