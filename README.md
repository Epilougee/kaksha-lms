# Kaksha LMS (कक्षा)
A clean, robust, and serverless Learning Management System for colleges, built with Next.js 14 App Router and Supabase.

---

## 1. Quick Start & Local Setup

### Prerequisites
- Node.js 18.17+ or 20+
- A free [Supabase](https://supabase.com) project

### Installation
```bash
# 1. Clone or navigate to the project directory
cd sahid

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env.local and update with your Supabase credentials:
cp .env.example .env.local
```

### Environment Variables (`.env.local`)
```ini
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
SESSION_SECRET=your-random-32-character-secret-key-for-jose-jwt
```

### Running the App
```bash
# Start local development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 2. Supabase Database & Storage Setup

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to the **SQL Editor** in the left sidebar.
3. Open `db/schema.sql` from this repository, copy its entire contents, paste it into the Supabase SQL editor, and click **Run**.
   - This creates all 8 relational tables (`users`, `courses`, `enrollments`, `lessons`, `lesson_progress`, `live_sessions`, `assignments`, `submissions`), all indexes, and the private `kaksha-files` storage bucket (20MB file limit).
4. Run the seed script locally to load demo courses, real verified educational lectures, assignments, and test students:
```bash
node db/seed.js
```

---

## 3. Demo Credentials & Test Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Teacher** | `teacher@demo.com` | `demo123` | Dr. Ramesh Iyer (Owns CS-402, DBMS-401, DSA-301) |
| **Teacher 2** | `teacher2@demo.com` | `demo123` | Prof. Sunita Verma |
| **Student 1** | `student1@demo.com` | `demo123` | Aarav Sharma (~90% progress, graded work) |
| **Student 2** | `student2@demo.com` | `demo123` | Priya Nair (Far behind, overdue assignment) |
| **Student 3** | `student3@demo.com` | `demo123` | Rohan Kulkarni (Submission pending evaluation) |

### Sample Course Join Codes
- **Python Programming (CS-402):** `PY402`
- **Database Management Systems (DBMS-401):** `DB401`
- **Data Structures & Algorithms (DSA-301):** `DS301`

*(Students can join any course by clicking **Join Course** on `/student/courses` and entering the code).*

---

## 4. Entity-Relationship (ER) Diagram

```text
+-------------------------------------------------------+
|                        users                          |
|-------------------------------------------------------|
| id (PK) | name | email | password_hash | role         |
+-------------------------------------------------------+
         | 1                                  | 1
         | teacher_id                         | student_id
         v *                                  v *
+-----------------------+           +-----------------------+
|        courses        |           |      enrollments      |
|-----------------------| 1       * |-----------------------|
| id (PK)               |---------->| id (PK)               |
| title                 |           | course_id (FK)        |
| code (UNIQUE)         |           | student_id (FK)       |
| description           |           | joined_at             |
| color_index           |           +-----------------------+
| teacher_id (FK)       |
| join_code (UNIQUE)    |
+-----------------------+
     | 1            | 1               | 1
     |              |                 |
     v *            v *               v *
+---------------+ +-----------------+ +---------------------+
|    lessons    | |  live_sessions  | |     assignments     |
|---------------| |-----------------| |---------------------|
| id (PK)       | | id (PK)         | | id (PK)             |
| course_id (FK)| | course_id (FK)  | | course_id (FK)      |
| title         | | title           | | title               |
| type (v/m)    | | starts_at       | | instructions        |
| url           | | duration_min    | | due_at              |
| file_path     | +-----------------+ | max_marks           |
| order_no      |                     +---------------------+
+---------------+                                | 1
     | 1                                         |
     v *                                         v *
+-------------------------+           +---------------------+
|     lesson_progress     |           |     submissions     |
|-------------------------|           |---------------------|
| id (PK)                 |           | id (PK)             |
| lesson_id (FK)          |           | assignment_id (FK)  |
| student_id (FK)         |           | student_id (FK)     |
| completed_at            |           | text_answer         |
+-------------------------+           | file_path           |
                                      | submitted_at        |
                                      | marks               |
                                      | feedback            |
                                      | graded_at           |
                                      +---------------------+
```

---

## 5. Learning & Progress Logic (lib/learningEngine.js)

1. **Course Progress:** Percent of course lessons completed (`(completedCount / totalLessons) * 100`, rounded to nearest whole number; returns 0 if no lessons).
2. **Assignment Status:** Determined deterministically: `Graded` if evaluated; `Submitted` if turned in before grading; `Overdue` if past due date with no submission; otherwise `Pending`.
3. **Late Submissions:** Flagged with `isLate = true` whenever submission timestamp occurs strictly after `assignment.due_at`.
4. **Grade Calculation:** Student score percentage is `(marks / max_marks) * 100`. Course average is the arithmetic mean of all graded assignment percentages.
5. **Grade Bands:** Standard university grading scale: **A** (≥85%), **B** (70–84%), **C** (55–69%), **D** (40–54%), and **F** (<40%).
6. **Next-Up Recommendation Engine:** Dynamically prioritizes the single most urgent task: (1) live class starting within 24h, (2) assignment due within 72h, or (3) next incomplete chronological lesson.

---

## 6. Access Control Rules

- **Zero Client-Side Database Access:** The client browser never communicates directly with Postgres. All database interactions occur inside Next.js Server Components and Route Handlers using the secure `SUPABASE_SERVICE_KEY`.
- **Student Boundaries:**
  - Can only query courses they are actively enrolled in.
  - Can only view/download study material files for courses they are enrolled in.
  - Can only view, submit, or edit their own assignment submissions.
  - Resubmission is strictly locked once the assignment due date passes.
- **Teacher Boundaries:**
  - Can only edit courses, lessons, live sessions, and assignments that they created (`teacher_id = auth.userId`).
  - Can only view, inspect, and grade student submissions belonging to assignments of their own courses.
- **Signed Storage URLs:** Storage files are stored in a private bucket (`kaksha-files`). The server verifies enrollment or course ownership before generating a 60-second temporary signed download URL.

---

## 7. Vercel Deployment Instructions

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New** > **Project** and import the repository.
3. Under **Environment Variables**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SESSION_SECRET`
4. Click **Deploy**. Vercel will automatically build the Next.js App Router project via `npm run build`.

---

## 8. Viva Voce Questions & Answers

### Q1: How is course progress calculated?
> **Answer:** Progress is calculated purely on the server in `lib/learningEngine.js` via `courseProgress(lessons, completedIds)`. It divides the count of unique completed lesson IDs for a student by the total count of lessons in that course, multiplied by 100 and rounded to the nearest integer. If a course has 0 lessons, it safely returns 0%.

### Q2: How are files kept private in Supabase Storage?
> **Answer:** The Supabase storage bucket `kaksha-files` is marked `public = false`, completely preventing anonymous or direct public URL access. To download a file, the client requests a signed download URL from our Next.js API (`/api/storage/download-url`). The API verifies that the requester is a teacher who owns the course or a student enrolled in it, and only then issues a cryptographically signed URL valid for exactly 60 seconds via `createSignedUrl()`.

### Q3: Why embed YouTube lectures via youtube-nocookie.com instead of hosting video files?
> **Answer:** Video streaming requires high bandwidth, adaptive bitrate streaming (HLS/DASH), and significant storage costs that exceed standard serverless hosting quotas. Embedding through YouTube offloads all video encoding, caching, and CDN streaming infrastructure for free. We use `youtube-nocookie.com` to prevent third-party tracking cookies from being stored on students' browsers until they interact with the player.

### Q4: Why upload files directly from the browser to Supabase Storage rather than through Next.js API routes?
> **Answer:** Vercel serverless functions enforce a strict 4.5MB payload limit on incoming request bodies. Streaming large study materials or assignment attachments (up to 20MB) through an API route would trigger a `413 Payload Too Large` error. Instead, our server verifies user authentication and generates a signed upload URL (`createSignedUploadUrl`), allowing the student/teacher browser to stream the file directly to Supabase Storage while maintaining security.

### Q5: How does authentication and session management work without client-side Supabase Auth?
> **Answer:** We use HTTP-only, SameSite signed session cookies powered by `jose` (JWT) and passwords hashed with `bcryptjs`. When a user logs in, the server verifies the password against `password_hash` in the `users` table and writes a tamper-proof session token into a cookie named `kaksha_session`. Every subsequent API route and page verifies this cookie on the server, extracting `userId` and `role` without exposing database tokens or keys to the browser.

### Q6: How is timezone handled across due dates and live sessions?
> **Answer:** All server dates are handled in standard UTC in the database, but user-facing display and validation are unified under Indian Standard Time (`Asia/Kolkata`) via `lib/time.js` using native `Intl.DateTimeFormat`. This prevents common bugs where a due date set by a teacher at 11:59 PM IST appears shifted by several hours depending on the client device's local clock.

### Q7: How are late submissions detected and handled?
> **Answer:** In `lib/learningEngine.js`, `assignmentStatus` compares the submission's `submitted_at` timestamp with the assignment's `due_at` timestamp. If `submitted_at > due_at`, an `isLate: true` flag is attached. Furthermore, on the client and server, resubmissions are permanently locked once the due date passes.

### Q8: How are live classes conducted without third-party API keys or WebRTC server maintenance?
> **Answer:** We embed Jitsi Meet via an `<iframe>` pointing to the public `meet.jit.si` service using a deterministic room name derived from the live session ID (`kaksha-live-${sessionId}`). The iframe is configured with `allow="camera; microphone; fullscreen; display-capture"`. The student UI automatically enables the **Join Class** button 10 minutes before the scheduled `starts_at` time based on IST time calculation.
