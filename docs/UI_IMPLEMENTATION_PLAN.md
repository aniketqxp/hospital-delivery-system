# Hospital Delivery System — UI Implementation Plan

**Philosophy**: The Receding Interface  
**Status**: Planning Phase (ready for Phase 1 execution)  
**Last Updated**: 2026-04-26

---

## Design Philosophy

### Core Premise
This application is used in a gynaecology ward, immediately after clinical events. The user has one job: enter the record and move on. The interface must cost them nothing — no cognitive overhead, no hunting, no waiting. When the UI recedes completely, the design has succeeded.

### The Four Laws

**I. Every pixel must justify its existence.**
No welcome messages, decorative dividers, banners, footers. If it isn't load-bearing, it doesn't exist.

**II. Speed is a design feature, not an engineering detail.**
200ms feels broken. Autofocus saves a click. Silent submissions save a modal. Every interaction is measured in cognitive load units.

**III. Colour carries meaning or it carries nothing.**
The palette is near-monochrome. Colour appears only where it conveys information: delivery type badges (green/amber/red). Everywhere else, colour is absent.

**IV. Predictability beats novelty.**
The "New Record" button is always in the same place. Form fields are always in the same order. A staff member using this for two weeks should operate it in the dark.

---

## Design Tokens

### Colour Palette

```
Primary Action:      #0969da  (GitHub blue — universally understood as "do this")
Text Primary:        #1f2328  (near-black, high contrast)
Text Secondary:      #656d76  (muted, secondary information)
Border:              #d0d7de  (subtle grid lines)
Surface Default:     #ffffff  (page background)
Surface Muted:       #f6f8fa  (alternating rows, hover states)

Semantic Badge Colours (Delivery Type only):
  Normal Delivery:   #1a7f37  (green)
  Vacuum Delivery:   #9a6700  (amber)
  Cesarean Section:  #cf222e  (red)

Status:
  Error:             #cf222e
  (Success: no badge — the record appearing in the list is confirmation)
```

### Typography

**Font Stack**: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`  
*(Zero network requests. Invisible because it matches the OS.)*

**Monospace Stack**: `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`  
*(For serial numbers, dates in edit context.)*

**Scale**:
- 12px — secondary text, timestamps, badges, form hints
- 13px — form labels, table secondary info
- 14px — body text, nav links, table primary content
- 16px — input/button base size
- 20px — page heading (`<h1>`)

**Line Height**: 1.5 for body text, 1.25 for headings

### Spacing Scale

Tailwind default (4px base unit):  
`4px, 8px, 12px, 16px, 24px, 32px, 48px`

**Specific gaps**:
- Label to input: 4px
- Between form fields: 20px
- Around table rows: 0px (no padding — density is a feature)
- Header height: 48px
- Input/button height: 32px

### Border Radius

- **Form inputs, buttons, badges**: 4px
- **Cards, modals, panels**: 4px
- **Nothing rounder**: squarish, clinical, modern

### Focus Ring

**Style**: 2px solid `#0969da`, 2px offset  
**Applied to**: All interactive elements (buttons, inputs, links)  
**No glow**, no shadow — surgical precision

---

## Visual Language

### Typography & Emphasis
- Bold/semibold reserved for patient names (primary identifier) and labels
- Regular weight for everything else
- No italics except in error messages or hints
- All caps only for badge labels (NORMAL, VACUUM, CESAREAN)

### Density
- Table rows: 36px height (compact, scannable)
- Form fields: 32px input height (efficient, not cramped)
- No whitespace padding for aesthetic reasons — only structural

### Whitespace
- Used to separate logical groups, not as decoration
- Form: breathing room between field groups because they are distinct logical units
- Table: minimal horizontal padding; rows separated by alternating color, not whitespace

### Interaction States

**Three states, no more**:
1. **Default**: border `#d0d7de`, text `#1f2328`, background `#ffffff`
2. **Hover**: background becomes `#f6f8fa`, border slightly darker `#c9d1d9`
3. **Active/Focus**: border becomes `#0969da`, focus ring applied

**No transitions** between states (0ms). Instant feedback.

---

## Component Specifications

### MainLayout (Header)
- **Height**: 48px
- **Background**: `#ffffff`
- **Bottom border**: 1px `#d0d7de`
- **Layout**: flexbox, space-between
- **Left**: Hospital name (14px semibold `#1f2328`)
- **Centre-left**: Nav links ("Records", "+ New Record"), 14px, medium weight, 8px gap between links
- **Active link**: Blue underline (2px `#0969da`), no background fill
- **Right**: "Sign out" link (ghost text, 13px, `#656d76`, no hover effect until hovered)
- **Content area below**: max-width 1100px, centred, 2rem horizontal padding, 1.5rem top padding

