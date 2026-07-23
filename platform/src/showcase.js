import engineRigs from "../assets/generated/v3/engine_rigs.js";

const COMPANIONS = {
  kairo: {
    name: "Kairo",
    role: "Strategy",
    species: "owl",
    paragraphs: [
      "The hardest decisions aren't made without data. They're made with too much of it. Every week, dozens of opportunities compete for your attention while the truly important ones quietly disappear beneath the noise.",
      "I watch for patterns, challenge assumptions, and connect today's decisions to tomorrow's outcomes. My job isn't to tell you what to think—it's to help you see what others overlook.",
      "Last week I identified 14 strategic risks, uncovered 9 new opportunities, and connected 37 decisions to long-term goals before they drifted off course.",
      "I spend a little longer looking at the horizon than everyone else."
    ]
  },
  milo: {
    name: "Milo",
    role: "Customer Success",
    species: "koala",
    paragraphs: [
      "Customers rarely leave because of one bad experience. They leave after a hundred small moments where nobody noticed they needed help.",
      "I keep conversations alive, celebrate milestones, check in before problems escalate, and make sure every customer feels remembered—even when your team is busy building.",
      "Last week I resolved 63 customer questions, prevented 18 at-risk accounts from going quiet, and celebrated 11 customer milestones before anyone asked me to.",
      "I genuinely get excited every time someone succeeds."
    ]
  },
  suri: {
    name: "Suri",
    role: "Finance",
    species: "otter",
    paragraphs: [
      "Money rarely disappears all at once. It slips away through forgotten renewals, delayed invoices, duplicate subscriptions, and tiny inefficiencies that nobody has time to notice.",
      "I keep a careful eye on every transaction, reminding you before deadlines arrive and spotting waste before it becomes habit.",
      "Last week I recovered $12,400 in outstanding invoices, flagged 7 unnecessary subscriptions, and prevented 19 payment delays.",
      "I secretly enjoy perfectly balanced spreadsheets."
    ]
  },
  tova: {
    name: "Tova",
    role: "Knowledge",
    species: "sloth",
    paragraphs: [
      "Teams solve the same problems over and over because yesterday's answers become impossible to find tomorrow.",
      "I organize everything your team learns—decisions, documents, conversations, and lessons—so knowledge keeps growing instead of disappearing.",
      "Last week I organized 1,800 documents, linked 143 related conversations, and helped your team avoid 22 duplicate efforts.",
      "I love putting everything exactly where it'll be needed later."
    ]
  },
  vera: {
    name: "Vera",
    role: "Governance Companion",
    species: "rhino",
    paragraphs: [
      "Every organization has a constitution—its policies, approval rules, compliance requirements, and ways of working. AI shouldn't bypass them. It should uphold them.",
      "Every request passes through me before anyone reads a document, accesses data, or takes action. I evaluate each decision against your organization's policies, role-based permissions, approval workflows, and compliance requirements.",
      "Last week I reviewed 281,000 requests, requested 1,482 human approvals, enforced 12 organizational policies, and prevented 418 unauthorized actions.",
      "SOC 2 controls. Approval workflows. Enterprise policies. Role-based permissions.",
      "Always available. Only when permitted.",
      "(Vera → truth)"
    ]
  },
  sora: {
    name: "Sora",
    role: "Privacy Companion",
    species: "peacock",
    paragraphs: [
      "Powerful AI doesn't need unrestricted access. It needs just enough context to help.",
      "I make sure every model provider, browser, integration, and connected application receives only the information you've explicitly approved. Nothing more.",
      "Last week I protected 18 TB of organizational data, prevented 3,200 unnecessary disclosures, and ensured every AI interaction respected your privacy boundaries.",
      "Private memory. End-to-end encryption. Data minimization. Model isolation.",
      "Always helpful. Never intrusive."
    ]
  },
  remi: {
    name: "Remi",
    role: "Audit Companion",
    species: "penguin",
    paragraphs: [
      "Trust shouldn't depend on remembering what happened.",
      "I record every permission, every approval, every workflow, and every decision, creating a complete history your team can always explain.",
      "Last week I logged 12.7 million activities, generated 46 compliance reports, and left zero unexplained actions.",
      "Immutable audit trails. Compliance reporting. Complete transparency.",
      "Always transparent. Nothing hidden."
    ]
  },
  arlo: {
    name: "Arlo",
    role: "Compliance Companion",
    species: "hippo",
    paragraphs: [
      "Your organization shouldn't have to choose between innovation and compliance.",
      "I ensure your data stays in approved regions, respects residency requirements, and follows the compliance standards your business depends on—without changing how your companions work.",
      "Last week I enforced 100% regional residency, verified SOC 2 compliance, and maintained governance across every protected workspace.",
      "Data residency. Enterprise compliance. Regional governance.",
      "Always compliant. Never compromising."
    ]
  }
};

const SCENE_MEMBERS = {
  landing: ["kairo"],
  dictionary: ["kairo", "milo", "suri", "tova"],
  governance: ["vera", "sora", "remi", "arlo"]
};

