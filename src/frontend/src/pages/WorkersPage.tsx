import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { SalaryRecord, Worker } from "../backend.d";
import {
  useSalaries,
  useSalaryMutations,
  useWorkerMutations,
  useWorkers,
} from "../hooks/useQueries";
import { formatINR, monthName } from "../utils/format";

interface WorkerForm {
  name: string;
  role: string;
  phone: string;
  joinDate: string;
}
interface SalaryForm {
  workerId: string;
  month: string;
  year: string;
  amount: string;
  paid: boolean;
}

const emptyWorkerForm = (): WorkerForm => ({
  name: "",
  role: "",
  phone: "",
  joinDate: new Date().toISOString().slice(0, 10),
});
const emptySalaryForm = (): SalaryForm => ({
  workerId: "",
  month: "1",
  year: String(new Date().getFullYear()),
  amount: "",
  paid: false,
});

export function WorkersPage() {
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers();
  const { data: salaries = [], isLoading: loadingSalaries } = useSalaries();
  const workerMut = useWorkerMutations();
  const salaryMut = useSalaryMutations();

  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerForm, setWorkerForm] = useState<WorkerForm>(emptyWorkerForm());
  const [deleteWorkerId, setDeleteWorkerId] = useState<bigint | null>(null);

  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryRecord | null>(null);
  const [salaryForm, setSalaryForm] = useState<SalaryForm>(emptySalaryForm());
  const [deleteSalaryId, setDeleteSalaryId] = useState<bigint | null>(null);

  function openAddWorker() {
    setEditingWorker(null);
    setWorkerForm(emptyWorkerForm());
    setShowWorkerModal(true);
  }
  function openEditWorker(w: Worker) {
    setEditingWorker(w);
    setWorkerForm({
      name: w.name,
      role: w.role,
      phone: w.phone,
      joinDate: w.joinDate,
    });
    setShowWorkerModal(true);
  }

  async function handleWorkerSubmit() {
    if (!workerForm.name || !workerForm.role) {
      toast.error("Name and role are required");
      return;
    }
    try {
      if (editingWorker) {
        await workerMut.update.mutateAsync({
          id: editingWorker.id,
          ...workerForm,
        });
        toast.success("Worker updated");
      } else {
        await workerMut.add.mutateAsync(workerForm);
        toast.success("Worker added");
      }
      setShowWorkerModal(false);
    } catch {
      toast.error("Failed to save worker");
    }
  }

  async function handleDeleteWorker() {
    if (!deleteWorkerId) return;
    try {
      await workerMut.remove.mutateAsync(deleteWorkerId);
      toast.success("Worker deleted");
      setDeleteWorkerId(null);
    } catch {
      toast.error("Failed to delete worker");
    }
  }

  function openAddSalary() {
    setEditingSalary(null);
    setSalaryForm(emptySalaryForm());
    setShowSalaryModal(true);
  }
  function openEditSalary(s: SalaryRecord) {
    setEditingSalary(s);
    setSalaryForm({
      workerId: String(s.workerId),
      month: String(Number(s.month)),
      year: String(Number(s.year)),
      amount: String(Number(s.amount)),
      paid: s.paid,
    });
    setShowSalaryModal(true);
  }

  async function handleSalarySubmit() {
    if (!salaryForm.workerId || !salaryForm.amount) {
      toast.error("Worker and amount are required");
      return;
    }
    const payload = {
      workerId: BigInt(salaryForm.workerId),
      month: BigInt(salaryForm.month),
      year: BigInt(salaryForm.year),
      amount: BigInt(Math.round(Number.parseFloat(salaryForm.amount))),
      paid: salaryForm.paid,
    };
    try {
      if (editingSalary) {
        await salaryMut.update.mutateAsync({
          id: editingSalary.id,
          ...payload,
        });
        toast.success("Salary updated");
      } else {
        await salaryMut.add.mutateAsync(payload);
        toast.success("Salary added");
      }
      setShowSalaryModal(false);
    } catch {
      toast.error("Failed to save salary");
    }
  }

  async function handleDeleteSalary() {
    if (!deleteSalaryId) return;
    try {
      await salaryMut.remove.mutateAsync(deleteSalaryId);
      toast.success("Salary deleted");
      setDeleteSalaryId(null);
    } catch {
      toast.error("Failed to delete salary");
    }
  }

  const workerMap = new Map(workers.map((w) => [String(w.id), w.name]));

  return (
    <div className="space-y-8">
      {/* Workers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-estate-text">
              Workers
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Manage estate staff
            </p>
          </div>
          <Button
            data-ocid="workers.add_worker.primary_button"
            onClick={openAddWorker}
            className="bg-estate-green hover:bg-estate-green-mid text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Worker
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingWorkers ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2
                      data-ocid="workers.loading_state"
                      className="w-5 h-5 animate-spin mx-auto text-muted-foreground"
                    />
                  </TableCell>
                </TableRow>
              ) : workers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    data-ocid="workers.empty_state"
                    className="text-center py-10 text-muted-foreground"
                  >
                    No workers added yet.
                  </TableCell>
                </TableRow>
              ) : (
                workers.map((w, idx) => (
                  <motion.tr
                    key={String(w.id)}
                    data-ocid={`workers.item.${idx + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-border last:border-0"
                  >
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-estate-green-mid text-estate-green"
                      >
                        {w.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {w.phone}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {w.joinDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-ocid={`workers.edit_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditWorker(w)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`workers.delete_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteWorkerId(w.id)}
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
      </div>

      {/* Salaries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-estate-text">
              Salary Records
            </h3>
            <p className="text-muted-foreground text-sm">
              Monthly salary entries
            </p>
          </div>
          <Button
            data-ocid="salary.add_salary.primary_button"
            onClick={openAddSalary}
            className="bg-estate-gold hover:bg-secondary text-secondary-foreground border border-estate-brown/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Salary
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Worker</TableHead>
                <TableHead>Month / Year</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingSalaries ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2
                      data-ocid="salary.loading_state"
                      className="w-5 h-5 animate-spin mx-auto text-muted-foreground"
                    />
                  </TableCell>
                </TableRow>
              ) : salaries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    data-ocid="salary.empty_state"
                    className="text-center py-10 text-muted-foreground"
                  >
                    No salary records yet.
                  </TableCell>
                </TableRow>
              ) : (
                salaries.map((s, idx) => (
                  <motion.tr
                    key={String(s.id)}
                    data-ocid={`salary.item.${idx + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-border last:border-0"
                  >
                    <TableCell className="font-medium">
                      {workerMap.get(String(s.workerId)) ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {monthName(Number(s.month))} {String(Number(s.year))}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      {formatINR(Number(s.amount))}
                    </TableCell>
                    <TableCell>
                      {s.paid ? (
                        <Badge className="bg-green-100 text-estate-green-mid border-green-200 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                          <XCircle className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          data-ocid={`salary.edit_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditSalary(s)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`salary.delete_button.${idx + 1}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteSalaryId(s.id)}
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
      </div>

      {/* Worker Modal */}
      <Dialog open={showWorkerModal} onOpenChange={setShowWorkerModal}>
        <DialogContent data-ocid="workers.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingWorker ? "Edit Worker" : "Add Worker"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="w-name" className="mb-1 block text-sm">
                Name *
              </Label>
              <Input
                data-ocid="workers.name.input"
                id="w-name"
                placeholder="Full name"
                value={workerForm.name}
                onChange={(e) =>
                  setWorkerForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="w-role" className="mb-1 block text-sm">
                Role *
              </Label>
              <Input
                data-ocid="workers.role.input"
                id="w-role"
                placeholder="e.g. Harvester, Supervisor"
                value={workerForm.role}
                onChange={(e) =>
                  setWorkerForm((p) => ({ ...p, role: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="w-phone" className="mb-1 block text-sm">
                Phone
              </Label>
              <Input
                data-ocid="workers.phone.input"
                id="w-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={workerForm.phone}
                onChange={(e) =>
                  setWorkerForm((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="w-join" className="mb-1 block text-sm">
                Join Date
              </Label>
              <Input
                data-ocid="workers.joindate.input"
                id="w-join"
                type="date"
                value={workerForm.joinDate}
                onChange={(e) =>
                  setWorkerForm((p) => ({ ...p, joinDate: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="workers.cancel_button"
              variant="outline"
              onClick={() => setShowWorkerModal(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="workers.submit_button"
              onClick={handleWorkerSubmit}
              disabled={workerMut.add.isPending || workerMut.update.isPending}
              className="bg-estate-green hover:bg-estate-green-mid text-primary-foreground"
            >
              {(workerMut.add.isPending || workerMut.update.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingWorker ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Worker Confirm */}
      <Dialog
        open={!!deleteWorkerId}
        onOpenChange={() => setDeleteWorkerId(null)}
      >
        <DialogContent
          data-ocid="workers.delete.dialog"
          className="sm:max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>Delete Worker?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove this worker.
          </p>
          <DialogFooter>
            <Button
              data-ocid="workers.delete.cancel_button"
              variant="outline"
              onClick={() => setDeleteWorkerId(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="workers.delete.confirm_button"
              variant="destructive"
              onClick={handleDeleteWorker}
              disabled={workerMut.remove.isPending}
            >
              {workerMut.remove.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Modal */}
      <Dialog open={showSalaryModal} onOpenChange={setShowSalaryModal}>
        <DialogContent data-ocid="salary.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSalary ? "Edit Salary" : "Add Salary Record"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1 block text-sm">Worker *</Label>
              <Select
                value={salaryForm.workerId}
                onValueChange={(v) =>
                  setSalaryForm((p) => ({ ...p, workerId: v }))
                }
              >
                <SelectTrigger data-ocid="salary.worker.select">
                  <SelectValue placeholder="Select worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((w) => (
                    <SelectItem key={String(w.id)} value={String(w.id)}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block text-sm">Month</Label>
                <Select
                  value={salaryForm.month}
                  onValueChange={(v) =>
                    setSalaryForm((p) => ({ ...p, month: v }))
                  }
                >
                  <SelectTrigger data-ocid="salary.month.select">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {monthName(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sal-year" className="mb-1 block text-sm">
                  Year
                </Label>
                <Input
                  data-ocid="salary.year.input"
                  id="sal-year"
                  type="number"
                  placeholder="2024"
                  value={salaryForm.year}
                  onChange={(e) =>
                    setSalaryForm((p) => ({ ...p, year: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sal-amt" className="mb-1 block text-sm">
                Amount (₹) *
              </Label>
              <Input
                data-ocid="salary.amount.input"
                id="sal-amt"
                type="number"
                min="0"
                placeholder="e.g. 8000"
                value={salaryForm.amount}
                onChange={(e) =>
                  setSalaryForm((p) => ({ ...p, amount: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                data-ocid="salary.paid.checkbox"
                id="sal-paid"
                checked={salaryForm.paid}
                onCheckedChange={(v) =>
                  setSalaryForm((p) => ({ ...p, paid: !!v }))
                }
              />
              <Label htmlFor="sal-paid" className="text-sm">
                Mark as Paid
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="salary.cancel_button"
              variant="outline"
              onClick={() => setShowSalaryModal(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="salary.submit_button"
              onClick={handleSalarySubmit}
              disabled={salaryMut.add.isPending || salaryMut.update.isPending}
              className="bg-estate-green hover:bg-estate-green-mid text-primary-foreground"
            >
              {(salaryMut.add.isPending || salaryMut.update.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingSalary ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Salary Confirm */}
      <Dialog
        open={!!deleteSalaryId}
        onOpenChange={() => setDeleteSalaryId(null)}
      >
        <DialogContent data-ocid="salary.delete.dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Salary Record?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              data-ocid="salary.delete.cancel_button"
              variant="outline"
              onClick={() => setDeleteSalaryId(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="salary.delete.confirm_button"
              variant="destructive"
              onClick={handleDeleteSalary}
              disabled={salaryMut.remove.isPending}
            >
              {salaryMut.remove.isPending && (
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
