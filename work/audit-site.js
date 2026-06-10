const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500).end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(contents);
  });
});

async function run() {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const desktop = await page.evaluate(() => {
    const h1 = getComputedStyle(document.querySelector("h1"));
    const featuredParagraph = getComputedStyle(document.querySelector(".process-card.featured p"));
    return {
      viewport: [innerWidth, innerHeight],
      scrollWidth: document.documentElement.scrollWidth,
      h1Font: h1.fontFamily,
      h1Weight: h1.fontWeight,
      featuredTextColor: featuredParagraph.color,
      title: document.title
    };
  });

  await page.locator('[data-inquiry="Growth package"]').click();
  const selectedInquiry = await page.locator('select[name="need"]').inputValue();

  await page.locator('[data-lang="pl"]').click();
  const polish = {
    heading: await page.locator("h1").innerText(),
    title: await page.title(),
    menuLabel: await page.locator(".menu-button").getAttribute("aria-label")
  };

  await page.screenshot({ path: path.join(__dirname, "audit-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".menu-button").click();

  const mobile = await page.evaluate(() => ({
    viewport: [innerWidth, innerHeight],
    scrollWidth: document.documentElement.scrollWidth,
    menuExpanded: document.querySelector(".menu-button").getAttribute("aria-expanded"),
    navVisible: getComputedStyle(document.querySelector(".nav-links")).display,
    pricingColumns: getComputedStyle(document.querySelector(".package-grid")).gridTemplateColumns
  }));

  await page.screenshot({ path: path.join(__dirname, "audit-mobile.png"), fullPage: true });
  await page.goto(`http://127.0.0.1:${port}/privacy.html`, { waitUntil: "networkidle" });
  const privacyTitle = await page.title();

  await browser.close();
  server.close();

  console.log(JSON.stringify({ desktop, selectedInquiry, polish, mobile, privacyTitle, consoleErrors }, null, 2));
}

run().catch((error) => {
  server.close();
  console.error(error);
  process.exitCode = 1;
});
