import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IndianRupee,
  ListChecks,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useEquipment, useTransactions } from "../hooks/useQueries";
import { formatINR } from "../utils/format";

function isInFinancialYear(date: string, yearLabel: string): boolean {
  const parts = yearLabel.split("-");
  const startYear = Number(parts[0]);
  const endYear = Number(parts[1]);
  const d = new Date(date);
  return (
    d >= new Date(`${startYear}-04-01`) && d <= new Date(`${endYear}-03-31`)
  );
}

interface YearDashboardPageProps {
  yearLabel: string;
}

export function YearDashboardPage({ yearLabel }: YearDashboardPageProps) {
  const { data: allTransactions = [], isLoading: txLoading } =
    useTransactions();
  const { data: allEquipment = [], isLoading: eqLoading } = useEquipment();

  const isLoading = txLoading || eqLoading;

  const transactions = allTransactions.filter((t) =>
    isInFinancialYear(t.date, yearLabel),
  );
  const equipment = allEquipment.filter((e) =>
    isInFinancialYear(e.purchaseDate, yearLabel),
  );

  const totalIncome = transactions
    .filter((t) => t.txType && String(t.txType) === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebits = transactions
    .filter((t) => t.txType && String(t.txType) === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const equipmentCost = equipment.reduce((sum, e) => sum + Number(e.cost), 0);

  const totalExpenses = totalDebits + equipmentCost;
  const netPL = totalIncome - totalExpenses;
  const isProfit = netPL >= 0;

  const kpiCards = [
    {
      title: "Total Income",
      value: formatINR(totalIncome),
      icon: TrendingUp,
      color: "text-estate-green-mid",
      bg: "bg-green-50",
      ocid: "year-dashboard.income.card",
    },
    {
      title: "Total Expenses",
      value: formatINR(totalExpenses),
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-red-50",
      ocid: "year-dashboard.expenses.card",
    },
    {
      title: "Transactions",
      value: String(transactions.length),
      icon: ListChecks,
      color: "text-estate-brown",
      bg: "bg-amber-50",
      ocid: "year-dashboard.transactions.card",
    },
    {
      title: "Equipment Items",
      value: String(equipment.length),
      icon: Wrench,
      color: "text-estate-green",
      bg: "bg-green-50",
      ocid: "year-dashboard.equipment.card",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-estate-text">
          Dashboard
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Financial overview for {yearLabel}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              data-ocid={card.ocid}
              className="bg-card shadow-card hover:shadow-card-hover transition-shadow"
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className={`text-xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Net P/L Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card
          data-ocid="year-dashboard.profitloss.card"
          className={`shadow-card-hover border-2 ${
            isProfit
              ? "border-estate-green-mid bg-green-50"
              : "border-destructive bg-red-50"
          }`}
        >
          <CardContent className="py-8 text-center">
            <div
              className={`inline-flex items-center gap-3 ${
                isProfit ? "text-estate-green" : "text-destructive"
              }`}
            >
              <IndianRupee className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium uppercase tracking-widest mb-1">
                  {isProfit ? "Net Profit" : "Net Loss"} · {yearLabel}
                </p>
                {isLoading ? (
                  <Skeleton className="h-10 w-36 mx-auto" />
                ) : (
                  <p className="text-4xl font-bold font-display">
                    {formatINR(Math.abs(netPL))}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-estate-text">
              Year Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                label: "Transaction Credits",
                value: totalIncome,
                positive: true,
              },
              {
                label: "Transaction Debits",
                value: totalDebits,
                positive: false,
              },
              {
                label: "Equipment Cost",
                value: equipmentCost,
                positive: false,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {row.label}
                </span>
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      row.positive
                        ? "text-estate-green-mid"
                        : "text-destructive"
                    }`}
                  >
                    {row.positive ? "+" : "-"}
                    {formatINR(row.value)}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
