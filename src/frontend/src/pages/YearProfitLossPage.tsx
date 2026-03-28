import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AnnualExtras } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useAnnualExtras,
  useAnnualExtrasMutation,
  useEquipment,
  useExpenseItemMutations,
  useExpenseItems,
  useIncomeItemMutations,
  useIncomeItems,
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

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  };
}

interface AddItemRowProps {
  onAdd: (name: string, amount: bigint) => Promise<unknown>;
  isPending: boolean;
  placeholder: string;
  ocidPrefix: string;
  disabled?: boolean;
}

function AddItemRow({
  onAdd,
  isPending,
  placeholder,
  ocidPrefix,
  disabled,
}: AddItemRowProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  async function handleAdd() {
    const trimmed = name.trim();
    const val = Number(amount);
    if (!trimmed || !val || val <= 0) {
      toast.error("Enter a valid name and amount");
      return;
    }
    await onAdd(trimmed, BigInt(Math.round(val)));
    setName("");
    setAmount("");
  }

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-dashed border-border">
      <Input
        data-ocid={`${ocidPrefix}.input`}
        placeholder={placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 text-sm flex-1"
        onKeyDown={(e) => e.key === "Enter" && !disabled && handleAdd()}
        disabled={disabled}
      />
      <Input
        data-ocid={`${ocidPrefix}.amount_input`}
        type="number"
        min="0"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="h-8 text-sm w-36"
        onKeyDown={(e) => e.key === "Enter" && !disabled && handleAdd()}
        disabled={disabled}
      />
      <div className="relative">
        <Button
          data-ocid={`${ocidPrefix}.add_button`}
          size="sm"
          onClick={handleAdd}
          disabled={isPending || disabled}
          title={disabled ? "Backend connecting..." : undefined}
          className="h-8 px-3 bg-estate-green hover:bg-estate-green-mid text-primary-foreground"
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </Button>
        {disabled && (
          <span className="absolute -bottom-5 right-0 text-xs text-muted-foreground whitespace-nowrap">
            Connecting...
          </span>
        )}
      </div>
    </div>
  );
}

type SaveStatus = "idle" | "saving" | "saved";

