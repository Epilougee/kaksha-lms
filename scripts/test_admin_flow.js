import { chromium } from 'playwright';

async function testAdminFlow() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- Step 1: Login as Admin ---');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Admin (Director)")');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/admin', { timeout: 10000 });
  console.log('Admin landed on:', page.url());

  console.log('--- Step 2: Admin adds new Faculty Member ---');
  await page.click('button:has-text("Add Faculty or Student")');
  await page.waitForTimeout(500);
  await page.fill('#userName', 'Prof. Alok Sharma');
  await page.fill('#userEmail', 'alok.sharma@college.edu');
  await page.fill('#userPass', 'ProfAlok@2026');
  await page.fill('#dept', 'Artificial Intelligence');
  await page.click('button:has-text("Create Faculty Account")');
  await page.waitForTimeout(1500);
  console.log('Faculty creation submitted!');

  console.log('--- Step 3: Admin adds new Student Scholar ---');
  await page.click('button:has-text("Student (Scholar)")');
  await page.fill('#userName', 'Kavita Iyer');
  await page.fill('#userEmail', 'kavita.iyer@student.edu');
  await page.fill('#userPass', 'KavitaPass#42');
  await page.fill('#dept', 'BCA Semester IV');
  await page.click('button:has-text("Create Student Account")');
  await page.waitForTimeout(1500);
  console.log('Student creation submitted!');
  await page.click('button:has-text("Close")');
  await page.waitForTimeout(500);

  console.log('--- Step 4: Logout from Admin ---');
  await page.click('button:has-text("Sign Out")');
  await page.waitForURL('**/login', { timeout: 10000 });
  console.log('Logged out to login page.');

  console.log('--- Step 5: Test login as new Faculty (alok.sharma@college.edu) ---');
  await page.fill('input[type="email"]', 'alok.sharma@college.edu');
  await page.fill('input[type="password"]', 'ProfAlok@2026');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/teacher', { timeout: 10000 });
  console.log('SUCCESS! Faculty logged in and redirected to:', page.url());
  const facultyHeader = await page.locator('.topbar-user').textContent();
  console.log('Faculty Topbar User:', facultyHeader);

  console.log('--- Step 6: Logout Faculty ---');
  await page.click('button:has-text("Sign Out")');
  await page.waitForURL('**/login', { timeout: 10000 });

  console.log('--- Step 7: Test login as new Student (kavita.iyer@student.edu) ---');
  await page.fill('input[type="email"]', 'kavita.iyer@student.edu');
  await page.fill('input[type="password"]', 'KavitaPass#42');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/student', { timeout: 10000 });
  console.log('SUCCESS! Student logged in and redirected to:', page.url());
  const studentHeader = await page.locator('.topbar-user').textContent();
  console.log('Student Topbar User:', studentHeader);

  await browser.close();
  console.log('=== ALL ADMIN & NEW CREDENTIAL LOGIN TESTS PASSED PERFECTLY! ===');
}

testAdminFlow().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
