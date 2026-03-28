import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

actor {
  // ─── Authorization ──────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── User Profiles ──────────────────────────────────────────────
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ─── Transactions ───────────────────────────────────────────────
  public type TxType = { #credit; #debit };
  public type Transaction = {
    id : Nat;
    txType : TxType;
    category : Text;
    amount : Nat;
    date : Text;
    description : Text;
  };

  var txMap : Map.Map<Nat, Transaction> = Map.empty();
  var txCounter = 0;

  public shared ({ caller }) func addTransaction(txType : TxType, category : Text, amount : Nat, date : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };
    txCounter += 1;
    txMap.add(txCounter, { id = txCounter; txType; category; amount; date; description });
    txCounter;
  };

  public shared ({ caller }) func updateTransaction(id : Nat, txType : TxType, category : Text, amount : Nat, date : Text, description : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update transactions");
    };
    switch (txMap.get(id)) {
      case (null) { false };
      case (?_) {
        txMap.add(id, { id; txType; category; amount; date; description });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };
    switch (txMap.get(id)) {
      case (null) { false };
      case (?_) {
        txMap.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    txMap.values().toArray();
  };

  // ─── Workers ─────────────────────────────────────────────────────
  public type Worker = {
    id : Nat;
    name : Text;
    role : Text;
    phone : Text;
    joinDate : Text;
  };

  var workerMap : Map.Map<Nat, Worker> = Map.empty();
  var workerCounter = 0;

  public shared ({ caller }) func addWorker(name : Text, role : Text, phone : Text, joinDate : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add workers");
    };
    workerCounter += 1;
    workerMap.add(workerCounter, { id = workerCounter; name; role; phone; joinDate });
    workerCounter;
  };

  public shared ({ caller }) func updateWorker(id : Nat, name : Text, role : Text, phone : Text, joinDate : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update workers");
    };
    switch (workerMap.get(id)) {
      case (null) { false };
      case (?_) {
        workerMap.add(id, { id; name; role; phone; joinDate });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteWorker(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete workers");
    };
    switch (workerMap.get(id)) {
      case (null) { false };
      case (?_) {
        workerMap.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getWorkers() : async [Worker] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workers");
    };
    workerMap.values().toArray();
  };

  // ─── Salary Records ─────────────────────────────────────────────
  public type SalaryRecord = {
    id : Nat;
    workerId : Nat;
    month : Nat;
    year : Nat;
    amount : Nat;
    paid : Bool;
  };

  var salaryMap : Map.Map<Nat, SalaryRecord> = Map.empty();
  var salaryCounter = 0;

  public shared ({ caller }) func addSalary(workerId : Nat, month : Nat, year : Nat, amount : Nat, paid : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add salary records");
    };
    salaryCounter += 1;
    salaryMap.add(salaryCounter, { id = salaryCounter; workerId; month; year; amount; paid });
    salaryCounter;
  };

  public shared ({ caller }) func updateSalary(id : Nat, workerId : Nat, month : Nat, year : Nat, amount : Nat, paid : Bool) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update salary records");
    };
    switch (salaryMap.get(id)) {
      case (null) { false };
      case (?_) {
        salaryMap.add(id, { id; workerId; month; year; amount; paid });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteSalary(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete salary records");
    };
    switch (salaryMap.get(id)) {
      case (null) { false };
      case (?_) {
        salaryMap.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getSalaries() : async [SalaryRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view salary records");
    };
    salaryMap.values().toArray();
  };

  // ─── Equipment ───────────────────────────────────────────────────
  public type Equipment = {
    id : Nat;
    name : Text;
    equipmentType : Text;
    purchaseDate : Text;
    cost : Nat;
    condition : Text;
    notes : Text;
  };

  var equipMap : Map.Map<Nat, Equipment> = Map.empty();
  var equipCounter = 0;

  public shared ({ caller }) func addEquipment(name : Text, equipmentType : Text, purchaseDate : Text, cost : Nat, condition : Text, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add equipment");
    };
    equipCounter += 1;
    equipMap.add(equipCounter, { id = equipCounter; name; equipmentType; purchaseDate; cost; condition; notes });
    equipCounter;
  };

  public shared ({ caller }) func updateEquipment(id : Nat, name : Text, equipmentType : Text, purchaseDate : Text, cost : Nat, condition : Text, notes : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update equipment");
    };
    switch (equipMap.get(id)) {
      case (null) { false };
      case (?_) {
        equipMap.add(id, { id; name; equipmentType; purchaseDate; cost; condition; notes });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteEquipment(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete equipment");
    };
    switch (equipMap.get(id)) {
      case (null) { false };
      case (?_) {
        equipMap.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getEquipment() : async [Equipment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view equipment");
    };
    equipMap.values().toArray();
  };

  // ─── Annual Records (legacy, kept for backward compat) ───────────
  public type AnnualRecord = {
    yearLabel : Text;
    coffeeIncome : Nat;
    pepperIncome : Nat;
    arecanutIncome : Nat;
    paddyIncome : Nat;
    fertilisers : Nat;
    irrigation : Nat;
    managerSalary : Nat;
    workersTotalSalary : Nat;
    miscellaneous : Nat;
  };

  var annualMap : Map.Map<Text, AnnualRecord> = Map.empty();

  public shared ({ caller }) func saveAnnualRecord(
    yearLabel : Text,
    coffeeIncome : Nat,
    pepperIncome : Nat,
    arecanutIncome : Nat,
    paddyIncome : Nat,
    fertilisers : Nat,
    irrigation : Nat,
    managerSalary : Nat,
    workersTotalSalary : Nat,
    miscellaneous : Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save annual records");
    };
    annualMap.add(yearLabel, {
      yearLabel;
      coffeeIncome;
      pepperIncome;
      arecanutIncome;
      paddyIncome;
      fertilisers;
      irrigation;
      managerSalary;
      workersTotalSalary;
      miscellaneous;
    });
  };

  public query ({ caller }) func getAnnualRecord(yearLabel : Text) : async ?AnnualRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view annual records");
    };
    annualMap.get(yearLabel);
  };

  public query ({ caller }) func getAllAnnualRecords() : async [AnnualRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view annual records");
    };
    annualMap.values().toArray();
  };

  // ─── Annual Extras (opening/closing balance + legacy crop fields) ─
  // NOTE: crop expenditure fields kept for stable variable compatibility.
  // New dynamic income/expense items are stored in incomeItemMap/expenseItemMap.
  public type AnnualExtras = {
    yearLabel : Text;
    openingBalance : Nat;
    closingBalance : Nat;
    coffeeExpenditure : Nat;
    paddyExpenditure : Nat;
    arecanutExpenditure : Nat;
    pepperExpenditure : Nat;
  };

  var extrasMap : Map.Map<Text, AnnualExtras> = Map.empty();

  public shared ({ caller }) func saveAnnualExtras(
    yearLabel : Text,
    openingBalance : Nat,
    closingBalance : Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save annual extras");
    };
    // Preserve existing crop expenditure values if they exist
    let existing = extrasMap.get(yearLabel);
    let coffeeExp = switch (existing) { case (?e) e.coffeeExpenditure; case null 0 };
    let paddyExp = switch (existing) { case (?e) e.paddyExpenditure; case null 0 };
    let arecanutExp = switch (existing) { case (?e) e.arecanutExpenditure; case null 0 };
    let pepperExp = switch (existing) { case (?e) e.pepperExpenditure; case null 0 };
    extrasMap.add(yearLabel, {
      yearLabel;
      openingBalance;
      closingBalance;
      coffeeExpenditure = coffeeExp;
      paddyExpenditure = paddyExp;
      arecanutExpenditure = arecanutExp;
      pepperExpenditure = pepperExp;
    });
  };

  public query ({ caller }) func getAnnualExtras(yearLabel : Text) : async ?AnnualExtras {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view annual extras");
    };
    extrasMap.get(yearLabel);
  };

  // ─── Income Items (dynamic per year) ────────────────────────────
  public type IncomeItem = {
    id : Nat;
    yearLabel : Text;
    name : Text;
    amount : Nat;
  };

  var incomeItemMap : Map.Map<Nat, IncomeItem> = Map.empty();
  var incomeItemCounter = 0;

  public shared ({ caller }) func addIncomeItem(yearLabel : Text, name : Text, amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    incomeItemCounter += 1;
    incomeItemMap.add(incomeItemCounter, { id = incomeItemCounter; yearLabel; name; amount });
    incomeItemCounter;
  };

  public shared ({ caller }) func updateIncomeItem(id : Nat, name : Text, amount : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (incomeItemMap.get(id)) {
      case (null) { false };
      case (?item) {
        incomeItemMap.add(id, { id; yearLabel = item.yearLabel; name; amount });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteIncomeItem(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (incomeItemMap.get(id)) {
      case (null) { false };
      case (?_) {
        incomeItemMap.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getIncomeItemsByYear(yearLabel : Text) : async [IncomeItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let buf = incomeItemMap.values();
    buf.filter(func(item : IncomeItem) : Bool { item.yearLabel == yearLabel }).toArray();
  };

  // ─── Expense Items (dynamic per year) ───────────────────────────
  public type ExpenseItem = {
    id : Nat;
    yearLabel : Text;
    name : Text;
    amount : Nat;
  };

  var expenseItemMap : Map.Map<Nat, ExpenseItem> = Map.empty();
  var expenseItemCounter = 0;

  public shared ({ caller }) func addExpenseItem(yearLabel : Text, name : Text, amount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    expenseItemCounter += 1;
    expenseItemMap.add(expenseItemCounter, { id = expenseItemCounter; yearLabel; name; amount });
    expenseItemCounter;
  };

  public shared ({ caller }) func updateExpenseItem(id : Nat, name : Text, amount : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (expenseItemMap.get(id)) {
      case (null) { false };
      case (?item) {
        expenseItemMap.add(id, { id; yearLabel = item.yearLabel; name; amount });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteExpenseItem(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (expenseItemMap.get(id)) {
      case (null) { false };
      case (?_) {
        expenseItemMap.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getExpenseItemsByYear(yearLabel : Text) : async [ExpenseItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let buf = expenseItemMap.values();
    buf.filter(func(item : ExpenseItem) : Bool { item.yearLabel == yearLabel }).toArray();
  };

  // ─── Summary ─────────────────────────────────────────────────────
  public type Summary = {
    totalCredits : Int;
    totalDebits : Int;
    totalSalaryPaid : Int;
    totalEquipmentCost : Int;
    netProfitLoss : Int;
    workerCount : Nat;
    equipmentCount : Nat;
  };

  public query ({ caller }) func getSummary() : async Summary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view summary");
    };
    var credits : Int = 0;
    var debits : Int = 0;
    for (tx in txMap.values()) {
      switch (tx.txType) {
        case (#credit) { credits += tx.amount };
        case (#debit) { debits += tx.amount };
      };
    };
    var salaryPaid : Int = 0;
    for (s in salaryMap.values()) {
      if (s.paid) { salaryPaid += s.amount };
    };
    var equipCost : Int = 0;
    for (e in equipMap.values()) {
      equipCost += e.cost;
    };
    {
      totalCredits = credits;
      totalDebits = debits;
      totalSalaryPaid = salaryPaid;
      totalEquipmentCost = equipCost;
      netProfitLoss = credits - debits - salaryPaid - equipCost;
      workerCount = workerMap.size();
      equipmentCount = equipMap.size();
    };
  };
};
