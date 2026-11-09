const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const onView = (el, fn, opts = { threshold: 0.25 }) => {
  const io = new IntersectionObserver((es) => { for (const e of es) fn(e.isIntersecting, e); }, opts);
  io.observe(el);
  return io;
};

// Animated assets loop while they are on screen and pause when they are not.
const frames = [...document.querySelectorAll("[data-illos]")];
for (const el of frames) {
  el.style.setProperty("--illos-play", "paused");
  if (!reduce) onView(el, (on) => el.style.setProperty("--illos-play", on ? "running" : "paused"), { threshold: 0.2 });
}

// Menus: Products, Solutions, Developers and the Try for free split. Click or keyboard; on a mouse, hover opens them too.
let open = null;
const setMenu = (btn, on) => {
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  if (on && open && open !== btn) setMenu(open, false);
  panel.hidden = !on;
  btn.setAttribute("aria-expanded", on);
  open = on ? btn : open === btn ? null : open;
};
for (const btn of document.querySelectorAll(".links__btn, .split__more")) {
  btn.addEventListener("click", () => setMenu(btn, btn.getAttribute("aria-expanded") !== "true"));
  if (fine && btn.classList.contains("links__btn")) {
    const wrap = btn.parentElement;
    let t;
    wrap.addEventListener("pointerenter", () => { clearTimeout(t); t = setTimeout(() => setMenu(btn, true), 80); });
    wrap.addEventListener("pointerleave", () => { clearTimeout(t); t = setTimeout(() => setMenu(btn, false), 160); });
  }
}
document.addEventListener("click", (e) => {
  if (!open) return;
  const panel = document.getElementById(open.getAttribute("aria-controls"));
  if (e.target.closest("a") && panel.contains(e.target)) return setMenu(open, false);
  if (!open.contains(e.target) && !panel.contains(e.target)) setMenu(open, false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && open) { const b = open; setMenu(b, false); b.focus(); }
});

// The small-screen sheet.
const burger = document.querySelector(".burger");
const sheet = document.getElementById("sheet");
const setSheet = (on) => { sheet.hidden = !on; burger.setAttribute("aria-expanded", on); burger.setAttribute("aria-label", on ? "Close menu" : "Open menu"); };
burger.addEventListener("click", () => setSheet(sheet.hidden));
sheet.addEventListener("click", (e) => { if (e.target.closest("a")) setSheet(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) { setSheet(false); burger.focus(); } });

// The hero's last word turns over while the hero is on screen; the underline draws under each new word.
const rot = document.querySelector(".rot");
if (rot && !reduce) {
  const WORDS = ["writes", "builds", "answers", "ships", "plans"];
  const word = rot.querySelector(".rot__word");
  const line = rot.querySelector(".rot__line");
  const probe = document.createElement("span");
  probe.className = "rot__word";
  probe.style.cssText = "position:absolute;visibility:hidden;left:0;top:0";
  rot.append(probe);
  const widthOf = (w) => { probe.textContent = w; return probe.getBoundingClientRect().width; };
  let i = 0, timer, visible = true;
  const fit = () => { rot.style.width = `${widthOf(word.textContent)}px`; };
  const turn = () => {
    i = (i + 1) % WORDS.length;
    const next = WORDS[i];
    const w = widthOf(next);
    // The box widens before a longer word arrives and narrows after a shorter one, so the full stop never sits on a letter.
    const grow = w > rot.getBoundingClientRect().width;
    if (grow) rot.style.width = `${w}px`;
    word.classList.remove("is-in");
    word.classList.add("is-out");
    setTimeout(() => {
      if (!grow) rot.style.width = `${w}px`;
      word.textContent = next;
      word.classList.remove("is-out");
      word.classList.add("is-in");
      line.classList.remove("is-grow"); void line.offsetWidth; line.classList.add("is-grow");
    }, 240);
  };
  const run = () => { clearInterval(timer); if (visible && !document.hidden) timer = setInterval(turn, 2800); };
  document.fonts.ready.then(() => { fit(); line.classList.add("is-grow"); run(); });
  onView(rot, (on) => { visible = on; run(); }, { threshold: 0 });
  document.addEventListener("visibilitychange", run);
  addEventListener("resize", fit);
}

