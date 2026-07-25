# Craftora

A premium e-commerce storefront for handcrafted goods — original design and
content, built on the token system defined in `DESIGN.md`, with plain
HTML5, CSS variables, and vanilla JavaScript. No frameworks, no build step.

## Running it

No build tools required. Two options:

1. **Just open it.** Double-click `index.html` (or any page) to open it
   directly in a browser. Everything works except the cart, which needs a
   real HTTP origin for `localStorage` to persist reliably in some browsers.
2. **Serve it locally** (recommended, and required if your browser blocks
   `file://` fetches):
   ```
   cd craftora
   python3 -m http.server 8080
   ```
   Then visit `http://localhost:8080`.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `collection.html` | Collection / product listing, with filters and sort |
| `product.html` | Product details, gallery, variants, accordions |
| `cart.html` | Cart with quantity controls and order summary |
| `about.html` | About / our makers |
| `contact.html` | Contact form with client-side validation |

## Architecture

- **CSS** loads in cascade order: `tokens.css` → `base.css` → `layout.css`
  → `components.css`. Tokens define every color, spacing, radius, type, and
  motion value as a CSS custom property — no raw hex/px values appear in
  `components.css` or `layout.css`.
- **JS** is split into small modules under `assets/js/modules/`, each of
  which no-ops safely if its markup isn't present on the current page, plus
  shared utilities under `assets/js/utils/`. `app.js` is the single entry
  point loaded on every page.
- **Cart state** persists to `localStorage` (see `assets/js/modules/cart.js`)
  since this is a static, backend-less build. Swap `readCart`/`writeCart`
  for real API calls to connect a backend — no other code needs to change.
- **Images** are original, abstract SVG placeholders (no third-party or
  copyrighted photography) — swap the files in `assets/images/` for real
  product photography before launch; the `<img>` dimensions and `alt` text
  are already in place.

## Accessibility

Built to WCAG 2.2 AA:
- All interactive components are keyboard-operable (mega nav, mobile menu,
  modals, accordions, filters, gallery, quantity steppers).
- Every focusable element has a visible `:focus-visible` ring; dialogs trap
  focus and return it to the trigger on close.
- Color tokens were adjusted from the raw DESIGN.md export where the literal
  values would have failed AA contrast — see the comment block at the top
  of `assets/css/tokens.css` for exactly what changed and why.
- Motion respects `prefers-reduced-motion`.
- Form errors are associated to their fields via `aria-describedby` and
  announced through a shared `aria-live` region (`assets/js/utils/a11y.js`).

## Known gaps to fill before a real launch

- Real product photography and a real product/catalog data source (the
  demo catalog lives inline in `cart.js` and the HTML).
- A real checkout flow — the "Checkout" button on `cart.html` is a visual
  stub.
- A real newsletter/contact backend — both forms currently validate and
  show a success state client-side only.
