/**
 * Craftora — Modal / Dialog controller
 *
 * Keyboard contract: focus moves into the dialog on open (trapped inside),
 * Escape closes, focus returns to the triggering element on close.
 * Usage: data-modal-target="modal-id" on any trigger button,
 * data-modal="modal-id" on the modal root, data-modal-close inside it.
 */
(function (window, document) {
  "use strict";

  var dom = window.Craftora.dom;
  var a11y = window.Craftora.a11y;

  function initModal(modalEl) {
    var dialog = dom.qs(".modal__dialog", modalEl);
    var trap = a11y.createFocusTrap(dialog);
    var isOpen = false;
    var trigger = null;

    function open(fromTrigger) {
      trigger = fromTrigger || null;
      isOpen = true;
      modalEl.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
      trap.activate();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      modalEl.setAttribute("data-open", "false");
      document.body.style.overflow = "";
      trap.deactivate();
      if (trigger) trigger.focus();
    }

    dom.qsa("[data-modal-close]", modalEl).forEach(function (el) {
      dom.on(el, "click", close);
    });
    dom.on(dom.qs(".modal__overlay", modalEl), "click", close);
    dom.on(document, "keydown", function (event) {
      if (event.key === "Escape" && isOpen) close();
    });

    return { open: open, close: close };
  }

  function init() {
    var modals = {};
    dom.qsa("[data-modal]").forEach(function (modalEl) {
      var id = modalEl.getAttribute("data-modal");
      modals[id] = initModal(modalEl);
    });

    dom.qsa("[data-modal-target]").forEach(function (trigger) {
      dom.on(trigger, "click", function () {
        var id = trigger.getAttribute("data-modal-target");
        if (modals[id]) modals[id].open(trigger);
      });
    });

    return modals;
  }

  window.Craftora = window.Craftora || {};
  window.Craftora.modal = { init: init };
})(window, document);