// The Code card: an agent's log, written a line at a time while the card is on screen.
const log = document.querySelector(".term__log");
if (log) {
  const ctx = document.querySelector(".term__ctx");
  const L = [
    ["t-tool", "▸ read_file", "t-dim", "src/middleware/auth.ts  88 lines"],
    ["t-tool", "▸ grep", "", '"session" src/', "t-dim", "4 matches"],
    ["t-tool", "▸ read_file", "t-dim", "src/lib/jwt.ts  42 lines"],
    ["", "│ Audit auth middleware", "t-dim", "explore", "t-run", "[running]"],
    ["", "│ Design token rotation", "t-dim", "general", "t-run", "[running]"],
    ["", "│ Find session references", "t-dim", "explore", "t-done", "[done]"],
    ["t-mark", "◆ Thought for 4.1s"],
    ["t-mark", "◆ Edit", "t-tool", "src/middleware/auth.ts"],
    ["t-n", "42", "", "export async function handler(req) {"],
    ["t-n t-add", "43", "", "  const token = extractBearer(req);"],
    ["t-n t-add", "44", "", "  if (!token) return unauthorized();"],
    ["t-n t-del", "47", "", "  const session = await getSession(req);"],
    ["t-n t-add", "48", "", "  req.user = await verify(token);"],
    ["t-done", "✓ 31 tests passed"],
    ["t-ask", "› Add rate limiting to all API routes."],
  ];
  const render = (parts) => {
    const li = document.createElement("li");
    const isDiff = parts[0].includes("t-add") || parts[0].includes("t-del");
    if (isDiff) li.className = parts[0].includes("t-add") ? "t-add" : "t-del";
    for (let k = 0; k < parts.length; k += 2) {
      const s = document.createElement("span");
      s.className = parts[k].replace(/\bt-(add|del)\b/, "").trim();
      s.textContent = parts[k + 1];
      li.append(s);
    }
    return li;
  };
  if (reduce) { for (const p of L) log.append(render(p)); }
  else {
    let n = 0, timer;
    const step = () => {
      if (n === L.length) { n = 0; log.replaceChildren(); }
      log.append(render(L[n++]));
      while (log.children.length > 14) log.firstChild.remove();
      const v = 0.12 + (n / L.length) * 0.06;
      ctx.querySelector("b").style.setProperty("--v", v.toFixed(3));
      ctx.querySelector("em").textContent = `${(v * 100).toFixed(1)}%`;
    };
    for (let k = 0; k < 8; k++) step();
    onView(log.closest(".prod"), (on) => { clearInterval(timer); if (on) timer = setInterval(step, 900); }, { threshold: 0.2 });
  }
}

// Numbers count up once, when the band first shows.
const stats = document.querySelector(".stats");
if (stats && !reduce) {
  const nums = [...stats.querySelectorAll("[data-count]")];
  const io = onView(stats, (on) => {
    if (!on) return;
    io.disconnect();
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1200);
      const e = 1 - Math.pow(1 - p, 3);
      for (const b of nums) {
        const to = parseFloat(b.dataset.count);
        const dec = (b.dataset.count.split(".")[1] || "").length;
        b.textContent = (to * e).toFixed(dec) + b.dataset.suffix;
      }
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.5 });
}

// The business chat plays its answer once when it comes into view.
const chat = document.querySelector("[data-chat]");
if (chat) {
  const steps = [...chat.querySelectorAll(".chat__log > *")];
  if (!reduce) {
    for (const s of steps) s.dataset.step = "";
    const io = onView(chat, (on) => {
      if (!on) return;
      io.disconnect();
      steps.forEach((s, k) => setTimeout(() => s.classList.add("is-on"), 200 + k * (k < 2 ? 520 : 180) + (k >= 2 ? 500 : 0)));
    }, { threshold: 0.4 });
  }
}

// Code tabs and copy.
const tabs = [...document.querySelectorAll('.code [role="tab"]')];
const pick = (tab, focus) => {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  }
  document.querySelector(".code__file").textContent = tab.dataset.file;
  if (focus) tab.focus();
};
for (const t of tabs) {
  t.addEventListener("click", () => pick(t));
  t.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(t);
    if (e.key === "ArrowRight") { e.preventDefault(); pick(tabs[(i + 1) % tabs.length], true); }
    if (e.key === "ArrowLeft") { e.preventDefault(); pick(tabs[(i - 1 + tabs.length) % tabs.length], true); }
  });
}
const copyBtn = document.querySelector(".code__copy");
copyBtn?.addEventListener("click", async () => {
  const pre = document.querySelector('.code pre:not([hidden])');
  try { await navigator.clipboard.writeText(pre.innerText); } catch (e) {}
  const label = copyBtn.querySelector("span");
  copyBtn.classList.add("is-done");
  label.textContent = "Copied";
  setTimeout(() => { copyBtn.classList.remove("is-done"); label.textContent = "Copy"; }, 1500);
});

// Pricing: monthly or yearly.
for (const b of document.querySelectorAll("[data-period]")) {
  b.addEventListener("click", () => {
    for (const x of document.querySelectorAll("[data-period]")) x.setAttribute("aria-pressed", x === b);
    for (const p of document.querySelectorAll("[data-month]")) p.textContent = p.dataset[b.dataset.period];
  });
}

// The contact form checks itself late: on leaving a field, and on Send.
const form = document.querySelector(".form");
if (form) {
  const email = form.querySelector("#f-email");
  const err = form.querySelector("#f-email-err");
  const okEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  const show = () => { const bad = email.value && !okEmail(); email.setAttribute("aria-invalid", bad); email.setAttribute("aria-describedby", bad ? "f-email-err" : ""); err.hidden = !bad; };
  email.addEventListener("blur", show);
  email.addEventListener("input", () => { if (email.getAttribute("aria-invalid") === "true") show(); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let first = null;
    for (const f of form.querySelectorAll("[required]")) {
      const bad = !f.value.trim() || (f === email && !okEmail());
      f.setAttribute("aria-invalid", bad);
      if (bad && !first) first = f;
    }
    show();
    if (first) { first.focus(); return; }
    form.querySelector(".form__done").hidden = false;
    form.querySelector('button[type="submit"]').disabled = true;
  });
}

// The bar shows its line once the page scrolls under it.
const bar = document.querySelector(".nav");
const edge = () => bar.classList.toggle("is-scrolled", scrollY > 4);
addEventListener("scroll", edge, { passive: true });
edge();
