---
name: Academic Flow
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is tailored for undergraduate and graduate students juggling modular course loads, strict assignment deadlines, and personal productivity. The aesthetic couples serene, cognitive-load-reducing layouts with energetic, optimistic accents to alleviate academic burnout and decision fatigue.

### Core Philosophy
- **Calm Clarity:** White and ultra-light slate planes strip away visual noise, allowing students to instantly comprehend timelines and study tasks.
- **Supportive Momentum:** Soft cornflower blue anchors foundational focus, while lilac/violet tones offer tactile moments of creative agency and self-direction.
- **Intentional Urgency:** Vibrant semantic alerts (emerald, amber, rose) punctuate the interface without producing panic, categorizing tasks clearly by status and immediacy.

### Style Archetype
- **Clean Modernism with Soft Tactility:** Crisp layout architecture paired with generous corner radii (`rounded-2xl` on cards, `rounded-xl` on interactive modules), delicate slate hairline borders (`#E2E8F0`), and multi-stop ambient drop shadows that mimic natural desk lighting.

## Colors

The palette balances clinical legibility with emotional warmth.

### Functional Roles
- **Base Canvas (`#F8FAFC`):** Crisp, anti-glare slate canvas that separates seamlessly from white surface containers.
- **Surface Elevation (`#FFFFFF`):** Pure white container surfaces that lift primary data cards above the canvas.
- **Primary Focus (`#2563EB` default, `#3B82F6` hover/active):** Cornflower blue allocated to primary call-to-actions, active navigation markers, and focus-timer progression tracks.
- **Secondary Accent (`#7C3AED` default, `#8B5CF6` light surface tint):** Lilac and violet purple designated for deep study blocks, exam prep tags, and intellectual milestone metrics.
- **Semantic Productive Tiers:**
  - **Success / High Productivity (`#10B981`):** Emerald green for completed tasks, habit milestones, and peak grade tracking.
  - **Caution / Medium Priority (`#F59E0B`):** Warm amber for upcoming mid-week milestones and moderate urgency.
  - **Critical / Urgent Deadline (`#EF4444`):** Crisp rose for impending 24-hour deadlines and high-priority coursework.
- **Text & Borders:**
  - **Title / Body Text (`#0F172A` / `#334155`):** Deep slate providing WCAG AAA-compliant reading contrast.
  - **Muted Text (`#64748B`):** Secondary metadata, course IDs, and timestamps.
  - **Borders & Dividers (`#E2E8F0`):** Subtle boundaries preserving clarity without heavy wireframe visual weight.

## Typography

Typography pairs geometric structure with academic reading clarity.

### Pairing Rationale
- **Headlines (Plus Jakarta Sans):** Selected for its contemporary, welcoming personality. The subtle rounded apertures keep dense course schedules approachable rather than rigid.
- **Body & Data Displays (Inter):** Highly optimized for tabular assignment lists, time slots, and small metadata labels. Tall x-height prevents eye strain during extended night-study sessions.

### Layout Implementation Rules
- Apply `display-hero` exclusively to primary greeting and focus dashboards (e.g., "Good morning, Elena").
- Apply uppercase styling to `label-sm` exclusively when paired with course codes or urgency categories (e.g., `BIO-201`, `DUE TODAY`).

## Layout & Spacing

The structural layout utilizes a modern fluid-grid system built around an 8pt baseline rhythm, engineered to support both wide dashboard multi-tasking and focused mobile views.

### Screen Adaptations
- **Desktop (1200px+):** 12-column layout. Max container constraint of `1440px`. Features a persistent `260px` left-hand navigation column, a dynamic 8-column main study agenda, and a 4-column contextual rail (calendar, Pomodoro timer, assignment checklist).
- **Tablet (768px - 1199px):** 8-column layout. Collapses the left rail into a slim icon navigation bar, prioritizing schedule visibility and week views.
- **Mobile (< 768px):** 4-column single-stack view with bottom navigation bar. Margins contract to `1rem` with `0.75rem` card gutters, allowing student cards to fill lateral real estate efficiently without side-bleed cramping.

### Spacing Principles
- Task lists utilize internal item padding of `space-sm` vertically and `space-md` horizontally to preserve rapid scanning speed.
- Main card containers utilize `space-lg` inner padding to maintain airy separation between titles, data charts, and action points.

## Elevation & Depth

