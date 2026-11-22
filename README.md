# PaperLedger — Quote, Invoice & Receipt Studio

A local-first studio for issuing quotations, invoices and official receipts. Everything runs in the browser: no backend, no account, nothing uploaded.

## Features

- **Three-stage lifecycle.** Convert a quotation (`QT-2026-001`) into an invoice (`INV-2026-001`), then into an official receipt (`OR-2026-001`) in one click. Sequence numbers only ever move forward and are stored in `localStorage`. Linked documents show up in the lifecycle stepper.
- **Sender and client details**, with an optional logo. The logo is resized and kept as base64 in `localStorage`.
- **Line items** you can add, reorder (drag, or the up/down buttons), duplicate and delete. Subtotal, discount (flat or %), tax (0%, 12% VAT or a custom rate) and grand total update as you type.
- **Status and due dates.** Draft, Sent, Accepted and Paid statuses, plus automatic badges such as *Due in 7 days*, *Overdue by 3 days* and *Expired*. A **Paid** stamp appears on the A4 sheet once a document is paid.
- **Saves automatically** on every change. The History drawer has search and filters, and handles **Export JSON Backup** and **Import JSON**. Imported files are validated before use.
- **Print-ready PDF.** Dedicated `@media print` rules print only the document, at exactly 210 × 297 mm, with accent colours kept (`print-color-adjust: exact`).
- **Brand accent** (Deep Navy, Deep Teal, Terracotta, Charcoal) and currency (PHP ₱, USD $, EUR €).
- **Responsive.** On desktop, the editor and live preview sit side by side. On mobile, you switch between Edit and Live Preview, with a fixed action bar for Export PDF and Convert.

Three demo documents load on first visit. **Reset Demo** brings them back.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview
```

## Deploy

Static output in `dist/`.

- **Cloudflare Pages:** build command `npm run build`, output directory `dist`.
- **Vercel:** import the repo. `vercel.json` already sets the Vite build.

## Structure

```
src/
  types.ts                 Domain model
  lib/                     Pure logic: totals, numbering, dates, money, status, storage, seed data
  state/studio.ts          Reducer, persistence and actions
  components/
    TopBar.tsx             Brand, history, currency, accent, reset, print
    HistoryDrawer.tsx      Saved documents, new/duplicate/delete, JSON backup
    MobileActionBar.tsx    Mobile Export PDF / Convert
    editor/                Collapsible form sections and field primitives
    preview/               A4 document and scale-to-fit preview
```
