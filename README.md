# Build Your Burger

# DOUBLE GOOD — Interactive Burger Builder Website — Exact Recreation Prompt
## Ready to paste into Lovable (new project)

> **Source:** the website shown in the Instagram reel by online.by.annie (reel DfOAH1MI1-g, viewed 3 Nov 2026).
> **Important — read first:** No website URL or domain is legible in the reel, its caption, or its visible comments, so **do not invent a domain and do not copy doublegood.com** — that is a different business (gourmet popcorn), not this burger site. Build this as a standalone burger-delivery site. The brand name shown on screen in the reel is DOUBLE GOOD; use it exactly as the on-screen brand, or swap it in ONE place (see TODO 1) for your own brand name if this is for your own business.
> **Also do NOT reproduce:** the reel's own white overlay text, any Instagram UI, the laptop, the hand, or the table the laptop sits on. Those are part of the reel video, not the website.

---

## PROMPT — COPY FROM HERE

Build me a complete, fully working, interactive burger-delivery website called DOUBLE GOOD. This is NOT a static menu page. The whole point is a game-like, satisfying "build your own burger" experience, in a playful pop-art fast-food style. Build it exactly in the order below. Do NOT simplify, omit, merge, or flatten any section. Do NOT replace the builder with a plain menu list. Every interaction below must actually work.

### 1. DESIGN LANGUAGE — LOCK THIS IN FIRST

- **Style:** flat, cartoon, pop-art food illustration. Thick simple shapes, hard shadows, no photorealism, no stock photos, no gradients on the food. Everything food-related is drawn in code as clean SVG-style flat illustration.
- **Palette — use exactly these tokens everywhere, no other main colours:**
  - Page background: pale butter yellow `#FFF6CC`
  - Bright yellow (boxes, trays, header band, fry cartons): `#FFD400`
  - Royal blue (logo, primary buttons, repeating box pattern): `#1E40E6`
  - Red (ketchup, tomato, accent hands): `#E11D2E`
  - Headline text: near-black `#111111`
  - Card interiors / secondary text: white `#FFFFFF`
  - Counter surface (top-down view only): metallic light grey `#CBD5E1` with a darker steel edge `#94A3B8`
  - Small secondary pill: purple `#7C3AED` (hero secondary buttons only)
- **Typography:** one heavy, bold, rounded display sans-serif for ALL headings, logo and buttons (use "Baloo 2" or "Fredoka" — ExtraBold weight, all caps for brand and headings). Body text: the same family at regular weight, or a clean rounded sans. Headings must look fat, chunky and playful, never thin or elegant.
- **Buttons:** fully rounded pill buttons, thick, with a hard offset shadow (3px solid black shadow, no blur). Primary button = royal blue background, white text. Hover = button lifts 2px and shadow grows. Active/press = button sinks.
- **Corners:** cards and boxes use large rounded corners (20–28px), except the burger box which is a chunky rectangular takeaway box with a lid flap.
- **Motion feel:** bouncy, tactile, satisfying. Every add/remove must feel like a toy snapping into place. Use spring physics (stiffness ~300, damping ~20) for layer drops, box opening, and cart bumps. Never use slow fades as a substitute for this bounce.

### 2. HEADER — ALWAYS VISIBLE

