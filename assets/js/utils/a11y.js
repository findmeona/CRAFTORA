/**
 * Craftora — Accessibility utilities
 * Focus trap for dialogs/off-canvas panels, and a shared aria-live announcer.
 */
(function (window, document) {
  "use strict";

  var FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /**
   * Creates a focus trap controller for a container element.
   * @param {HTMLElement} container
   * @returns {{activate: Function, deactivate: Function}}
   */
  function createFocusTrap(container) {
    var lastFocused = null;

    function getFocusable() {
      return Array.prototype.slice
        .call(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter(function (el) {
          return el.offsetParent !== null;
        });
    }

    function handleKeydown(event) {
      if (event.key === "Tab") {
        var focusable = getFocusable();
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    function activate() {
      lastFocused = document.activeElement;
      container.addEventListener("keydown", handleKeydown);
      var focusable = getFocusable();
      if (focusable.length) {
        focusable[0].focus();
      } else {
        container.setAttribute("tabindex", "-1");
        container.focus();
      }
    }

    function deactivate() {
      container.removeEventListener("keydown", handleKeydown);
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    return { activate: activate, deactivate: deactivate };
  }

  /**
   * Announces a message to screen readers via a shared visually-hidden
   * aria-live region, created lazily on first use.
   */
  var liveRegion = null;
  function announce(message) {
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.className = "sr-only";
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = "";
    // Force a reflow so repeated identical messages are still announced.
    window.requestAnimationFrame(function () {
      liveRegion.textContent = message;
    });
  }

  window.Craftora = window.Craftora || {};
  window.Craftora.a11y = { createFocusTrap: createFocusTrap, announce: announce };
})(window, document);
