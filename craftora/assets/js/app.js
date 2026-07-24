/**
 * Craftora — App entry point
 * Wires up every module. Each module no-ops safely if its markup isn't
 * present on the current page, so this file is shared by all pages.
 */
(function (window, document) {
  "use strict";

  var dom = window.Craftora.dom;
  var a11y = window.Craftora.a11y;

  function initHeaderElevation() {
    var header = dom.qs("[data-header]");
    if (!header) return;
    var onScroll = dom.debounce(function () {
      header.classList.toggle("site-header--elevated", window.scrollY > 4);
    }, 10);
    dom.on(window, "scroll", onScroll, { passive: true });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function initNewsletterForm() {
    var form = dom.qs("[data-newsletter-form]");
    if (!form) return;
    var status = dom.qs("[data-newsletter-status]");
    var input = dom.qs("#newsletter-email", form);

    dom.on(form, "submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();

      if (!isValidEmail(value)) {
        status.textContent = "Enter a valid email address to subscribe.";
        status.className = "newsletter__status newsletter__status--error";
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }

      input.removeAttribute("aria-invalid");
      status.textContent = "You're subscribed — first pick of new drops lands in your inbox.";
      status.className = "newsletter__status newsletter__status--success";
      form.reset();
    });
  }

  function initContactForm() {
    var form = dom.qs("[data-contact-form]");
    if (!form) return;

    dom.on(form, "submit", function (event) {
      event.preventDefault();
      var fields = dom.qsa("[data-required]", form);
      var firstInvalid = null;

      fields.forEach(function (field) {
        var wrapper = field.closest(".field");
        var errorEl = wrapper ? dom.qs("[data-field-error]", wrapper) : null;
        var valid = field.type === "email" ? isValidEmail(field.value.trim()) : field.value.trim().length > 0;

        if (!valid) {
          if (wrapper) wrapper.classList.add("field--error");
          if (errorEl) errorEl.hidden = false;
          field.setAttribute("aria-invalid", "true");
          if (!firstInvalid) firstInvalid = field;
        } else {
          if (wrapper) wrapper.classList.remove("field--error");
          if (errorEl) errorEl.hidden = true;
          field.removeAttribute("aria-invalid");
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        a11y.announce("Please fix the highlighted fields before submitting.");
        return;
      }

      var successEl = dom.qs("[data-contact-success]");
      form.hidden = true;
      if (successEl) {
        successEl.hidden = false;
        successEl.focus();
      }
      a11y.announce("Your message has been sent. We'll reply within two business days.");
    });
  }

  function init() {
    initHeaderElevation();
    window.Craftora.megaNav.init();
    if (window.Craftora.search) window.Craftora.search.init();
    if (window.Craftora.cart) window.Craftora.cart.init();
    if (window.Craftora.modal) window.Craftora.modal.init();
    if (window.Craftora.filters) window.Craftora.filters.init();
    if (window.Craftora.productGallery) window.Craftora.productGallery.init();
    initNewsletterForm();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
