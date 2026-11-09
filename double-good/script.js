/* DOUBLE GOOD — burger builder logic (no dependencies). */
(function () {
  "use strict";
  var BASE_PRICE = 4.00;         /* bun bottom + box */
  var SAUCE_PRICE = 0.30;
  var MAX_ITEMS = 14;

  var INGREDIENTS = [
    { key: "patty",   name: "Beef Patty", price: 3.50, icon: "🥩", cls: "l-patty" },
    { key: "cheese",  name: "Cheese",     price: 1.20, icon: "🧀", cls: "l-cheese" },
    { key: "tomato",  name: "Tomato",     price: 0.60, icon: "🍅", cls: "l-tomato" },
    { key: "lettuce", name: "Lettuce",    price: 0.50, icon: "🥬", cls: "l-lettuce" },
    { key: "pickles", name: "Pickles",    price: 0.40, icon: "🥒", cls: "l-pickles" },
    { key: "onion",   name: "Onions",     price: 0.40, icon: "🧅", cls: "l-onion" },
    { key: "egg",     name: "Fried Egg",  price: 1.50, icon: "🍳", cls: "l-egg" },
    { key: "topbun",  name: "Top Bun",    price: 1.00, icon: "🍔", cls: "l-bun-top", single: true }
  ];

  var items = [];        /* stack above the base: {kind:'layer'|'sauce', name, price, cls, color} */
  var sides = {};        /* name -> price */
  var sealed = false;

  var stackEl = document.getElementById("stack");
  var orderList = document.getElementById("orderList");
  var totalEl = document.getElementById("totalPrice");
  var layerCountEl = document.getElementById("layerCount");
  var stackStateEl = document.getElementById("stackState");
  var hint = document.getElementById("handHint");

  function money(n) { return "$" + n.toFixed(2); }

  /* tiny pop sound, only after a user gesture (these are all clicks) */
  var actx = null;
  function pop(freq) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = "sine"; o.frequency.value = freq || 520;
      g.gain.setValueAtTime(0.12, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.12);
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + 0.13);
    } catch (e) { /* silent is fine */ }
  }

  function total() {
    var t = BASE_PRICE;
    items.forEach(function (i) { t += i.price; });
    Object.keys(sides).forEach(function (k) { t += sides[k]; });
    return t;
  }

  function render(animate) {
    if (!animate) stackEl.classList.add("no-anim");
    stackEl.innerHTML = "";
    var base = document.createElement("div");
    base.className = "layer l-bun-bottom";
    stackEl.appendChild(base);
    items.forEach(function (i) {
      var d = document.createElement("div");
      d.className = "layer " + i.cls;
      if (i.kind === "sauce") d.style.backgroundColor = i.color;
      stackEl.appendChild(d);
    });
    if (!animate) requestAnimationFrame(function () { stackEl.classList.remove("no-anim"); });

    layerCountEl.textContent = String(items.length + 1);
    stackStateEl.textContent = sealed ? "sealed with a top bun" :
      items.length === 0 ? "bun base ready" : "building… looking good";

    orderList.innerHTML = "";
    function row(label, price, onRemove) {
      var li = document.createElement("li");
      var s = document.createElement("span"); s.textContent = label;
      var right = document.createElement("span");
      right.textContent = money(price) + " ";
      if (onRemove) {
        var b = document.createElement("button");
        b.className = "rm"; b.type = "button"; b.textContent = "×";
        b.setAttribute("aria-label", "Remove " + label);
        b.addEventListener("click", onRemove);
        right.appendChild(b);
      }
      li.appendChild(s); li.appendChild(right);
      orderList.appendChild(li);
    }
    row("Bun base + box", BASE_PRICE, null);
    items.forEach(function (i, idx) {
      row(i.name, i.price, function () { removeItem(idx); });
    });
    Object.keys(sides).forEach(function (k) {
      row(k + " (side)", sides[k], function () { delete sides[k]; syncSideCards(); render(false); });
    });
    totalEl.textContent = money(total());
    document.querySelectorAll(".tray").forEach(function (t) {
      var ing = INGREDIENTS[+t.getAttribute("data-idx")];
      var used = items.some(function (i) { return i.key === ing.key; });
      t.classList.toggle("used", used);
      t.disabled = sealed || (ing.single && used) || items.length >= MAX_ITEMS;
    });
  }

  function addItem(i) {
    if (sealed || items.length >= MAX_ITEMS) return;
    items.push(i);
    if (i.key === "topbun") sealed = true;
    if (hint) hint.classList.add("off");
    pop(i.kind === "sauce" ? 700 : 480 + items.length * 24);
    render(true);
  }
  function removeItem(idx) {
    var gone = items.splice(idx, 1)[0];
    if (gone && gone.key === "topbun") sealed = false;
    render(false);
  }

  /* trays */
  var traysEl = document.getElementById("trays");
  INGREDIENTS.forEach(function (ing, idx) {
    var b = document.createElement("button");
    b.className = "tray"; b.type = "button";
    b.setAttribute("data-idx", String(idx));
    b.setAttribute("aria-label", "Add " + ing.name + ", " + money(ing.price));
    b.innerHTML = '<span class="t-icon">' + ing.icon + '</span>' +
      '<span class="t-name">' + ing.name + '</span>' +
      '<span class="t-price">' + money(ing.price) + "</span>";
    b.addEventListener("click", function () {
      addItem({ kind: "layer", key: ing.key, name: ing.name, price: ing.price, cls: ing.cls });
    });
    traysEl.appendChild(b);
  });

  /* sauces */
  document.querySelectorAll(".bottle").forEach(function (b) {
    b.addEventListener("click", function () {
      addItem({ kind: "sauce", key: "sauce-" + b.getAttribute("data-sauce"),
        name: b.getAttribute("data-sauce") + " sauce", price: SAUCE_PRICE,
        cls: "l-sauce", color: b.getAttribute("data-color") });
    });
  });

  /* sides */
  function syncSideCards() {
    document.querySelectorAll(".side-card").forEach(function (c) {
      var on = !!sides[c.getAttribute("data-side")];
      c.classList.toggle("added", on);
      c.querySelector(".add-btn").textContent = on ? "✓ ADDED" : "+ ADD";
    });
  }
  document.querySelectorAll(".side-card").forEach(function (card) {
    var name = card.getAttribute("data-side");
    var price = parseFloat(card.getAttribute("data-price"));
    card.querySelector(".add-btn").addEventListener("click", function () {
      if (sides[name]) { delete sides[name]; }
      else { sides[name] = price; pop(640); }
      syncSideCards();
      render(false);
    });
  });

  /* undo / clear */
  document.getElementById("undoBtn").addEventListener("click", function () {
    if (!items.length) return;
    var gone = items.pop();
    if (gone.key === "topbun") sealed = false;
    render(false);
  });
  document.getElementById("clearBtn").addEventListener("click", function () {
    items = []; sealed = false; sides = {};
    syncSideCards();
    render(false);
  });

  /* red hand cursor inside the builder (fine pointers only) */
  var builder = document.getElementById("builder");
  var hand = document.getElementById("handCursor");
  if (window.matchMedia && matchMedia("(pointer:fine)").matches) {
    builder.addEventListener("mousemove", function (e) {
      document.body.classList.add("has-hand");
      hand.style.left = e.clientX + "px";
      hand.style.top = e.clientY + "px";
      hand.textContent = "👆";
    });
    builder.addEventListener("mouseleave", function () { document.body.classList.remove("has-hand"); });
  }

  /* checkout modal */
  var back = document.getElementById("modalBack");
  var form = document.getElementById("checkoutForm");
  var done = document.getElementById("checkoutDone");
  function openModal() {
    var parts = ["Bun base"];
    items.forEach(function (i) { parts.push(i.name); });
    Object.keys(sides).forEach(function (k) { parts.push(k); });
    document.getElementById("modalSummary").textContent =
      parts.join(" · ") + " — Total " + money(total());
    form.hidden = false; done.hidden = true;
    back.hidden = false;
  }
  function closeModal() { back.hidden = true; }
  document.getElementById("orderBtn").addEventListener("click", openModal);
  document.getElementById("navOrderBtn").addEventListener("click", openModal);
  document.getElementById("modalX").addEventListener("click", closeModal);
  back.addEventListener("click", function (e) { if (e.target === back) closeModal(); });
  document.getElementById("placeBtn").addEventListener("click", function () {
    var name = document.getElementById("fName");
    var addr = document.getElementById("fAddr");
    var bad = false;
    [name, addr].forEach(function (f) {
      var empty = !f.value.trim();
      f.style.borderColor = empty ? "#E63329" : "";
      if (empty) bad = true;
    });
    if (bad) return;
    var no = "DG-" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById("doneText").textContent =
      "Thanks, " + name.value.trim() + " — order " + no + " is on the grill. " +
      "Your " + (items.length + 1) + "-layer build (" + money(total()) + ") is coming your way.";
    form.hidden = true; done.hidden = false;
    pop(880);
  });
  document.getElementById("doneBtn").addEventListener("click", function () {
    closeModal();
    document.getElementById("clearBtn").click();
    document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
  });

  render(false);
})();
