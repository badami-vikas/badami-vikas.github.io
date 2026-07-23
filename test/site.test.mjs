import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function page(path) {
  return readFile(new URL(path, root), "utf8");
}

test("home page presents the AI-native transformation narrative", async () => {
  const html = await page("index.html");

  assert.match(html, /There are moments when the old rules stop working\./);
  assert.match(html, /When history looks back at the AI era, where will you stand\?/);
  assert.match(html, /THE NEXT GENERATION OF ORGANIZATIONS ARE <span>AI-native<\/span>/);
  assert.match(html, /Your path to AI-native/);
  assert.match(html, /The future will not belong to the organizations that use the most AI\./);
});

test("home page exposes all requested comparison categories and cycling control", async () => {
  const html = await page("index.html");

  for (const category of ["Steam Engine", "Electricity", "Computer", "Internet"]) {
    assert.match(html, new RegExp(`>${category}<`));
  }
  assert.match(html, /id="generate-case"/);
  assert.match(html, /id="case-image"/);
  assert.match(html, /id="case-transitional"/);
  assert.match(html, /id="case-transformational"/);
});

test("home page exposes five accessible infrastructure levels", async () => {
  const html = await page("index.html");

  const levels = html.match(/class="maturity-level/g) ?? [];
  assert.equal(levels.length, 5);
  assert.match(html, /data-level="1"/);
  assert.match(html, /data-level="5"/);
  assert.match(html, /id="level-detail"/);
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
