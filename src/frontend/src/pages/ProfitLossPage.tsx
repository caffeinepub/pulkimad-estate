import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

export function ProfitLossPage() {
  const { data: summary, isLoading } = useSummary();

  const totalCredits = summary ? Number(summary.totalCredits) : 0;
  const totalDebits = summary ? Number(summary.totalDebits) : 0;
  const totalSalary = summary ? Number(summary.totalSalaryPaid) : 0;
  const totalEquipment = summary ? Number(summary.totalEquipmentCost) : 0;
  const netPL = summary ? Number(summary.netProfitLoss) : 0;
  const totalExpenses = totalDebits + totalSalary + totalEquipment;
  const isProfit = netPL >= 0;

  const expenseBreakdown = [
    {
      label: "Transaction Debits",
      value: totalDebits,
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      label: "Salaries Paid",
      value: totalSalary,
      icon: Users,
      color: "text-amber-600",
    },
    {
      label: "Equipment Cost",
      value: totalEquipment,
      icon: Wrench,
      color: "text-estate-brown",
    },
  ];

  const maxVal = Math.max(totalCredits, totalExpenses, 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-estate-text">
          Profit / Loss Analysis
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Full financial breakdown of the estate
        </p>
      </div>

      {/* Net Result */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          data-ocid="pl.result.card"
          className={`shadow-card-hover border-2 text-center py-2 ${
            isProfit ? "border-estate-green-mid" : "border-destructive"
          }`}
        >
          <CardContent className="py-8">
            <div
              className={`inline-flex flex-col items-center gap-2 ${
                isProfit ? "text-estate-green" : "text-destructive"
              }`}
            >
              {isProfit ? (
                <TrendingUp className="w-10 h-10" />
              ) : (
                <TrendingDown className="w-10 h-10" />
              )}
              <p className="text-sm font-semibold uppercase tracking-widest">
                {isProfit ? "Profit" : "Loss"}
              </p>
              {isLoading ? (
                <Skeleton className="h-14 w-48" />
              ) : (
                <p className="text-5xl font-bold font-display">
                  {formatINR(Math.abs(netPL))}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Income {isProfit ? "exceeds" : "falls short of"} expenses by
                this amount
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Income vs Expense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card data-ocid="pl.income.card" className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-estate-green-mid">
                <TrendingUp className="w-4 h-4" /> Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-3xl font-bold font-display text-estate-green">
                  {formatINR(totalCredits)}
                </p>
              )}
              <div className="mt-3">
                <Progress
                  value={isLoading ? 0 : (totalCredits / maxVal) * 100}
                  className="h-2 bg-muted"
                  style={
                    {
                      "--progress-color": "oklch(0.51 0.10 148)",
                    } as React.CSSProperties
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All credited transactions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card data-ocid="pl.expenses.card" className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <TrendingDown className="w-4 h-4" /> Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-3xl font-bold font-display text-destructive">
                  {formatINR(totalExpenses)}
                </p>
              )}
              <div className="mt-3">
                <Progress
                  value={isLoading ? 0 : (totalExpenses / maxVal) * 100}
                  className="h-2 bg-muted [&>div]:bg-destructive"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Debits + Salaries + Equipment
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Expense Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card data-ocid="pl.breakdown.card" className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-estate-text">
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {expenseBreakdown.map((item, idx) => {
              const pct =
                totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-medium text-estate-text">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right">
                      {isLoading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        <span className={`text-sm font-semibold ${item.color}`}>
                          {formatINR(item.value)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    data-ocid={`pl.breakdown.item.${idx + 1}`}
                    value={isLoading ? 0 : pct}
                    className="h-1.5 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "" : `${pct.toFixed(1)}% of total expenses`}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card data-ocid="pl.summary.card" className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-estate-text">
              Full Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {[
                {
                  label: "Total Credits (Income)",
                  value: totalCredits,
                  sign: "+",
                  color: "text-estate-green-mid",
                },
                {
                  label: "Transaction Debits",
                  value: totalDebits,
                  sign: "-",
                  color: "text-destructive",
                },
                {
                  label: "Salaries Paid",
                  value: totalSalary,
                  sign: "-",
                  color: "text-destructive",
                },
                {
                  label: "Equipment Investment",
                  value: totalEquipment,
                  sign: "-",
                  color: "text-destructive",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {row.label}
                  </span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className={`text-sm font-semibold ${row.color}`}>
                      {row.sign}
                      {formatINR(row.value)}
                    </span>
                  )}
                </div>
              ))}
              <div
                className={`flex items-center justify-between py-4 ${
                  isProfit ? "text-estate-green" : "text-destructive"
                }`}
              >
                <span className="font-bold flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Net {isProfit ? "Profit" : "Loss"}
                </span>
                {isLoading ? (
                  <Skeleton className="h-6 w-28" />
                ) : (
                  <span className="text-xl font-bold font-display">
                    {formatINR(Math.abs(netPL))}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