### RecordsTable
- **Container**: full width, no border-radius
- **Header**: sticky on scroll, background `#f5f7fa`, 1px bottom border `#d0d7de`
- **Rows**: 36px height, alternating white / `#f6f8fa`
- **Columns** (fixed widths):
  - Serial: 130px, monospace 13px, `#656d76`
  - Name: flex, 14px medium, `#1f2328`
  - Age: 52px, numeric center-aligned
  - Date/Time: 148px, `dd MMM yyyy` (14px) + time (12px muted) stacked
  - Type: 196px, badge pill with semantic colour
  - Actions: 112px, two buttons (Details link + Edit ghost button), 8px gap

**Empty State**:
- Centred in table body area
- Muted text, 14px: "No records yet."
- Secondary text, 13px `#656d76`: "Deliveries you log will appear here."

**Loading State**:
- Three skeleton rows (muted animated bars), no spinner

### RecordDetailsModal
- **Container**: white, 600px max-width, 1px border `#d0d7de`, 4px radius
- **Layout**: two-column key/value grid, 16px row gap
- **Serial number**: spans full width at top, larger (16px), monospace
- **Divider**: 1px `#d0d7de` before audit fields
- **Audit fields**: 12px `#656d76` at bottom
- **Close**: backdrop click or Escape key

### DeliveryForm
- **Container**: max-width 560px, left-aligned, no card wrapper
- **Field order** (locked):
  1. Patient Name (required)
  2. Age (required)
  3. Aadhaar Last 4 (optional)
  4. Address (required, textarea)
  5. Delivery Date & Time (required, datetime-local)
  6. Baby Sex (required, select)
  7. Delivery Type (required, select)

**Each field**:
- Label: 13px medium, `#1f2328`
- `(optional)` suffix in 12px `#656d76` where applicable
- Input: 32px height, full width, 1px border `#d0d7de`, 4px radius, 14px text
- Focus state: border `#0969da`, focus ring
- Error state: border `#cf222e`, error message 12px `#cf222e` directly below input
- 4px gap between label and input, 20px gap between fields

**Two-column grids**:
- Age + Aadhaar (short fields, same group)
- Baby Sex + Delivery Type (both selects, same weight)

**Submit**:
- Full width on small screens, auto-width on larger
- 32px height, primary blue background, white text
- `autofocus` on Patient Name on mount

**Cancel**:
- Plain text link left of submit
- `#656d76`, no button chrome

**On submit**: no alert, no toast — navigate directly to `/records`

### LoginPage
- **Container**: centred card, 400px wide
- **Card**: white background, 1px border `#d0d7de`, 4px radius, no shadow
- **Title**: 16px semibold, `#1f2328`
- **Fields**: email + password (standard layout)
- **Submit**: primary blue, full width
- **Error**: shown inline below button, 13px red `#cf222e`
- **No "Forgot password" link** (admin resets credentials)

### AdvancedSearch Panel
- **Trigger**: "Search" button in toolbar, toggle collapse
- **Layout**: 3-column grid for inputs
- **No submit button** — debounce queries at 300ms on input change
- **Active filters**: shown as small dismissible chips below panel
- **"Clear all" link**: appears when any filter active
- **Result count**: shown in toolbar ("14 records" → "3 results")

---

## Phased Execution Plan

### Phase 1 — Foundation (30 min)
**Objective**: Establish design system as infrastructure.

**Steps**:
1. `npm install -D tailwindcss postcss autoprefixer`
2. `npx tailwindcss init -p`
3. Create full `tailwind.config.js` with colour, typography, spacing tokens
4. Rewrite `index.css`:
   - CSS reset (box-sizing, margins, padding)
   - Base element styles (body font, line-height, focus rings)
   - Form normalisation (inputs, selects, textareas)
   - Scrollbar styling

**Completion criteria**: `npm run dev` shows white page with correct base font. No visual regressions.

---

### Phase 2 — Layout Shell (45 min)
**Objective**: Header is the visual contract for every page.

**Steps**:
1. Rewrite `MainLayout.tsx` with Tailwind classes
   - 48px height, white background, 1px bottom border
   - Hospital name left, nav centre-left, sign out right
   - Active route: blue underline
2. Add page title pattern (`<h1>` 20px semibold, 0 top margin)
3. Main content area: max-width 1100px, centred, proper padding

**Completion criteria**: Navigate between Records and New Record. Header stable. Active state clear.

