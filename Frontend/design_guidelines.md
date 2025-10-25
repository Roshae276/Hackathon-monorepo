# Village Grievance Redressal System - Design Guidelines

## Design Approach: Government Portal with Rural Accessibility

**Selected Framework:** Hybrid approach combining Indian Government Digital Identity aesthetics (inspired by mygov.in, umang.gov.in) with accessibility-first principles for rural users with varying literacy levels.

**Core Principles:**
- Trust through formality and government authority
- Accessibility for low-literacy and first-time digital users
- Clear information hierarchy with visual status indicators
- Multi-modal interaction support (voice, touch, keyboard)

---

## Typography System

**Font Families:**
- Primary: Inter or Noto Sans (excellent multilingual support, high readability)
- Secondary: Poppins for headings (approachable yet authoritative)

**Type Scale:**
- Headings H1: 2.5rem (40px) - Page titles
- Headings H2: 2rem (32px) - Section headers
- Headings H3: 1.5rem (24px) - Card titles
- Body Large: 1.125rem (18px) - Important instructions, form labels
- Body: 1rem (16px) - Standard text
- Small: 0.875rem (14px) - Helper text, timestamps

**Weight Distribution:**
- Headings: 600-700 (Semi-bold to Bold)
- Body: 400-500 (Regular to Medium)
- Emphasis: 600 (Semi-bold)

**Critical Accessibility:**
- Minimum body text: 16px (18px preferred for primary content)
- Line height: 1.6 for body text, 1.3 for headings
- Letter spacing: 0.02em for improved readability

---

## Layout & Spacing System

**Container Strategy:**
- Max-width: 1280px (large screens)
- Content max-width: 960px (forms, text-heavy sections)
- Responsive breakpoints: 640px, 768px, 1024px, 1280px

**Spacing Primitives (Tailwind units):**
- Micro spacing: 1, 2 (4px, 8px) - Icon gaps, tight elements
- Component spacing: 4, 6, 8 (16px, 24px, 32px) - Internal padding, between form fields
- Section spacing: 12, 16, 20 (48px, 64px, 80px) - Between major sections
- Page spacing: 24, 32 (96px, 128px) - Top/bottom page margins

**Grid Systems:**
- Dashboard cards: 1 column mobile, 2 columns tablet, 3 columns desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Form layout: Single column throughout for clarity and accessibility
- Status lists: Full-width stacked cards with internal grid for meta information

---

## Component Library

### Navigation Header
- Sticky top navigation with government logo/emblem
- Primary navigation: Dashboard, Submit Grievance, My Grievances, Help
- User profile dropdown (right-aligned): Name, Role, Logout
- Language selector with flag icons
- Height: 64px desktop, 56px mobile
- Include trust indicators: "Secure" badge, helpline number prominently displayed

### Grievance Submission Form
**Multi-step Progress Indicator:**
- 4 steps: Problem Details → Evidence Upload → Description → Contact Info
- Visual progress bar with numbered circles
- Each step card: Generous padding (p-8), elevated shadow, rounded corners (rounded-lg)

**Form Fields:**
- Large input fields: min-height 48px for touch targets
- Clear labels above fields (not floating labels - better for low literacy)
- Icon prefixes for field context (📱 for phone, 📧 for email)
- Error states with inline error messages in Alert Red
- Success states with checkmark icons in Success Green

**Evidence Upload:**
- Large drag-and-drop zone: min-height 200px
- Visual file type icons (camera, video)
- Image preview grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Clear file size limits displayed

**Voice Recording Interface:**
- Large circular record button (80px diameter)
- Waveform visualization during recording
- Playback controls with large touch targets (min 44px)
- Visual recording timer prominently displayed

### Dashboard Cards

**Grievance Status Cards:**
- Full-width cards on mobile, stacked vertically
- Status badge: Top-left corner, large (12px height), color-coded
- Card structure:
  - Grievance ID + Status (Header row)
  - Problem title (H3 size, bold)
  - Meta information grid: 2 columns (Submitted date | Due date, Category | Assigned to)
  - Action buttons row (right-aligned)
- Border-left accent: 4px colored stripe matching status
- Hover elevation: Subtle shadow increase

**Official Assignment Cards:**
- Priority indicator: Top-right corner badge
- Timeline setter: Dropdown with preset options (7/15/30 days)
- Evidence thumbnails: Horizontal scroll gallery (if available)
- Accept/View buttons: Primary (Accept) + Secondary (View)

### Status Indicators

