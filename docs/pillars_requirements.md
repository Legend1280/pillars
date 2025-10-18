# Pillars Financial Dashboard - Requirements Summary

## Brand Identity (from pillars.care)
- **Logo**: "pillars" text with stylized bar chart columns (green/teal gradient)
- **Primary Colors**: 
  - Teal/Turquoise green (#4DB8A8 range) - primary accent, buttons
  - Dark navy/charcoal (#2C3E50 range) - text, headers
  - Light green accent (#7FD99F range)
  - Yellow/gold accent (visible in logo)
- **Typography**: Clean, modern sans-serif
- **Design Style**: Professional, data-driven, clean white backgrounds with subtle geometric line patterns

## Dashboard Structure (from Framework PDF)

### Layout Components:
1. **Left Sidebar** (Collapsible)
   - Logo at top
   - Section selector/navigation
   - Grouped inputs per section
   - "Reset to Defaults" button

2. **Global Header**
   - Projection tabs: "12-Month Plan", "Ramp & Launch", "Risk Analysis"
   - Summary & ROI ribbon (persistent across all views)
   - Export buttons: "Export to Excel"

3. **Main Canvas**
   - KPI card row (5 cards across top)
   - Dynamic charts grid below

4. **Help System**
   - Info icons (ⓘ) trigger modal popups
   - Markdown content + embedded video support

## 8 Dashboard Sections:

### Section 1: Inputs & Scenarios
- Founding Physician toggle (ON/OFF with fee % and equity %)
- Monthly Growth inputs:
  - New Dexafit Members/Month (slider)
  - New Corporate Contracts/Month (slider)
  - % Conversion to Specialty (slider)
- Primary Care inputs
- Specialty Care inputs
- Diagnostics inputs
- Corporate Contracts inputs

### Section 2: Revenues
- Primary Revenue stream
- Specialty MSO revenue
- Diagnostics revenue
- Corporate revenue
- Combined growth and margin model

### Section 3: Diagnostics
- Echo, Lab, CT assumptions
- Diagnostic service modeling

### Section 4: Costs
- Initial build-out costs
- Ongoing operational costs
- Simple staffing placeholders

### Section 5: Staffing
- Detailed role modeling
- Salaries by position
- Start-month triggers

### Section 6: Financial Summary
- Full P&L view
- ROI analysis
- Capital analysis

### Section 7: Risk & Sensitivity
- Scenario testing
- Variance visualization

### Section 8: Export
- Generate investor/partner summaries

## Key Metrics (from example dashboard image):

### Top KPI Cards:
1. **MSO Total Revenue**: $546,960 (All Sources Month 12)
2. **MSO Net Profit**: $282,872 (Revenue - Costs)
3. **Physician Income**: $72,273 (Specialty + Equity)
4. **Physician ROI**: 144.5% (Annual / Investment)
5. **Physician MSO Income**: $28,287 (10% of Net Profit)

### Charts:
1. **12-Month Financial Projection** (Stacked Bar + Line)
   - Primary Revenue (blue)
   - Specialty MSO (green)
   - Diagnostics (purple)
   - Corporate (yellow)
   - Net Profit (line overlay)

2. **Physician ROI Analysis** (Donut Chart)
   - Specialty Retained (blue)
   - MSO Equity Income (green)
   - Total: $72,273/month

### Physician Details Panel:
- Physician Type: Founding (1 of 4)
- Investment: $600,000
- Equity Stake: 10%
- MSO Service Fee: 37%
- Specialty Revenue Retained: $44,233
- Equity Income from MSO: $28,287
- Monthly Income (Month 12): $72,273
- Annualized Income: $867,276

## Data Schema (JSON):
- Section 1 primitives to be implemented first
- All inputs bound through clean JSON configuration
- Support for future computational layers

## Technical Requirements:
- Responsive single-page application
- Modern front-end stack (React/Vue/Next.js recommended)
- Charting library (Recharts/ECharts/Plotly)
- Collapsible sidebar navigation
- Modal system for help/walkthrough
- Export functionality (Excel, PDF future)
- Modular architecture for section expansion

## User Flow:
Guided walkthrough: Inputs → Revenues → Diagnostics → Costs → Staffing → Summary → Risk → Export

## Business Context:
- MSO (Management Services Organization) model
- Physician equity participation structure
- Subscription-based primary care + specialty add-ons
- DexaFit Denver as proof of concept (400+ monthly DEXA appointments, 2000+ active clients)
- Target: 4 founding physicians at 10%, 5%, 5%, 5% equity stakes

