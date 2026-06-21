/* staff.js — data and rendering for the staff directory page
   Photos map to photos/1.png – photos/40.png in order:
     Team โก๊ดโกด  → 1–10
     Team เศร้าซึม → 11–20
     Team อี๋แหวะ  → 21–30
     Team กลั๊วกลัว → 31–40
*/

const TEAMS = [
  {
    name: "โก๊ดโกด",
    color: "#FF4D4D",
    colorSoft: "rgba(255,77,77,.18)",
    members: [
      /* 1  */ { name: "พี่รถเก๋ง",  ig: "" },
      /* 2  */ { name: "พี่แซนด้า", ig: "" },
      /* 3  */ { name: "พี่อาร์ม",  ig: "" },
      /* 4  */ { name: "พี่เอย",    ig: "" },
      /* 5  */ { name: "พี่น้ำเพชร",ig: "" },
      /* 6  */ { name: "พี่แตงโม",  ig: "" },
      /* 7  */ { name: "พี่กิต",    ig: "" },
      /* 8  */ { name: "พี่ปริม",   ig: "" },
      /* 9  */ { name: "พี่เซนต์",  ig: "" },
      /* 10 */ { name: "พี่ครีม",   ig: "" },
    ],
  },
  {
    name: "เศร้าซึม",
    color: "#3B9DFF",
    colorSoft: "rgba(59,157,255,.18)",
    members: [
      /* 11 */ { name: "พี่ธีร์",   ig: "" },
      /* 12 */ { name: "พี่อชิ",    ig: "" },
      /* 13 */ { name: "พี่ต้น",    ig: "" },
      /* 14 */ { name: "พี่ไข่มุก",ig: "" },
      /* 15 */ { name: "พี่ณิชกุล",ig: "" },
      /* 16 */ { name: "พี่ซู",     ig: "" },
      /* 17 */ { name: "พี่จ๋า",    ig: "" },
      /* 18 */ { name: "พี่อันอัน", ig: "" },
      /* 19 */ { name: "พี่เฟียต",  ig: "" },
      /* 20 */ { name: "พี่แอล",    ig: "" },
    ],
  },
  {
    name: "อี๋แหวะ",
    color: "#3DDC84",
    colorSoft: "rgba(61,220,132,.18)",
    members: [
      /* 21 */ { name: "พี่เซฟ",    ig: "" },
      /* 22 */ { name: "พี่โตโต้",  ig: "" },
      /* 23 */ { name: "พี่ภัทร",   ig: "" },
      /* 24 */ { name: "พี่ภณ",     ig: "" },
      /* 25 */ { name: "พี่นิคกี้", ig: "" },
      /* 26 */ { name: "พี่โดนัท",  ig: "" },
      /* 27 */ { name: "พี่ฟง",     ig: "" },
      /* 28 */ { name: "พี่วิน",    ig: "" },
      /* 29 */ { name: "พี่เพลง",   ig: "" },
      /* 30 */ { name: "พี่ลิสา",   ig: "" },
    ],
  },
  {
    name: "กลั๊วกลัว",
    color: "#B57BFF",
    colorSoft: "rgba(181,123,255,.18)",
    members: [
      /* 31 */ { name: "พี่ปุณ",    ig: "" },
      /* 32 */ { name: "พี่คลีน",   ig: "" },
      /* 33 */ { name: "พี่ต๊อด",   ig: "" },
      /* 34 */ { name: "พี่ทิม",    ig: "" },
      /* 35 */ { name: "อชิ",       ig: "" },
      /* 36 */ { name: "พี่กาน",    ig: "" },
      /* 37 */ { name: "พี่ไอซ์",   ig: "" },
      /* 38 */ { name: "พี่เบนเทน", ig: "" },
      /* 39 */ { name: "พี่จีน",    ig: "" },
      /* 40 */ { name: "พี่ตอง",    ig: "" },
    ],
  },
];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function placeholderChar(name) {
  return name.replace(/^พี่/, "")[0] || name[0];
}

(function render() {
  const container = document.getElementById("teams-container");
  let num = 0;

  TEAMS.forEach(team => {
    const section = document.createElement("section");
    section.className = "team-section";

    const h2 = document.createElement("h2");
    h2.className = "team-name";
    h2.style.color = team.color;
    h2.textContent = team.name;

    const divider = document.createElement("div");
    divider.className = "team-divider";
    divider.style.background = team.color;

    const grid = document.createElement("div");
    grid.className = "staff-grid";

    team.members.forEach(member => {
      num++;

      const card = document.createElement("div");
      card.className = "staff-card";

      const wrap = document.createElement("div");
      wrap.className = "photo-wrap";
      wrap.style.setProperty("--tc", team.color);
      wrap.style.setProperty("--ts", team.colorSoft);
      wrap.style.borderColor = team.color;
      wrap.style.background = team.colorSoft;

      const img = document.createElement("img");
      img.className = "staff-photo";
      img.src = `photos/${num}.png`;
      img.alt = member.name;
      img.addEventListener("error", () => {
        img.remove();
        const ph = document.createElement("span");
        ph.className = "photo-placeholder";
        ph.style.color = team.color;
        ph.textContent = placeholderChar(member.name);
        wrap.appendChild(ph);
      });
      wrap.appendChild(img);

      const nameEl = document.createElement("span");
      nameEl.className = "staff-name";
      nameEl.textContent = member.name;

      const igEl = document.createElement("span");
      igEl.className = "staff-ig";
      igEl.textContent = "IG : " + (member.ig || "—");

      card.appendChild(wrap);
      card.appendChild(nameEl);
      card.appendChild(igEl);
      grid.appendChild(card);
    });

    section.appendChild(h2);
    section.appendChild(divider);
    section.appendChild(grid);
    container.appendChild(section);
  });
})();
