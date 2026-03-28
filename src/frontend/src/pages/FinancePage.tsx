import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TxType } from "../backend";
import type { Transaction } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useTransactionMutations, useTransactions } from "../hooks/useQueries";
import { formatINR } from "../utils/format";

const CATEGORIES = [
  "Coffee Sales",
  "Labour",
  "Maintenance",
  "Fertilizers",
  "Transport",
  "Miscellaneous",
];

function isInFinancialYear(date: string, yearLabel: string): boolean {
  const parts = yearLabel.split("-");
  const startYear = Number(parts[0]);
  const endYear = Number(parts[1]);
  const d = new Date(date);
  return (
    d >= new Date(`${startYear}-04-01`) && d <= new Date(`${endYear}-03-31`)
  );
}

interface FormState {
  txType: TxType;
  category: string;
  amount: string;
  date: string;
  description: string;
}

const emptyForm = (yearFilter?: string): FormState => ({
  txType: TxType.credit,
  category: "",
  amount: "",
  date: yearFilter
    ? `${yearFilter.split("-")[0]}-04-01`
    : new Date().toISOString().slice(0, 10),
  description: "",
});

interface FinancePageProps {
  yearFilter?: string;
}

export function FinancePage({ yearFilter }: FinancePageProps) {
  const { data: allTransactions = [], isLoading } = useTransactions();
  const { add, update, remove } = useTransactionMutations();
  const { actor, isFetching } = useActor();
  const backendNotReady = !actor || isFetching;
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(yearFilter));
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const transactions = yearFilter
    ? allTransactions.filter((t) => isInFinancialYear(t.date, yearFilter))
    : allTransactions;

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.txType === filter;
  });

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm(yearFilter));
    setShowModal(true);
  }

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setForm({
      txType: tx.txType,
      category: tx.category,
      amount: String(Number(tx.amount)),
      date: tx.date,
      description: tx.description,
    });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.category || !form.amount || !form.date) {
      toast.error("Please fill in all required fields");
      return;
    }
    const amount = BigInt(Math.round(Number.parseFloat(form.amount)));
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          txType: form.txType,
          category: form.category,
          amount,
          date: form.date,
          description: form.description,
        });
        toast.success("Transaction updated");
      } else {
        await add.mutateAsync({
          txType: form.txType,
          category: form.category,
          amount,
          date: form.date,
          description: form.description,
        });
        toast.success("Transaction added");
      }
      setShowModal(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Failed to save transaction");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success("Transaction deleted");
      setDeleteId(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Failed to delete transaction");
    }
  }

  const isSaving = add.isPending || update.isPending;
  const isDeleting = remove.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-estate-text">
            Transactions
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {yearFilter
              ? `Showing transactions for ${yearFilter}`
              : "Track all credits and debits"}
          </p>
        </div>
        <Button
          data-ocid="finance.add_transaction.primary_button"
          onClick={openAdd}
          disabled={backendNotReady}
          className="bg-estate-green hover:bg-estate-green-mid text-primary-foreground"
        >
          {backendNotReady ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" /> Add Transaction
            </>
          )}
        </Button>
      </div>

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as "all" | TxType)}
      >
        <TabsList className="bg-muted">
          <TabsTrigger data-ocid="finance.all.tab" value="all">
            All
          </TabsTrigger>
          <TabsTrigger data-ocid="finance.credit.tab" value={TxType.credit}>
            Credits
          </TabsTrigger>
          <TabsTrigger data-ocid="finance.debit.tab" value={TxType.debit}>
            Debits
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2
                    data-ocid="finance.loading_state"
                    className="w-6 h-6 animate-spin mx-auto text-muted-foreground"
                  />
                </TableCell>
              </TableRow>
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  data-ocid="finance.empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  No transactions found. Add your first entry.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((tx, idx) => (
                <motion.tr
                  key={String(tx.id)}
                  data-ocid={`finance.item.${idx + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-border last:border-0"
                >
                  <TableCell className="text-sm">{tx.date}</TableCell>
                  <TableCell>
                    {tx.txType === TxType.credit ? (
                      <Badge className="bg-green-100 text-estate-green-mid border-green-200 gap-1">
                        <TrendingUp className="w-3 h-3" /> Credit
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-destructive border-red-200 gap-1">
                        <TrendingDown className="w-3 h-3" /> Debit
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{tx.category}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {tx.description}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold text-sm ${
                      tx.txType === TxType.credit
                        ? "text-estate-green-mid"
                        : "text-destructive"
                    }`}
                  >
                    {tx.txType === TxType.credit ? "+" : "-"}
                    {formatINR(Number(tx.amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        data-ocid={`finance.edit_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(tx)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        data-ocid={`finance.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(tx.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-ocid="finance.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1 block text-sm">Type</Label>
              <div className="flex gap-2">
                <Button
                  data-ocid="finance.credit.toggle"
                  type="button"
                  variant={
                    form.txType === TxType.credit ? "default" : "outline"
                  }
                  className={
                    form.txType === TxType.credit
                      ? "bg-estate-green-mid text-white flex-1"
                      : "flex-1"
                  }
                  onClick={() =>
                    setForm((p) => ({ ...p, txType: TxType.credit }))
                  }
                >
                  <TrendingUp className="w-4 h-4 mr-1" /> Credit
                </Button>
                <Button
                  data-ocid="finance.debit.toggle"
                  type="button"
                  variant={
                    form.txType === TxType.debit ? "destructive" : "outline"
                  }
                  className="flex-1"
                  onClick={() =>
                    setForm((p) => ({ ...p, txType: TxType.debit }))
                  }
                >
                  <TrendingDown className="w-4 h-4 mr-1" /> Debit
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="fin-cat" className="mb-1 block text-sm">
                Category *
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger data-ocid="finance.category.select" id="fin-cat">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fin-amount" className="mb-1 block text-sm">
                Amount (₹) *
              </Label>
              <Input
                data-ocid="finance.amount.input"
                id="fin-amount"
                type="number"
                min="0"
                placeholder="e.g. 50000"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="fin-date" className="mb-1 block text-sm">
                Date *
              </Label>
              <Input
                data-ocid="finance.date.input"
                id="fin-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="fin-desc" className="mb-1 block text-sm">
                Description
              </Label>
              <Textarea
                data-ocid="finance.description.textarea"
                id="fin-desc"
                placeholder="Optional notes"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="finance.cancel_button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="finance.submit_button"
              onClick={handleSubmit}
              disabled={isSaving || backendNotReady}
              className="bg-estate-green hover:bg-estate-green-mid text-primary-foreground"
            >
              {(isSaving || backendNotReady) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {backendNotReady ? "Connecting..." : editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent
          data-ocid="finance.delete.dialog"
          className="sm:max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              data-ocid="finance.delete.cancel_button"
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="finance.delete.confirm_button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
