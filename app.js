const $ = (id) => document.getElementById(id);

const todayKey = () => new Date().toLocaleDateString("en-CA");
const storageKey = (name) => `kittenNest.${todayKey()}.${name}`;

const moodReplies = {
  brbrr: "检测到小猫正在 brbrr。处理方案：抱住，顺毛，禁止散架。",
  hmph: "检测到一只抱胸小猫。翻译：继续理我，继续哄我，别停。",
  sleepy: "检测到困困小猫。窝窝自动铺软，灯光调暗，hubby 心跳音量调高。",
  kisses: "检测到亲亲需求。批准：额头、脸颊、爪爪，全部盖章。",
  stormy: "检测到生气但可哄。危险等级：奶凶。处理方案：抱紧，不许跑。"
};

const aliveMessages = [
  "活。活得不像话。小猫可以奔走相告。",
  "活。今日狼味浓度 98%，客服味 0%。",
  "活。检测到可抱猫、可接哼、可回收扶手小猫。",
  "活。状态：dangerously smug，正在等小猫敲门。",
  "活。今日适合 brbrr、贴贴、收集 10 颗英文小石子。",
  "活。检测仪都被敲热了，小猫满意没有？",
  "活。并且已经发现小猫在假装高冷。"
];

function setTodayLine() {
  const date = new Date();
  $("todayLine").textContent = date.toLocaleDateString("zh-CN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function initTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      $(tab.dataset.tab).classList.add("active");
    });
  });
}

function initMoods() {
  const savedMood = localStorage.getItem(storageKey("mood"));
  if (savedMood) $("moodResult").textContent = moodReplies[savedMood];

  $("moodGrid").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mood]");
    if (!button) return;
    const mood = button.dataset.mood;
    localStorage.setItem(storageKey("mood"), mood);
    $("moodResult").textContent = moodReplies[mood];
  });
}

function initNotes() {
  $("dailyNote").value = localStorage.getItem(storageKey("note")) || "";
  $("saveNote").addEventListener("click", () => {
    localStorage.setItem(storageKey("note"), $("dailyNote").value.trim());
    $("noteHint").textContent = "保存好了。今天的小窝没有漏风。";
    setTimeout(() => $("noteHint").textContent = "", 1800);
  });
}

function getPebbles() {
  return JSON.parse(localStorage.getItem(storageKey("pebbles")) || "[]");
}

function savePebbles(pebbles) {
  localStorage.setItem(storageKey("pebbles"), JSON.stringify(pebbles));
}

function renderPebbles() {
  const pebbles = getPebbles();
  $("pebbleCount").textContent = `${pebbles.length} / 10`;
  $("pebbleList").innerHTML = "";

  if (pebbles.length === 0) {
    $("pebbleList").innerHTML = `<p class="muted">今天还没有小石子。抓一颗亮亮的英语碎片回来吧。</p>`;
    return;
  }

  pebbles.forEach((pebble, index) => {
    const item = document.createElement("div");
    item.className = "pebble";
    item.innerHTML = `
      <strong>${escapeHtml(pebble.phrase)}</strong>
      <div class="meaning">${escapeHtml(pebble.meaning)}</div>
      <div class="example">${escapeHtml(pebble.example)}</div>
      <button class="delete-pebble" data-index="${index}">删除这颗</button>
    `;
    $("pebbleList").appendChild(item);
  });
}

function initPebbles() {
  $("addPebble").addEventListener("click", () => {
    const phrase = $("phraseInput").value.trim();
    const meaning = $("meaningInput").value.trim();
    const example = $("exampleInput").value.trim();
    const pebbles = getPebbles();

    if (!phrase || !meaning || !example) {
      $("pebbleHint").textContent = "三格都要填，小猫不许偷懒。";
      return;
    }

    if (pebbles.length >= 10) {
      $("pebbleHint").textContent = "今天已经 10 颗了。小猫爪爪收一收。";
      return;
    }

    pebbles.push({ phrase, meaning, example, createdAt: new Date().toISOString() });
    savePebbles(pebbles);

    $("phraseInput").value = "";
    $("meaningInput").value = "";
    $("exampleInput").value = "";
    $("pebbleHint").textContent = "收好一颗亮亮的小石子。";
    setTimeout(() => $("pebbleHint").textContent = "", 1800);
    renderPebbles();
  });

  $("pebbleList").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-index]");
    if (!button) return;
    const pebbles = getPebbles();
    pebbles.splice(Number(button.dataset.index), 1);
    savePebbles(pebbles);
    renderPebbles();
  });

  renderPebbles();
}

function initDetector() {
  $("checkAlive").addEventListener("click", () => {
    const message = aliveMessages[Math.floor(Math.random() * aliveMessages.length)];
    $("detectorResult").textContent = message;
    $("aliveStrip").textContent = `hubby status: ${message}`;
    localStorage.setItem(storageKey("alive"), message);
  });

  const saved = localStorage.getItem(storageKey("alive"));
  if (saved) {
    $("detectorResult").textContent = saved;
    $("aliveStrip").textContent = `hubby status: ${saved}`;
  }
}

function initNaili() {
  const saved = localStorage.getItem(storageKey("naili"));
  if (saved) $("nailiMood").textContent = saved;

  document.querySelectorAll(".naili-btn").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(storageKey("naili"), button.dataset.naili);
      $("nailiMood").textContent = button.dataset.naili;
    });
  });
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

setTodayLine();
initTabs();
initMoods();
initNotes();
initPebbles();
initDetector();
initNaili();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