export function YearProfitLossPage({ yearLabel }: YearProfitLossPageProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: extrasData, isLoading: extrasLoading } =
    useAnnualExtras(yearLabel);
  const { data: allTransactions = [], isLoading: txLoading } =
    useTransactions();
  const { data: allEquipment = [], isLoading: eqLoading } = useEquipment();
  const { data: incomeItems = [], isLoading: incomeLoading } =
    useIncomeItems(yearLabel);
  const { data: expenseItems = [], isLoading: expenseLoading } =
    useExpenseItems(yearLabel);
  const { save: saveExtras } = useAnnualExtrasMutation();
  const incomeMutations = useIncomeItemMutations(yearLabel);
  const expenseMutations = useExpenseItemMutations(yearLabel);

  const isLoading =
    txLoading || eqLoading || extrasLoading || incomeLoading || expenseLoading;

  const [extras, setExtras] = useState({
    openingBalance: "0",
    closingBalance: "0",
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (extrasData) {
      setExtras({
        openingBalance: String(Number(extrasData.openingBalance)),
        closingBalance: String(Number(extrasData.closingBalance)),
      });
    }
  }, [extrasData]);

  // Mark as mounted after first render so autosave doesn't fire immediately
  useEffect(() => {
    isMounted.current = true;
  }, []);

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

  const incomeItemsTotal = incomeItems.reduce(
    (s, i) => s + Number(i.amount),
    0,
  );
  const expenseItemsTotal = expenseItems.reduce(
    (s, i) => s + Number(i.amount),
    0,
  );

  const totalIncome = txIncome + incomeItemsTotal;
  const totalExpenses = txExpenses + eqCost + expenseItemsTotal;
  const netPL = totalIncome - totalExpenses;
  const isProfit = netPL >= 0;
  const maxVal = Math.max(totalIncome, totalExpenses, 1);

  const openingBalance = Number(extras.openingBalance || 0);
  const closingBalance = Number(extras.closingBalance || 0);

  const handleSaveBalances = useCallback(
    async (ob: string, cb: string) => {
      setSaveStatus("saving");
      try {
        await saveExtras.mutateAsync({
          yearLabel,
          openingBalance: BigInt(Number(ob) || 0),
          closingBalance: BigInt(Number(cb) || 0),
        });
        setSaveStatus("saved");
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error(msg || "Failed to save balances");
        setSaveStatus("idle");
      }
    },
    [yearLabel, saveExtras],
  );

  // Autosave debounce for balances
  useEffect(() => {
    if (!isMounted.current) return;
    const ob = extras.openingBalance;
    const cb = extras.closingBalance;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      handleSaveBalances(ob, cb);
    }, 1500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [extras.openingBalance, extras.closingBalance, handleSaveBalances]);

  const backendNotReady = !actor || actorFetching;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-estate-text">
            Profit / Loss
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {yearLabel} — Full financial breakdown
          </p>
        </div>
        {/* Autosave status indicator */}
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-estate-green-mid font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>
      </motion.div>

      {/* Opening Balance */}
      <motion.div {...fade(0.05)}>
        <Card className="border-2 border-blue-200 shadow-card bg-blue-50/50">
          <CardContent className="py-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">Opening Balance</p>
                <p className="text-xs text-blue-600">
                  Balance at start of {yearLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm text-blue-700 w-28 shrink-0">
                Amount (₹)
              </Label>
              <Input
                data-ocid="pl.openingbalance.input"
                type="number"
                min="0"
                value={extras.openingBalance}
                onChange={(e) =>
                  setExtras((p) => ({ ...p, openingBalance: e.target.value }))
                }
                className="h-9 text-sm max-w-xs border-blue-200 focus:ring-blue-400"
                placeholder="e.g. 100000"
              />
              {!isLoading && openingBalance > 0 && (
                <span className="text-blue-700 font-bold text-sm">
                  {formatINR(openingBalance)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Net P/L Hero */}
      <motion.div {...fade(0.1)}>
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
                <p className="text-xs text-muted-foreground mb-1">
                  Total Income
                </p>
                <p className="font-bold text-estate-green-mid">
                  {formatINR(totalIncome)}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Expenses
                </p>
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
        <motion.div {...fade(0.15)}>
          <Card data-ocid="pl.income.card" className="shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-estate-green-mid">
                <TrendingUp className="w-4 h-4" /> Income Breakdown
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Total: {formatINR(totalIncome)}
              </p>
            </CardHeader>
            <CardContent className="space-y-1">
              {incomeLoading ? (
                <div data-ocid="pl.income.loading_state" className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <AnimatePresence>
                  {incomeItems.length === 0 && (
                    <motion.p
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-muted-foreground italic py-2"
                      data-ocid="pl.income.empty_state"
                    >
                      No income entries yet. Add one below.
                    </motion.p>
                  )}
                  {incomeItems.map((item, idx) => (
                    <motion.div
                      key={String(item.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group"
                      data-ocid={`pl.income.item.${idx + 1}`}
                    >
                      <span className="text-sm font-medium flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold text-estate-green-mid mx-3">
                        +{formatINR(Number(item.amount))}
                      </span>
                      <button
                        type="button"
                        data-ocid={`pl.income.delete_button.${idx + 1}`}
                        onClick={() =>
                          incomeMutations.remove
                            .mutateAsync(item.id)
                            .catch((e: unknown) => {
                              const msg =
                                e instanceof Error ? e.message : String(e);
                              toast.error(msg || "Failed to delete");
                            })
                        }
                        disabled={
                          incomeMutations.remove.isPending || backendNotReady
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <AddItemRow
                onAdd={(name, amount) =>
                  incomeMutations.add
                    .mutateAsync({ name, amount })
                    .then(() => toast.success("Income added"))
                    .catch((e: unknown) => {
                      const msg = e instanceof Error ? e.message : String(e);
                      toast.error(msg || "Failed to add");
                    })
                }
                isPending={incomeMutations.add.isPending}
                placeholder="Crop / income source"
                ocidPrefix="pl.income"
                disabled={backendNotReady}
              />

              <div className="pt-3 mt-3 border-t border-border">
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
        <motion.div {...fade(0.2)}>
          <Card data-ocid="pl.expenses.card" className="shadow-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <TrendingDown className="w-4 h-4" /> Expense Breakdown
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Total: {formatINR(totalExpenses)}
              </p>
            </CardHeader>
            <CardContent className="space-y-1">
              {expenseLoading ? (
                <div
                  data-ocid="pl.expenses.loading_state"
                  className="space-y-2"
                >
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <AnimatePresence>
                  {expenseItems.length === 0 && (
                    <motion.p
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-muted-foreground italic py-2"
                      data-ocid="pl.expenses.empty_state"
                    >
                      No expense entries yet. Add one below.
                    </motion.p>
                  )}
                  {expenseItems.map((item, idx) => (
                    <motion.div
                      key={String(item.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group"
                      data-ocid={`pl.expenses.item.${idx + 1}`}
                    >
                      <span className="text-sm font-medium flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="text-sm font-semibold text-destructive mx-3">
                        -{formatINR(Number(item.amount))}
                      </span>
                      <button
                        type="button"
                        data-ocid={`pl.expenses.delete_button.${idx + 1}`}
                        onClick={() =>
                          expenseMutations.remove
                            .mutateAsync(item.id)
                            .catch((e: unknown) => {
                              const msg =
                                e instanceof Error ? e.message : String(e);
                              toast.error(msg || "Failed to delete");
                            })
                        }
                        disabled={
                          expenseMutations.remove.isPending || backendNotReady
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <AddItemRow
                onAdd={(name, amount) =>
                  expenseMutations.add
                    .mutateAsync({ name, amount })
                    .then(() => toast.success("Expense added"))
                    .catch((e: unknown) => {
                      const msg = e instanceof Error ? e.message : String(e);
                      toast.error(msg || "Failed to add");
                    })
                }
                isPending={expenseMutations.add.isPending}
                placeholder="Expenditure name"
                ocidPrefix="pl.expenses"
                disabled={backendNotReady}
              />

              <div className="pt-3 mt-3 border-t border-border space-y-2">
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

      {/* Closing Balance */}
      <motion.div {...fade(0.25)}>
        <Card className="border-2 border-amber-200 shadow-card bg-amber-50/50">
          <CardContent className="py-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-800">Closing Balance</p>
                <p className="text-xs text-amber-600">
                  Balance at end of {yearLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm text-amber-700 w-28 shrink-0">
                Amount (₹)
              </Label>
              <Input
                data-ocid="pl.closingbalance.input"
                type="number"
                min="0"
                value={extras.closingBalance}
                onChange={(e) =>
                  setExtras((p) => ({ ...p, closingBalance: e.target.value }))
                }
                className="h-9 text-sm max-w-xs border-amber-200 focus:ring-amber-400"
                placeholder="e.g. 150000"
              />
              {!isLoading && closingBalance > 0 && (
                <span className="text-amber-700 font-bold text-sm">
                  {formatINR(closingBalance)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
