# CR EQUITY AI — Acquisition Intelligence Platform

> A premium, institutional-grade underwriting dashboard designed for executive real estate acquisition decisions.

![CR Equity AI](https://img.shields.io/badge/CR_EQUITY_AI-Intelligence_Platform-0ea5e9) 
![Stack](https://img.shields.io/badge/React-19-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan) ![Vercel](https://img.shields.io/badge/Vercel-ready-black)

---

## Brand Positioning
This platform serves as the central **Acquisition Intelligence** hub for CR EQUITY AI. It transitions the standard "student calculator" into a sophisticated fintech underwriting product, built to surface risk signals, benchmark target returns, and generate verifiable Investment Committee (IC) Memos with executive precision.

Visually, it embraces a deeper slate/midnight aesthetic complemented by electric cyan and emerald accents, mimicking top-tier capital markets terminals.

## Core Capabilities

- **Institutional Risk Engine**: Flags structural vulnerabilities (e.g., negative leverage, compressed margins) using smart thresholding logic.
- **Dimensional Scoring**: A weighted composite metric scoring 7 axes of real estate health (Cap Rate, Levered Cash, LTV, DSCR, Opex Ratio, Break-Even, CapEx load).
- **Curated Case Studies**: Built-in, single-click scenarios demonstrating value-add, core-plus, and distressed positioning.
- **IC Memo Generator**: Transforms quantitative inputs into a sharp, narrative-driven output suitable for capital allocators.

## Development Stack

| Layer | Component |
|-------|-----------|
| Framework | Vite + React 19 |
| Styling | Tailwind CSS v4 (Custom Dark Fintech theme) |
| UI & Icons | `lucide-react`, `shadcn/ui` foundation |
| Visualization | `recharts` for Capital Flow Waterfall |

## Architecture

The business logic is intentionally decoupled from the component tree to allow for rapid parameter tuning by the underwriting desk.

```
src/
├── config/
│   └── thresholds.js       # Scoring weights & risk trigger parameters
├── utils/
│   ├── calculations.js     # Exacting real estate formulas
│   ├── recommendation.js   # The 'Underwriting Verdict' engine
│   └── riskEngine.js       # Auto-detects 'Underwriting Signals'
```

## Running Locally

Ensure Node.js is installed.

```bash
npm install
npm run dev
```

The platform is fully Vercel-ready. Push to main and let Vercel handle the Vite build process. SPA routing is safeguarded via `vercel.json`.
