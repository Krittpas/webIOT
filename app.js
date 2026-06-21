/* ============================================================
   Admin ranking panel — talks to Supabase via the REST API.
   No external library is loaded (keeps the CSP tight); we use
   plain fetch() against PostgREST + an RPC for atomic +/- score.
   ============================================================ */

/* ---------- 1) CONFIG — fill these in with your project values ----------
   Supabase dashboard → Project Settings → API
     • Project URL  →  SUPABASE_URL   (also put the same host in the CSP:
                       index.html <meta> and _headers connect-src)
     • anon public key  →  SUPABASE_ANON_KEY
   ---------------------------------------------------------------------- */
const SUPABASE_URL      = "https://uivplwgurceicvcysiua.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpdnBsd2d1cmNlaWN2Y3lzaXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NzU2MzMsImV4cCI6MjA5NzU1MTYzM30.lcq84ok-O6R8n8CJm268LrlUe28kCMxOZOzRLwldY4c";

// Codes that unlock the admin panel (Ctrl+I → type one of these → Enter).
const ADMIN_CODES = ["rk", "kn", "pn", "sd", "sv"];

// Display order is FIXED (not sorted by score), as requested.
const TEAM_ORDER  = ["โก๊ดโกด", "เศร้าซึม", "อี๋แหวะ", "กลั๊วกลัว"];
const TEAM_COLORS = {
  "โก๊ดโกด":  "#FF4D4D", // แดง
  "เศร้าซึม": "#3B9DFF", // ฟ้า
  "อี๋แหวะ":  "#3DDC84", // เขียว
  "กลั๊วกลัว": "#B57BFF", // ม่วง
};

const REFRESH_MS = 5000; // auto-refresh the chart while the panel is open

/* ---------- 2) Element refs ---------- */
const gate       = document.getElementById("admin-gate");
const gateForm   = document.getElementById("admin-gate-form");
const codeInput  = document.getElementById("admin-code");
const gateError  = document.getElementById("admin-gate-error");
const gateCancel = document.getElementById("admin-gate-cancel");
const panel      = document.getElementById("admin-panel");
const logoutBtn  = document.getElementById("admin-logout");
const statusEl   = document.getElementById("admin-status");
const chartEl    = document.getElementById("chart");
const controlsEl = document.getElementById("controls");
const adminFab   = document.getElementById("admin-fab");

let refreshTimer = null;
let teams = [];

/* ---------- 3) Supabase REST helpers ---------- */
const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": "Bearer " + SUPABASE_ANON_KEY,
  "Content-Type": "application/json",
};

function configMissing() {
  return SUPABASE_URL.includes("YOUR_PROJECT_REF") ||
         SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");
}

async function fetchTeams() {
  const url = `${SUPABASE_URL}/rest/v1/teams?select=id,name,score,sort_order&order=sort_order.asc`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (HTTP ${res.status})`);
  return res.json();
}

// Atomic add/subtract via the adjust_score() RPC (see supabase_setup.sql).
async function adjustScore(id, delta) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/adjust_score`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ p_id: id, p_delta: delta }),
  });
  if (!res.ok) throw new Error(`ปรับคะแนนไม่สำเร็จ (HTTP ${res.status})`);
}

/* ---------- 4) Rendering ---------- */
function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("is-error", isError);
}

// Order the fetched rows by our fixed TEAM_ORDER (falls back to given order).
function orderTeams(rows) {
  const byName = new Map(rows.map(r => [r.name, r]));
  const ordered = TEAM_ORDER.map(n => byName.get(n)).filter(Boolean);
  // include any extra teams not in TEAM_ORDER, just in case
  rows.forEach(r => { if (!TEAM_ORDER.includes(r.name)) ordered.push(r); });
  return ordered;
}

