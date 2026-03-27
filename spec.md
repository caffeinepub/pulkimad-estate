# Pulkimad Estate

## Current State
Full-stack ICP app for a coffee estate in Coorg. Has: Login (Internet Identity), global Dashboard, Finance (transactions), Equipment, Profit/Loss, and Year Sheets pages. The Year Sheets page already shows year tabs with income/expenditure forms, transactions, and equipment. Logo image exists but may not display due to transparency issues. Users report transactions and equipment saves failing.

## Requested Changes (Diff)

### Add
- **Homepage (Year Index)**: After login, show a beautiful landing page with year cards (2025-2026, 2026-2027, 2027-2028, 2028-2029, 2029-2030, 2030-2031). Each card shows the year label with a decorative design. Clicking a card navigates to that year's detail view.
- **Year Detail View**: When a year is selected, show a secondary navigation with 4 tabs: Dashboard, Transactions, Equipment, Profit/Loss. All data is filtered by the selected financial year (Apr-Mar).
  - **Year Dashboard**: KPI cards for income, expenditure, equipment cost, net P/L for the year. Small summary breakdown.
  - **Year Transactions**: Same as current FinancePage but filtered to the selected year. Full CRUD.
  - **Year Equipment**: Same as current EquipmentPage but filtered to the selected year. Full CRUD.
  - **Year Profit/Loss**: P&L breakdown for that year using AnnualRecord data + transactions + equipment.

### Modify
- **Navigation**: Replace current top nav pages with: Home (returns to year index) + a breadcrumb showing selected year when in year view.
- **Logo**: Fix the logo display — use `object-contain` and add a white/light circular background behind the logo so it's always visible on the dark green header.
- **Save failures fix**: In `useQueries.ts` mutation functions, add `if (!actor) throw new Error('Backend not ready')` guards before calling actor methods. Also add `disabled={!actor}` checks to all submit/save buttons in Finance and Equipment pages.
- **UI Polish**: More attractive homepage, better card designs, richer visual hierarchy.

### Remove
- **Current Year Sheets tab** from nav (replaced by the new homepage → year → tabs flow)
- **Current global Finance, Equipment, Profit/Loss as separate top-level nav items** (accessible through year view instead)
- **Current global Dashboard as top-level nav** (replaced by homepage + year-specific dashboards)

## Implementation Plan
1. Update `App.tsx` page state management: add `selectedYear: string | null` state, add `subPage` for year tabs. Homepage is shown when no year selected.
2. Update `Layout.tsx` / `components/Layout.tsx`: simplify nav to just Logo/Home button + logout. Add breadcrumb when a year is selected.
3. Create `HomePage.tsx`: grid of year cards with decorative design, clicking navigates to year.
4. Create `YearDetailLayout.tsx`: secondary nav with 4 tabs (Dashboard, Transactions, Equipment, Profit/Loss), passes selectedYear to child pages.
5. Create `YearDashboardPage.tsx`: year-specific KPI cards using filtered transactions/equipment.
6. Modify `FinancePage.tsx` to accept optional `yearFilter?: string` prop that filters transactions.
7. Modify `EquipmentPage.tsx` to accept optional `yearFilter?: string` prop that filters equipment.
8. Create `YearProfitLossPage.tsx`: year-specific P&L using AnnualRecord + filtered data.
9. Fix `useQueries.ts`: add actor null guards in all mutation functions.
10. Fix logo: add background circle in Layout so transparent logo is visible.
