/* DOUBLE GOOD — v5. Layout & flow measured from the reel frames:
   hero (closed box) -> one counter scene -> receipt -> success card.
   Artwork lives in assets-data.js (window.DG_ASSETS). */
(function () {
  "use strict";
  var A = window.DG_ASSETS || {};
  var SAUCE_PRICE = 0.60, MAX_ITEMS = 14;

  var ING = {
    bun:     { name: "Brioche bun", price: 1.00, asset: "bunBottom" },
    bunTop:  { name: "Brioche bun", price: 1.00, asset: "topBun" },
    patty:   { name: "Smash patty", price: 3.50 },
    tomato:  { name: "Tomato",      price: 0.60 },
    cheese:  { name: "Cheddar",     price: 1.20 },
    lettuce: { name: "Lettuce",     price: 0.50 },
    pickles: { name: "Pickles",     price: 0.50 },
    onion:   { name: "Red onion",   price: 0.50, asset: "onionRings" },
    topBun:  { name: "Top bun",     price: 1.00 }
  };
  var SAUCES = {
    mustard: { name: "House sauce", color: "#FFB52E" },
    ketchup: { name: "Ketchup",     color: "#D92B1F" },
    mayo:    { name: "Garlic mayo", color: "#FDF3D8" }
  };
  var SIDES = {
    fries: { name: "Fries",       price: 2.90 },
    rings: { name: "Onion rings", price: 3.40 },
    curly: { name: "Curly fries", price: 3.20 }
  };

  /* wire every <img data-asset> to its generated artwork */
  document.querySelectorAll("img[data-asset]").forEach(function (img) {
    var src = A[img.getAttribute("data-asset")];
    if (src) img.src = src;
  });

  /* photographic steel on the hero + counter (the reel's counter is a real
     brushed-steel photo, not a flat gradient) */
  if (A.steelTex) {
    document.querySelectorAll(".hero, .scene").forEach(function (el) {
      el.style.backgroundImage = "linear-gradient(180deg, rgba(255,244,214,.16), rgba(59,36,8,.22)), url(" + A.steelTex + ")";
      el.style.backgroundSize = "cover, cover";
      el.style.backgroundPosition = "center, center";
    });
  }

  var stackEl = document.getElementById("stack");
  var hintEl = document.getElementById("stageHint");
  var compHintEl = document.getElementById("compHint");
  var receiptEl = document.getElementById("receipt");
  var receiptWaitEl = document.getElementById("receiptWait");
  var linesEl = document.getElementById("receiptLines");
  var totalEl = document.getElementById("receiptTotal");
  var topOffBtn = document.getElementById("topOffBtn");
  var sideDropsEl = document.getElementById("sideDrops");
  var boxEl = document.getElementById("stage");
  var sceneEl = document.getElementById("builder");

  var layers = [];      /* {kind:'ing'|'sauce', key, name, price} */
  var freshSauce = -1;  /* index of a just-added sauce, for the draw-in wipe */
  var sidesOn = {};     /* side key -> true */
  var lastAction = -1;
  var lastAddedName = "";

  function money(n) { return "$" + n.toFixed(2); }
  function total() {
    var t = 0;
    layers.forEach(function (l) { t += l.price; });
    Object.keys(sidesOn).forEach(function (k) { t += SIDES[k].price; });
    return t;
  }
  function sealed() { return layers.length > 0 && layers[layers.length - 1].key === "topBun"; }
  function hasItems() { return layers.length > 0 || Object.keys(sidesOn).length > 0; }

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
    land: function (key) {
      if (key === "patty") { tone(300, 120, 0.12, "sine", 0.5); noiseHit(0.08, 500, 200, 0.25); }
      else if (key === "topBun" || key === "bun") { tone(420, 160, 0.13, "sine", 0.4); tone(660, 660, 0.07, "triangle", 0.18, 0.05); }
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

  /* reel-style sauce: one continuous zigzag sweep across the TOP face of the
     layer below — long connected diagonal stripes, shadow pass + gloss pass */
  function drizzleURI(color) {
    /* parallel diagonal sweeps, long enough to be trimmed by the layer's outline */
    var bands = "";
    for (var i = 0; i < 5; i++) {
      var x = 2 + i * 38;
      bands += "M" + x + " 64 L" + (x + 52) + " -6 ";
    }
    function pass(dy, stroke, w) {
      return "<path d='" + bands + "' transform='translate(0," + dy + ")' fill='none' stroke='" + stroke + "' stroke-width='" + w + "' stroke-linecap='round'/>";
    }
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 58'>" +
      "<clipPath id='e'><ellipse cx='100' cy='29' rx='93' ry='27'/></clipPath>" +
      "<g clip-path='url(#e)'>" +
      pass(2.5, "rgba(60,30,0,.20)", 12) +
      pass(0, color, 10) +
      pass(-2.8, "rgba(255,255,255,.35)", 3.2) +
      "</g></svg>";
    return "url('data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, "%27") + "')";
  }

  /* ---------------- render ---------------- */
  function render() {
    var html = "";
    var ingPos = 0;
    layers.forEach(function (l, i) {
      var anim = i === lastAction ? " just-added" : "";
      if (l.kind === "sauce") {
        html += '<div class="sauce-strip' + anim + (i === freshSauce ? " drawing" : "") + '" data-idx="' + i + '" title="Tap to remove" style="--sauce:' + SAUCES[l.key].color + ';background-image:' + drizzleURI(SAUCES[l.key].color) + '"></div>';
      } else {
        var asset = (ING[l.key] && ING[l.key].asset) || l.key;
        var baseW = (l.key === "tomato" || l.key === "pickles") ? 218 : 214;
        var wdt = Math.max(182, baseW - ingPos * 4); ingPos++;
        html += '<button type="button" class="layer' + anim + '" data-idx="' + i + '" data-key="' + l.key + '" title="Tap to remove"><img style="width:' + wdt + 'px" src="' + (A[asset] || "") + '" alt="' + l.name + '"></button>';
      }
    });
    stackEl.innerHTML = html;
    stackEl.classList.remove("squash"); void stackEl.offsetWidth; stackEl.classList.add("squash");

    /* hints, concept-style */
    if (sealed()) hintEl.textContent = "One very good burger.";
    else if (layers.length === 0) hintEl.textContent = "Start with your bun, then click & drag.";
    else if (layers.length >= MAX_ITEMS) hintEl.textContent = "That box is FULL. Respect.";
    else hintEl.textContent = (lastAddedName ? lastAddedName + " added! " : "") + "Keep stacking, sauce it up, or top it off.";
    compHintEl.textContent = layers.length === 0 ? "Start with your bun, then click & drag." : (sealed() ? "" : layers.length + (layers.length === 1 ? " layer in…" : " layers in…"));
    compHintEl.style.display = sealed() ? "none" : "block";

    /* top-off pill */
    topOffBtn.disabled = layers.length === 0 || sealed();
    topOffBtn.textContent = sealed() ? "One very good burger ✓" : "Top it off ✓";
    topOffBtn.classList.toggle("done", sealed());

    /* receipt */
    var counts = {}, order = [];
    layers.forEach(function (l) {
      if (!counts[l.name]) { counts[l.name] = { n: 0, sum: 0 }; order.push(l.name); }
      counts[l.name].n++; counts[l.name].sum += l.price;
    });
    var li = "";
    order.forEach(function (name) {
      var c = counts[name];
      li += "<li><span>" + name + (c.n > 1 ? " ×" + c.n : "") + "</span><span>" + money(c.sum) + "</span></li>";
    });
    Object.keys(sidesOn).forEach(function (k) {
      li += '<li><span>' + SIDES[k].name + '</span><span>' + money(SIDES[k].price) +
            '</span><button type="button" class="li-x" data-side-off="' + k + '" aria-label="Remove ' + SIDES[k].name + '">✕</button></li>';
    });
    linesEl.innerHTML = li;
    totalEl.textContent = money(total());
    receiptEl.hidden = !hasItems();
    receiptWaitEl.style.display = "none"; /* the reel's counter stays bare until the receipt prints */

    /* tub badges: how many of each ingredient are already in */
    var byKey = {};
    layers.forEach(function (l) { if (l.kind === "ing") { var bk = l.key === "bunTop" ? "bun" : l.key; byKey[bk] = (byKey[bk] || 0) + 1; } });
    document.querySelectorAll("#trays .tub").forEach(function (tub) {
      var n = byKey[tub.getAttribute("data-add")] || 0;
      var badge = tub.querySelector(".tub-badge");
      if (badge) { badge.hidden = !n; badge.textContent = "×" + n; }
      tub.classList.toggle("used", n > 0);
    });
    document.querySelector(".comp-main").classList.toggle("is-empty", layers.length === 0);
    document.querySelector(".comp-main").classList.toggle("sealed", sealed());
    freshSauce = -1;

    /* sides resting in the box's side compartment */
    sideDropsEl.innerHTML = Object.keys(sidesOn).map(function (k) {
      return '<img src="' + (A[k] || "") + '" alt="' + SIDES[k].name + '">';
    }).join("");
    lastAction = -1;
  }

  function addLayer(entry) {
    if (layers.length >= MAX_ITEMS) { hintEl.textContent = "That box is FULL. Respect."; SFX.buzz(); return; }
    if (sealed()) { hintEl.textContent = "It's topped off! Undo the top bun to keep stacking."; SFX.buzz(); return; }
    if (entry.kind === "ing" && entry.key === "bun" &&
        layers.some(function (x) { return x.key === "bun" || x.key === "bunTop"; })) {
      entry = { kind: "ing", key: "bunTop", name: entry.name, price: entry.price };
    }
    layers.push(entry); lastAction = layers.length - 1; lastAddedName = entry.name;
    if (entry.kind === "sauce") freshSauce = layers.length - 1;
    if (entry.kind === "sauce") {
      SFX.squirt();
      document.querySelectorAll(".sauce-btn").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-sauce") === entry.key);
      });
    } else SFX.land(entry.key);
    render();
  }

  /* click-to-fly: the ingredient visibly flies from its tub/bottle into the box */
  var reduceMotionQ = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function requestAdd(entry, sourceBtn) {
    if (sealed() || layers.length >= MAX_ITEMS || reduceMotionQ || !sourceBtn) { addLayer(entry); return; }
    var img = sourceBtn.querySelector("img");
    if (!img || !img.getBoundingClientRect) { addLayer(entry); return; }
    var r = img.getBoundingClientRect();
    var target = document.querySelector(".comp-main").getBoundingClientRect();
    var effKey = entry.key;
    if (entry.kind === "ing" && effKey === "bun" &&
        layers.some(function (x) { return x.key === "bun" || x.key === "bunTop"; })) effKey = "bunTop";
    var asset = entry.kind === "sauce" ? entry.key : ((ING[effKey] && ING[effKey].asset) || effKey);
    var clone = document.createElement("img");
    clone.src = A[asset] || img.src;
    clone.style.cssText = "position:fixed;z-index:300;pointer-events:none;left:" + r.left + "px;top:" + r.top +
      "px;width:" + r.width + "px;height:" + r.height + "px;object-fit:contain;filter:drop-shadow(0 10px 10px rgba(29,26,20,.4))";
    document.body.appendChild(clone);
    var dx = target.left + target.width / 2 - (r.left + r.width / 2);
    var dy = target.top + target.height * 0.52 - (r.top + r.height / 2);
    if (entry.kind === "sauce") {
      /* the reel's move: the bottle itself flies into the box, flips nozzle-down
         over the burger and squeezes while the stripes draw themselves in */
      var sy = target.top + target.height * 0.30 - (r.top + r.height / 2);
      var sq = clone.animate([
        { transform: "translate(0,0) rotate(0deg) scale(1,1)", opacity: 1 },
        { transform: "translate(" + dx + "px," + sy + "px) rotate(0deg) scale(.94, .94)", opacity: 1, offset: 0.42 },
        { transform: "translate(" + dx + "px," + (sy + 18) + "px) rotate(132deg) scale(.94, .94)", opacity: 1, offset: 0.58 },
        { transform: "translate(" + dx + "px," + (sy + 26) + "px) rotate(132deg) scale(.94, .84)", opacity: 1, offset: 0.68 },
        { transform: "translate(" + dx + "px," + (sy + 18) + "px) rotate(132deg) scale(.94, .94)", opacity: 1, offset: 0.76 },
        { transform: "translate(" + dx + "px," + (sy + 26) + "px) rotate(132deg) scale(.94, .84)", opacity: 1, offset: 0.84 },
        { transform: "translate(" + dx + "px," + (sy + 8) + "px) rotate(110deg) scale(.9, .9)", opacity: 1, offset: 0.93 },
        { transform: "translate(" + dx + "px," + (sy - 8) + "px) rotate(60deg) scale(.86, .86)", opacity: 0, offset: 1 }
      ], { duration: 1020, easing: "cubic-bezier(.3,.7,.4,1)" });
      window.setTimeout(function () { addLayer(entry); }, 560);
      sq.onfinish = function () { clone.remove(); };
      return;
    }
    var anim = clone.animate([
      { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
      { transform: "translate(" + dx * 0.7 + "px," + (dy - 90) + "px) rotate(-7deg) scale(.92)", opacity: 1, offset: 0.65 },
      { transform: "translate(" + dx + "px," + dy + "px) rotate(2deg) scale(.8)", opacity: 0.95 }
    ], { duration: 430, easing: "cubic-bezier(.3,.7,.4,1)" });
    anim.onfinish = function () { clone.remove(); addLayer(entry); };
  }

  document.getElementById("trays").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    var key = b.getAttribute("data-add"), d = ING[key]; if (!d) return;
    requestAdd({ kind: "ing", key: key, name: d.name, price: d.price }, b);
  });
  document.getElementById("sauces").addEventListener("click", function (e) {
    var b = e.target.closest("[data-sauce]"); if (!b) return;
    var key = b.getAttribute("data-sauce");
    requestAdd({ kind: "sauce", key: key, name: SAUCES[key].name, price: SAUCE_PRICE }, b);
  });
  stackEl.addEventListener("click", function (e) {
    var el = e.target.closest("[data-idx]"); if (!el) return;
    layers.splice(parseInt(el.getAttribute("data-idx"), 10), 1);
    lastAddedName = ""; SFX.remove(); render();
  });
  linesEl.addEventListener("click", function (e) {
    var x = e.target.closest("[data-side-off]"); if (!x) return;
    delete sidesOn[x.getAttribute("data-side-off")]; syncSideCards(); SFX.remove(); render();
  });
  document.querySelectorAll(".side-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var k = card.getAttribute("data-side");
      if (sidesOn[k]) { delete sidesOn[k]; SFX.remove(); } else { sidesOn[k] = true; lastAddedName = SIDES[k].name; SFX.side(); }
      syncSideCards(); render();
    });
  });
  function syncSideCards() {
    document.querySelectorAll(".side-card").forEach(function (card) {
      card.classList.toggle("on", !!sidesOn[card.getAttribute("data-side")]);
    });
  }
  topOffBtn.addEventListener("click", function () {
    addLayer({ kind: "ing", key: "topBun", name: ING.topBun.name, price: ING.topBun.price });
  });
  document.getElementById("undoBtn").addEventListener("click", function () {
    if (!layers.length) return; layers.pop(); lastAddedName = ""; SFX.remove(); render();
  });
  document.getElementById("resetBtn").addEventListener("click", function () {
    layers = []; sidesOn = {}; lastAddedName = ""; syncSideCards(); SFX.remove(); render();
  });

  /* --- drag & drop: drag a tub or bottle onto the open box --- */
  function armDrag(el, payload) {
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", payload);
      e.dataTransfer.effectAllowed = "copy";
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", function () { el.classList.remove("dragging"); boxEl.classList.remove("drop-hot"); });
  }
  document.querySelectorAll("#trays .tub").forEach(function (t) { armDrag(t, "ing:" + t.getAttribute("data-add")); });
  document.querySelectorAll("#sauces .sauce-btn").forEach(function (b) { armDrag(b, "sauce:" + b.getAttribute("data-sauce")); });
  boxEl.addEventListener("dragover", function (e) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; boxEl.classList.add("drop-hot"); });
  boxEl.addEventListener("dragleave", function (e) { if (!boxEl.contains(e.relatedTarget)) boxEl.classList.remove("drop-hot"); });
  boxEl.addEventListener("drop", function (e) {
    e.preventDefault(); boxEl.classList.remove("drop-hot");
    var parts = (e.dataTransfer.getData("text/plain") || "").split(":");
    if (parts.length !== 2) return;
    if (parts[0] === "ing" && ING[parts[1]]) addLayer({ kind: "ing", key: parts[1], name: ING[parts[1]].name, price: ING[parts[1]].price });
    if (parts[0] === "sauce" && SAUCES[parts[1]]) addLayer({ kind: "sauce", key: parts[1], name: SAUCES[parts[1]].name, price: SAUCE_PRICE });
  });

  /* ---------- checkout: success card ---------- */
  var backdrop = document.getElementById("modalBackdrop");
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    if (!hasItems()) { SFX.buzz(); return; }
    var lines = layers.map(function (l) { return { n: l.name, p: l.price }; });
    Object.keys(sidesOn).forEach(function (k) { lines.push({ n: SIDES[k].name, p: SIDES[k].price }); });
    var shown = lines.slice(0, 6);
    var html = shown.map(function (l) {
      return '<div class="card-line"><span>' + l.n + '</span><span>' + money(l.p) + "</span></div>";
    }).join("");
    if (lines.length > shown.length) html += '<div class="card-line dim"><span>+ ' + (lines.length - shown.length) + " more</span><span></span></div>";
    document.getElementById("successLines").innerHTML = html;
    document.getElementById("successTotal").textContent = money(total());
    backdrop.hidden = false; SFX.jingle();
  });
  document.getElementById("successClose").addEventListener("click", function () {
    backdrop.hidden = true;
    layers = []; sidesOn = {}; lastAddedName = ""; syncSideCards(); render();
  });
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) backdrop.hidden = true; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") backdrop.hidden = true; });

  /* ---------- motion: GSAP entrance + scroll reveals (progressive enhancement) ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.gsap && !reduceMotion) {
    gsap.from(".hero-copy > *", { y: 34, opacity: 0, stagger: 0.09, duration: 0.7, ease: "power3.out" });
    gsap.from(".closed-box", { scale: 0.93, rotate: 1.5, opacity: 0, duration: 0.85, ease: "back.out(1.4)", delay: 0.15 });
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray(".tub, .open-box, .side-card, .how-step").forEach(function (el) {
        gsap.from(el, { y: 30, opacity: 0, duration: 0.55, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%" } });
      });
    }
  }

  /* ---------- red hand cursor that follows you around the counter ---------- */
  if (window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches && !reduceMotion) {
    document.body.classList.add("hand-on");
    var hand = document.getElementById("handCursor");
    var hx = -100, hy = -100, tx = -100, ty = -100, handLive = false;
    sceneEl.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      hand.style.opacity = "1";
      hand.classList.toggle("big", !!e.target.closest(".layer, .sauce-strip, .tub, .sauce-btn, .side-card"));
      if (!handLive) { handLive = true; requestAnimationFrame(handTick); }
    });
    sceneEl.addEventListener("mouseleave", function () { hand.style.opacity = "0"; handLive = false; });
    function handTick() {
      hx += (tx - hx) * 0.35; hy += (ty - hy) * 0.35;
      hand.style.transform = "translate(" + (hx - 8) + "px," + (hy - 4) + "px) rotate(-8deg)";
      if (handLive) requestAnimationFrame(handTick);
    }
  }

  render();
})();