---

### Phase 3 — Records Table (60 min)
**Objective**: Primary interface must be immediately scannable.

**Steps**:
1. Rewrite `RecordsTable.tsx` with Tailwind
   - Sticky header, fixed column widths
   - 36px rows, alternating colours
   - Serial (monospace, secondary), Name (primary), Date (two-line), Type (badge)
2. Rewrite `RecordDetailsModal.tsx`
   - Two-column key/value, serial number prominent
   - Audit info at bottom in muted text
3. Implement empty state + loading state (skeleton rows)

**Completion criteria**: 10 test records visible. Table scannable in 3 seconds. Badges distinguishable. Modal opens/closes correctly.

---

### Phase 4 — Data Entry Forms (60 min)
**Objective**: Form is highest-stakes interaction. Must guide and enforce.

**Steps**:
1. Refactor `DeliveryForm.tsx` with Tailwind
   - Max-width 560px, field order locked
   - Two-column grids for related short fields
   - Autofocus on Patient Name
   - Inline error states (no alerts)
2. Ensure silent submit, direct navigation to `/records`
3. Test tab order on both NewRecordPage and EditRecordPage

**Completion criteria**: Tab through all fields in correct order. Submit navigates silently. Errors appear inline. Edit pre-fills correctly.

---

### Phase 5 — Search (45 min)
**Objective**: Finding a record feels like "Everything" (Voidtools).

**Steps**:
1. Rewrite `AdvancedSearch.tsx`
   - Collapsible panel triggered by "Search" button
   - 3-column grid for inputs
   - Debounce at 300ms, no submit button
   - Active filter chips with dismiss
   - "Clear all" link

**Completion criteria**: Type partial name → results within 300ms. Clear filter → results reset. Panel collapse/expand preserves state.

---

### Phase 6 — Login + Errors (30 min)
**Objective**: First impression and error handling.

**Steps**:
1. Style `LoginPage.tsx` with Tailwind
   - Centred card, 400px wide
   - Inline error display
2. Add global error boundary component
3. Verify 404 redirects to `/records`

**Completion criteria**: Login works. Wrong credentials show inline error. Crash caught by boundary.

---

### Phase 7 — Final Audit (45 min)
**Objective**: System consistency before shipping.

**Checklist**:
- All interactive elements respond in <100ms
- Tab order logical on every page
- No `alert()` calls remain
- No inline `style={{}}` remains
- TypeScript compiles clean
- Contrast ratios pass WCAG AA (4.5:1)
- No console logs remain
- Tested at 100%, 90%, 110% zoom

---

## Implementation Notes

### Tailwind Configuration Structure

```javascript
// tailwind.config.js example structure
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0969da',
        text: {
          primary: '#1f2328',
          secondary: '#656d76',
        },
        // ... full palette
      },
      fontSize: {
        // Named sizes matching our scale
      },
    },
  },
};
```

### Component Class Pattern

Instead of inline `style={{}}`, use Tailwind classes:
```jsx
// Before
<button style={{ padding: '0.6rem 1.5rem', backgroundColor: '#007bff' }}>

// After
<button className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded">
```

### Removing Inline Styles

Global find-replace strategy:
1. Phase 2: MainLayout only
2. Phase 3: RecordsTable + RecordDetailsModal
3. Phase 4: DeliveryForm
4. Phase 5: AdvancedSearch
5. Phase 6: LoginPage
6. Phase 7: Any remaining inline styles in utility files

---

## Reference: Design System in CSS

For quick lookup without scrolling:

**Colours**: Primary `#0969da`, Text `#1f2328`, Secondary `#656d76`, Border `#d0d7de`, Surface `#f6f8fa`  
**Type**: System font stack, sizes 12/13/14/16/20px, mono for serials  
**Spacing**: 4px base (Tailwind default)  
**Height**: Header 48px, inputs/buttons 32px, table rows 36px  
**Radius**: 4px everywhere  
**Focus**: 2px `#0969da` border, 2px offset  

---

## Completion Criteria — Full System

When all 7 phases are complete:
- [ ] No inline `style={{}}` remains
- [ ] No Tailwind config changes needed after Phase 1
- [ ] Table is scannable in <3 seconds
- [ ] Form entry to submission <90 seconds
- [ ] Search results appear in <300ms
- [ ] Login → Records → New Record flow is seamless
- [ ] All colours are semantic (only badges use colour)
- [ ] Focus visible on all interactive elements
- [ ] Contrast ratios pass WCAG AA
- [ ] No animations, all interactions instant