**Color-Coded System (Already Specified):**
- New/Pending: Primary Blue (#1C4587)
- In Progress: Secondary Orange (#F4511E)
- Resolved: Success Green (#2E7D32)
- Pending Verification: Warning Amber (#F57C00)
- Overdue/Disputed: Alert Red (#C62828)

**Visual Hierarchy:**
- Large status badges with icon + text (not icon alone)
- Status timeline: Horizontal progress tracker with checkpoints
- Days counter for overdue items: Large, bold, attention-grabbing

### Buttons & Actions

**Primary Actions:**
- Height: 48px minimum (large touch target)
- Padding: px-8 py-3
- Border radius: rounded-md (6px)
- Font size: 1rem, weight: 600
- Include icon + text for critical actions (Submit, Verify, Dispute)

**Button Hierarchy:**
- Primary: Solid fill (government blue)
- Secondary: Outlined with 2px border
- Tertiary: Ghost/text only for low-priority actions
- Destructive: Alert Red for dispute/delete actions

**Hero Section (if applicable for landing/info pages):**
- Large hero image showcasing rural India context (village scenes, community gatherings)
- Overlay: Subtle gradient (dark at bottom for text legibility)
- Hero text on blurred backdrop panel
- CTA buttons with backdrop blur for visibility over images

### Verification Interface

**Community Verification Panel:**
- Large "Verify" and "Dispute" buttons (equal prominence)
- Photo comparison: Before (submitted) | After (resolution) - side by side on desktop, stacked on mobile
- Evidence upload for disputes: Same drag-drop interface as submission
- Verification countdown: Circular progress indicator showing days remaining
- Blockchain transaction confirmation: Success message with transaction ID

### Notification System

**In-App Notifications:**
- Toast notifications: Top-right corner, 8-second auto-dismiss
- Notification bell icon with badge counter in header
- Notification panel: Slide-in from right, categorized by type (Updates, Escalations, Verifications)

---

## Accessibility & Inclusive Design

**Icon + Text Labels:**
- Never icon-only buttons or navigation
- Icons: 20-24px size, positioned left of text (consistent)
- High contrast icons from Heroicons (outlined style for clarity)

**Touch Targets:**
- Minimum: 44x44px for all interactive elements
- Spacing between adjacent touch targets: 8px minimum

**Keyboard Navigation:**
- Visible focus states: 2px solid outline, offset 2px
- Logical tab order through forms
- Skip navigation link for screen readers

**Multilingual Considerations:**
- Text expansion buffer: 30% extra space for translations
- RTL support preparation (flexbox with logical properties)
- Language toggle: Prominent placement in header

---

## Images & Visual Assets

**Hero Image (Landing/Info Pages):**
- Use: Authentic photos of Indian villages, community gatherings, or panchayat meetings
- Treatment: Subtle warm filter to enhance trust and community feeling
- Placement: Full-width hero section (80vh on desktop)

**Dashboard & Forms:**
- Minimal decorative images - focus on functionality
- Icons from Heroicons or Material Icons (outlined style)
- Evidence thumbnails: Rounded corners (rounded-md), object-cover fit

**Illustrations (Optional):**
- Empty states: Simple line illustrations (e.g., empty grievance list)
- Help section: Step-by-step visual guides for submitting grievances

---

## Animation & Interactions

**Minimal, Purposeful Animations:**
- Form field focus: Smooth border transition (200ms)
- Card hover: Subtle elevation change (150ms ease-out)
- Status changes: Fade transition between states (300ms)
- Loading states: Spinner or skeleton screens (avoid blocking the entire UI)

**NO Complex Animations:**
- Avoid scroll-triggered effects
- No parallax or heavy animations (performance on low-end devices)

---

## Responsive Behavior

**Mobile-First Approach:**
- Single-column layouts on mobile
- Bottom navigation bar for primary actions on mobile (Submit, Dashboard, Profile)
- Collapsible filters and advanced options
- Large, thumb-friendly touch targets throughout

**Tablet (768px+):**
- Two-column dashboard layouts
- Side-by-side form field pairs where logical
- Persistent sidebar navigation

**Desktop (1024px+):**
- Three-column dashboard grids
- Sidebar navigation always visible
- Hover states and tooltips

---

## Government Authority Aesthetic

**Trust Signals:**
- Government emblem/seal in header
- "Secured by Blockchain" badge with lock icon
- Footer: Government department affiliations, helpline numbers
- Certificate/seal graphics for verified resolutions

**Formal Visual Language:**
- Clean, structured layouts (no playful elements)
- Professional photography (avoid stock photos with unrealistic smiles)
- Serious, authoritative tone in microcopy

This system prioritizes clarity, accessibility, and trust - essential for serving rural communities and government officials with a platform that empowers transparent grievance resolution.