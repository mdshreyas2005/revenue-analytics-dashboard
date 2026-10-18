# Business Performance & Revenue Analytics Dashboard

A production-quality, highly interactive enterprise admin dashboard engineered with **React 18 + Vite + TypeScript**, **Tailwind CSS**, and **Recharts**.

---

## 🚀 Live Demo & Running Locally

### Development Server
```bash
npm install
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview -- --port 4173
```
- Local preview URL: `http://localhost:4173/`

### Static Deployment (Vercel & Netlify)
The project is pre-configured with:
- **`vercel.json`**: SPA rewrite routing rules (`/(.*)` -> `/index.html`) so refreshing on any route or query string never 404s.
- **`public/_redirects`**: Netlify rewrite rules (`/*  /index.html  200`).
- **`dist/200.html`**: Fallback routing support for Surge / static servers.

To deploy via Vercel CLI:
```bash
vercel --prod
```
To deploy via Netlify CLI:
```bash
netlify deploy --prod --dir=dist
```

---

## 📊 Architecture & Features

### 1. Seeded Dummy-Data Engine (`src/data/seedData.ts`)
- **Deterministic Mulberry32 PRNG**: Generates consistent, stable data across page reloads.
- **Time Coverage**: August 1 to October 31, 2026 (anchored at reference date `2026-10-18`).
- **Relational Integrity**:
  - `Leads` (310 records): Inbound sources (Google Ads, Website, Just Dial, Other), status (New, Qualified, Converted, Unqualified), sales owner.
  - `Quotations` (420 records): Linked to leads with commercial services (Private Limited, LLP, GST, Trademark, FSSAI, ISO, etc.), amounts, status (Pending, Accepted, Rejected).
  - `Deals` (105 records): Generated from accepted quotations, priority tiers, stages (`Prospecting` -> `Negotiation` -> `Won` -> `In Delivery` -> `Closed`).
  - `Orders` (155 records): Linked to deals with operations stage milestone progress.
  - `Payments` (260 records): Split installments (Advance, Milestone, Final), payment methods (UPI, Bank Transfer, CC, Cheque, Cash), status (Collected, Pending).
  - `Activities`: Chronological CRM audit trail.

### 2. Global Sticky Filter Bar (`src/components/layout/FilterBar.tsx`)
- **Date Presets**:
  - `Today`: Oct 18, 2026 (compares with Oct 17, 2026).
  - `Last 7 Days`: Oct 12 to Oct 18, 2026 (compares with Oct 05 to Oct 11, 2026).
  - `Last 30 Days` (Default): Sep 19 to Oct 18, 2026 (compares with Aug 20 to Sep 18, 2026).
  - `Custom Date Range`: Interactive start and end date modal picker.
- **User & Department Filters**: Filter by Sales / Operations or individual employees.
- **URL Synchronization**: Active filters are preserved in URL query parameters (`?preset=30days&user=EMP-01&dept=Sales`) for shareable links.

### 3. Previous-Period Comparison Engine (`src/utils/comparisons.ts`)
- Automatically computes matching historical duration: for any selected range of $N$ days, compares against immediately preceding $N$ days.
- Handles division by zero gracefully: outputs `"New"` badge or `"0%"` without crashing.
- Inverts color semantics where appropriate (e.g., reduction in dropped/unqualified leads displays as a positive green indicator).

### 4. Interactive Sections
- **Section 1: Lead Analytics**: 8 KPI comparison cards, ₹85L monthly target progress bar & mini bar chart, 3-stage funnel with unqualified drop branch, multi-line daily trend with legend toggles, stacked area status mix, and donut chart of lead sources.
- **Section 2: Quotation Analytics**: Bar chart by service and acceptance, horizontal quotation value bar, sortable service-wise quotation table, status donut, searchable lead-wise quotation history, and radial gauge for quote-to-deal conversion efficiency.
- **Section 3: Deals & Revenue**: Dual-axis bar chart (Deals Count vs Revenue ₹), service category progress bars, priority segmentation table, deal pipeline stages, and daily booked revenue vs collected cash flow trend.
- **Section 4: Orders & Payments**: 4 order status cards, per-service operational stage completion progress bars, completed orders roster, daily collection & receivables area chart, and searchable payment history ledger with pagination.
- **Section 5: Team Activity**: Sales team productivity table, operations team turnaround table, top performer spotlight cards, and live CRM activity feed.

### 5. Deep Relational Drill-Down (`src/components/drilldown/DrillDownModal.tsx`)
- Slide-over drawer with full breadcrumb navigation:
  `Lead -> Quotations -> Deals -> Orders -> Payments`
- Accessible by clicking any KPI card, chart segment/bar, or table row.
- Results strictly respect active global date and user filters.

### 6. CSV Data Export (`src/utils/exportCsv.ts`)
- Global CSV export button downloads all active filtered tables.
- Table-specific CSV buttons on individual tables.
