import { inject, track } from "@vercel/analytics";
import { analyticsPageUrl } from "../lib/analytics.js";
import { chartMarkup } from "../lib/chart.js";
import {
  FREQUENCIES,
  LIMITS,
  answerSentence,
  formatFull,
  formatInput,
  formatMoney,
  formatRate,
  googleCalendarUrl,
  nextMonthStart,
  parsePlan,
  planKey,
  planSearchParams,
  previewModel,
  project,
  readSrc,
  sliderPos,
  sliderValue,
  totalFontSize,
  yearRows,
  yearWord,
} from "../lib/plan.js";

const $ = (id) => document.getElementById(id);
const KEYS = ["p", "m", "r", "y"];
const UTM = ["utm_source", "utm_medium", "utm_campaign"];

function trackEvent(name, data) {
  if (typeof window.va !== "function") {
    window.va = (...params) => {
      (window.vaq = window.vaq || []).push(params);
    };
  }
  const payload = { ...(data || {}) };
  try {
    const src = readSrc(new URLSearchParams(location.search));
    if (src) payload.src = src;
  } catch {
    /* location can be missing in odd embeds */
  }
  try {
    if (Object.keys(payload).length) track(name, payload);
    else track(name);
  } catch {
    /* analytics is optional */
  }
}

function startAnalytics() {
  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return;
  let conf;
  try {
    const raw = JSON.parse($("cj-analytics")?.textContent || '""');
    if (typeof raw === "string" && raw) conf = raw;
  } catch {
    conf = undefined;
  }
  inject(
    {
      beforeSend(event) {
        try {
          return { ...event, url: analyticsPageUrl(location.href, document.referrer) };
        } catch {
          return event;
        }
      },
    },
    conf,
  );
}

