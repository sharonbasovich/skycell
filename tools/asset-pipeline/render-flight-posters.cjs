/**
 * Deterministic first-party browser asset capture. Run while Vite serves repo.
 * No production entrypoint imports this fixture; no other website is visited.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs/promises");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "../..");
const bundledPackages = path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules");
let playwright;
try { playwright = require("playwright"); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE_PATH || path.join(bundledPackages, "playwright")); }
const base = process.env.POSTER_BASE_URL || "http://127.0.0.1:8080";
const chrome = process.env.CHROME_EXECUTABLE || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const scratch = process.env.POSTER_CAPTURE_DIR || path.resolve(root, "../skycell-cinematic-assets/flight-posters");
const output = path.join(root, "public/posters");

async function capture(browser, mode, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  const failures = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => failures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.origin === new URL(base).origin ? route.continue() : route.abort("blockedbyclient");
  });
  const response = await page.goto(`${base}/tools/asset-pipeline/flight-poster.html?mode=${mode}`, { waitUntil: "networkidle", timeout: 60000 });
  if (!response?.ok()) throw new Error(`Fixture response: ${response?.status()}`);
  await page.waitForFunction(() => document.documentElement.dataset.posterReady === "true" || document.documentElement.dataset.posterError, undefined, { timeout: 60000 });
  const state = await page.evaluate(() => ({ ...document.documentElement.dataset }));
  if (state.posterError) throw new Error(state.posterError);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const screenshot = path.join(scratch, `flight-${mode}-capture.png`);
  await page.screenshot({ path: screenshot, type: "png", omitBackground: true, animations: "disabled" });
  if (errors.length || failures.length) throw new Error(JSON.stringify({ errors, failures }));
  await context.close();
  return { mode, viewport, screenshot, state, consoleErrors: errors, failedRequests: failures };
}

async function main() {
  await fs.mkdir(scratch, { recursive: true });
  await fs.mkdir(output, { recursive: true });
  const browser = await playwright.chromium.launch({
    executablePath: chrome,
    headless: true,
    args: ["--use-angle=d3d11", "--disable-background-timer-throttling", "--disable-renderer-backgrounding"],
  });
  const results = [];
  try {
    // Serial GPU captures, never parallel with each other or other browser QA.
    results.push(await capture(browser, "rig", { width: 600, height: 1200 }));
    results.push(await capture(browser, "earth", { width: 1440, height: 900 }));
  } finally { await browser.close(); }

  const python = String.raw`
import hashlib, json, sys
from pathlib import Path
from PIL import Image
scratch, output = map(Path, sys.argv[1:])
result = {}
rig = Image.open(scratch/'flight-rig-capture.png').convert('RGBA')
alpha = rig.getchannel('A')
bounds = alpha.getbbox()
assert bounds, 'Rig capture is empty'
assert min(bounds[0], bounds[1], rig.width-bounds[2], rig.height-bounds[3]) > 2, 'Rig touches source capture edge'
w, h = bounds[2]-bounds[0], bounds[3]-bounds[1]
px, py = max(2, round(w*.03)), max(2, round(h*.03))
crop = (max(0,bounds[0]-px), max(0,bounds[1]-py), min(rig.width,bounds[2]+px), min(rig.height,bounds[3]+py))
rig = rig.crop(crop)
rig_path = output/'flight-rig.webp'
rig.save(rig_path, 'WEBP', quality=92, method=6, exact=True)
check = Image.open(rig_path).convert('RGBA')
hist = check.getchannel('A').histogram()
assert hist[0] > 0 and sum(hist[1:]) > 0 and sum(hist[1:255]) > 0, 'True alpha required'
result['rig'] = {'dimensions':check.size,'bytes':rig_path.stat().st_size,'sha256':hashlib.sha256(rig_path.read_bytes()).hexdigest(),'source_alpha_bounds':bounds,'crop_with_3pct_padding':crop,'transparent_fraction':hist[0]/(check.width*check.height),'partial_alpha_fraction':sum(hist[1:255])/(check.width*check.height),'alpha_range':check.getchannel('A').getextrema()}
earth = Image.open(scratch/'flight-earth-capture.png').convert('RGBA')
assert earth.getchannel('A').getextrema() == (255,255), 'Earth must fill the opaque background'
earth_path = output/'flight-earth.webp'
earth.convert('RGB').save(earth_path, 'WEBP', quality=86, method=6)
result['earth'] = {'dimensions':earth.size,'bytes':earth_path.stat().st_size,'sha256':hashlib.sha256(earth_path.read_bytes()).hexdigest(),'opaque':True}
(scratch/'poster-image-metadata.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result))
`;
  const converted = spawnSync(process.env.PYTHON_BIN || "python", ["-c", python, scratch, output], { cwd: root, encoding: "utf8" });
  if (converted.status !== 0) throw new Error(converted.stderr || converted.stdout);
  const images = JSON.parse(converted.stdout.trim());
  const report = { fixture: "tools/asset-pipeline/flight-poster.html", base, chrome, results, images };
  await fs.writeFile(path.join(scratch, "poster-render-report.json"), JSON.stringify(report, null, 2));
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
