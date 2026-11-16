---
name: Kaksha LMS
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#424654'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737786'
  outline-variant: '#c2c6d7'
  surface-tint: '#0056d0'
  primary: '#0055ce'
  on-primary: '#ffffff'
  primary-container: '#2f6fed'
  on-primary-container: '#ffffff'
  inverse-primary: '#b1c5ff'
  secondary: '#835400'
  on-secondary: '#ffffff'
  secondary-container: '#ffad2e'
  on-secondary-container: '#6c4400'
  tertiary: '#9d4200'
  on-tertiary: '#ffffff'
  tertiary-container: '#c45400'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001847'
  on-primary-fixed-variant: '#0040a0'
  secondary-fixed: '#ffddb5'
  secondary-fixed-dim: '#ffb957'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#793100'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-regular:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-medium:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-semibold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  overline:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 1rem
  space-md: 1.5rem
  space-lg: 2rem
---

## Brand & Style

This design system establishes an academic environment tailored to higher education and collegiate rigor. The aesthetic blends institutional stability with modern digital utility, rejecting frivolous visual trends, gradients, neon accents, and conversational fluff.

### Philosophy & Visual Tone
- **Demeanor:** Quiet authority, intellectual clarity, and structural poise.
- **Visual Stance:** Functional Modernism. Crisp architectural lines, deliberate negative space, and disciplined data density.
- **Emotional Intent:** Reduces cognitive friction for students and faculty during high-stakes workflows (course registration, grading, assignment submissions, lecture tracking).
- **Iconography & Asset Rules:** Monoline geometric stroke icons only (Font Awesome Line / regular style). No gradients, no frosted glass layers, and no decorative emojis.

## Colors

The palette employs deep ink for navigational grounding, balanced by an expansive light background and crisp card surfaces.

### Application Rules
- **Sidebar & Navigation:** Grounded entirely in Dark Ink (`#0F172A`). Active items utilize a left indicator border or a solid tint with `#2F6FED`.
- **Primary Blue (`#2F6FED`):** Reserved for primary interactive elements, progress bar fills, selected navigation tags, and active pagination.
- **Accent Amber (`#F5A524`):** Strictly restricted to at most one high-value highlight or alert callout per view (e.g., pending assignment deadline, overdue fee notification).
- **Course Palette:** Six flat solids used strictly for course covers, module banners, and categorical subject tags:
  - Blue (`#2F6FED`)
  - Teal (`#0D9488`)
  - Coral (`#E05344`)
  - Amber (`#D97706`)
  - Green (`#16A34A`)
  - Slate (`#475569`)
  Course banners feature faint, low-contrast concentric circles/geometric lines in `rgba(255, 255, 255, 0.12)`.

## Typography

The typography system relies exclusively on **Plus Jakarta Sans** across all roles to ensure an uncluttered, modern geometric feel.

### Hierarchy & Style Principles
- **Headings (Display, Headline, Title):** Rendered in weights 600 or 700 with negative letter spacing for concise editorial presence. Titles should be brief and direct (e.g., "Data Structures & Algorithms", "Semester IV Academic Standing").
- **Body & Data:** Keep instructional prose minimal. Present tabular academic data, deadlines, and grade allocations with tabular numbers enabled via `font-variant-numeric: tabular-nums`.
- **Overline:** Used exclusively for semester taxonomy, department badges, and course codes (e.g., `BCA-402`, `DEPARTMENT OF COMPUTER APPLICATIONS`). Always uppercase with `0.06em` letter spacing.

## Layout & Spacing

The layout model pairs a fixed-width left navigation rail (`260px` desktop) with an adaptive, fluid-grid central content canvas (`max-width: 1440px`).

### Spacing Scale
Layout distances adhere strictly to a 5-step rhythmic scale:
- `space-2xs`: 4px (micro alignments, indicator gaps)
- `space-xs`: 8px (icon-to-text spacing, chip padding)
- `space-sm`: 16px (gutter on mobile, interior form stack gaps)
- `space-md`: 24px (standard card padding, grid gutters)
- `space-lg`: 32px (section separations, dashboard module splits)

