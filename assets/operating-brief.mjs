const LAYERS = {
  1: "Individual Work",
  2: "AI-Assisted Work",
  3: "Shared Workflow Maturity",
  4: "AI-Native Operating Model",
  5: "Compounding Organization"
};

const DIAGNOSTICS = {
  intelligenceFlow: {
    bottleneck: "Useful context is not yet compounding across work.",
    unlock: "Capture reusable context so every task strengthens organizational memory."
  },
  governanceScale: {
    bottleneck: "Governance sits outside the work, so friction remains high.",
    unlock: "Embed governance into workflows so safe action is the default."
  },
  leadershipLearning: {
    bottleneck: "Leadership and learning are not yet designed as reusable organizational capabilities.",
    unlock: "Redesign leadership around scaling intelligence and learning."
  },
  readiness: {
    bottleneck: "Onboarding still depends on people and tribal knowledge.",
    unlock: "Build onboarding into shared memory, standards, and workflows."
  }
};

function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function dominantScore(answers) {
  const counts = [0, 0, 0, 0, 0, 0];
  answers.forEach((answer) => { counts[answer] += 1; });
  const highest = Math.max(...counts);
  const tied = counts
    .map((count, score) => ({ count, score }))
    .filter((entry) => entry.score > 0 && entry.count === highest)
    .map((entry) => entry.score);
  if (tied.length === 1) return tied[0];
  return Math.max(1, Math.min(5, Math.round(average(answers))));
}

export function scoreBrief(rawAnswers) {
  const answers = rawAnswers.map(Number);
  if (answers.length !== 7 || answers.some((answer) => !Number.isInteger(answer) || answer < 1 || answer > 5)) {
    throw new TypeError("Seven answers scored from 1 to 5 are required.");
  }

  const dimensions = {
    intelligenceFlow: average(answers.slice(0, 2)),
    governanceScale: average(answers.slice(2, 4)),
    leadershipLearning: average(answers.slice(4, 6)),
    readiness: answers[6]
  };
  const bottleneckKey = Object.entries(dimensions).reduce((lowest, current) => (
    current[1] < lowest[1] ? current : lowest
  ))[0];
  const diagnostic = DIAGNOSTICS[bottleneckKey];

  return {
    currentLayer: LAYERS[dominantScore(answers)],
    bottleneck: diagnostic.bottleneck,
    unlock: diagnostic.unlock,
    nextMove: "Redesign one high-volume process as a governed AI workflow",
    dimensions
  };
}

function initBrief() {
  const dialog = document.getElementById("brief-dialog");
  const form = document.getElementById("brief-form");
  if (!dialog || !form) return;

  const steps = Array.from(form.querySelectorAll("[data-brief-step]"));
  const progress = document.getElementById("brief-progress-bar");
  const stepCount = document.getElementById("brief-step-count");
  const next = document.getElementById("brief-next");
  const submit = document.getElementById("brief-submit");
  const error = document.getElementById("brief-error");
  let step = 0;

  function paintStep() {
    steps.forEach((item, index) => { item.hidden = index !== step; });
    next.hidden = step === steps.length - 1;
    submit.hidden = step !== steps.length - 1;
    progress.style.width = ((step + 1) / steps.length * 100) + "%";
    stepCount.textContent = step < 7 ? "Question " + (step + 1) + " of 7" : "Your details";
    error.hidden = true;
    const focusTarget = steps[step].querySelector("input");
    if (focusTarget) window.setTimeout(() => focusTarget.focus(), 40);
  }

  function currentStepIsValid() {
    if (step < 7) {
      const checked = steps[step].querySelector("input:checked");
      if (!checked) {
        const first = steps[step].querySelector("input");
        if (first) first.focus();
        return false;
      }
    }
    return true;
  }

  function openBrief() {
    form.reset();
    step = 0;
    submit.disabled = false;
    submit.textContent = "Send me the report";
    paintStep();
    dialog.showModal();
  }

  document.querySelectorAll("[data-open-brief]").forEach((button) => {
    button.addEventListener("click", openBrief);
  });
  dialog.querySelector("[data-close-brief]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  next.addEventListener("click", () => {
    if (!currentStepIsValid()) return;
    step += 1;
    paintStep();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const endpoint = document.querySelector('meta[name="operating-brief-endpoint"]')?.content;
    if (!endpoint) {
      error.textContent = "The report service is temporarily unavailable. Please try again shortly.";
      error.hidden = false;
      return;
    }

    const data = new FormData(form);
    const answers = Array.from({ length: 7 }, (_, index) => Number(data.get("q" + (index + 1))));
    const answerText = Array.from({ length: 7 }, (_, index) => {
      const selected = form.querySelector('input[name="q' + (index + 1) + '"]:checked');
      return selected?.closest("label")?.querySelector("span")?.textContent || "";
    });
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      profession: String(data.get("profession") || "").trim(),
      answers,
      answerText,
      result: scoreBrief(answers),
      submittedFrom: location.href
    };

    submit.disabled = true;
    submit.textContent = "Saving…";
    error.hidden = true;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Submission failed");
      submit.textContent = "Saved";
      window.setTimeout(() => dialog.close(), 350);
    } catch {
      submit.disabled = false;
      submit.textContent = "Send me the report";
      error.textContent = "We could not save your responses. Please try again.";
      error.hidden = false;
    }
  });

  paintStep();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initBrief);
}
