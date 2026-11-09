/* DOUBLE GOOD — v2 builder logic. Artwork lives in assets-data.js (window.DG_ASSETS). */
(function () {
  "use strict";
  var A = window.DG_ASSETS || {};
  var BASE_PRICE = 4.00, SAUCE_PRICE = 0.30, MAX_ITEMS = 14;

  var ING = {
    patty:   { name: "Beef Patty", price: 3.50 },
    cheese:  { name: "Cheese",     price: 1.20 },
    tomato:  { name: "Tomato",     price: 0.60 },
    lettuce: { name: "Lettuce",    price: 0.50 },
    pickles: { name: "Pickles",    price: 0.40 },
    onion:   { name: "Onions",     price: 0.40 },
    egg:     { name: "Fried Egg",  price: 1.50 },
    topBun:  { name: "Top Bun",    price: 1.00, single: true }
  };
  var SAUCES = {
    mustard: { name: "Mustard", color: "#F2A007" },
    ketchup: { name: "Ketchup", color: "#D92B1F" },
    mayo:    { name: "Mayo",    color: "#FDF3D8" }
  };
  var SIDES = {
    fries: { name: "Fries",       price: 2.90 },
    rings: { name: "Onion Rings", price: 3.40 },
    curly: { name: "Curly Fries", price: 3.20 }
  };

  /* wire every <img data-asset> to its generated artwork */
  document.querySelectorAll("img[data-asset]").forEach(function (img) {
    var src = A[img.getAttribute("data-asset")];
    if (src) img.src = src;
  });

  var stackEl = document.getElementById("stack");
  var hintEl = document.getElementById("stageHint");
  var linesEl = document.getElementById("orderLines");
  var emptyEl = document.getElementById("orderEmpty");
  var totalEl = document.getElementById("orderTotal");
  var metaEl = document.getElementById("orderMeta");

  var layers = [];      /* {kind:'ing'|'sauce', key, name, price} */
  var sidesOn = {};     /* side key -> true */
  var lastAction = -1;  /* index of layer to animate */

  function money(n) { return "$" + n.toFixed(2); }
  function total() {
    var t = BASE_PRICE;
    layers.forEach(function (l) { t += l.price; });
    Object.keys(sidesOn).forEach(function (k) { t += SIDES[k].price; });
    return t;
  }
  function sealed() { return layers.length > 0 && layers[layers.length - 1].key === "topBun"; }

  /* tiny pop sound, synthesized — no audio files */
  var actx = null;
  function pop(freq) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = "sine"; o.frequency.setValueAtTime(freq || 520, t);
      o.frequency.exponentialRampToValueAtTime(180, t + 0.09);
      g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.11);
    } catch (e) { /* sound is a bonus, never a blocker */ }
  }

  function render() {
    /* --- the stack in the box --- */
    var html = '<img class="base-img" src="' + (A.bunBottom || "") + '" alt="Bun base">';
    layers.forEach(function (l, i) {
      var anim = i === lastAction ? " just-added" : "";
      if (l.kind === "sauce") {
        html += '<div class="sauce-strip' + anim + '" data-idx="' + i + '" title="Tap to remove" style="--sauce:' + SAUCES[l.key].color + '"></div>';
      } else {
        html += '<button type="button" class="layer' + anim + '" data-idx="' + i + '" data-key="' + l.key + '" title="Tap to remove"><img src="' + (A[l.key] || "") + '" alt="' + l.name + '"></button>';
      }
    });
    stackEl.innerHTML = html;
    stackEl.classList.remove("squash"); void stackEl.offsetWidth; stackEl.classList.add("squash");

    /* --- hint --- */
    if (sealed()) hintEl.textContent = "Sealed with a top bun — that's a burger! Add a side, or check out. 🍔";
    else if (layers.length === 0) hintEl.textContent = "Your box is empty — tap something tasty on the left.";
    else if (layers.length >= MAX_ITEMS) hintEl.textContent = "That box is FULL. Respect. Time to check out.";
    else hintEl.textContent = layers.length + (layers.length === 1 ? " layer" : " layers") + " in — tap a layer to remove it, or keep stacking.";

    /* --- order lines (grouped) --- */
    var counts = {}, order = [];
    layers.forEach(function (l) {
      if (!counts[l.name]) { counts[l.name] = { n: 0, sum: 0 }; order.push(l.name); }
      counts[l.name].n++; counts[l.name].sum += l.price;
    });
    var li = '<li><span class="li-name">Bun base (in the box)</span><span>' + money(BASE_PRICE) + "</span></li>";
    order.forEach(function (name) {
      var c = counts[name];
      li += '<li><span class="li-name">' + name + (c.n > 1 ? " ×" + c.n : "") + "</span><span>" + money(c.sum) + "</span></li>";
    });
    Object.keys(sidesOn).forEach(function (k) {
      li += '<li><span class="li-name">' + SIDES[k].name + ' (side)</span><span>' + money(SIDES[k].price) +
            '</span><button type="button" class="li-x" data-side-off="' + k + '" aria-label="Remove ' + SIDES[k].name + '">✕</button></li>';
    });
    linesEl.innerHTML = li;
    emptyEl.style.display = (layers.length === 0 && Object.keys(sidesOn).length === 0) ? "block" : "none";
    totalEl.textContent = money(total());
    var ns = Object.keys(sidesOn).length;
    metaEl.textContent = layers.length + (layers.length === 1 ? " layer" : " layers") + (ns ? " · " + ns + (ns === 1 ? " side" : " sides") : "") + " · bun base included";
    lastAction = -1;
  }

  function addLayer(entry) {
    if (layers.length >= MAX_ITEMS) { hintEl.textContent = "That box is FULL. Respect. Time to check out."; return; }
    if (sealed()) { hintEl.textContent = "Top bun is on! Tap the top bun in the box to take it off first."; stackEl.classList.remove("squash"); void stackEl.offsetWidth; stackEl.classList.add("squash"); return; }
    if (entry.key === "topBun" && layers.some(function (l) { return l.key === "topBun"; })) return;
    layers.push(entry); lastAction = layers.length - 1;
    pop(entry.kind === "sauce" ? 700 : 500);
    render();
  }

  document.getElementById("trays").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    var key = b.getAttribute("data-add"), d = ING[key]; if (!d) return;
    addLayer({ kind: "ing", key: key, name: d.name, price: d.price });
  });
  document.getElementById("sauces").addEventListener("click", function (e) {
    var b = e.target.closest("[data-sauce]"); if (!b) return;
    var key = b.getAttribute("data-sauce");
    addLayer({ kind: "sauce", key: key, name: SAUCES[key].name + " drizzle", price: SAUCE_PRICE });
  });
  stackEl.addEventListener("click", function (e) {
    var el = e.target.closest("[data-idx]"); if (!el) return;
    layers.splice(parseInt(el.getAttribute("data-idx"), 10), 1);
    pop(300); render();
  });
  linesEl.addEventListener("click", function (e) {
    var x = e.target.closest("[data-side-off]"); if (!x) return;
    delete sidesOn[x.getAttribute("data-side-off")]; syncSideCards(); pop(300); render();
  });
  document.querySelectorAll(".side-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var k = card.getAttribute("data-side");
      if (sidesOn[k]) delete sidesOn[k]; else { sidesOn[k] = true; pop(620); }
      syncSideCards(); render();
    });
  });
  function syncSideCards() {
    document.querySelectorAll(".side-card").forEach(function (card) {
      var on = !!sidesOn[card.getAttribute("data-side")];
      card.classList.toggle("on", on);
      card.querySelector(".side-toggle").textContent = on ? "✓ ADDED" : "+ ADD";
    });
  }
  document.getElementById("undoBtn").addEventListener("click", function () {
    if (!layers.length) return; layers.pop(); pop(300); render();
  });
  document.getElementById("resetBtn").addEventListener("click", function () {
    layers = []; sidesOn = {}; syncSideCards(); pop(260); render();
  });

  /* ---------- checkout ---------- */
  var backdrop = document.getElementById("modalBackdrop");
  var bodyEl = document.getElementById("modalBody");
  var successEl = document.getElementById("modalSuccess");
  function openModal() {
    var counts = {}, order = [];
    layers.forEach(function (l) {
      if (!counts[l.name]) { counts[l.name] = 0; order.push(l.name); }
      counts[l.name]++;
    });
    var parts = order.map(function (n) { return n + (counts[n] > 1 ? " ×" + counts[n] : ""); });
    var sideNames = Object.keys(sidesOn).map(function (k) { return SIDES[k].name; });
    document.getElementById("modalSummary").innerHTML =
      "<strong>Your build:</strong> " + (parts.length ? parts.join(", ") : "just the bun base — a minimalist") +
      (sideNames.length ? "<br><strong>Sides:</strong> " + sideNames.join(", ") : "") +
      "<br><strong>Total: " + money(total()) + "</strong>";
    bodyEl.hidden = false; successEl.hidden = true;
    backdrop.hidden = false;
  }
  function closeModal() { backdrop.hidden = true; }
  document.getElementById("checkoutBtn").addEventListener("click", openModal);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("successClose").addEventListener("click", closeModal);
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !backdrop.hidden) closeModal(); });

  document.getElementById("checkoutForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("fieldName").value.trim();
    var addr = document.getElementById("fieldAddress").value.trim();
    var err = document.getElementById("formError");
    if (!name || !addr) { err.hidden = false; return; }
    err.hidden = true;
    var no = "DG-" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById("successText").textContent =
      "Thanks, " + name + " — order " + no + " confirmed: your " + layers.length + "-layer build (" + money(total()) +
      ") is on the grill and heading to " + addr + ".";
    bodyEl.hidden = true; successEl.hidden = false;
    pop(880);
  });

  render();
})();
