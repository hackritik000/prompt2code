/* UI + storage. All scoring lives in engine.js.[cite: 2] */
const querySelector = (selector, root = document) =>
  root.querySelector(selector);

const escapeHtml = (str) =>
  String(str).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

const getIsoDate = (offsetDays) => {
  const now = new Date();
  now.setDate(now.getDate() - offsetDays);
  return new Date(now - now.getTimezoneOffset() * 6e4)
    .toISOString()
    .slice(0, 10);
};

const CATEGORIES = [
  "Bottle",
  "Bag",
  "Wallet",
  "Phone",
  "Keys",
  "ID card",
  "Earphones",
  "Glasses",
  "Book",
  "Clothing",
  "Other",
];

const COLORS = [
  "black",
  "white",
  "grey",
  "silver",
  "blue",
  "green",
  "red",
  "pink",
  "orange",
  "yellow",
  "brown",
  "multicolor",
];

const PART_LABELS = {
  category: "Category",
  color: "Color",
  location: "Location",
  date: "Date",
  description: "Description",
};

const loadStorage = (key, defaultVal) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? defaultVal;
  } catch {
    return defaultVal;
  }
};

let items = loadStorage("lf-items", []);
let config = loadStorage("lf-ai", {
  provider: "gemini",
  model: "gemini-3.5-flash",
});

const saveStorage = () => {
  try {
    localStorage.setItem("lf-items", JSON.stringify(items));
  } catch {
    showToast("Could not save: browser storage is full or blocked.");
  }
};

function showToast(message) {
  const toastEl = querySelector("#toast");
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastEl.classList.remove("show"), 2800);
}

/* ---------- Form Setup ---------- */
const populateSelect = (name, arr) => {
  querySelector(`[name=${name}]`).innerHTML = arr
    .map((val) => `<option value="${val}">${capitalize(val)}</option>`)
    .join("");
};

populateSelect("category", CATEGORIES);
populateSelect("color", COLORS);
populateSelect("location", Object.keys(Engine.ZONES));

const dateInput = querySelector("[name=date]");
dateInput.max = getIsoDate(0);
dateInput.value = getIsoDate(0);

querySelector("#weights").textContent =
  "How a score is built: " +
  Object.entries(Engine.W)
    .map(([key, val]) => `${key} ${val}%`)
    .join(", ") +
  ". Different categories cap the score at 40%.";

/* ---------- Navigation & Tabs ---------- */
function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach((section) => {
    section.hidden = section.id !== tabId;
  });
  document.querySelectorAll("#tabs button").forEach((btn) => {
    btn.classList.toggle("on", btn.dataset.t === tabId);
  });
  if (tabId === "matches") renderMatches();
  if (LIST_CONFIGS[tabId]) renderList(tabId);
}

querySelector("#tabs").onclick = (e) => {
  if (e.target.dataset.t) switchTab(e.target.dataset.t);
};

/* ---------- Add Reports ---------- */
querySelector("#form").onsubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    type: formData.get("type"),
    category: formData.get("category"),
    color: formData.get("color"),
    location: formData.get("location"),
    date: formData.get("date"),
    description: formData.get("description").trim(),
    status: "open",
  };

  if (!newItem.date || newItem.date > getIsoDate(0))
    return showToast("Choose a date that is today or earlier.");

  items.push(newItem);
  saveStorage();
  e.target.reset();
  dateInput.value = getIsoDate(0);
  showToast(`${newItem.type === "lost" ? "Lost" : "Found"} report saved.`);
  switchTab("matches");
};

