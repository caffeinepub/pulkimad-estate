import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Equipment } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useEquipment, useEquipmentMutations } from "../hooks/useQueries";
import { formatINR } from "../utils/format";

const EQUIPMENT_TYPES = [
  "Harvesting",
  "Processing",
  "Irrigation",
  "Transport",
  "Other",
];
const CONDITIONS = ["Good", "Fair", "Poor"];

function isInFinancialYear(date: string, yearLabel: string): boolean {
  const parts = yearLabel.split("-");
  const startYear = Number(parts[0]);
  const endYear = Number(parts[1]);
  const d = new Date(date);
  return (
    d >= new Date(`${startYear}-04-01`) && d <= new Date(`${endYear}-03-31`)
  );
}

interface EqForm {
  name: string;
  equipmentType: string;
  purchaseDate: string;
  cost: string;
  condition: string;
  notes: string;
}

const emptyForm = (yearFilter?: string): EqForm => ({
  name: "",
  equipmentType: "",
  purchaseDate: yearFilter
    ? `${yearFilter.split("-")[0]}-04-01`
    : new Date().toISOString().slice(0, 10),
  cost: "",
  condition: "Good",
  notes: "",
});

const conditionColor: Record<string, string> = {
  Good: "bg-green-100 text-estate-green-mid border-green-200",
  Fair: "bg-amber-100 text-amber-700 border-amber-200",
  Poor: "bg-red-100 text-destructive border-red-200",
};

interface EquipmentPageProps {
  yearFilter?: string;
}

export function EquipmentPage({ yearFilter }: EquipmentPageProps) {
  const { data: allEquipment = [], isLoading } = useEquipment();
  const { add, update, remove } = useEquipmentMutations();
  const { actor, isFetching } = useActor();
  const backendNotReady = !actor || isFetching;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState<EqForm>(emptyForm(yearFilter));
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const equipment = yearFilter
    ? allEquipment.filter((e) => isInFinancialYear(e.purchaseDate, yearFilter))
    : allEquipment;

  const totalCost = equipment.reduce((sum, e) => sum + Number(e.cost), 0);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm(yearFilter));
    setShowModal(true);
  }
  function openEdit(e: Equipment) {
    setEditing(e);
    setForm({
      name: e.name,
      equipmentType: e.equipmentType,
      purchaseDate: e.purchaseDate,
      cost: String(Number(e.cost)),
      condition: e.condition,
      notes: e.notes,
    });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.name || !form.equipmentType || !form.cost) {
      toast.error("Name, type, and cost are required");
      return;
    }
    const payload = {
      name: form.name,
      equipmentType: form.equipmentType,
      purchaseDate: form.purchaseDate,
      cost: BigInt(Math.round(Number.parseFloat(form.cost))),
      condition: form.condition,
      notes: form.notes,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload });
        toast.success("Equipment updated");
      } else {
        await add.mutateAsync(payload);
        toast.success("Equipment added");
      }
      setShowModal(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Failed to save equipment");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success("Equipment deleted");
      setDeleteId(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Failed to delete equipment");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-estate-text">
            Equipment
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {yearFilter
              ? `Equipment for ${yearFilter}`
              : "Track all estate tools and machinery"}
          </p>
        </div>
        <Button
          data-ocid="equipment.add_equipment.primary_button"
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
              <Plus className="w-4 h-4 mr-2" /> Add Equipment
            </>
          )}
        </Button>
      </div>

      {/* Total Cost Card */}
      <Card
        data-ocid="equipment.total.card"
        className="shadow-card bg-estate-green text-primary-foreground"
      >
        <CardContent className="py-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/10">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-primary-foreground/70">
              Total Equipment Investment
            </p>
            <p className="text-2xl font-bold font-display">
              {formatINR(totalCost)}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-primary-foreground/70">Items</p>
            <p className="text-xl font-bold">{equipment.length}</p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2
                    data-ocid="equipment.loading_state"
                    className="w-5 h-5 animate-spin mx-auto text-muted-foreground"
                  />
                </TableCell>
              </TableRow>
            ) : equipment.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  data-ocid="equipment.empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  No equipment added yet.
                </TableCell>
              </TableRow>
            ) : (
              equipment.map((eq, idx) => (
                <motion.tr
                  key={String(eq.id)}
                  data-ocid={`equipment.item.${idx + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="border-b border-border last:border-0"
                >
                  <TableCell className="font-medium">{eq.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-estate-green-mid text-estate-green text-xs"
                    >
                      {eq.equipmentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {eq.purchaseDate}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatINR(Number(eq.cost))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs ${
                        conditionColor[eq.condition] ?? ""
                      }`}
                    >
                      {eq.condition}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                    {eq.notes}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        data-ocid={`equipment.edit_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(eq)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        data-ocid={`equipment.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(eq.id)}
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
        <DialogContent data-ocid="equipment.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Equipment" : "Add Equipment"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="eq-name" className="mb-1 block text-sm">
                Name *
              </Label>
              <Input
                data-ocid="equipment.name.input"
                id="eq-name"
                placeholder="e.g. Coffee Pulper"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Type *</Label>
              <Select
                value={form.equipmentType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, equipmentType: v }))
                }
              >
                <SelectTrigger data-ocid="equipment.type.select">
                  <SelectValue placeholder="Select type" />
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
            <div>
              <Label htmlFor="eq-date" className="mb-1 block text-sm">
                Purchase Date
              </Label>
              <Input
                data-ocid="equipment.date.input"
                id="eq-date"
                type="date"
                value={form.purchaseDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purchaseDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="eq-cost" className="mb-1 block text-sm">
                Cost (₹) *
              </Label>
              <Input
                data-ocid="equipment.cost.input"
                id="eq-cost"
                type="number"
                min="0"
                placeholder="e.g. 25000"
                value={form.cost}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cost: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Condition</Label>
              <Select
                value={form.condition}
                onValueChange={(v) => setForm((p) => ({ ...p, condition: v }))}
              >
                <SelectTrigger data-ocid="equipment.condition.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="eq-notes" className="mb-1 block text-sm">
                Notes
              </Label>
              <Textarea
                data-ocid="equipment.notes.textarea"
                id="eq-notes"
                placeholder="Additional details"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="equipment.cancel_button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="equipment.submit_button"
              onClick={handleSubmit}
              disabled={add.isPending || update.isPending || backendNotReady}
              className="bg-estate-green hover:bg-estate-green-mid text-primary-foreground"
            >
              {(add.isPending || update.isPending || backendNotReady) && (
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
          data-ocid="equipment.delete.dialog"
          className="sm:max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Delete Equipment?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove this item.
          </p>
          <DialogFooter>
            <Button
              data-ocid="equipment.delete.cancel_button"
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="equipment.delete.confirm_button"
              variant="destructive"
              onClick={handleDelete}
              disabled={remove.isPending}
            >
              {remove.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
