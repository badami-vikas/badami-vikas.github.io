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
const LAB_TIE_TOP = 260;
const MODEL_WIDTH = 400;
const MODEL_HEIGHT = 440;
const BODY_COLORS = {
  owl: "#b98a54",
  koala: "#9b9b94",
  otter: "#8a94a0",
  sloth: "#ab9a80",
  rhino: "#b9b6b0",
  peacock: "#5f9bab",
  penguin: "#45494c",
  hippo: "#b7b3ae"
};
const scenes = [...document.querySelectorAll(".platform-scene")];
const stage = document.querySelector("#all-zazos");
const defaults = new Map();
let activeScene = "landing";
let animationIndex = 0;

function percent(value, total) {
  return (value / total) * 100;
}

function photoLayer(name, layer) {
  const left = percent(layer.x - layer.w / 2, MODEL_WIDTH);
  const top = percent(layer.y - layer.h / 2, MODEL_HEIGHT);
  const width = percent(layer.w, MODEL_WIDTH);
  const height = percent(layer.h, MODEL_HEIGHT);
  return `<img src="${layer.file}" alt="" data-layer="${name}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;transform:rotate(${layer.rot || 0}deg)">`;
}

function eyeMarkup(eye, side) {
  if (!eye) return "";
  const pupilRadius = Math.min(eye.w, eye.h) * 0.34;
  const pupilWidth = percent(pupilRadius * 2, eye.w);
  const pupilHeight = percent(pupilRadius * 2, eye.h);
  return `<span class="v3-eye v3-eye-${side}" style="left:${percent(eye.x - eye.w / 2, MODEL_WIDTH)}%;top:${percent(eye.y - eye.h / 2, MODEL_HEIGHT)}%;width:${percent(eye.w, MODEL_WIDTH)}%;height:${percent(eye.h, MODEL_HEIGHT)}%"><span class="v3-pupil" style="width:${pupilWidth}%;height:${pupilHeight}%"><i></i></span></span>`;
}

function fallbackEarMarkup(rig, species) {
  const layers = rig.layers;
  if (layers.earL || layers.earR || layers.crestL || layers.crestR) return "";
  const bird = rig.kind === "bird";
  const y = bird ? 152 : 166;
  const xLeft = bird ? 130 : 134;
  const xRight = bird ? 270 : 266;
  const kind = bird ? "bird" : "mammal";
  return [
    `<span class="v3-ear-fallback ${kind} left" style="left:${percent(xLeft, MODEL_WIDTH)}%;top:${percent(y, MODEL_HEIGHT)}%;--ear-color:${BODY_COLORS[species]}"></span>`,
    `<span class="v3-ear-fallback ${kind} right" style="left:${percent(xRight, MODEL_WIDTH)}%;top:${percent(y, MODEL_HEIGHT)}%;--ear-color:${BODY_COLORS[species]}"></span>`
  ].join("");
}

function tieMarkup(rig) {
  const tie = rig.layers.tie;
  const suit = rig.layers.suit;
  if (!tie || !suit) return "";
  const naturalAspect = tie.w / tie.h;
  const width = Math.min(suit.w * 0.15, suit.h * 0.4 * naturalAspect);
  const height = width / naturalAspect;
  return `<img src="${tie.file}" alt="" class="v3-tie" data-layer="tie" style="left:${percent(suit.x - width / 2, MODEL_WIDTH)}%;top:${percent(LAB_TIE_TOP, MODEL_HEIGHT)}%;width:${percent(width, MODEL_WIDTH)}%;height:${percent(height, MODEL_HEIGHT)}%">`;
}

function spectaclesMarkup(rig) {
  const leftEye = rig.layers.eyeL;
  const rightEye = rig.layers.eyeR;
  if (!leftEye || !rightEye) return "";
  const radius = Math.max(Math.min(leftEye.w, leftEye.h) * 0.6, 16);
  const left = leftEye.x - radius - 8;
  const right = rightEye.x + radius + 8;
  const top = (leftEye.y + rightEye.y) / 2 - radius;
  const height = radius * 2;
  const leftCenter = percent(leftEye.x - left, right - left);
  const rightCenter = percent(rightEye.x - left, right - left);
  const lensSize = percent(radius * 2, right - left);
  const bridgeLeft = leftCenter + lensSize * 0.33;
  const bridgeRight = 100 - rightCenter + lensSize * 0.33;
  return `<span class="v3-spectacles" aria-hidden="true" style="left:${percent(left, MODEL_WIDTH)}%;top:${percent(top, MODEL_HEIGHT)}%;width:${percent(right - left, MODEL_WIDTH)}%;height:${percent(height, MODEL_HEIGHT)}%;--lens-size:${lensSize}%;--left-lens:${leftCenter}%;--right-lens:${rightCenter}%;--bridge-left:${bridgeLeft}%;--bridge-right:${bridgeRight}%"><i class="lens left"></i><i class="lens right"></i><span></span></span>`;
}

function layerMarkup(species, withSpectacles) {
  const rig = engineRigs[species];
  if (!rig) return "";

  const images = Object.entries(rig.layers)
    .filter(([name]) => !["eyeL", "eyeR", "tie"].includes(name))
    .map(([name, layer]) => photoLayer(name, layer))
    .join("");
  return [
    fallbackEarMarkup(rig, species),
    images,
    tieMarkup(rig),
    eyeMarkup(rig.layers.eyeL, "left"),
    eyeMarkup(rig.layers.eyeR, "right"),
    withSpectacles ? spectaclesMarkup(rig) : ""
  ].join("");
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
  button.innerHTML = `<span class="v3-rig ${ANIMATIONS[index % ANIMATIONS.length]}">${layerMarkup(companion.species, SPECTACLES.has(id))}</span>`;
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
  const previousScene = activeScene;
  restoreScene(previousScene);
  activeScene = sceneId;
  stage.dataset.scene = activeScene;
  document.querySelectorAll(".showcase-group").forEach((group) => {
    group.classList.remove("landing", "leaving");
    if (group.dataset.scene === previousScene) {
      group.classList.remove("on");
      group.classList.add("leaving");
      group.addEventListener("animationend", () => group.classList.remove("leaving"), { once: true });
    } else if (group.dataset.scene === activeScene) {
      group.classList.add("on", "landing");
      group.addEventListener("animationend", () => group.classList.remove("landing"), { once: true });
    } else {
      group.classList.remove("on");
    }
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
