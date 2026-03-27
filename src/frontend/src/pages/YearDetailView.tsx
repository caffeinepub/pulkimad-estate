import type { YearTab } from "../App";
import { EquipmentPage } from "./EquipmentPage";
import { FinancePage } from "./FinancePage";
import { YearDashboardPage } from "./YearDashboardPage";
import { YearProfitLossPage } from "./YearProfitLossPage";

interface YearDetailViewProps {
  view: { kind: "year"; yearLabel: string; tab: YearTab };
  onChangeTab: (tab: YearTab) => void;
  onHome: () => void;
}

export function YearDetailView({ view }: YearDetailViewProps) {
  const { yearLabel, tab } = view;

  return (
    <div>
      {tab === "dashboard" && <YearDashboardPage yearLabel={yearLabel} />}
      {tab === "transactions" && <FinancePage yearFilter={yearLabel} />}
      {tab === "equipment" && <EquipmentPage yearFilter={yearLabel} />}
      {tab === "profitloss" && <YearProfitLossPage yearLabel={yearLabel} />}
    </div>
  );
}
