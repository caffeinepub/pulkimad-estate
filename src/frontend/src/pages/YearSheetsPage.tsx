import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Loader2,
  Plus,
  Save,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TxType } from "../backend";
import {
  useAnnualRecordMutation,
  useAnnualRecords,
  useEquipment,
  useEquipmentMutations,
  useTransactionMutations,
  useTransactions,
} from "../hooks/useQueries";
import { formatINR } from "../utils/format";

const YEARS = [
  "2025-2026",
  "2026-2027",
  "2027-2028",
  "2028-2029",
  "2029-2030",
  "2030-2031",
];

const TX_CATEGORIES = [
  "Coffee Sales",
  "Labour",
  "Maintenance",
  "Fertilizers",
  "Transport",
  "Miscellaneous",
  "Other",
];

const EQUIPMENT_CONDITIONS = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Needs Repair",
];
const EQUIPMENT_TYPES = [
  "Machinery",
  "Vehicle",
  "Tool",
  "Irrigation",
  "Storage",
  "Other",
];

interface YearFormState {
  coffeeIncome: string;
  pepperIncome: string;
  arecanutIncome: string;
  paddyIncome: string;
  fertilisers: string;
  irrigation: string;
  managerSalary: string;
  miscellaneous: string;
}

const emptyForm = (): YearFormState => ({
  coffeeIncome: "",
  pepperIncome: "",
  arecanutIncome: "",
  paddyIncome: "",
  fertilisers: "",
  irrigation: "",
  managerSalary: "",
  miscellaneous: "",
});

function parseBigInt(val: string): bigint {
  const n = Number.parseInt(val, 10);
  return BigInt(Number.isNaN(n) || n < 0 ? 0 : n);
}