querySelector("#demo").onclick = () => {
  const createMockItem = (
    type,
    category,
    color,
    location,
    daysAgo,
    description,
  ) => ({
    id: Math.random().toString(36).slice(2, 9),
    type,
    category,
    color,
    location,
    date: getIsoDate(daysAgo),
    description,
    status: "open",
  });

  items.push(
    createMockItem(
      "lost",
      "Bottle",
      "black",
      "Library",
      0,
      "Black water bottle",
    ),
    createMockItem("found", "Bottle", "black", "Library", 0, "Black bottle"),
    createMockItem(
      "lost",
      "Bag",
      "blue",
      "Canteen",
      2,
      "Blue backpack with a Nike logo",
    ),
    createMockItem(
      "found",
      "Bag",
      "blue",
      "Auditorium",
      1,
      "Navy rucksack, Nike logo on the front",
    ),
    createMockItem(
      "lost",
      "Keys",
      "red",
      "Parking",
      1,
      "Bunch of keys with a red keyring",
    ),
    createMockItem(
      "found",
      "Keys",
      "red",
      "Main Gate",
      0,
      "Keys on a red keychain",
    ),
    createMockItem(
      "lost",
      "Phone",
      "black",
      "Classroom Block",
      1,
      "Black Samsung mobile with cracked cover",
    ),
    createMockItem(
      "found",
      "Phone",
      "black",
      "Computer Lab",
      0,
      "Samsung smartphone, black, cover cracked",
    ),
    createMockItem(
      "found",
      "Wallet",
      "brown",
      "Mess",
      0,
      "Brown leather wallet",
    ),
  );

  saveStorage();
  showToast("Demo data added.");
  switchTab("matches");
};

/* ---------- Matches Rendering ---------- */
const renderTags = (item) =>
  `<div class="tags"><span class="tag">${escapeHtml(item.category)}</span><span class="tag">${capitalize(escapeHtml(item.color))}</span>` +
  `<span class="tag">${escapeHtml(item.location)}</span><span class="tag">${escapeHtml(item.date)}</span></div>`;

const getTitle = (item) =>
  escapeHtml((item.description || item.category).slice(0, 80));

function renderMatches() {
  const openLostItems = items.filter(
    (i) => i.type === "lost" && i.status === "open",
  );
  querySelector("#matches").innerHTML =
    '<h2>Matches</h2><p class="lead">Best matches first. Every score shows exactly how it was built.</p>' +
    (openLostItems.length
      ? openLostItems.map(renderLostCard).join("")
      : '<div class="empty">No open lost reports yet. Report a lost item, or load the demo data on the Report tab.</div>');
}

function renderLostCard(lostItem) {
  const matches = Engine.matchesFor(lostItem, items);
  return (
    `<article class="card"><h3><button class="link" data-open="${lostItem.id}">Lost: ${getTitle(lostItem)}</button></h3>${renderTags(lostItem)}` +
    (matches.length
      ? matches.map((match) => renderCandidateCard(lostItem, match)).join("")
      : '<p class="lead">No found item matches this yet. New found reports are compared automatically.</p>') +
    "</article>"
  );
}

function renderCandidateCard(lostItem, match) {
  const foundItem = match.item;
  const barsHtml = Object.entries(PART_LABELS)
    .map(([key, label]) => {
      const score = match.parts[key];
      return `<span>${label}${score == null ? " (skipped)" : ""}</span><div class="trk"><i style="width:${score == null ? 0 : Math.round(score * 100)}%"></i></div>`;
    })
    .join("");

  return (
    `<div class="cand" data-open="${foundItem.id}"><div class="ring" style="--p:${match.pct}"><b>${match.pct}%</b></div><div>` +
    `<button class="link" data-open="${foundItem.id}">Found: ${getTitle(foundItem)}</button>${renderTags(foundItem)}<div class="bars">${barsHtml}</div>` +
    `<div class="row"><button class="soft" data-ok="${lostItem.id}|${foundItem.id}">Confirm match</button>` +
    `<button class="soft" data-ai="${lostItem.id}|${foundItem.id}">Ask AI</button></div><div class="ai" hidden></div></div></div>`
  );
}

querySelector("#matches").onclick = (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  if (button.dataset.ok) {
    const [lostId, foundId] = button.dataset.ok.split("|");
    [lostId, foundId].forEach((id) => {
      const item = items.find((x) => x.id === id);
      item.status = "claimed";
      item.pair = id === lostId ? foundId : lostId;
    });
    saveStorage();
    showToast("Match confirmed. Both reports are closed.");
    renderMatches();
  }
  if (button.dataset.ai) askAI(button);
};

