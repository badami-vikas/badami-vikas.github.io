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
  assert.doesNotMatch(html, /class="case-heading"/);
  assert.doesNotMatch(html, /class="case-shade"/);
  assert.ok(
    html.indexOf('class="case-tabs"') > html.indexOf('class="case-study"'),
    "comparison toggles should be overlaid inside the image"
  );
  assert.ok(
    html.indexOf('class="hero-copy"') > html.indexOf("</article>") &&
      html.indexOf('class="hero-copy"') < html.indexOf('class="cta-row"'),
    "paradigm-shift copy should sit below the image and above its CTAs"
  );
  assert.match(script, /\*\*The steam engine\*\* is a better source of power\./);
  assert.match(script, /By replacing water wheels with steam engines, manufacturers powered existing mills more reliably\./);
  assert.match(script, /By preserving existing workflows, they built \*\*better mills\*\*\./);
  assert.match(script, /\*\*The steam engine\*\* is a new way to organize production\./);
  assert.match(script, /By centralizing workers and machines around steam power, manufacturers coordinated specialized production at unprecedented scale\./);
  assert.match(script, /By redesigning work around centralized production, they created the \*\*factory system\*\*\./);
});

test("home page exposes five accessible infrastructure levels", async () => {
  const html = await page("index.html");
  const script = await page("assets/home.js");

  const levels = html.match(/class="maturity-level/g) ?? [];
  assert.equal(levels.length, 5);
  assert.match(html, /data-level="1"/);
  assert.match(html, /data-level="5"/);
  assert.match(html, /id="level-detail"/);
  assert.doesNotMatch(html, /level-arrow/);
  assert.doesNotMatch(script, /Remove bottlenecks\. Accelerate decisions\./);
  assert.match(html, /Takes less than 2 mins/);
});

test("three main sections are composed as single desktop viewports", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");

  assert.equal((html.match(/class="screen-section/g) ?? []).length, 3);
  assert.match(css, /height:calc\(100svh - 68px\)/);
  assert.match(css, /overflow:hidden/);
});

test("operating brief is a seven-question accessible dialog", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");
  const script = await page("assets/operating-brief.mjs");

  assert.match(html, /data-open-brief/);
  assert.match(html, /<dialog[^>]+id="brief-dialog"/);
  assert.equal((html.match(/class="brief-question/g) ?? []).length, 7);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="profession"/);
  assert.match(html, />Send me the report</);
  assert.doesNotMatch(html, /id="brief-back"/);
  assert.doesNotMatch(script, /brief-back/);
  assert.match(css, /body:has\(\.brief-dialog\[open\]\)\{overflow:hidden\}/);
  assert.match(css, /\.brief-question legend[^}]*text-align:center/);
  assert.match(css, /\.brief-question label\{[^}]*display:flex[^}]*width:100%/);
});

test("desktop composition encodes the requested compact line and column layout", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");

  assert.match(css, /\.hero-question\{[^}]*white-space:nowrap/);
  assert.match(css, /\.native-heading h2\{[^}]*white-space:nowrap/);
  assert.match(css, /\.native-heading p\{[^}]*white-space:nowrap/);
  assert.match(css, /\.maturity\{[^}]*grid-template-columns:minmax\(0,\.94fr\) minmax\(0,1\.06fr\)/);
  assert.match(css, /\.path-heading p\{[^}]*white-space:nowrap/);
  assert.match(css, /\.path-card h3\{[^}]*white-space:nowrap/);
  assert.doesNotMatch(html, /class="path-for"/);
});

test("the 9112049 visual foundation and original compact footer are retained", async () => {
  const html = await page("index.html");
  const css = await page("assets/home.css");

  assert.match(css, /\.hero h1\{font:700 clamp\(38px,4\.6vw,66px\)/);
  assert.match(css, /\.path-card\{[^}]*padding:clamp\(20px,2\.3vw,30px\)/);
  assert.match(css, /\.maturity-level strong\{[^}]*clamp\(16px,1\.65vw,20px\)/);
  assert.match(html, /<footer class="footer compact-footer">/);
  assert.match(css, /\.compact-footer\{padding:30px 0 20px\}/);
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

test("home footer uses the compact Platform-page treatment", async () => {
  const html = await page("index.html");

  assert.match(html, /<footer class="footer compact-footer">/);
  assert.doesNotMatch(html, /future-footer/);
});
