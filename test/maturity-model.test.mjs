import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import maturityModelData from "../assets/maturity-model-data.js";

const { functions, getContent, stages } = maturityModelData;

const root = new URL("../", import.meta.url);

async function page(path) {
  return readFile(new URL(path, root), "utf8");
}

function collectStrings(value, results = []) {
  if (typeof value === "string") {
    results.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, results));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, results));
  }
  return results;
}

test("the maturity model exposes the full five-stage journey", async () => {
  const html = await page("maturity-model/index.html");

  assert.equal(stages.length, 5);
  for (const stage of ["Ask", "Direct", "Multiply", "Extend", "Reinvent"]) {
    assert.match(html, new RegExp(`>${stage}<`));
  }
  assert.equal((html.match(/class="stage-tab/g) ?? []).length, 5);
  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tabpanel"/);
});

test("General is the default and business functions can be selected", async () => {
  const html = await page("maturity-model/index.html");

  assert.match(html, /<option value="general">General<\/option>/);
  for (const option of ["Human Resources", "Finance", "Sales", "Marketing", "Operations", "Engineering"]) {
    assert.match(html, new RegExp(`>${option}<`));
  }
  assert.deepEqual(Object.keys(functions), [
    "general",
    "hr",
    "finance",
    "sales",
    "marketing",
    "operations",
    "engineering"
  ]);
});

test("every function and stage supports neutral and Zazoo views", () => {
  for (const functionId of Object.keys(functions)) {
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex += 1) {
      for (const zazooEnabled of [false, true]) {
        const content = getContent(functionId, stageIndex, zazooEnabled);
        assert.ok(content.headline.length > 12);
        assert.ok(content.title.length > 8);
        assert.equal(content.points.length, 3);
        content.points.forEach((point) => assert.match(point, /[.!?]$/));
      }
    }
  }
});

test("visitor-facing model copy contains no colons", async () => {
  const html = await page("maturity-model/index.html");
  const visibleHtml = html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");

  assert.doesNotMatch(visibleHtml, /:/);
  for (const text of collectStrings({ stages, functions })) {
    assert.doesNotMatch(text, /:/);
  }

  for (const functionId of Object.keys(functions)) {
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex += 1) {
      assert.doesNotMatch(getContent(functionId, stageIndex, false).headline, /:/);
      assert.doesNotMatch(getContent(functionId, stageIndex, true).headline, /:/);
    }
  }
});

test("the Zazoo switch changes the same panel in place", async () => {
  const html = await page("maturity-model/index.html");
  const script = await page("assets/maturity-model.js");

  assert.match(html, /role="switch" aria-checked="false"/);
  assert.match(html, /See how Zazoo helps/);
  assert.equal((html.match(/id="stage-panel"/g) ?? []).length, 1);
  assert.match(script, /zazooEnabled = !zazooEnabled/);
  assert.match(script, /getContent\(activeFunction, activeStage, zazooEnabled\)/);
});

test("the page runs without JavaScript module loading", async () => {
  const html = await page("maturity-model/index.html");

  assert.doesNotMatch(html, /type="module"/);
  assert.match(html, /src="\.\.\/assets\/maturity-model-data\.js"/);
  assert.match(html, /<ul id="panel-points">[\s\S]*A general-purpose LLM/);
  assert.doesNotMatch(html, /maturity-model-data\.mjs/);
});

test("the model contrasts a composed tool stack with Zazoo", () => {
  const withoutZazoo = getContent("finance", 1, false);
  const withZazoo = getContent("finance", 1, true);

  assert.match(withoutZazoo.points[0], /LLM/);
  assert.match(withoutZazoo.points[0], /workflow automation tool/);
  assert.match(withoutZazoo.points[0], /accounting, planning, procurement/);
  assert.match(withoutZazoo.points[1], /scales/);
  assert.match(withoutZazoo.points[2], /measured/);
  assert.match(withZazoo.points[0], /^Zazoo/);
  assert.match(withZazoo.points[1], /^Zazoo scales/);
  assert.match(withZazoo.points[2], /^Progress is measured/);
});

test("the evaluation CTA opens the existing diagnostic", async () => {
  const model = await page("maturity-model/index.html");
  const home = await page("index.html");
  const brief = await page("assets/operating-brief.mjs");

  assert.match(model, /Find your custom path to AI-native/);
  assert.match(model, /Get My Business AI Infra Evaluation/);
  assert.match(model, /Takes less than 2 mins/);
  assert.match(model, /\.\.\/index\.html\?brief=open/);
  assert.match(home, /Get My Business AI Infra Evaluation/);
  assert.match(brief, /get\("brief"\) === "open"/);
});
