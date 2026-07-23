import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
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
  const script = await page("assets/home.js");

  for (const category of ["Steam Engine", "Electricity", "Computer", "Internet"]) {
    assert.match(html, new RegExp(`>${category}<`));
  }
  assert.match(html, /id="generate-case"/);
  assert.match(html, /id="case-image"/);
  assert.match(html, /id="case-transitional"/);
  assert.match(html, /id="case-transformational"/);
  assert.doesNotMatch(html, /class="case-heading"/);
  assert.doesNotMatch(html, /class="case-shade"/);
  assert.ok(html.indexOf('class="case-tabs"') > html.indexOf('class="case-study"'));
  assert.ok(html.indexOf('class="hero-copy"') > html.indexOf("</article>"));
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
  assert.doesNotMatch(html, /level-arrow/);
  assert.doesNotMatch(script, /Remove bottlenecks\. Accelerate decisions\./);
  assert.match(css, /\.maturity-detail\{[^}]*border:0/);
  assert.match(css, /\.maturity-level::after/);
});

test("operating brief is a seven-question modal with final-only submission", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");

  assert.match(html, /data-open-brief/);
  assert.match(html, /Takes less than 2 mins/);
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

test("path cards and compact footer use the requested aligned treatment", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");

  assert.doesNotMatch(html, /class="path-for"/);
  assert.match(css, /\.path-heading>p:last-child\{[^}]*white-space:nowrap/);
  assert.match(css, /\.path-card h3\{[^}]*white-space:nowrap/);
  assert.match(css, /\.path-best\{[^}]*margin-top:auto/);
  assert.match(html, /<footer class="footer compact-footer">/);
});

test("the former home experience lives at Platform", async () => {
  const html = await page("platform/index.html");

  assert.match(html, /Your Zazoo never stops\./);
  assert.match(html, /Everyone deserves a Zazoo\./);
  assert.match(html, /\.\.\/assets\/zazoo\.css/);
});

test("Consulting is renamed Labs while legacy links remain recoverable", async () => {
  const labs = await page("labs.html");
  const legacy = await page("consulting.html");

  assert.match(labs, /<title>Labs\. Zazoo<\/title>/);
  assert.match(labs, />Labs<\/a>/);
  assert.match(legacy, /url=labs\.html/);
});

test("all supplied comparison imagery is available to the home page", async () => {
  const images = await readdir(new URL("assets/comparison-case-studies/", root));

  assert.equal(images.filter((name) => name.endsWith(".jpg")).length, 17);
});
