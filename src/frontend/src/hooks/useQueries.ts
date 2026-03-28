import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnnualExtras,
  AnnualRecord,
  Equipment,
  ExpenseItem,
  backendInterface as FullBackend,
  IncomeItem,
  SalaryRecord,
  Summary,
  Transaction,
  TxType,
  Worker,
} from "../backend.d";
import { useActor } from "./useActor";

function getBackend(actor: unknown): FullBackend {
  return actor as FullBackend;
}

export function useSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<Summary>({
    queryKey: ["summary"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return getBackend(actor).getSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return getBackend(actor).getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWorkers() {
  const { actor, isFetching } = useActor();
  return useQuery<Worker[]>({
    queryKey: ["workers"],
    queryFn: async () => {
      if (!actor) return [];
      return getBackend(actor).getWorkers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSalaries() {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryRecord[]>({
    queryKey: ["salaries"],
    queryFn: async () => {
      if (!actor) return [];
      return getBackend(actor).getSalaries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEquipment() {
  const { actor, isFetching } = useActor();
  return useQuery<Equipment[]>({
    queryKey: ["equipment"],
    queryFn: async () => {
      if (!actor) return [];
      return getBackend(actor).getEquipment();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactionMutations() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
  };

  const add = useMutation({
    mutationFn: (v: {
      txType: TxType;
      category: string;
      amount: bigint;
      date: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).addTransaction(
        v.txType,
        v.category,
        v.amount,
        v.date,
        v.description,
      );
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (v: {
      id: bigint;
      txType: TxType;
      category: string;
      amount: bigint;
      date: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).updateTransaction(
        v.id,
        v.txType,
        v.category,
        v.amount,
        v.date,
        v.description,
      );
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).deleteTransaction(id);
    },
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

export function useWorkerMutations() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["workers"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
  };

  const add = useMutation({
    mutationFn: (v: {
      name: string;
      role: string;
      phone: string;
      joinDate: string;
    }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).addWorker(v.name, v.role, v.phone, v.joinDate);
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (v: {
      id: bigint;
      name: string;
      role: string;
      phone: string;
      joinDate: string;
    }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).updateWorker(
        v.id,
        v.name,
        v.role,
        v.phone,
        v.joinDate,
      );
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).deleteWorker(id);
    },
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

export function useSalaryMutations() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["salaries"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
  };

  const add = useMutation({
    mutationFn: (v: {
      workerId: bigint;
      month: bigint;
      year: bigint;
      amount: bigint;
      paid: boolean;
    }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).addSalary(
        v.workerId,
        v.month,
        v.year,
        v.amount,
        v.paid,
      );
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (v: {
      id: bigint;
      workerId: bigint;
      month: bigint;
      year: bigint;
      amount: bigint;
      paid: boolean;
    }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).updateSalary(
        v.id,
        v.workerId,
        v.month,
        v.year,
        v.amount,
        v.paid,
      );
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).deleteSalary(id);
    },
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

export function useEquipmentMutations() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["equipment"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
  };

  const add = useMutation({
    mutationFn: (v: {
      name: string;
      equipmentType: string;
      purchaseDate: string;
      cost: bigint;
      condition: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).addEquipment(
        v.name,
        v.equipmentType,
        v.purchaseDate,
        v.cost,
        v.condition,
        v.notes,
      );
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (v: {
      id: bigint;
      name: string;
      equipmentType: string;
      purchaseDate: string;
      cost: bigint;
      condition: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).updateEquipment(
        v.id,
        v.name,
        v.equipmentType,
        v.purchaseDate,
        v.cost,
        v.condition,
        v.notes,
      );
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).deleteEquipment(id);
    },
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

export function useAnnualRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<AnnualRecord[]>({
    queryKey: ["annualRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return getBackend(actor).getAllAnnualRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnnualRecordMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (v: AnnualRecord) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).saveAnnualRecord(
        v.yearLabel,
        v.coffeeIncome,
        v.pepperIncome,
        v.arecanutIncome,
        v.paddyIncome,
        v.fertilisers,
        v.irrigation,
        v.managerSalary,
        v.workersTotalSalary,
        v.miscellaneous,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["annualRecords"] }),
  });
  return { save };
}

export function useAnnualExtras(yearLabel: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AnnualExtras | null>({
    queryKey: ["annualExtras", yearLabel],
    queryFn: async () => {
      if (!actor) return null;
      return getBackend(actor).getAnnualExtras(yearLabel);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnnualExtrasMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (
      v: Pick<AnnualExtras, "yearLabel" | "openingBalance" | "closingBalance">,
    ) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).saveAnnualExtras(
        v.yearLabel,
        v.openingBalance,
        v.closingBalance,
      );
    },
    onSuccess: (_, v) =>
      qc.invalidateQueries({ queryKey: ["annualExtras", v.yearLabel] }),
  });
  return { save };
}

export function useIncomeItems(yearLabel: string) {
  const { actor, isFetching } = useActor();
  return useQuery<IncomeItem[]>({
    queryKey: ["incomeItems", yearLabel],
    queryFn: async () => {
      if (!actor) return [];
      return getBackend(actor).getIncomeItemsByYear(yearLabel);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncomeItemMutations(yearLabel: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["incomeItems", yearLabel] });

  const add = useMutation({
    mutationFn: (v: { name: string; amount: bigint }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).addIncomeItem(yearLabel, v.name, v.amount);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).deleteIncomeItem(id);
    },
    onSuccess: invalidate,
  });

  return { add, remove };
}

export function useExpenseItems(yearLabel: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ExpenseItem[]>({
    queryKey: ["expenseItems", yearLabel],
    queryFn: async () => {
      if (!actor) return [];
      return getBackend(actor).getExpenseItemsByYear(yearLabel);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpenseItemMutations(yearLabel: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["expenseItems", yearLabel] });

  const add = useMutation({
    mutationFn: (v: { name: string; amount: bigint }) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).addExpenseItem(yearLabel, v.name, v.amount);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Backend not ready. Please wait.");
      return getBackend(actor).deleteExpenseItem(id);
    },
    onSuccess: invalidate,
  });

  return { add, remove };
}
