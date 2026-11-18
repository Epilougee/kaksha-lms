import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 }, // standard A4 @ 96 DPI
  });

  const htmlPath = path.resolve('report', 'report.html');
  const fileUrl = `file://${htmlPath.replace(/\\/g, '/')}`;
  console.log(`Loading HTML report from: ${fileUrl}`);

  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check scroll heights of each page to ensure no overflow
  const pagesData = await page.evaluate(() => {
    const pages = document.querySelectorAll('.page');
    return Array.from(pages).map((p, idx) => ({
      pageIndex: idx + 1,
      scrollHeight: p.scrollHeight,
      clientHeight: p.clientHeight,
      overflow: p.scrollHeight > p.clientHeight,
    }));
  });

  console.log('Page Height Inspection:');
  let hasOverflow = false;
  pagesData.forEach((p) => {
    console.log(`Page ${p.pageIndex}: scrollHeight = ${p.scrollHeight}px, clientHeight = ${p.clientHeight}px, overflow = ${p.overflow}`);
    if (p.overflow) hasOverflow = true;
  });

  const pdfPath = path.resolve('report', 'Kaksha_LMS_Report.pdf');
  console.log(`Exporting PDF to: ${pdfPath}`);

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
  });

  console.log('PDF exported successfully!');

  // Now render pages 1, 5, 6, and 8 to PNG for visual inspection
  const inspectDir = path.resolve('report', 'inspection');
  if (!fs.existsSync(inspectDir)) fs.mkdirSync(inspectDir, { recursive: true });

  const pageElements = await page.locator('.page').all();
  console.log(`Total .page elements found: ${pageElements.length}`);

  const targetPages = [1, 5, 6, 8];
  for (const pageNum of targetPages) {
    if (pageElements[pageNum - 1]) {
      const outPng = path.join(inspectDir, `page-${pageNum}.png`);
      await pageElements[pageNum - 1].screenshot({ path: outPng });
      console.log(`Captured preview: ${outPng}`);
    }
  }

  await browser.close();
  return { pageCount: pageElements.length, hasOverflow };
}

run().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
