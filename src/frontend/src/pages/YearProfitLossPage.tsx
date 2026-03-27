import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AnnualRecord } from "../backend.d";
import {
  useAnnualRecordMutation,
  useAnnualRecords,
  useEquipment,
  useTransactions,
} from "../hooks/useQueries";
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

interface YearProfitLossPageProps {
  yearLabel: string;
}

type FieldKey =
  | "coffeeIncome"
  | "pepperIncome"
  | "arecanutIncome"
  | "paddyIncome"
  | "fertilisers"
  | "irrigation"
  | "managerSalary"
  | "workersTotalSalary"
  | "miscellaneous";

const EMPTY_RECORD = (yearLabel: string): AnnualRecord => ({
  yearLabel,
  coffeeIncome: BigInt(0),
  pepperIncome: BigInt(0),
  arecanutIncome: BigInt(0),
  paddyIncome: BigInt(0),
  fertilisers: BigInt(0),
  irrigation: BigInt(0),
  managerSalary: BigInt(0),
  workersTotalSalary: BigInt(0),
  miscellaneous: BigInt(0),
});

export function YearProfitLossPage({ yearLabel }: YearProfitLossPageProps) {
  const { data: records = [], isLoading: recordsLoading } = useAnnualRecords();
  const { data: allTransactions = [], isLoading: txLoading } =
    useTransactions();
  const { data: allEquipment = [], isLoading: eqLoading } = useEquipment();
  const { save } = useAnnualRecordMutation();

  const isLoading = recordsLoading || txLoading || eqLoading;

  const existing = records.find((r) => r.yearLabel === yearLabel);
  const [form, setForm] = useState<Record<FieldKey, string>>(() => ({
    coffeeIncome: "0",
    pepperIncome: "0",
    arecanutIncome: "0",
    paddyIncome: "0",
    fertilisers: "0",
    irrigation: "0",
    managerSalary: "0",
    workersTotalSalary: "0",
    miscellaneous: "0",
  }));

  useEffect(() => {
    if (existing) {
      setForm({
        coffeeIncome: String(Number(existing.coffeeIncome)),
        pepperIncome: String(Number(existing.pepperIncome)),
        arecanutIncome: String(Number(existing.arecanutIncome)),
        paddyIncome: String(Number(existing.paddyIncome)),
        fertilisers: String(Number(existing.fertilisers)),
        irrigation: String(Number(existing.irrigation)),
        managerSalary: String(Number(existing.managerSalary)),
        workersTotalSalary: String(Number(existing.workersTotalSalary)),
        miscellaneous: String(Number(existing.miscellaneous)),
      });
    }
  }, [existing]);

  // Transaction-derived data
  const yearTransactions = allTransactions.filter((t) =>
    isInFinancialYear(t.date, yearLabel),
  );
  const yearEquipment = allEquipment.filter((e) =>
    isInFinancialYear(e.purchaseDate, yearLabel),
  );

  const txIncome = yearTransactions
    .filter((t) => String(t.txType) === "credit")
    .reduce((s, t) => s + Number(t.amount), 0);
  const txExpenses = yearTransactions
    .filter((t) => String(t.txType) === "debit")
    .reduce((s, t) => s + Number(t.amount), 0);
  const eqCost = yearEquipment.reduce((s, e) => s + Number(e.cost), 0);

  // Annual record derived numbers
  const recordIncome =
    Number(form.coffeeIncome || 0) +
    Number(form.pepperIncome || 0) +
    Number(form.arecanutIncome || 0) +
    Number(form.paddyIncome || 0);

  const recordExpenses =
    Number(form.fertilisers || 0) +
    Number(form.irrigation || 0) +
    Number(form.managerSalary || 0) +
    Number(form.workersTotalSalary || 0) +
    Number(form.miscellaneous || 0);

  const totalIncome = txIncome + recordIncome;
  const totalExpenses = txExpenses + eqCost + recordExpenses;
  const netPL = totalIncome - totalExpenses;
  const isProfit = netPL >= 0;

  const maxVal = Math.max(totalIncome, totalExpenses, 1);

  async function handleSave() {
    try {
      const record: AnnualRecord = {
        ...EMPTY_RECORD(yearLabel),
        coffeeIncome: BigInt(Number(form.coffeeIncome) || 0),
        pepperIncome: BigInt(Number(form.pepperIncome) || 0),
        arecanutIncome: BigInt(Number(form.arecanutIncome) || 0),
        paddyIncome: BigInt(Number(form.paddyIncome) || 0),
        fertilisers: BigInt(Number(form.fertilisers) || 0),
        irrigation: BigInt(Number(form.irrigation) || 0),
        managerSalary: BigInt(Number(form.managerSalary) || 0),
        workersTotalSalary: BigInt(Number(form.workersTotalSalary) || 0),
        miscellaneous: BigInt(Number(form.miscellaneous) || 0),
      };
      await save.mutateAsync(record);
      toast.success("Annual record saved");
    } catch {
      toast.error("Failed to save annual record");
    }
  }

  const setField = (key: FieldKey, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-estate-text">
            Profit / Loss
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {yearLabel} — Full financial breakdown
          </p>
        </div>
        <Button
          data-ocid="pl.save_button"
          onClick={handleSave}
          disabled={save.isPending}
          className="bg-estate-green hover:bg-estate-green-mid text-primary-foreground"
        >
          {save.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save
        </Button>
      </div>

      {/* Net P/L Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          data-ocid="pl.result.card"
          className={`shadow-card-hover border-2 text-center ${
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
                {isProfit ? "Profit" : "Loss"} · {yearLabel}
              </p>
              {isLoading ? (
                <Skeleton className="h-14 w-48" />
              ) : (
                <p className="text-5xl font-bold font-display">
                  {formatINR(Math.abs(netPL))}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm mx-auto">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Income</p>
                <p className="font-bold text-estate-green-mid">
                  {formatINR(totalIncome)}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                <p className="font-bold text-destructive">
                  {formatINR(totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Section */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card data-ocid="pl.income.card" className="shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-estate-green-mid">
                <TrendingUp className="w-4 h-4" /> Income Breakdown
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Total: {formatINR(totalIncome)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pb-2 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Crop Income (Manual)
                </p>
                {(
                  [
                    ["coffeeIncome", "Coffee Income"],
                    ["pepperIncome", "Pepper Income"],
                    ["arecanutIncome", "Arecanut Income"],
                    ["paddyIncome", "Paddy Income"],
                  ] as [FieldKey, string][]
                ).map(([key, label]) => (
                  <div key={key} className="mb-3">
                    <Label className="text-xs mb-1 block">{label} (₹)</Label>
                    <Input
                      data-ocid={`pl.${key}.input`}
                      type="number"
                      min="0"
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  From Transactions
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credits</span>
                  <span className="font-semibold text-estate-green-mid">
                    +{formatINR(txIncome)}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <Progress
                  value={(totalIncome / maxVal) * 100}
                  className="h-2 bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expenses Section */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card data-ocid="pl.expenses.card" className="shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <TrendingDown className="w-4 h-4" /> Expense Breakdown
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Total: {formatINR(totalExpenses)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pb-2 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Operating Expenses (Manual)
                </p>
                {(
                  [
                    ["fertilisers", "Fertilisers"],
                    ["irrigation", "Irrigation"],
                    ["managerSalary", "Manager's Salary"],
                    ["workersTotalSalary", "Workers Total Salary"],
                    ["miscellaneous", "Miscellaneous"],
                  ] as [FieldKey, string][]
                ).map(([key, label]) => (
                  <div key={key} className="mb-3">
                    <Label className="text-xs mb-1 block">{label} (₹)</Label>
                    <Input
                      data-ocid={`pl.${key}.input`}
                      type="number"
                      min="0"
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  From Records
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Transaction Debits
                  </span>
                  <span className="font-semibold text-destructive">
                    -{formatINR(txExpenses)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equipment Cost</span>
                  <span className="font-semibold text-destructive">
                    -{formatINR(eqCost)}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <Progress
                  value={(totalExpenses / maxVal) * 100}
                  className="h-2 bg-muted [&>div]:bg-destructive"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