/* ---------- Item Lists (Lost, Found, All) ---------- */
const LIST_CONFIGS = {
  lost: [
    "Lost items",
    (i) => i.type === "lost",
    "No lost reports yet. Use the Report tab to add one.",
  ],
  found: [
    "Found items",
    (i) => i.type === "found",
    "No found reports yet. Use the Report tab to add one.",
  ],
  items: [
    "All items",
    () => true,
    "Nothing here yet. Save a report to get started.",
  ],
};

const renderRow = (item) =>
  `<div class="item ${item.status === "claimed" ? "done" : ""}" data-open="${item.id}"><div>` +
  `<button class="link" data-open="${item.id}">${item.type === "lost" ? "Lost" : "Found"}: ${getTitle(item)}</button>` +
  `${item.status === "claimed" ? ' <span class="tag">Closed</span>' : ""}${renderTags(item)}</div>` +
  `<button class="soft" data-del="${item.id}">Delete</button></div>`;

function renderList(listId) {
  const [heading, filterFn, emptyMessage] = LIST_CONFIGS[listId];
  const filteredList = items.filter(filterFn);
  const openCount = filteredList.filter((i) => i.status === "open").length;

  querySelector("#" + listId).innerHTML =
    `<h2>${heading}</h2><div class="stats"><span class="tag">${openCount} open</span>` +
    `<span class="tag">${filteredList.length - openCount} closed</span></div>` +
    (filteredList.length
      ? filteredList
          .slice()
          .reverse()
          .sort((a, b) => (a.status === "claimed") - (b.status === "claimed"))
          .map(renderRow)
          .join("")
      : `<div class="empty">${emptyMessage}</div>`);
}

/* ---------- Item Detail Modal ---------- */
function showDetailModal(id) {
  const item = items.find((x) => x.id === id);
  if (!item) return;
  const isClosed = item.status === "claimed";
  const pairedItem = isClosed && items.find((x) => x.id === item.pair);

  const details = [
    ["Category", item.category],
    ["Color", capitalize(item.color)],
    ["Where", item.location],
    ["Date", item.date],
    ["Description", item.description || "None given"],
  ];

  querySelector("#dBody").innerHTML =
    `<h2>${item.type === "lost" ? "Lost" : "Found"} item</h2>` +
    `<p><span class="tag">${isClosed ? "Closed" : "Open"}</span></p>` +
    `<dl class="ov">${details.map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(v)}</dd>`).join("")}</dl>` +
    (isClosed
      ? `<p class="note">${item.type === "lost" ? "This item has been found." : "This item has been claimed by its owner."}` +
        (pairedItem
          ? ` It was matched with a ${pairedItem.type} report: ${getTitle(pairedItem)}, ${escapeHtml(pairedItem.location)}, ${escapeHtml(pairedItem.date)}.`
          : "") +
        "</p>"
      : "");
  querySelector("#detail").showModal();
}

const getCurrentTab = () => querySelector("#tabs .on").dataset.t;

document.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest("[data-del]");
  if (deleteBtn) {
    items = items.filter((i) => i.id !== deleteBtn.dataset.del);
    saveStorage();
    switchTab(getCurrentTab());
    showToast("Report deleted.");
    return;
  }
  const openTarget = e.target.closest("[data-open]");
  if (openTarget && !e.target.closest("button:not([data-open]), .ai"))
    showDetailModal(openTarget.dataset.open);
});

/* ---------- Optional AI Comparison Integration ---------- */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const createError = (msg, extra) => Object.assign(new Error(msg), extra);

async function aiCompare(lost, found, updateNote) {
  const isGemini = config.provider === "gemini";
  if (!isGemini && !config.model)
    throw createError("no model", { kind: "model" });

  const formatDesc = (i) =>
    `${i.color} ${i.category}, ${i.description || "no description"}, at ${i.location} on ${i.date}`;
  const prompt =
    "You compare two campus lost-and-found reports. Reply with JSON only: " +
    '{"score": number 0-100 (chance they are the same item), "reason": "one short sentence"}.\n' +
    `LOST: ${formatDesc(lost)}\nFOUND: ${formatDesc(found)}`;

  const url = isGemini
    ? `https://generativelanguage.googleapis.com/v1beta/models/${config.model || "gemini-3.5-flash"}:generateContent`
    : `${(config.base || "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`;

  const requestOptions = {
    method: "POST",
    headers: isGemini
      ? { "Content-Type": "application/json", "x-goog-api-key": config.key }
      : {
          "Content-Type": "application/json",
          Authorization: "Bearer " + config.key,
        },
    body: JSON.stringify(
      isGemini
        ? { contents: [{ parts: [{ text: prompt }] }] }
        : {
            model: config.model,
            messages: [{ role: "user", content: prompt }],
          },
    ),
  };

  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await fetch(url, {
        ...requestOptions,
        signal: AbortSignal.timeout ? AbortSignal.timeout(20000) : undefined,
      });
    } catch {
      throw createError("network", { kind: "net" });
    }
    if (
      response.ok ||
      ![429, 500, 502, 503, 504].includes(response.status) ||
      attempt === 3
    )
      break;
    updateNote("The AI service is busy, trying again...");
    await sleep(1500 * attempt);
  }

  if (!response.ok)
    throw createError("HTTP " + response.status, { status: response.status });
  try {
    const json = await response.json();
    const textResponse = isGemini
      ? json.candidates[0].content.parts.map((p) => p.text || "").join("")
      : json.choices[0].message.content;
    return JSON.parse(textResponse.match(/\{[\s\S]*\}/)[0]);
  } catch {
    throw createError("reply", { kind: "reply" });
  }
}