Visual hierarchy uses a refined ambient shadow system layered over delicate borders to convey light, clean elevation without heavy skeuomorphic weight.

### Depth Stratification
- **Level 0 (Base Canvas):** `#F8FAFC`. Completely unshadowed ground plane.
- **Level 1 (Resting Dashboard Cards & Task Lists):** 
  - Background: `#FFFFFF`
  - Border: `1px solid #E2E8F0`
  - Shadow: `0px 1px 3px rgba(15, 23, 42, 0.04), 0px 4px 12px rgba(15, 23, 42, 0.03)`
- **Level 2 (Hovered Cards & Interactive Controls):** 
  - Background: `#FFFFFF`
  - Border: `1px solid #CBD5E1`
  - Shadow: `0px 4px 6px -1px rgba(37, 99, 235, 0.04), 0px 10px 20px -3px rgba(15, 23, 42, 0.07)`
- **Level 3 (Modals, Overlays, Floating Study Timers):** 
  - Background: `#FFFFFF`
  - Border: `1px solid rgba(226, 232, 240, 0.8)`
  - Shadow: `0px 20px 25px -5px rgba(15, 23, 42, 0.08), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)`

### Glassmorphic Utility
- Fixed sticky headers and floating bottom navigations utilize frosted transparency: `rgba(248, 250, 252, 0.85)` with `backdrop-filter: blur(12px)`.

## Shapes

The interface embraces a soft, friendly, and tactile aesthetic through progressive rounding.

### Corner Radius Mapping
- **Primary Cards & Containers:** Standardized on `rounded-2xl` (`1rem` to `1.25rem` / `16px-20px`) to give the app a modern consumer-grade feel rather than a rigid enterprise database look.
- **Interactive Controls (Inputs, Buttons, Dropdowns):** Built with `rounded-xl` (`0.75rem` / `12px`), optimizing touch targets and click confidence.
- **Tags, Filter Chips, Badges:** Use `rounded-full` for high scannability and visual contrast against structural card geometry.

## Components

### Buttons
- **Primary:** Solid `#2563EB` fill, white `#FFFFFF` label, `rounded-xl`, `padding: 0.625rem 1.25rem`. On hover: transition to `#1D4ED8` with `box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25)`.
- **Secondary / Accent:** Soft lilac surface `rgba(124, 58, 237, 0.08)`, `#7C3AED` label, border: `1px solid rgba(124, 58, 237, 0.2)`. On hover: `#7C3AED` text on `rgba(124, 58, 237, 0.15)` fill.
- **Ghost:** Transparent background, slate `#475569` text. Hover yields `#F1F5F9`.

### Chips & Badges
- **Status Badges:** Fully rounded (`rounded-full`), `padding: 0.25rem 0.625rem`, displaying `label-sm`.
  - *Completed:* `bg-[#ECFDF5]` with text `#047857` and border `1px solid #A7F3D0`.
  - *Medium Priority:* `bg-[#FFFBEB]` with text `#B45309` and border `1px solid #FDE68A`.
  - *Urgent:* `bg-[#FEF2F2]` with text `#B91C1C` and border `1px solid #FECACA`.

### Task Checkboxes
- **Base:** `20px x 20px`, `rounded-md` (`6px`), border: `2px solid #CBD5E1`.
- **Checked (Complete):** Solid emerald `#10B981` with clean white micro checkmark icon. Task text transitions from `#0F172A` to `#94A3B8` with a neat strikethrough.

### Input Fields
- **Container:** `#FFFFFF` fill, `1px solid #E2E8F0`, `rounded-xl`, `padding: 0.75rem 1rem`.
- **Focus State:** Border shifts to primary `#2563EB` with an ambient glow: `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`.

### Cards (Course, Assignment & Focus Modules)
- White `#FFFFFF` ground, `rounded-2xl`, subtle border `1px solid #E2E8F0`, padding `1.5rem`.
- Include a 4px vertical color bar or subtle left edge accent matching the course category (e.g., violet for Arts, blue for STEM).

### Student-Specific Components
- **Pomodoro / Focus Radial:** Cornflower blue progress track on light slate `#E2E8F0` track, centered with `display-hero` timer countdown and a violet pause/play button.
- **Deadline Countdown Pill:** High-contrast pill featuring a tiny clock icon; dynamically flags `< 24 Hours` in bright rose tint with subtle pulsating status indicator.