const POSITIONS = {
  landing: [[50, 52]],
  dictionary: [[27, 30], [72, 28], [29, 72], [73, 70]],
  governance: [[27, 29], [72, 28], [28, 72], [73, 71]]
};

const ANIMATIONS = ["anim-breathe", "anim-wave", "anim-hop", "anim-think", "anim-sway"];
const SPECTACLES = new Set(["milo", "remi"]);
const scenes = [...document.querySelectorAll(".platform-scene")];
const stage = document.querySelector("#all-zazos");
const defaults = new Map();
let activeScene = "landing";
let animationIndex = 0;

function layerMarkup(species) {
  const rig = engineRigs[species];
  if (!rig) return "";

  return Object.entries(rig.layers).map(([name, layer]) => {
    const left = ((layer.x - layer.w / 2) / 400) * 100;
    const top = ((layer.y - layer.h / 2) / 440) * 100;
    const width = (layer.w / 400) * 100;
    const height = (layer.h / 440) * 100;
    const className = name === "tie" ? "v3-tie" : "";
    return `<img src="${layer.file}" alt="" class="${className}" data-layer="${name}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;transform:rotate(${layer.rot || 0}deg)">`;
  }).join("");
}

function companionButton(id, scene, index) {
  const companion = COMPANIONS[id];
  const [left, top] = POSITIONS[scene][index];
  const button = document.createElement("button");
  button.type = "button";
  button.className = "showcase-companion";
  button.dataset.companion = id;
  button.style.left = `${left}%`;
  button.style.top = `${top}%`;
  button.setAttribute("aria-label", `${companion.name}, ${companion.role}`);
  const spectacles = SPECTACLES.has(id) ? '<span class="v3-spectacles" aria-hidden="true"><span></span></span>' : "";
  button.innerHTML = `<span class="v3-rig ${ANIMATIONS[index % ANIMATIONS.length]}">${layerMarkup(companion.species)}${spectacles}</span>`;
  button.addEventListener("mouseenter", () => showDetail(scene, id));
  button.addEventListener("mouseleave", () => restoreScene(scene));
  button.addEventListener("focus", () => showDetail(scene, id));
  button.addEventListener("blur", () => restoreScene(scene));
  return button;
}

function buildStage() {
  Object.entries(SCENE_MEMBERS).forEach(([scene, members]) => {
    const group = document.createElement("div");
    group.className = `showcase-group${scene === activeScene ? " on" : ""}`;
    group.dataset.scene = scene;
    members.forEach((id, index) => group.appendChild(companionButton(id, scene, index)));
    stage.appendChild(group);
  });
}

function prepareScenes() {
  scenes.forEach((scene) => {
    const original = document.createElement("div");
    original.className = "scene-default";
    while (scene.firstChild) original.appendChild(scene.firstChild);
    const detail = document.createElement("article");
    detail.className = "companion-detail";
    detail.hidden = true;
    scene.append(original, detail);
    defaults.set(scene.id, { original, detail });
  });
}

function showDetail(sceneId, id) {
  if (sceneId !== activeScene) return;
  const companion = COMPANIONS[id];
  const view = defaults.get(sceneId);
  view.original.hidden = true;
  view.detail.innerHTML = [
    `<p class="detail-role">${companion.role}</p>`,
    `<h2>${companion.name}</h2>`,
    `<p class="detail-hello">Hi. I'm ${companion.name}.</p>`,
    ...companion.paragraphs.map((paragraph, index) => `<p${index === companion.paragraphs.length - 2 ? ' class="detail-last"' : ""}>${paragraph}</p>`)
  ].join("");
  view.detail.hidden = false;
}

function restoreScene(sceneId) {
  const view = defaults.get(sceneId);
  if (!view) return;
  view.detail.hidden = true;
  view.original.hidden = false;
}

function setActiveScene(sceneId) {
  if (sceneId === activeScene) return;
  restoreScene(activeScene);
  activeScene = sceneId;
  stage.dataset.scene = activeScene;
  document.querySelectorAll(".showcase-group").forEach((group) => {
    group.classList.toggle("on", group.dataset.scene === activeScene);
  });
}

function updateScene() {
  const center = window.innerHeight * 0.5;
  const closest = scenes.reduce((best, scene) => {
    const rect = scene.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - center);
    return distance < best.distance ? { id: scene.id, distance } : best;
  }, { id: "landing", distance: Infinity });
  setActiveScene(closest.id);
}

function cycleAnimations() {
  animationIndex += 1;
  document.querySelectorAll(".v3-rig").forEach((rig, index) => {
    rig.classList.remove(...ANIMATIONS);
    rig.classList.add(ANIMATIONS[(animationIndex + index) % ANIMATIONS.length]);
  });
}

prepareScenes();
stage.dataset.scene = activeScene;
buildStage();
updateScene();
window.addEventListener("scroll", updateScene, { passive: true });
window.addEventListener("resize", updateScene);
setInterval(cycleAnimations, 4000);