const getAiErrorMessage = (err) => {
  const status = err.status;
  const reason =
    status >= 500 || status === 429
      ? "The AI service is busy right now. Press Ask AI again in a moment."
      : status === 404
        ? "The model name was not found. Check the model name in AI settings."
        : status
          ? "The key was rejected or the request was invalid. Check the API key in AI settings."
          : err.kind === "model"
            ? "Add a model name in AI settings."
            : err.kind === "net"
              ? "Could not reach the AI service (no internet, or it took too long)."
              : "The AI replied in an unexpected format. Please try again.";
  return `${reason}${status ? ` (HTTP ${status})` : ""} Matching still works offline.`;
};

async function askAI(button) {
  if (!config.key) {
    querySelector("#setBtn").click();
    return;
  }
  const [lostId, foundId] = button.dataset.ai.split("|");
  const lostItem = items.find((i) => i.id === lostId);
  const foundItem = items.find((i) => i.id === foundId);
  const aiBox = button.closest(".cand").querySelector(".ai");

  const setMessage = (msg) => {
    aiBox.hidden = false;
    aiBox.textContent = msg;
  };

  button.disabled = true;
  setMessage("Asking the AI...");
  try {
    const result = await aiCompare(lostItem, foundItem, setMessage);
    setMessage(
      `AI estimate: ${result.score}% likely the same item. ${result.reason}`,
    );
  } catch (err) {
    setMessage(getAiErrorMessage(err));
  } finally {
    button.disabled = false;
  }
}

/* ---------- AI Settings Dialog ---------- */
const handleProviderChange = () => {
  const isGemini = querySelector("#prov").value === "gemini";
  querySelector("#baseRow").hidden = isGemini;
  querySelector("#model").placeholder = isGemini
    ? "gemini-3.5-flash"
    : "model name";
};

querySelector("#prov").onchange = handleProviderChange;

querySelector("#setBtn").onclick = () => {
  querySelector("#prov").value = config.provider || "gemini";
  querySelector("#key").value = config.key || "";
  querySelector("#model").value = config.model || "";
  querySelector("#base").value = config.base || "";
  handleProviderChange();
  querySelector("#dlg").showModal();
};

querySelector("#saveCfg").onclick = () => {
  config = {
    provider: querySelector("#prov").value,
    key: querySelector("#key").value.trim(),
    model: querySelector("#model").value.trim(),
    base: querySelector("#base").value.trim(),
  };
  localStorage.setItem("lf-ai", JSON.stringify(config));
  showToast(
    config.key ? "AI check enabled." : "No key set. Matching stays offline.",
  );
};

querySelector("#clrCfg").onclick = () => {
  config.key = "";
  querySelector("#key").value = "";
  localStorage.setItem("lf-ai", JSON.stringify(config));
  showToast("Key removed.");
};
