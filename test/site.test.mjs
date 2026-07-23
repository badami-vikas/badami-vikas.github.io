import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";
import { scoreBrief } from "../assets/operating-brief.mjs";

const root = new URL("../", import.meta.url);

async function page(path) {
  return readFile(new URL(path, root), "utf8");
}

test("home page presents the AI-native transformation narrative", async () => {
  const html = await page("index.html");

  assert.doesNotMatch(html, /The AI era is an organizational event/);
  assert.match(html, /There are moments when the old rules stop working\./);
  assert.match(html, /When history looks back at the AI era, where will you stand\?/);
  assert.match(html, /THE NEXT GENERATION OF ORGANIZATIONS ARE <span>AI-native<\/span>/);
  assert.match(html, /Your path to AI-native/);
  assert.match(html, /The future will not belong to the organizations that use the most AI\./);
});

test("home page exposes all requested comparison categories and cycling control", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");
  const script = await page("assets/home.js");

  for (const category of ["Steam Engine", "Electricity", "Computer", "Internet", "AI"]) {
    assert.match(html, new RegExp(`>${category}<`));
  }
  assert.match(html, /id="case-coming-soon"/);
  assert.match(html, /Coming soon/);
  assert.match(html, /id="generate-case"/);
  assert.match(html, /id="case-image"/);
  assert.match(html, /id="case-transitional"/);
  assert.match(html, /id="case-transformational"/);
  assert.doesNotMatch(html, /class="case-heading"/);
  assert.doesNotMatch(html, /class="case-shade"/);
  assert.ok(html.indexOf('class="case-tabs"') > html.indexOf('class="case-study"'));
  assert.ok(html.indexOf('class="hero-copy"') < html.indexOf('class="hero-question"'));
  assert.ok(html.indexOf("Book a Strategy Session") > html.indexOf('id="generate-case"'));
  assert.doesNotMatch(html, /Assess Your Organization/);
  assert.match(css, /\.case-tabs\{[^}]*top:34px/);
  assert.match(css, /\.case-copy\{[^}]*background:rgba\(/);
  assert.match(script, /\*\*The steam engine\*\* is a better source of power\./);
  assert.match(script, /By replacing water wheels with steam engines, manufacturers powered existing mills more reliably\./);
  assert.match(script, /By preserving existing workflows, they built \*\*better mills\*\*\./);
});

