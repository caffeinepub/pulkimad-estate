import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AnnualRecord {
    yearLabel: string;
    coffeeIncome: bigint;
    pepperIncome: bigint;
    arecanutIncome: bigint;
    paddyIncome: bigint;
    fertilisers: bigint;
    irrigation: bigint;
    managerSalary: bigint;
    workersTotalSalary: bigint;
    miscellaneous: bigint;
}
export interface SalaryRecord {
    id: bigint;
    month: bigint;
    workerId: bigint;
    paid: boolean;
    year: bigint;
    amount: bigint;
}
export interface Summary {
    equipmentCount: bigint;
    totalDebits: bigint;
    totalSalaryPaid: bigint;
    totalEquipmentCost: bigint;
    netProfitLoss: bigint;
    totalCredits: bigint;
    workerCount: bigint;
}
export interface Equipment {
    id: bigint;
    purchaseDate: string;
    cost: bigint;
    name: string;
    equipmentType: string;
    notes: string;
    condition: string;
}
export interface Worker {
    id: bigint;
    joinDate: string;
    name: string;
    role: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: bigint;
    date: string;
    description: string;
    category: string;
    txType: TxType;
    amount: bigint;
}
export enum TxType {
    credit = "credit",
    debit = "debit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEquipment(name: string, equipmentType: string, purchaseDate: string, cost: bigint, condition: string, notes: string): Promise<bigint>;
    addSalary(workerId: bigint, month: bigint, year: bigint, amount: bigint, paid: boolean): Promise<bigint>;
    addTransaction(txType: TxType, category: string, amount: bigint, date: string, description: string): Promise<bigint>;
    addWorker(name: string, role: string, phone: string, joinDate: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEquipment(id: bigint): Promise<boolean>;
    deleteSalary(id: bigint): Promise<boolean>;
    deleteTransaction(id: bigint): Promise<boolean>;
    deleteWorker(id: bigint): Promise<boolean>;
    getAllAnnualRecords(): Promise<Array<AnnualRecord>>;
    getAnnualRecord(yearLabel: string): Promise<AnnualRecord | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEquipment(): Promise<Array<Equipment>>;
    getSalaries(): Promise<Array<SalaryRecord>>;
    getSummary(): Promise<Summary>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkers(): Promise<Array<Worker>>;
    isCallerAdmin(): Promise<boolean>;
    saveAnnualRecord(yearLabel: string, coffeeIncome: bigint, pepperIncome: bigint, arecanutIncome: bigint, paddyIncome: bigint, fertilisers: bigint, irrigation: bigint, managerSalary: bigint, workersTotalSalary: bigint, miscellaneous: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateEquipment(id: bigint, name: string, equipmentType: string, purchaseDate: string, cost: bigint, condition: string, notes: string): Promise<boolean>;
    updateSalary(id: bigint, workerId: bigint, month: bigint, year: bigint, amount: bigint, paid: boolean): Promise<boolean>;
    updateTransaction(id: bigint, txType: TxType, category: string, amount: bigint, date: string, description: string): Promise<boolean>;
    updateWorker(id: bigint, name: string, role: string, phone: string, joinDate: string): Promise<boolean>;
}
