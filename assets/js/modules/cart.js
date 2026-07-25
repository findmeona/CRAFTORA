/**
 * Craftora — Cart
 *
 * Persists to localStorage so the cart badge and cart page stay in sync
 * across pages in this static, backend-less demo. A production build would
 * swap `readCart`/`writeCart` for real API calls without touching callers.
 */
(function (window, document) {
  "use strict";

  var dom = window.Craftora.dom;
  var a11y = window.Craftora.a11y;
  var STORAGE_KEY = "craftora:cart";

  var CATALOG = {
    "speckled-mug": { title: "Speckled Stoneware Mug", maker: "Alder & Rowe Woodshop", price: 38, image: "assets/images/products/product-01.svg" },
    "walnut-board": { title: "Walnut Serving Board", maker: "Hearthstone Ceramics", price: 68, image: "assets/images/products/product-02.svg" },
    "leather-wallet": { title: "Vegetable-Tanned Card Wallet", maker: "Fen & Bramble Leatherworks", price: 52, image: "assets/images/products/product-03.svg" },
    "wool-throw": { title: "Handwoven Wool Throw", maker: "Loom & Field Textiles", price: 145, image: "assets/images/products/product-04.svg" },
    "oak-stool": { title: "Turned Oak Stool", maker: "Alder & Rowe Woodshop", price: 96, image: "assets/images/products/product-05.svg" },
    "clay-vase": { title: "Textured Clay Vase", maker: "Hearthstone Ceramics", price: 44, image: "assets/images/products/product-06.svg" }
  };

  function readCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeCart(cart) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* localStorage unavailable (private mode, quota) — cart just won't persist */
    }
    syncBadges();
  }

  function addItem(id, qty) {
    var cart = readCart();
    cart[id] = (cart[id] || 0) + (qty || 1);
    writeCart(cart);
    return cart;
  }

  function setQty(id, qty) {
    var cart = readCart();
    if (qty <= 0) {
      delete cart[id];
    } else {
      cart[id] = qty;
    }
    writeCart(cart);
    return cart;
  }

  function removeItem(id) {
    var cart = readCart();
    delete cart[id];
    writeCart(cart);
    return cart;
  }

  function totalCount() {
    var cart = readCart();
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + cart[id];
    }, 0);
  }

  function syncBadges() {
    var count = totalCount();
    dom.qsa("[data-cart-count]").forEach(function (el) {
      el.textContent = String(count);
    });
    dom.qsa("[data-cart-link]").forEach(function (el) {
      el.setAttribute("aria-label", "Cart, " + count + (count === 1 ? " item" : " items"));
    });
  }

  function showToast(message) {
    var region = dom.qs("[data-toast-region]");
    if (!region) return;
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 3200);
  }

  function initQuickAdd() {
    dom.qsa("[data-quick-add]").forEach(function (btn) {
      dom.on(btn, "click", function () {
        var id = btn.getAttribute("data-quick-add");
        var product = CATALOG[id];
        addItem(id, 1);
        var label = product ? product.title : "Item";
        showToast(label + " added to cart");
        a11y.announce(label + " added to cart");
      });
    });
  }

  function money(n) {
    return "€" + n.toFixed(2).replace(/\.00$/, "");
  }

  function renderCartPage() {
    var list = dom.qs("[data-cart-list]");
    if (!list) return; // not on the cart page

    var emptyState = dom.qs("[data-cart-empty]");
    var summary = dom.qs("[data-cart-summary]");
    var cart = readCart();
    var ids = Object.keys(cart).filter(function (id) { return CATALOG[id]; });

    if (ids.length === 0) {
      list.hidden = true;
      if (summary) summary.hidden = true;
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;
    list.hidden = false;
    if (summary) summary.hidden = false;
    list.innerHTML = "";

    var subtotal = 0;

    ids.forEach(function (id) {
      var product = CATALOG[id];
      var qty = cart[id];
      var lineTotal = product.price * qty;
      subtotal += lineTotal;

      var line = document.createElement("article");
      line.className = "cart-line";
      line.setAttribute("data-cart-line", id);
      line.innerHTML =
        '<img class="cart-line__img" src="' + product.image + '" alt="" width="88" height="88" loading="lazy" />' +
        "<div>" +
        '<div class="u-flex u-justify-between u-gap-3">' +
        "<div>" +
        '<p class="cart-line__title">' + product.title + "</p>" +
        '<p class="cart-line__meta">' + product.maker + "</p>" +
        "</div>" +
        '<p class="cart-line__title" data-line-total>' + money(lineTotal) + "</p>" +
        "</div>" +
        '<div class="cart-line__row">' +
        '<div class="qty-stepper" role="group" aria-label="Quantity for ' + product.title + '">' +
        '<button class="qty-stepper__btn" type="button" data-qty-decrease aria-label="Decrease quantity">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14" stroke-linecap="round"/></svg>' +
        "</button>" +
        '<span class="qty-stepper__value" data-qty-value aria-live="polite">' + qty + "</span>" +
        '<button class="qty-stepper__btn" type="button" data-qty-increase aria-label="Increase quantity">' +
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>' +
        "</button>" +
        "</div>" +
        '<button class="cart-line__remove" type="button" data-remove-line>Remove</button>' +
        "</div>" +
        "</div>";

      list.appendChild(line);

      dom.on(dom.qs("[data-qty-decrease]", line), "click", function () {
        var newQty = Math.max(0, qty - 1);
        setQty(id, newQty);
        renderCartPage();
        a11y.announce(newQty === 0 ? product.title + " removed from cart" : "Quantity updated to " + newQty);
      });
      dom.on(dom.qs("[data-qty-increase]", line), "click", function () {
        setQty(id, qty + 1);
        renderCartPage();
        a11y.announce("Quantity updated to " + (qty + 1));
      });
      dom.on(dom.qs("[data-remove-line]", line), "click", function () {
        removeItem(id);
        renderCartPage();
        a11y.announce(product.title + " removed from cart");
      });
    });

    var shipping = subtotal >= 75 || subtotal === 0 ? 0 : 6.5;
    var total = subtotal + shipping;

    var subtotalEl = dom.qs("[data-summary-subtotal]");
    var shippingEl = dom.qs("[data-summary-shipping]");
    var totalEl = dom.qs("[data-summary-total]");
    if (subtotalEl) subtotalEl.textContent = money(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "Free" : money(shipping);
    if (totalEl) totalEl.textContent = money(total);
  }

  function init() {
    syncBadges();
    initQuickAdd();
    renderCartPage();

    var pdpAddForm = dom.qs("[data-pdp-add-form]");
    if (pdpAddForm) {
      dom.on(pdpAddForm, "submit", function (event) {
        event.preventDefault();
        var id = pdpAddForm.getAttribute("data-product-id");
        var qtyInput = dom.qs("[data-pdp-qty]", pdpAddForm);
        var qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
        addItem(id, qty);
        var product = CATALOG[id];
        var label = product ? product.title : "Item";
        showToast(label + " added to cart");
        a11y.announce(label + " added to cart");
      });
    }
  }

  window.Craftora = window.Craftora || {};
  window.Craftora.cart = {
    init: init,
    addItem: addItem,
    setQty: setQty,
    removeItem: removeItem,
    totalCount: totalCount,
    CATALOG: CATALOG
  };
})(window, document);
