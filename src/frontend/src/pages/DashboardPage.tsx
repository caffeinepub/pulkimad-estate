import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useSummary } from "../hooks/useQueries";
import { formatINR } from "../utils/format";

export function DashboardPage() {
  const { data: summary, isLoading } = useSummary();

  const totalCredits = summary ? Number(summary.totalCredits) : 0;
  const totalDebits = summary ? Number(summary.totalDebits) : 0;
  const totalSalary = summary ? Number(summary.totalSalaryPaid) : 0;
  const totalEquipment = summary ? Number(summary.totalEquipmentCost) : 0;
  const netPL = summary ? Number(summary.netProfitLoss) : 0;
  const workerCount = summary ? Number(summary.workerCount) : 0;
  const equipmentCount = summary ? Number(summary.equipmentCount) : 0;
  const isProfit = netPL >= 0;

  const kpiCards = [
    {
      title: "Total Income",
      value: formatINR(totalCredits),
      icon: TrendingUp,
      color: "text-estate-green-mid",
      bg: "bg-green-50",
      ocid: "dashboard.income.card",
    },
    {
      title: "Total Expenses",
      value: formatINR(totalDebits + totalSalary),
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-red-50",
      ocid: "dashboard.expenses.card",
    },
    {
      title: "No. of Workers",
      value: String(workerCount),
      icon: Users,
      color: "text-estate-brown",
      bg: "bg-amber-50",
      ocid: "dashboard.workers.card",
    },
    {
      title: "Worker Expenditure",
      value: formatINR(totalSalary),
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-red-50",
      ocid: "dashboard.workerexp.card",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-estate-text">
          Dashboard
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your estate's financial health
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

      {/* Profit/Loss Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card
          data-ocid="dashboard.profitloss.card"
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
                  {isProfit ? "Net Profit" : "Net Loss"}
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
            <p className="text-xs text-muted-foreground mt-3">
              Income − (Transactions + Salaries + Equipment)
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-estate-text">
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Coffee Sales & Credits",
                value: totalCredits,
                positive: true,
              },
              {
                label: "Transaction Debits",
                value: totalDebits,
                positive: false,
              },
              { label: "Salaries Paid", value: totalSalary, positive: false },
              {
                label: "Equipment Cost",
                value: totalEquipment,
                positive: false,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-1 border-b border-border last:border-0"
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

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-estate-text">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active Workers
              </span>
              {isLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <span className="font-bold text-estate-text">
                  {workerCount}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Worker Expenditure
              </span>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <span className="font-bold text-destructive">
                  {formatINR(totalSalary)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Equipment Pieces
              </span>
              {isLoading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <span className="font-bold text-estate-text">
                  {equipmentCount}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Equipment Value
              </span>
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <span className="font-bold text-estate-text">
                  {formatINR(totalEquipment)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
