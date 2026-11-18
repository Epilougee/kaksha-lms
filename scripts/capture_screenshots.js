import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('report', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('1. Capturing Login Screen...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, '01-login.png') });

  console.log('2. Logging in as Student 1 (Aarav Sharma)...');
  await page.click('button:has-text("Student (Aarav - 90%)")');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/student', { timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '02-student-dashboard.png') });

  console.log('3. Capturing Student Courses (Enrolled)...');
  await page.goto('http://localhost:3000/student/courses', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '03-student-courses.png') });

  console.log('4. Capturing Course Store & KakshaPay Modal...');
  await page.click('button:has-text("Course Store & Electives")');
  await page.waitForTimeout(1000);
  // Find Purchase Course button for course 4 or 5
  const purchaseBtn = await page.locator('button:has-text("Purchase Course")').first();
  if (await purchaseBtn.isVisible()) {
    await purchaseBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: path.join(outDir, '04-course-store-modal.png') });

  // Close modal if open
  const closeBtn = await page.locator('button:has(.fa-xmark)').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  console.log('5. Capturing Course Detail...');
  await page.goto('http://localhost:3000/student/courses/1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '05-course-detail.png') });

  console.log('6. Capturing Student Assignments...');
  await page.goto('http://localhost:3000/student/assignments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '06-student-assignments.png') });

  console.log('7. Logging out and logging in as Teacher (Dr. Ramesh Iyer)...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.click('button:has-text("Faculty (Dr. Ramesh)")');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/teacher', { timeout: 10000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, '07-teacher-dashboard.png') });

  console.log('8. Capturing Teacher Course Editor...');
  await page.goto('http://localhost:3000/teacher/courses/1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '08-teacher-course-editor.png') });

  console.log('9. Capturing Teacher Grading Console...');
  await page.goto('http://localhost:3000/teacher/grading', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '09-teacher-grading.png') });

  console.log('10. Capturing Teacher Students & Attendance Roster...');
  await page.goto('http://localhost:3000/teacher/students', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outDir, '10-teacher-students.png') });

  console.log('All 10 screenshots captured successfully in report/screenshots!');
  await browser.close();
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