function mount() {
  const arrival = new URLSearchParams(location.search);
  const src = readSrc(arrival);
  const scenarioSlug = $("calculator")?.dataset.scenario || "";
  const scenarioKey = $("calculator")?.dataset.plan || "";
  const extra = new URLSearchParams();
  for (const key of UTM) {
    const value = arrival.get(key);
    if (value) extra.set(key, value);
  }
  const S = scenarioKey ? JSON.parse(scenarioKey) : parsePlan(arrival);
  let reminder = "ics";
  let lastStr = $("big")?.dataset.value || "";
  let raf = 0;
  let copyTimer = 0;
  let toastTimer = 0;

  function setPct(input) {
    const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty("--p", `${Math.min(100, Math.max(0, pct))}%`);
  }

  function paintSeg() {
    $("seg").querySelectorAll("button").forEach((button) => {
      button.classList.toggle("on", Number(button.dataset.f) === S.f);
    });
  }

  function canonical() {
    return {
      p: Math.round(S.p),
      m: Math.round(S.m),
      r: Math.round(S.r * 100) / 100,
      y: Math.round(S.y),
      f: S.f,
    };
  }

  function planQuery() {
    const params = planSearchParams(canonical(), { src });
    for (const [key, value] of extra) params.set(key, value);
    return params;
  }

  function absoluteShareUrl() {
    return `${location.origin}/?${planSearchParams(canonical(), { src: "share" }).toString()}`;
  }

  function odometer(str) {
    const big = $("big");
    big.style.fontSize = `${totalFontSize(str)}px`;
    if (str === lastStr && big.querySelector(".col")) {
      big.setAttribute("aria-label", str);
      return;
    }
    const rebuild = str.length !== lastStr.length || !big.querySelector(".col");
    if (rebuild) {
      big.textContent = "";
      for (const ch of str) {
        if (/\d/.test(ch)) {
          const wrap = document.createElement("span");
          wrap.className = "dg";
          const col = document.createElement("span");
          col.className = "col";
          for (let i = 0; i < 10; i++) {
            const digit = document.createElement("span");
            digit.textContent = String(i);
            col.appendChild(digit);
          }
          wrap.appendChild(col);
          big.appendChild(wrap);
        } else {
          const span = document.createElement("span");
          span.className = "ch";
          span.textContent = ch;
          big.appendChild(span);
        }
      }
    }
    let index = 0;
    for (const ch of str) {
      const node = big.children[index++];
      if (node?.classList.contains("dg")) {
        node.firstChild.style.transform = `translateY(${-Number.parseInt(ch, 10)}em)`;
      }
    }
    big.setAttribute("aria-label", str);
    big.dataset.value = str;
    lastStr = str;
  }

  function renderTable(result) {
    const body = $("year-body");
    body.replaceChildren();
    for (const row of yearRows(result)) {
      const tr = document.createElement("tr");
      const head = document.createElement("th");
      head.scope = "row";
      head.textContent = row.label;
      tr.append(head);
      for (const value of [row.balance, row.contributed, row.interest]) {
        const cell = document.createElement("td");
        cell.textContent = value;
        tr.append(cell);
      }
      body.append(tr);
    }
  }

  function syncConfirm() {
    const confirm = $("confirm");
    const plan = canonical();
    const start = nextMonthStart();
    if (reminder === "google") {
      confirm.href = googleCalendarUrl({ plan, origin: location.origin, startDate: start });
      confirm.target = "_blank";
      confirm.rel = "noopener noreferrer";
      confirm.dataset.kind = "google";
      confirm.textContent = "Open Google Calendar";
    } else {
      const params = planSearchParams(plan);
      params.set("d", start);
      confirm.href = `/reminder.ics?${params.toString()}`;
      confirm.target = "_self";
      confirm.removeAttribute("rel");
      confirm.dataset.kind = "ics";
      confirm.textContent = "Add monthly reminder";
    }
  }

  function render() {
    const plan = { ...S };
    const result = project(plan);
    const model = previewModel(canonical());
    const years = Math.round(S.y);
    const shown = formatMoney(result.bal);
    odometer(shown);
    $("contrib").textContent = formatMoney(result.con);
    $("interest").textContent = formatMoney(result.int);
    $("yrsLbl").textContent = `${years} ${yearWord(years)}`;
    $("rateLbl").textContent = `${formatRate(S.r)}%`;
    $("answer").textContent = answerSentence(plan, result);
    $("chart").innerHTML = chartMarkup(result);
    renderTable(result);
    const hash = location.hash === "#sheet" || location.hash === "#lock" ? location.hash : "";
    const onScenario = scenarioSlug && planKey(canonical()) === scenarioKey;
    let next;
    if (onScenario) {
      const params = new URLSearchParams();
      if (src) params.set("src", src);
      for (const [key, value] of extra) params.set(key, value);
      const query = params.toString();
      next = `${location.pathname}${query ? `?${query}` : ""}${hash}`;
    } else {
      next = `/?${planQuery().toString()}${hash}`;
    }
    if (`${location.pathname}${location.search}${location.hash}` !== next) {
      history.replaceState(null, "", next);
    }
    $("sh-total").textContent = shown;
    $("sh-yrs").textContent = `in ${years} ${yearWord(years)}`;
    $("sh-plan").innerHTML = `${formatMoney(S.p)} to start<br>${formatFull(S.m)} / month<br>${formatRate(S.r)}% a year`;
    $("sh-link").textContent = `${location.host}/?${planSearchParams(canonical(), { src: "share" }).toString()}`;
    $("sheet").dataset.shareText = model.shareText;
    $("sheet").dataset.shareUrl = absoluteShareUrl();
    syncConfirm();
  }

  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(render);
  }

  KEYS.forEach((key) => {
    const range = $(`${key}-r`);
    const field = $(`${key}-n`);
    range.value = sliderPos(key, S[key]);
    field.value = formatInput(key, S[key]);
    setPct(range);
    range.addEventListener("input", () => {
      S[key] = sliderValue(key, range.value);
      field.value = formatInput(key, S[key]);
      setPct(range);
      if (navigator.vibrate) {
        try { navigator.vibrate(4); } catch { /* ignore */ }
      }
      schedule();
    });
    field.addEventListener("input", () => {
      const value = Number.parseFloat(field.value.replace(/[^\d.]/g, ""));
      if (!Number.isFinite(value)) return;
      const [min, max] = LIMITS[key];
      S[key] = Math.min(max, Math.max(min, value));
      range.value = sliderPos(key, S[key]);
      setPct(range);
      schedule();
    });
    field.addEventListener("blur", () => {
      if (key === "r") S[key] = Math.round(S[key] * 100) / 100;
      else S[key] = Math.round(S[key]);
      field.value = formatInput(key, S[key]);
      schedule();
    });
    field.addEventListener("focus", () => field.select());
  });

  $("seg").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !FREQUENCIES.includes(Number(button.dataset.f))) return;
    S.f = Number(button.dataset.f);
    paintSeg();
    schedule();
  });
  paintSeg();
  if (S.f !== 12) $("adv").open = true;

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  async function copyLink() {
    const url = absoluteShareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const area = document.createElement("textarea");
      area.value = url;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    $("copy").textContent = "Copied";
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { $("copy").textContent = "Copy"; }, 1500);
    trackEvent("share_copy", { method: "copy" });
  }

  if (navigator.share) $("share").hidden = false;
  $("share").addEventListener("click", async () => {
    const url = absoluteShareUrl();
    const text = previewModel(canonical()).shareText;
    try {
      await navigator.share({ title: "Compound Jar", text, url });
      trackEvent("share_copy", { method: "share" });
    } catch (error) {
      if (error && error.name === "AbortError") return;
      await copyLink();
    }
  });
  $("copy").addEventListener("click", () => { copyLink(); });

  function setSheetOpen(open) {
    document.body.classList.toggle("open", open);
    const sheet = $("sheet");
    if (open) {
      sheet.removeAttribute("aria-hidden");
      sheet.removeAttribute("inert");
    } else {
      sheet.setAttribute("aria-hidden", "true");
      sheet.setAttribute("inert", "");
    }
  }

  function openSheet() {
    for (const key of ["p", "m", "y"]) S[key] = Math.round(S[key]);
    S.r = Math.round(S.r * 100) / 100;
    KEYS.forEach((key) => { $(`${key}-n`).value = formatInput(key, S[key]); });
    render();
    setSheetOpen(true);
  }

  $("lock").addEventListener("click", (event) => {
    event.preventDefault();
    trackEvent("lock_plan_tap");
    openSheet();
  });
  $("scrim").addEventListener("click", (event) => {
    event.preventDefault();
    setSheetOpen(false);
    if (location.hash === "#sheet" || location.hash === "#lock") {
      history.replaceState(null, "", `${location.pathname}${location.search}`);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setSheetOpen(false);
  });

  document.querySelectorAll(".opt").forEach((option) => {
    option.addEventListener("click", () => {
      reminder = option.dataset.o === "google" ? "google" : "ics";
      document.querySelectorAll(".opt").forEach((item) => {
        const selected = item === option;
        item.classList.toggle("sel", selected);
        item.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      syncConfirm();
    });
  });

  $("confirm").addEventListener("click", () => {
    trackEvent("calendar_add", { kind: $("confirm").dataset.kind || "ics" });
    toast($("confirm").dataset.kind === "google" ? "Opening Google Calendar" : "Calendar reminder downloaded");
  });

  render();
  if (scenarioSlug) trackEvent("scenario_page_view", { slug: scenarioSlug });
  setSheetOpen(arrival.get("sheet") === "1" || location.hash === "#sheet" || location.hash === "#lock");
  document.body.dataset.ready = "1";
}

startAnalytics();
mount();