function renderChart() {
  const maxScore = Math.max(1, ...teams.map(t => t.score));
  chartEl.innerHTML = "";
  teams.forEach(t => {
    const color = TEAM_COLORS[t.name] || "#9AA3BD";
    const pct = Math.max(0, (t.score / maxScore) * 100);
    const col = document.createElement("div");
    col.className = "bar-col";
    col.innerHTML =
      `<span class="bar-val">${t.score}</span>` +
      `<span class="bar-track"><span class="bar-fill"></span></span>` +
      `<span class="bar-name">${escapeHtml(t.name)}</span>`;
    chartEl.appendChild(col);
    const fill = col.querySelector(".bar-fill");
    fill.style.background = color;
    // animate the height after the element is in the DOM
    requestAnimationFrame(() => { fill.style.height = pct + "%"; });
  });
}

function renderControls() {
  controlsEl.innerHTML = "";
  teams.forEach(t => {
    const row = document.createElement("div");
    row.className = "ctrl-row";
    row.innerHTML =
      `<span class="ctrl-name">${escapeHtml(t.name)}</span>` +
      `<input class="ctrl__input" type="number" min="1" step="10" value="10" aria-label="จำนวนคะแนนของ ${escapeHtml(t.name)}">` +
      `<button type="button" class="btn btn--add">เพิ่ม</button>` +
      `<button type="button" class="btn btn--sub">ลด</button>`;
    const input = row.querySelector(".ctrl__input");
    row.querySelector(".btn--add").addEventListener("click", () => apply(t.id, input, +1));
    row.querySelector(".btn--sub").addEventListener("click", () => apply(t.id, input, -1));
    controlsEl.appendChild(row);
  });
}

async function apply(id, input, sign) {
  const amount = Math.abs(parseInt(input.value, 10));
  if (!amount || amount < 1) { setStatus("กรุณาใส่จำนวนที่เป็นตัวเลขมากกว่า 0", true); return; }
  try {
    setStatus("กำลังบันทึก…");
    await adjustScore(id, sign * amount);
    await refresh();
    setStatus(`บันทึกแล้ว • ${new Date().toLocaleTimeString("th-TH")}`);
  } catch (e) {
    setStatus(e.message, true);
  }
}

async function refresh() {
  const rows = await fetchTeams();
  teams = orderTeams(rows);
  renderChart();
  renderControls();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- 5) Panel open/close ---------- */
async function openPanel() {
  gate.hidden = true;
  panel.hidden = false;
  if (configMissing()) {
    setStatus("ยังไม่ได้ตั้งค่า Supabase — แก้ SUPABASE_URL และ SUPABASE_ANON_KEY ใน app.js", true);
    return;
  }
  try {
    setStatus("กำลังโหลด…");
    await refresh();
    setStatus("พร้อมใช้งาน");
  } catch (e) {
    setStatus(e.message, true);
  }
  clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    if (!panel.hidden && !configMissing()) refresh().catch(() => {});
  }, REFRESH_MS);
}

function closePanel() {
  panel.hidden = true;
  clearInterval(refreshTimer);
  if (adminFab) adminFab.hidden = false;
}

function openGate() {
  gateError.hidden = true;
  codeInput.value = "";
  gate.hidden = false;
  if (adminFab) adminFab.hidden = true;
  codeInput.focus();
}

function closeGate() {
  gate.hidden = true;
  if (adminFab && panel.hidden) adminFab.hidden = false;
}

/* ---------- 6) Wiring ---------- */
// Ctrl+I → open the login gate.
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && !e.shiftKey && !e.altKey && (e.key === "i" || e.key === "I")) {
    e.preventDefault();
    if (panel.hidden) openGate();
  }
  if (e.key === "Escape") { closeGate(); }
});

gateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = codeInput.value.trim().toLowerCase();
  if (ADMIN_CODES.map(c => c.toLowerCase()).includes(code)) {
    closeGate();
    openPanel();
  } else {
    gateError.hidden = false;
    codeInput.select();
  }
});

gateCancel.addEventListener("click", closeGate);
adminFab.addEventListener("click", openGate);
logoutBtn.addEventListener("click", closePanel);
