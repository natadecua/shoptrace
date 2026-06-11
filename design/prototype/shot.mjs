import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import path from "path";

const execPath = await chromium.executablePath();
console.log("chromium:", execPath);
const browser = await puppeteer.launch({
  args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
  executablePath: execPath,
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 1480, height: 1024, deviceScaleFactor: 2 });
await page.goto("file://" + path.resolve("index.html"), { waitUntil: "networkidle0" });
try { await page.evaluate(() => document.fonts.ready); } catch {}
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: "shoptrace.png", fullPage: true });
await browser.close();
console.log("screenshot done");