function toNum(val: string): number {
  const n = Number.parseInt(val, 10);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

function isInFinancialYear(date: string, yearLabel: string): boolean {
  const [startYear, endYear] = yearLabel.split("-").map(Number);
  if (!startYear || !endYear) return false;
  const d = new Date(date);
  const start = new Date(`${startYear}-04-01`);
  const end = new Date(`${endYear}-03-31`);
  return d >= start && d <= end;
}

function financialYearStart(yearLabel: string): string {
  const startYear = yearLabel.split("-")[0];
  return `${startYear}-04-01`;
}

// ─── Transaction Dialog ──────────────────────────────────────────────────────

interface TxDialogProps {
  yearLabel: string;
  onClose: () => void;
}

function AddTransactionDialog({ yearLabel, onClose }: TxDialogProps) {
  const { add } = useTransactionMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    txType: TxType.credit as TxType,
    category: "Coffee Sales",
    amount: "",
    date: financialYearStart(yearLabel),
    description: "",
  });

  const handleSave = () => {
    if (!form.amount || !form.date) {
      toast.error("Amount and date are required");
      return;
    }
    add.mutate(
      {
        txType: form.txType,
        category: form.category,
        amount: parseBigInt(form.amount),
        date: form.date,
        description: form.description,
      },
      {
        onSuccess: () => {
          toast.success("Transaction added");
          setOpen(false);
          onClose();
        },
        onError: () => toast.error("Failed to add transaction"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-estate-green hover:bg-estate-green/90 text-primary-foreground"
          data-ocid="yearsheet.add_transaction.button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="yearsheet.add_transaction.dialog">
        <DialogHeader>
          <DialogTitle>Add Transaction — {yearLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={form.txType === TxType.credit ? "default" : "outline"}
              className={
                form.txType === TxType.credit
                  ? "bg-estate-green hover:bg-estate-green/90"
                  : ""
              }
              onClick={() => setForm((p) => ({ ...p, txType: TxType.credit }))}
            >
              Credit
            </Button>
            <Button
              variant={form.txType === TxType.debit ? "default" : "outline"}
              className={
                form.txType === TxType.debit
                  ? "bg-amber-600 hover:bg-amber-700"
                  : ""
              }
              onClick={() => setForm((p) => ({ ...p, txType: TxType.debit }))}
            >
              Debit
            </Button>
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger data-ocid="yearsheet.tx_category.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TX_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
              data-ocid="yearsheet.tx_amount.input"
            />
          </div>
          <div className="space-y-1">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              data-ocid="yearsheet.tx_date.input"
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              placeholder="Optional description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              data-ocid="yearsheet.tx_description.input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="yearsheet.tx_cancel.button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={add.isPending}
            className="bg-estate-green hover:bg-estate-green/90 text-primary-foreground"
            data-ocid="yearsheet.tx_save.button"
          >
            {add.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditTxDialogProps {
  tx: {
    id: bigint;
    txType: TxType;
    category: string;
    amount: bigint;
    date: string;
    description: string;
  };
}

function EditTransactionDialog({ tx }: EditTxDialogProps) {
  const { update } = useTransactionMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    txType: tx.txType,
    category: tx.category,
    amount: tx.amount.toString(),
    date: tx.date,
    description: tx.description,
  });

  useEffect(() => {
    if (open) {
      setForm({
        txType: tx.txType,
        category: tx.category,
        amount: tx.amount.toString(),
        date: tx.date,
        description: tx.description,
      });
    }
  }, [open, tx]);

  const handleSave = () => {
    update.mutate(
      {
        id: tx.id,
        txType: form.txType,
        category: form.category,
        amount: parseBigInt(form.amount),
        date: form.date,
        description: form.description,
      },
      {
        onSuccess: () => {
          toast.success("Transaction updated");
          setOpen(false);
        },
        onError: () => toast.error("Failed to update"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={form.txType === TxType.credit ? "default" : "outline"}
              className={
                form.txType === TxType.credit
                  ? "bg-estate-green hover:bg-estate-green/90"
                  : ""
              }
              onClick={() => setForm((p) => ({ ...p, txType: TxType.credit }))}
            >
              Credit
            </Button>
            <Button
              variant={form.txType === TxType.debit ? "default" : "outline"}
              className={
                form.txType === TxType.debit
                  ? "bg-amber-600 hover:bg-amber-700"
                  : ""
              }
              onClick={() => setForm((p) => ({ ...p, txType: TxType.debit }))}
            >
              Debit
            </Button>
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TX_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={update.isPending}
            className="bg-estate-green hover:bg-estate-green/90 text-primary-foreground"
          >
            {update.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : null}{" "}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Equipment Dialog ─────────────────────────────────────────────────────────

interface AddEquipmentDialogProps {
  yearLabel: string;
}

function AddEquipmentDialog({ yearLabel }: AddEquipmentDialogProps) {
  const { add } = useEquipmentMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    equipmentType: "Machinery",
    purchaseDate: financialYearStart(yearLabel),
    cost: "",
    condition: "Good",
    notes: "",
  });

  const handleSave = () => {
    if (!form.name || !form.cost) {
      toast.error("Name and cost are required");
      return;
    }
    add.mutate(
      { ...form, cost: parseBigInt(form.cost) },
      {
        onSuccess: () => {
          toast.success("Equipment added");
          setOpen(false);
        },
        onError: () => toast.error("Failed to add equipment"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          data-ocid="yearsheet.add_equipment.button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Equipment
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="yearsheet.add_equipment.dialog">
        <DialogHeader>
          <DialogTitle>Add Equipment — {yearLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              placeholder="Equipment name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              data-ocid="yearsheet.eq_name.input"
            />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select
              value={form.equipmentType}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, equipmentType: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Purchase Date</Label>
            <Input
              type="date"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, purchaseDate: e.target.value }))
              }
              data-ocid="yearsheet.eq_date.input"
            />
          </div>
          <div className="space-y-1">
            <Label>Cost (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={form.cost}
              onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
              data-ocid="yearsheet.eq_cost.input"
            />
          </div>
          <div className="space-y-1">
            <Label>Condition</Label>
            <Select
              value={form.condition}
              onValueChange={(v) => setForm((p) => ({ ...p, condition: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Input
              placeholder="Optional notes"
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="yearsheet.eq_cancel.button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={add.isPending}
            className="bg-estate-green hover:bg-estate-green/90 text-primary-foreground"
            data-ocid="yearsheet.eq_save.button"
          >
            {add.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : null}{" "}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditEquipmentDialogProps {
  eq: {
    id: bigint;
    name: string;
    equipmentType: string;
    purchaseDate: string;
    cost: bigint;
    condition: string;
    notes: string;
  };
}

function EditEquipmentDialog({ eq }: EditEquipmentDialogProps) {
  const { update } = useEquipmentMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: eq.name,
    equipmentType: eq.equipmentType,
    purchaseDate: eq.purchaseDate,
    cost: eq.cost.toString(),
    condition: eq.condition,
    notes: eq.notes,
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: eq.name,
        equipmentType: eq.equipmentType,
        purchaseDate: eq.purchaseDate,
        cost: eq.cost.toString(),
        condition: eq.condition,
        notes: eq.notes,
      });
    }
  }, [open, eq]);

  const handleSave = () => {
    update.mutate(
      { id: eq.id, ...form, cost: parseBigInt(form.cost) },
      {
        onSuccess: () => {
          toast.success("Equipment updated");
          setOpen(false);
        },
        onError: () => toast.error("Failed to update"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select
              value={form.equipmentType}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, equipmentType: v }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Purchase Date</Label>
            <Input
              type="date"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, purchaseDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Cost (₹)</Label>
            <Input
              type="number"
              min="0"
              value={form.cost}
              onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Condition</Label>
            <Select
              value={form.condition}
              onValueChange={(v) => setForm((p) => ({ ...p, condition: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={update.isPending}
            className="bg-estate-green hover:bg-estate-green/90 text-primary-foreground"
          >
            {update.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : null}{" "}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Year Sheet ──────────────────────────────────────────────────────────

interface YearSheetProps {
  yearLabel: string;
  form: YearFormState;
  onChange: (field: keyof YearFormState, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  allTransactions: import("../backend.d").Transaction[];
  allEquipment: import("../backend.d").Equipment[];
}

function YearSheet({
  yearLabel,
  form,
  onChange,
  onSave,
  isSaving,
  allTransactions,
  allEquipment,
}: YearSheetProps) {
  const { remove: removeTx } = useTransactionMutations();
  const { remove: removeEq } = useEquipmentMutations();

  const yearTransactions = allTransactions.filter((t) =>
    isInFinancialYear(t.date, yearLabel),
  );
  const yearEquipment = allEquipment.filter((e) =>
    isInFinancialYear(e.purchaseDate, yearLabel),
  );

  // P&L calculations
  const formIncome =
    toNum(form.coffeeIncome) +
    toNum(form.pepperIncome) +
    toNum(form.arecanutIncome) +
    toNum(form.paddyIncome);

  const formExpenditure =
    toNum(form.fertilisers) +
    toNum(form.irrigation) +
    toNum(form.managerSalary) +
    toNum(form.miscellaneous);

  const txCredits = yearTransactions
    .filter((t) => t.txType === TxType.credit)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const txDebits = yearTransactions
    .filter((t) => t.txType === TxType.debit)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const eqCosts = yearEquipment.reduce((sum, e) => sum + Number(e.cost), 0);

  const totalIncome = formIncome + txCredits;
  const totalExpenditure = formExpenditure + txDebits + eqCosts;
  const netPL = totalIncome - totalExpenditure;
  const isProfit = netPL >= 0;
  const slug = yearLabel.replace("-", "_");

  const incomeFields: { key: keyof YearFormState; label: string }[] = [
    { key: "coffeeIncome", label: "Coffee Income" },
    { key: "pepperIncome", label: "Pepper Income" },
    { key: "arecanutIncome", label: "Arecanut Income" },
    { key: "paddyIncome", label: "Paddy Income" },
  ];

  const expenditureFields: { key: keyof YearFormState; label: string }[] = [
    { key: "fertilisers", label: "Fertilisers" },
    { key: "irrigation", label: "Irrigation" },
    { key: "managerSalary", label: "Manager's Salary" },
    { key: "miscellaneous", label: "Miscellaneous" },
  ];

  return (
    <div className="space-y-8">
      {/* ── P&L Summary (TOP) ── */}
      <Card
        className={`border-2 ${
          isProfit
            ? "border-estate-green/40 bg-estate-green/5"
            : "border-destructive/40 bg-destructive/5"
        }`}
      >
        <CardContent className="py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Net {isProfit ? "Profit" : "Loss"} — {yearLabel}
              </p>
              <p
                className={`text-4xl font-bold mt-1 ${
                  isProfit ? "text-estate-green" : "text-destructive"
                }`}
              >
                {isProfit ? "+" : "-"}
                {formatINR(Math.abs(netPL))}
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Total Income</p>
                <p className="font-bold text-estate-green text-lg">
                  {formatINR(totalIncome)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Total Expenditure</p>
                <p className="font-bold text-amber-700 text-lg">
                  {formatINR(totalExpenditure)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section A: Annual Income/Expenditure ── */}
      <div>
        <h3 className="text-lg font-semibold text-estate-text mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-estate-green text-white text-xs flex items-center justify-center font-bold">
            A
          </span>
          Annual Income &amp; Expenditure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Card */}
          <Card className="border-2 border-estate-green/20 shadow-card">
            <CardHeader className="bg-estate-green/5 rounded-t-lg pb-3">
              <CardTitle className="flex items-center gap-2 text-estate-green">
                <TrendingUp className="w-5 h-5" />
                Income
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {incomeFields.map((field) => {
                const inputId = `${slug}-${field.key}`;
                return (
                  <div key={field.key} className="flex items-center gap-3">
                    <label
                      htmlFor={inputId}
                      className="text-sm font-medium text-estate-text w-36 shrink-0"
                    >
                      {field.label}
                    </label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                      </span>
                      <Input
                        id={inputId}
                        data-ocid={`yearsheet.${slug}.${field.key}.input`}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form[field.key]}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-estate-green/20 flex justify-between items-center">
                <span className="font-semibold text-estate-text">Subtotal</span>
                <span className="font-bold text-estate-green text-lg">
                  {formatINR(formIncome)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Expenditure Card */}
          <Card className="border-2 border-amber-500/20 shadow-card">
            <CardHeader className="bg-amber-50 rounded-t-lg pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <TrendingDown className="w-5 h-5" />
                Expenditure
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {expenditureFields.map((field) => {
                const inputId = `${slug}-${field.key}`;
                return (
                  <div key={field.key} className="flex items-center gap-3">
                    <label
                      htmlFor={inputId}
                      className="text-sm font-medium text-estate-text w-36 shrink-0"
                    >
                      {field.label}
                    </label>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                      </span>
                      <Input
                        id={inputId}
                        data-ocid={`yearsheet.${slug}.${field.key}.input`}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form[field.key]}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t border-amber-500/20 flex justify-between items-center">
                <span className="font-semibold text-estate-text">Subtotal</span>
                <span className="font-bold text-amber-700 text-lg">
                  {formatINR(formExpenditure)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            data-ocid={`yearsheet.${slug}.save_button`}
            onClick={onSave}
            disabled={isSaving}
            className="bg-estate-green hover:bg-estate-green/90 text-primary-foreground"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Annual Data"}
          </Button>
        </div>
      </div>

      {/* ── Section B: Transactions ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-estate-text flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-estate-green text-white text-xs flex items-center justify-center font-bold">
              B
            </span>
            Transactions
          </h3>
          <AddTransactionDialog yearLabel={yearLabel} onClose={() => {}} />
        </div>
        <Card className="border border-border shadow-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                      data-ocid={`yearsheet.${slug}.tx.empty_state`}
                    >
                      No transactions for this year
                    </TableCell>
                  </TableRow>
                ) : (
                  yearTransactions.map((tx, idx) => (
                    <TableRow
                      key={tx.id.toString()}
                      data-ocid={`yearsheet.tx.item.${idx + 1}`}
                    >
                      <TableCell className="text-sm">{tx.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.txType === TxType.credit
                              ? "default"
                              : "secondary"
                          }
                          className={
                            tx.txType === TxType.credit
                              ? "bg-estate-green/10 text-estate-green border border-estate-green/30"
                              : "bg-amber-100 text-amber-700 border border-amber-300"
                          }
                        >
                          {tx.txType === TxType.credit ? "Credit" : "Debit"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{tx.category}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {tx.description || "—"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.txType === TxType.credit
                            ? "text-estate-green"
                            : "text-amber-700"
                        }`}
                      >
                        {tx.txType === TxType.credit ? "+" : "-"}
                        {formatINR(Number(tx.amount))}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <EditTransactionDialog tx={tx} />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={removeTx.isPending}
                            onClick={() =>
                              removeTx.mutate(tx.id, {
                                onSuccess: () =>
                                  toast.success("Transaction deleted"),
                                onError: () => toast.error("Failed to delete"),
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* ── Section C: Equipment ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-estate-text flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-estate-green text-white text-xs flex items-center justify-center font-bold">
              C
            </span>
            Equipment
          </h3>
          <AddEquipmentDialog yearLabel={yearLabel} />
        </div>
        <Card className="border border-border shadow-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                      data-ocid={`yearsheet.${slug}.eq.empty_state`}
                    >
                      No equipment purchased this year
                    </TableCell>
                  </TableRow>
                ) : (
                  yearEquipment.map((eq, idx) => (
                    <TableRow
                      key={eq.id.toString()}
                      data-ocid={`yearsheet.eq.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium">{eq.name}</TableCell>
                      <TableCell className="text-sm">
                        {eq.equipmentType}
                      </TableCell>
                      <TableCell className="text-sm">
                        {eq.purchaseDate}
                      </TableCell>
                      <TableCell className="text-right font-medium text-amber-700">
                        {formatINR(Number(eq.cost))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {eq.condition}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                        {eq.notes || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <EditEquipmentDialog eq={eq} />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={removeEq.isPending}
                            onClick={() =>
                              removeEq.mutate(eq.id, {
                                onSuccess: () =>
                                  toast.success("Equipment deleted"),
                                onError: () => toast.error("Failed to delete"),
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function YearSheetsPage() {
  const { data: annualRecords, isLoading: isLoadingAnnual } =
    useAnnualRecords();
  const { data: allTransactions = [], isLoading: isLoadingTx } =
    useTransactions();
  const { data: allEquipment = [], isLoading: isLoadingEq } = useEquipment();
  const { save } = useAnnualRecordMutation();

  const [forms, setForms] = useState<Record<string, YearFormState>>(() =>
    Object.fromEntries(YEARS.map((y) => [y, emptyForm()])),
  );

  useEffect(() => {
    if (!annualRecords) return;
    setForms((prev) => {
      const next = { ...prev };
      for (const rec of annualRecords) {
        next[rec.yearLabel] = {
          coffeeIncome: rec.coffeeIncome.toString(),
          pepperIncome: rec.pepperIncome.toString(),
          arecanutIncome: rec.arecanutIncome.toString(),
          paddyIncome: rec.paddyIncome.toString(),
          fertilisers: rec.fertilisers.toString(),
          irrigation: rec.irrigation.toString(),
          managerSalary: rec.managerSalary.toString(),
          miscellaneous: rec.miscellaneous.toString(),
        };
      }
      return next;
    });
  }, [annualRecords]);

  const handleChange = (
    year: string,
    field: keyof YearFormState,
    value: string,
  ) => {
    setForms((prev) => ({
      ...prev,
      [year]: { ...prev[year], [field]: value },
    }));
  };

  const handleSave = (year: string) => {
    const f = forms[year];
    save.mutate(
      {
        yearLabel: year,
        coffeeIncome: parseBigInt(f.coffeeIncome),
        pepperIncome: parseBigInt(f.pepperIncome),
        arecanutIncome: parseBigInt(f.arecanutIncome),
        paddyIncome: parseBigInt(f.paddyIncome),
        fertilisers: parseBigInt(f.fertilisers),
        irrigation: parseBigInt(f.irrigation),
        managerSalary: parseBigInt(f.managerSalary),
        workersTotalSalary: BigInt(0),
        miscellaneous: parseBigInt(f.miscellaneous),
      },
      {
        onSuccess: () => toast.success(`${year} data saved successfully`),
        onError: () => toast.error(`Failed to save ${year} data`),
      },
    );
  };

  if (isLoadingAnnual || isLoadingTx || isLoadingEq) {
    return (
      <div
        className="flex items-center justify-center py-20"
        data-ocid="yearsheets.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-estate-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-estate-text">
          Year Sheets
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Annual breakdown of income, expenditure, transactions, and equipment
          per financial year
        </p>
      </div>

      <Tabs defaultValue={YEARS[0]} data-ocid="yearsheets.tab">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg mb-6">
          {YEARS.map((year) => (
            <TabsTrigger
              key={year}
              value={year}
              data-ocid={`yearsheets.${year.replace("-", "_")}.tab`}
              className="text-xs sm:text-sm data-[state=active]:bg-estate-green data-[state=active]:text-primary-foreground"
            >
              {year}
            </TabsTrigger>
          ))}
        </TabsList>

        {YEARS.map((year) => (
          <TabsContent key={year} value={year}>
            <YearSheet
              yearLabel={year}
              form={forms[year]}
              onChange={(field, value) => handleChange(year, field, value)}
              onSave={() => handleSave(year)}
              isSaving={save.isPending}
              allTransactions={allTransactions}
              allEquipment={allEquipment}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