test("home page exposes five accessible infrastructure levels", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");
  const script = await page("assets/home.js");

  const levels = html.match(/class="maturity-level/g) ?? [];
  assert.equal(levels.length, 5);
  assert.match(html, /data-level="1"/);
  assert.match(html, /data-level="5"/);
  assert.match(html, /id="level-detail"/);
  assert.equal((html.match(/class="zazo-footprint"/g) ?? []).length, 5);
  assert.doesNotMatch(html, /level-arrow/);
  assert.doesNotMatch(html, /Hover or select a level to explore it/);
  assert.doesNotMatch(script, /Remove bottlenecks\. Accelerate decisions\./);
  assert.doesNotMatch(script, /lockedLevel/);
  assert.doesNotMatch(script, /button\.addEventListener\("click"/);
  assert.match(css, /\.maturity-detail\{[^}]*border:0/);
  assert.match(css, /\.maturity-level::after/);
  assert.match(css, /\.maturity-scale\{[^}]*max-width:/);
  assert.match(css, /\.maturity-level:hover \.zazo-footprint/);
});

test("operating brief is a seven-question modal with final-only submission", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");

  assert.match(html, /data-open-brief/);
  assert.match(html, /data-open-brief[^>]*>[\s\S]*Takes less than 2 mins[\s\S]*<\/button>/);
  assert.match(html, /<dialog[^>]+id="brief-dialog"/);
  assert.equal((html.match(/class="brief-question/g) ?? []).length, 7);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="profession"/);
  assert.match(html, />Send me the report</);
  assert.doesNotMatch(html, /id="brief-back"/);
  assert.match(css, /body:has\(\.brief-dialog\[open\]\)\{overflow:hidden\}/);
  assert.match(css, /\.brief-question legend[^}]*text-align:center/);
});

test("brief scoring returns dominant pattern and diagnostic dimensions", () => {
  const result = scoreBrief([3, 3, 4, 4, 3, 3, 4]);

  assert.equal(result.currentLayer, "Shared Workflow Maturity");
  assert.equal(result.dimensions.intelligenceFlow, 3);
  assert.equal(result.dimensions.governanceScale, 4);
  assert.equal(result.dimensions.leadershipLearning, 3);
  assert.equal(result.dimensions.readiness, 4);
  assert.match(result.bottleneck, /context|leadership|learning/i);
  assert.equal(result.nextMove, "Redesign one high-volume process as a governed AI workflow");
});

test("path cards and restored footer use the requested treatment", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");

  assert.doesNotMatch(html, /class="path-for"/);
  assert.match(css, /\.path-heading>p:last-child\{[^}]*white-space:nowrap/);
  assert.match(css, /\.path-card h3\{[^}]*white-space:nowrap/);
  assert.match(css, /\.path-best\{[^}]*margin-top:auto/);
  assert.match(html, /Research and Training Lab/);
  assert.doesNotMatch(html, /Leadership for the AI Era/);
  assert.doesNotMatch(html, /culture for organizations where AI-native/);
  assert.match(css, /\.path-section \.wrap\{[^}]*max-width:1280px/);
  assert.match(html, /<footer class="future-footer">/);
  assert.match(html, /type="email"[^>]+placeholder="Work email"/);
  assert.match(html, />Subscribe to the newsletter</);
});

test("the former home experience lives at Platform", async () => {
  const html = await page("platform/index.html");
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

  assert.match(html, /Everyone deserves a ZAZO\./);
  assert.match(html, /Your AI Chief of Staff built with enterprise grade trust\./);
  assert.match(html, /Zazo \/za·zoo\//);
  assert.match(html, /1 Zazo\. 100s of hours returned\. 1000s of decisions coordinated\. 1000000s of tiny tasks never forgotten\./);
  assert.match(html, /Built for enterprise trust\./);
  assert.match(html, /Always present\.<\/div><div class="r">Never intrusive\./);
  assert.match(html, /Always helpful\.<\/div><div class="r">Never in control\./);
  assert.match(html, /Trusted by ambitious teams building the future\./);
  assert.match(html, /class="platform-story"/);
  assert.match(html, /id="all-zazos"/);
  assert.match(css, /\.zazo-frame\{[^}]*aspect-ratio:4\/3/);
  assert.match(css, /\.zazo-sticky\{[^}]*position:sticky/);
  assert.ok(html.indexOf('id="chapters"') > html.indexOf("Trusted by ambitious teams building the future."));
  assert.match(html, /\.\.\/assets\/zazoo\.css/);
});

test("Consulting is renamed Labs while legacy links remain recoverable", async () => {
  const labs = await page("labs.html");
  const legacy = await page("consulting.html");

  assert.match(labs, /<title>Labs\. Zazoo<\/title>/);
  assert.match(labs, />Labs<\/a>/);
  assert.match(labs, />Assess Your Organization</);
  assert.match(legacy, /url=labs\.html/);
});

test("all supplied comparison imagery is converted to compact WebP", async () => {
  const images = await readdir(new URL("assets/comparison-case-studies/", root));
  const webp = images.filter((name) => name.endsWith(".webp"));
  const sizes = await Promise.all(webp.map((name) => stat(new URL(`assets/comparison-case-studies/${name}`, root))));
  const html = await page("index.html");
  const script = await page("assets/home.js");

  assert.equal(webp.length, 17);
  assert.equal(images.filter((name) => name.endsWith(".jpg")).length, 0);
  assert.ok(sizes.reduce((sum, entry) => sum + entry.size, 0) < 3_000_000);
  assert.match(html, /steam-manufacturing\.webp/);
  assert.doesNotMatch(script, /\.jpg/);
});
