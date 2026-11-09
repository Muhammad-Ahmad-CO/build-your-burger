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

  /* ---- synthesized sound design (Web Audio, no files). Default OFF. ---- */
  var soundOn = false, actx = null, master = null;
  function ac() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.gain.value = 0.5; master.connect(actx.destination);
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freqA, freqB, dur, type, vol, delay) {
    if (!soundOn) return;
    try {
      var c = ac(), t = c.currentTime + (delay || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freqA, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(freqB, 1), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* sound is a bonus, never a blocker */ }
  }
  function noiseHit(dur, freqA, freqB, vol, delay) {
    if (!soundOn) return;
    try {
      var c = ac(), t = c.currentTime + (delay || 0);
      var len = Math.max(1, (dur * c.sampleRate) | 0), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = c.createBufferSource(); src.buffer = buf;
      var f = c.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.1;
      f.frequency.setValueAtTime(freqA, t); f.frequency.exponentialRampToValueAtTime(freqB, t + dur);
      var g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(f); f.connect(g); g.connect(master); src.start(t);
    } catch (e) { /* ignore */ }
  }
  var SFX = {
    land: function (key) {           /* a layer lands in the box */
      if (key === "patty") { tone(300, 120, 0.12, "sine", 0.5); noiseHit(0.08, 500, 200, 0.25); }
      else if (key === "topBun") { tone(420, 160, 0.13, "sine", 0.4); tone(660, 660, 0.07, "triangle", 0.18, 0.05); }
      else { tone(540, 200, 0.09, "sine", 0.32); noiseHit(0.05, 1200, 600, 0.10); }
    },
    squirt: function () { noiseHit(0.22, 2200, 500, 0.30); tone(300, 140, 0.16, "sine", 0.10); },
    remove: function () { tone(300, 520, 0.08, "sine", 0.22); },
    side: function () { tone(620, 620, 0.06, "triangle", 0.25); tone(790, 790, 0.07, "triangle", 0.25, 0.07); noiseHit(0.06, 2600, 1800, 0.12); },
    buzz: function () { tone(130, 110, 0.14, "square", 0.12); },
    jingle: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, f, 0.16, "triangle", 0.28, i * 0.09); }); noiseHit(0.2, 3200, 2400, 0.08, 0.36); }
  };
  var soundBtn = document.getElementById("soundBtn");
  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "🔊 SOUND ON" : "🔇 SOUND OFF";
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
    if (soundOn) { ac(); SFX.side(); }
  });
  function pop() { /* legacy no-op: all sounds route through SFX now */ }

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
    else if (layers.length === 0) hintEl.textContent = "Your box is empty — tap or drag something tasty into it.";
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
    if (layers.length >= MAX_ITEMS) { hintEl.textContent = "That box is FULL. Respect. Time to check out."; SFX.buzz(); return; }
    if (sealed()) { hintEl.textContent = "Top bun is on! Tap the top bun in the box to take it off first."; stackEl.classList.remove("squash"); void stackEl.offsetWidth; stackEl.classList.add("squash"); SFX.buzz(); return; }
    if (entry.key === "topBun" && layers.some(function (l) { return l.key === "topBun"; })) return;
    layers.push(entry); lastAction = layers.length - 1;
    if (entry.kind === "sauce") SFX.squirt(); else SFX.land(entry.key);
    render();
  }

  document.getElementById("trays").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    var key = b.getAttribute("data-add"), d = ING[key]; if (!d) return;
    addLayer({ kind: "ing", key: key, name: d.name, price: d.price });
  });
  /* --- drag & drop: drag a tray or bottle onto the stage --- */
  var stageEl = document.getElementById("stage");
  function armDrag(el, payload) {
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", payload);
      e.dataTransfer.effectAllowed = "copy";
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", function () { el.classList.remove("dragging"); stageEl.classList.remove("drop-hot"); });
  }
  document.querySelectorAll("#trays .tray").forEach(function (t) { armDrag(t, "ing:" + t.getAttribute("data-add")); });
  document.querySelectorAll("#sauces .sauce-btn").forEach(function (b) { armDrag(b, "sauce:" + b.getAttribute("data-sauce")); });
  stageEl.addEventListener("dragover", function (e) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; stageEl.classList.add("drop-hot"); });
  stageEl.addEventListener("dragleave", function (e) { if (!stageEl.contains(e.relatedTarget)) stageEl.classList.remove("drop-hot"); });
  stageEl.addEventListener("drop", function (e) {
    e.preventDefault(); stageEl.classList.remove("drop-hot");
    var parts = (e.dataTransfer.getData("text/plain") || "").split(":");
    if (parts.length !== 2) return;
    if (parts[0] === "ing" && ING[parts[1]]) addLayer({ kind: "ing", key: parts[1], name: ING[parts[1]].name, price: ING[parts[1]].price });
    if (parts[0] === "sauce" && SAUCES[parts[1]]) addLayer({ kind: "sauce", key: parts[1], name: SAUCES[parts[1]].name + " drizzle", price: SAUCE_PRICE });
  });

  document.getElementById("sauces").addEventListener("click", function (e) {
    var b = e.target.closest("[data-sauce]"); if (!b) return;
    var key = b.getAttribute("data-sauce");
    addLayer({ kind: "sauce", key: key, name: SAUCES[key].name + " drizzle", price: SAUCE_PRICE });
  });
  stackEl.addEventListener("click", function (e) {
    var el = e.target.closest("[data-idx]"); if (!el) return;
    layers.splice(parseInt(el.getAttribute("data-idx"), 10), 1);
    SFX.remove(); render();
  });
  linesEl.addEventListener("click", function (e) {
    var x = e.target.closest("[data-side-off]"); if (!x) return;
    delete sidesOn[x.getAttribute("data-side-off")]; syncSideCards(); SFX.remove(); render();
  });
  document.querySelectorAll(".side-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var k = card.getAttribute("data-side");
      if (sidesOn[k]) { delete sidesOn[k]; SFX.remove(); } else { sidesOn[k] = true; SFX.side(); }
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
    if (!layers.length) return; layers.pop(); SFX.remove(); render();
  });
  document.getElementById("resetBtn").addEventListener("click", function () {
    layers = []; sidesOn = {}; syncSideCards(); SFX.remove(); render();
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
    SFX.jingle();
  });

  /* ---------- motion: GSAP entrance + scroll reveals (progressive enhancement) ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.gsap && !reduceMotion) {
    gsap.from(".hero-copy > *", { y: 34, opacity: 0, stagger: 0.09, duration: 0.7, ease: "power3.out" });
    gsap.from(".hero-visual", { scale: 0.92, rotate: 2.5, opacity: 0, duration: 0.85, ease: "back.out(1.4)", delay: 0.15 });
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray(".tray-panel, .stage-wrap, .order-panel, .side-card, .how-step").forEach(function (el) {
        gsap.from(el, { y: 36, opacity: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    }
  }

  /* ---------- red hand cursor that follows you inside the stage ---------- */
  if (window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches && !reduceMotion) {
    document.body.classList.add("hand-on");
    var hand = document.getElementById("handCursor");
    var hx = -100, hy = -100, tx = -100, ty = -100, handLive = false;
    stageEl.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      hand.style.opacity = "1";
      hand.classList.toggle("big", !!e.target.closest(".layer, .sauce-strip"));
      if (!handLive) { handLive = true; requestAnimationFrame(handTick); }
    });
    stageEl.addEventListener("mouseleave", function () { hand.style.opacity = "0"; handLive = false; });
    function handTick() {
      hx += (tx - hx) * 0.35; hy += (ty - hy) * 0.35;
      hand.style.transform = "translate(" + (hx - 8) + "px," + (hy - 4) + "px) rotate(-8deg)";
      if (handLive) requestAnimationFrame(handTick);
    }
  }

  render();
})();