- A bright yellow horizontal band across the very top, full width.
- Left: logo "DOUBLE GOOD" in bold stacked royal-blue capitals, two lines ("DOUBLE" over "GOOD"), tight leading.
- Centre/right: small nav links in black bold text: MENU, BUILD YOUR BURGER, SIDES, ABOUT, CONTACT. (Nav wording is a clean reconstruction — the reel's small nav text is not legible at an angle — so use exactly these five labels.)
- Far right: a royal-blue pill CART button showing a basket icon and live item count. Clicking it opens the cart drawer (Section 7).
- On mobile: logo left, cart right, nav collapses into a hamburger that opens a full yellow menu panel with the same five links.

### 3. HERO — "GOOD THINGS COME IN LAYERS"

Layout: two columns on desktop (text left, visual right), stacked on mobile with the visual below the headline.

- **Left column:**
  - Eyebrow in small bold blue caps: "BUILD YOUR BURGER"
  - Huge black headline, three lines, ExtraBold, all caps:
    "GOOD THINGS
    COME IN
    LAYERS."
  - One short supporting paragraph in black regular text underneath, in the same playful tone (write it yourself, one or two sentences: a burger is only as good as its layers, so build yours exactly how you like it).
  - Primary blue pill button: "OPEN THE BURGER BOX" — clicking it MUST scroll smoothly into the builder (Section 4) and trigger the box-open animation there.
  - Below it, two smaller pill buttons (yellow and purple): "SEE PRESETS" and "TODAY'S SIDES". "SEE PRESETS" jumps to the preset list in the builder; "TODAY'S SIDES" jumps to the sides strip (Section 6).
- **Right column — the hero visual, do not shrink this:**
  - A large bright-yellow open burger box, drawn flat in code, with "DOUBLE GOOD" printed on it in royal blue and "BUILD YOUR BURGER" printed underneath.
  - Inside the box: a stylised cartoon burger (sesame top bun, lettuce, cheese, patty, tomato, bottom bun).
  - Two red cartoon hands/arms reaching in toward the burger from the sides, as in the reel.
  - The whole box gently bobs (up/down 6px, 3-second loop) and the burger inside slightly squashes and rebounds on a 4-second loop, so the hero feels alive even before any click.
  - On click of the box itself, it also opens into the builder, exactly like the CTA button.

### 4. THE BURGER BUILDER — THE CORE OF THE SITE (DO NOT SIMPLIFY THIS)

This is one screen with THREE linked panels that always stay in sync. A change in any panel updates the other two instantly, with no page reload.

**Layout (desktop):** left panel 260px, centre stage flexible, right panel 300px. On mobile: centre stage on top, then a bottom-sheet ingredient selector, then the summary as a sticky bar with price + ADD TO ORDER.

**4A. Left panel — presets + ingredient categories:**
- Heading in bold caps: "BURGERS".
- Preset rows (clicking one loads that full stack into the centre instantly, with a bounce):
  1. DOUBLE GOOD — the signature stack (see 4B default stack).
  2. CLASSIC BEEF — bun, beef patty, cheese, lettuce, tomato.
  3. Add at least two more presets of your own in the same style (for example a spicy and a veggie preset) so the list does not look empty.
- Below presets, category headings in bold caps, each expandable: BREAD, PATTY, CHEESE, VEGGIES, SAUCE, EXTRAS.
- Clicking a category scrolls/highlights the matching step in the bottom selector (4C).

**4B. Centre stage — the live stacked burger:**
- A bright-yellow tray/board underneath the burger, with a hard shadow.
- The burger is a vertical stack, drawn as flat layered shapes, bottom to top, default DOUBLE GOOD stack:
  1. Bottom bun (golden, flat base)
  2. Beef patty (dark brown, thick)
  3. Melted cheese (bright yellow-orange, with drips hanging over the patty edge)
  4. Tomato slice (red, round)
  5. Lettuce (bright green, wavy edge)
  6. Sesame top bun (golden dome with white sesame seeds)
- Every layer is a separate element. Adding an ingredient inserts its layer in the correct position (bread at bottom/top, patty above bottom bun, cheese above patty, veggies above cheese, sauce as a drizzle layer). Removing an ingredient removes its layer with a pop-out animation. Adding the same ingredient twice stacks it twice (double cheese, double patty must visibly double).
- The stack must squash slightly (scale Y 0.96 for 150ms) and rebound every time a layer is added or removed, and the total height must grow/shrink smoothly with a spring, never jump.
- A small "CLEAR" text button resets the stack to just the two buns. A "RANDOM" dice button builds a surprise burger.

**4C. Bottom selector strip — step-by-step building:**
- A horizontal strip under the centre stage with a step heading that changes as you build, starting with "SELECT YOUR BREAD".
- Steps in order: 1 BREAD → 2 PATTY → 3 CHEESE → 4 VEGGIES → 5 SAUCE → 6 EXTRAS. Show the step as numbered dots/progress at the top of the strip.
- Each step shows its ingredient tiles horizontally (scrollable on mobile): a flat illustration tile, the ingredient name in bold caps, and its price (see TODO 2 for real prices; use clear placeholder prices until then).
- **Interaction — both must work:**
  - CLICK a tile = add that ingredient to the stack.
  - DRAG a tile onto the burger = the same add, with the tile following the cursor and a highlighted drop glow on the burger while dragging.
- Clicking an already-added ingredient again removes one layer of it. Selected tiles show a blue ring + check mark.
- A "NEXT STEP →" button advances to the next step; a "← BACK" button goes back. Completing all steps shows a "YOUR BURGER IS READY!" state on the strip.

**4D. Right panel — live order summary:**
- Heading: "YOUR ORDER".
- Small thumbnails of the current burger layers as a mini list, each with a small × to remove that layer.
- Live price: base price + sum of added ingredients, updating instantly on every add/remove, with a quick count-up/count-down number animation (not a static jump).
- A calorie-style fun line underneath (for example "Layers: 6 · Stack height: TALL") that updates with the stack.
- Big royal-blue pill button: "ADD TO ORDER". Clicking it adds the current burger to the cart, bumps the header cart count with a spring animation, shows a "ADDED!" confirmation on the button for 1.5 seconds, and resets the builder to the default stack.

### 5. TOP-DOWN COUNTER VIEW — SECOND BUILDER MODE (SAME BURGER, SAME STATE)

Above the builder, add a view toggle: [STACK VIEW | COUNTER VIEW]. Both views share the EXACT same burger state — switching views never resets the burger, the price, or the selection.

- **Counter view scene (flat illustration, full width):**
  - Background: metallic steel counter surface (light grey with subtle horizontal brushed lines).
  - Top left: "DOUBLE GOOD" logo again, small, on the yellow header band.
  - Left side: ingredient trays/containers in a row/column — clear plastic trays for buns, patties, cheese, lettuce, tomato, chopped onions, each with a small yellow label. Clicking a tray adds that ingredient, exactly like the tiles in 4C.
  - Top centre: three large squeeze bottles labelled "DOUBLE GOOD" — yellow (mustard), red (ketchup), blue (mayonnaise). Clicking a bottle adds that sauce as a drizzle layer.
  - Centre: a large open bright-yellow "DOUBLE GOOD" box, inside printed with a repeating small blue logo pattern, holding the burger currently being assembled (same layers as 4B, shown at a slightly smaller scale inside the box).
  - Right side: three upright yellow cartons, also branded "DOUBLE GOOD", holding fries / onion rings. Clicking a carton adds that side to the order summary (see Section 6).
  - Bottom: the same blue pill "ADD TO ORDER" button.
- Counter view must be fully clickable/tappable, not a decorative image. Every tray, bottle and carton is a working button with hover lift and press sink.

### 6. SIDES STRIP

- Below the builder, a section titled "SIDES" in bold caps.
- Three cards in a row (stacked on mobile): FRIES, ONION RINGS, and one extra side of your choice, each in a yellow "DOUBLE GOOD" carton illustration, with name, short playful description, price (TODO 2), and a blue pill "ADD" button that adds it to the cart and bumps the cart count.

### 7. CART DRAWER + ORDER FLOW

- Clicking the header CART button slides in a right-side drawer (yellow header, white body) listing every added burger (with its layer list and price) and every side, each with quantity +/− and remove ×.
- Drawer footer: subtotal, delivery fee line, total (all live), and a big blue pill "CHECKOUT" button.
- Checkout for now goes to a simple order-success screen (no real payment integration unless TODO 5 supplies one): order number, estimated time, and a "BUILD ANOTHER" button that returns to the builder. Do NOT build a fake payment form.
- The cart must persist in the browser (localStorage) so a refresh does not empty it.

### 8. FOOTER

- Royal-blue footer band, white text.
- Left: "DOUBLE GOOD" stacked logo in white.
- Centre: the same five nav links as the header.
- Right: opening-hours line and contact line (use TODO 3 placeholders until real details are supplied).
- Bottom line in small text: "Made fresh. Built in layers." plus a copyright line with the brand name.

### 9. RESPONSIVE + ACCESSIBILITY — NON-NEGOTIABLE

- Desktop (1280px+): full three-panel builder as specified. Tablet: left panel collapses into a top preset row; centre + summary stay. Mobile (390px): single column, hero text first then box, builder centre stage first, bottom-sheet selector, sticky summary bar at the bottom with price + ADD TO ORDER always visible.
- Every button has a visible focus ring. All ingredient tiles and trays are real buttons with aria-labels. Respect prefers-reduced-motion: turn the bobbing/squash loops off and replace spring drops with a simple instant swap.
- No horizontal scroll on any screen. No text overlapping the burger or the box at any width — test at 1440px, 1024px, 768px and 390px.

### 10. DO NOT DO THIS — LOCK

- Do NOT simplify the builder into a menu list, a form, or a configurator with dropdowns.
- Do NOT drop the Counter View, the drag interaction, the live price, or the cart drawer.
- Do NOT use stock photos, photorealistic food, or a generic restaurant template look.
- Do NOT invent a domain, a delivery app link, or a real payment gateway.
- Do NOT copy the reel's overlay text, Instagram UI, laptop, or hand into the site.
- Do NOT change the palette, the stacked logo, or the headline "GOOD THINGS COME IN LAYERS."

### 11. QA CHECKLIST — THE BUILD MUST PASS ALL OF THESE BEFORE YOU SAY IT IS DONE

1. Hero shows the butter-yellow background, yellow header band, stacked blue DOUBLE GOOD logo, black headline "GOOD THINGS COME IN LAYERS.", blue "OPEN THE BURGER BOX" pill, and the large yellow box with burger + red hands.
2. "OPEN THE BURGER BOX" and clicking the box both scroll to and open the builder.
3. Presets DOUBLE GOOD and CLASSIC BEEF load a full correct stack instantly.
4. Clicking an ingredient tile adds its layer in the correct stack position; clicking again removes it; double-clicking a patty/cheese doubles it visibly.
5. Dragging a tile onto the burger adds it, with a drop glow while dragging.
6. The bottom strip steps run BREAD → PATTY → CHEESE → VEGGIES → SAUCE → EXTRAS, starting at "SELECT YOUR BREAD".
7. Stack View and Counter View show the same burger and price, and switching views never resets anything.
8. Counter trays, sauce bottles and side cartons are all clickable and update the burger/order.
9. The order summary price counts up/down live on every change; ADD TO ORDER bumps the header cart count.
10. The cart drawer opens, edits quantities, removes items, shows a live total, persists on refresh, and checkout reaches an order-success screen.
11. Sides cards add fries/onion rings to the cart.
12. Layout is clean with no overlap at 1440px, 1024px, 768px and 390px, and reduced-motion mode disables the loops.

---

## TODO — ONLY MUHAMMAD AHMAD CAN SUPPLY THESE (fill before publishing)

1. **Brand name:** keep DOUBLE GOOD as shown in the reel, or replace it in one place with your own brand name + logo file. Do not publish another business's brand as your own without permission.
2. **Prices + currency:** real price for every bread, patty, cheese, veggie, sauce, extra, preset and side (the reel's prices are not legible, so placeholders are used in the build).
3. **Delivery details:** delivery areas, delivery fee, opening hours, phone/WhatsApp, and address for the footer + checkout.
4. **Hero subtext:** final one-to-two-sentence supporting paragraph under the headline (the reel's small paragraph is not legible).
5. **Checkout:** whether to keep the simple order-success screen, or connect a real payment/delivery system — and if so, which one.
6. **Nav wording:** confirm the five nav labels (MENU, BUILD YOUR BURGER, SIDES, ABOUT, CONTACT) or replace them with your real pages.
7. **Extra presets + extra side:** confirm the extra preset and extra side names, or supply your real menu items.
8. **Language:** the reel site is in English — confirm English, or supply the exact translated copy if you want another language.
9. **Logo file:** supply your logo file if you are not using the stacked text logo drawn in code.

## BUILD ORDER FOR LOVABLE

1. Tokens + typography + header + footer shell. 2. Hero with box + hands + CTA. 3. Builder state (layers, price, cart) + Stack View + bottom selector + drag + presets. 4. Counter View sharing the same state. 5. Sides + cart drawer + checkout-success. 6. Responsive passes at 1440 / 1024 / 768 / 390px + reduced-motion. 7. Run the full QA checklist above and fix every failure before finishing.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/479673f9-332d-4aa3-b817-9323136b9315).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
