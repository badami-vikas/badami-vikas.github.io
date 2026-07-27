const { functions, getContent, stages } = window.MaturityModelData;

const functionSelect = document.querySelector("#function-select");
const zazooSwitch = document.querySelector("#zazoo-switch");
const stageTabs = Array.from(document.querySelectorAll(".stage-tab"));
const stagePanel = document.querySelector("#stage-panel");
const panelContent = document.querySelector("#panel-content");
const panelLevel = document.querySelector("#panel-level");
const panelContext = document.querySelector("#panel-context");
const panelStageTitle = document.querySelector("#panel-stage-title");
const panelHeadline = document.querySelector("#panel-headline");
const panelPoints = document.querySelector("#panel-points");
const previousButton = document.querySelector("#previous-stage");
const nextButton = document.querySelector("#next-stage");
const journeyProgress = document.querySelector("#journey-progress");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeStage = 0;
let activeFunction = "general";
let zazooEnabled = false;

function paint() {
  const content = getContent(activeFunction, activeStage, zazooEnabled);
  const selectedFunction = functions[activeFunction] ?? functions.general;

  panelLevel.textContent = `Level ${activeStage + 1}`;
  panelContext.textContent = zazooEnabled
    ? activeFunction === "general"
      ? "With Zazoo"
      : `${selectedFunction.name} with Zazoo`
    : activeFunction === "general"
      ? "Without Zazoo"
      : `${selectedFunction.name} without Zazoo`;
  panelStageTitle.textContent = content.title;
  panelHeadline.textContent = content.headline;
  panelPoints.replaceChildren(
    ...content.points.map((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      return item;
    })
  );

  stageTabs.forEach((tab, index) => {
    const isActive = index === activeStage;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  stagePanel.classList.toggle("is-zazoo", zazooEnabled);
  previousButton.disabled = activeStage === 0;
  nextButton.disabled = activeStage === stages.length - 1;
  journeyProgress.textContent = `Level ${activeStage + 1} of ${stages.length}`;
}

function updateContent() {
  if (reducedMotion.matches) {
    paint();
    return;
  }

  panelContent.classList.add("is-changing");
  window.setTimeout(() => {
    paint();
    panelContent.classList.remove("is-changing");
  }, 120);
}

function setStage(nextStage, focusTab = false) {
  activeStage = Math.max(0, Math.min(stages.length - 1, nextStage));
  updateContent();
  if (focusTab) {
    stageTabs[activeStage].focus();
  }
}

functionSelect.addEventListener("change", (event) => {
  activeFunction = event.target.value;
  updateContent();
});

zazooSwitch.addEventListener("click", () => {
  zazooEnabled = !zazooEnabled;
  zazooSwitch.setAttribute("aria-checked", String(zazooEnabled));
  updateContent();
});

stageTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setStage(index));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    if (event.key === "Home") {
      setStage(0, true);
    } else if (event.key === "End") {
      setStage(stages.length - 1, true);
    } else {
      setStage(activeStage + (event.key === "ArrowRight" ? 1 : -1), true);
    }
  });
});

previousButton.addEventListener("click", () => setStage(activeStage - 1));
nextButton.addEventListener("click", () => setStage(activeStage + 1));

paint();