### Responsive Adaptation
- **Desktop (≥ 1024px):** Fixed navigation sidebar pinned to the viewport left. Content sits inside a multi-column grid with `24px` (`1.5rem`) gutters and `32px` (`2rem`) canvas margins.
- **Tablet (768px – 1023px):** Sidebar collapses to an icon-only rail (`72px` width). Grid reflows from 3 or 4 columns down to 2 columns.
- **Mobile (< 768px):** Sidebar converts into a hidden off-canvas drawer accessed via a standard header bar. Canvas margin reduces to `16px` (`1rem`). Cards stack in a single column.

## Elevation & Depth

This design system avoids high-contrast drop shadows and artificial layering. Hierarchy is achieved through surface tone demarcation and crisp low-contrast borders.

### Depth Rules
- **Base Canvas:** The page canvas is `#F5F7FB`. It provides a soft, glare-free backdrop for long study hours.
- **Resting Cards:** Surfaces use pure `#FFFFFF` bounded by a strict `1px solid #E4E9F2` hairline border. The drop shadow is restrained:
  `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02);`
- **Elevated / Interactive Flyouts:** Context menus, dropdown selectors, and modal dialogs retain the `#FFFFFF` surface and `1px solid #E4E9F2` border, with shadow elevated to:
  `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03);`
- **Zero Glassmorphism:** Never use CSS backdrop blur (`backdrop-filter`) or alpha-blended white containers over images or solid colors.

## Shapes

The interface balances sharp, academic discipline with user-friendly ergonomics through consistent curvature:

- **Cards & Modals:** Standardized corner radius of `16px` (`rounded-xl` mapping to `1rem`).
- **Interactive Controls (Inputs, Buttons, Tabs):** Standardized corner radius of `8px` (`0.5rem`).
- **Status Pills, Badges & Micro-tags:** Fully rounded / pill-shaped (`9999px`) to distinguish categorical metadata from actionable controls.
- **Course Cover Banners:** Rounded `16px 16px 0 0` when integrated inside course cards, or full `16px` when rendered as standalone summary banners.

## Components

### 1. Buttons
- **Primary:** Background `#2F6FED`, text `#FFFFFF`, border `none`, radius `8px`, height `40px` (desktop), `font-weight: 600`. Hover state shifts background to `#2558CA`.
- **Secondary / Outlined:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`, radius `8px`. Hover shifts background to `#F8FAFC`.
- **Destructive:** Background `#FFFFFF`, text `#E5484D`, border `1px solid #FCA5A5`. Active/focus background `#FEF2F2`.

### 2. Cards
- **Padding:** Uniformly `24px` (`space-md`).
- **Structure:** White background (`#FFFFFF`), `1px solid #E4E9F2` border, `16px` corner radius.
- **Course Card Variant:** Header features a `120px` solid block from the Course Cover Palette (e.g., `#0D9488` for Database Management Systems) with watermark concentric ring line graphics. Content body features course title, instructor meta, and a progress track.

### 3. Progress Indicators
- **Track:** Background `#EBF2FE` (chart blue 20%), height `6px`, radius `9999px`.
- **Fill:** Solid `#2F6FED`. No gradients or animations.

### 4. Input Fields & Selectors
- **Container:** Height `40px`, background `#FFFFFF`, border `1px solid #E2E8F0`, radius `8px`, padding `0 12px`.
- **Typography:** Value text `#0F172A`, placeholder `#64748B` in `14px`.
- **Focus State:** Border color `#2F6FED`, paired with a crisp `0 0 0 3px rgba(47, 111, 237, 0.15)` focus ring.

### 5. Chips & Academic Badges
- **Size:** Height `24px`, padding `0 8px`, border radius `9999px`.
- **Semantics:**
  - Status active/complete: Background `#ECFDF5`, text `#16A37F`.
  - Attention/deadline: Background `#FFFBEB`, text `#D97706`.
  - Neutral/Credit count: Background `#F1F5F9`, text `#475569`.

### 6. Lists & Tables
- **Divider:** Standard horizontal separator `1px solid #E2E8F0`.
- **Row States:** Default background transparent. Hover state `#F8FAFC`.
- **Data Density:** Row heights set to `48px` for standard student/course listings, with vertical alignment centered.

### 7. Form Controls (Checkboxes & Radios)
- **Size:** `16px × 16px`, border `1.5px solid #CBD5E1`.
- **Selected State:** Fill `#2F6FED` with crisp white inner check/dot icon.