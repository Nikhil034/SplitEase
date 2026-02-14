import type { Group, Expense } from "@/types/expense";
import type { Invoice, ScheduledPayment, Collaboration, ActionLogEntry } from "@/types/splitEase";

const GROUPS_KEY = "splitease-groups";
const EXPENSES_KEY = "splitease-expenses";
const INVOICES_KEY = "splitease-invoices";
const SCHEDULED_KEY = "splitease-scheduled";
const COLLABS_KEY = "splitease-collaborations";
const ACTION_LOG_KEY = "splitease-action-log";

export function getGroups(): Group[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setGroups(groups: Group[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function getExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function addGroup(group: Group): void {
  const groups = getGroups();
  groups.push(group);
  setGroups(groups);
}

export function updateGroup(id: string, updates: Partial<Group>): void {
  const groups = getGroups().map((g) =>
    g.id === id ? { ...g, ...updates } : g
  );
  setGroups(groups);
}

export function deleteGroup(id: string): void {
  setGroups(getGroups().filter((g) => g.id !== id));
  setExpenses(getExpenses().filter((e) => e.groupId !== id));
}

export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.push(expense);
  setExpenses(expenses);
}

export function getExpensesForGroup(groupId: string): Expense[] {
  return getExpenses().filter((e) => e.groupId === groupId);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// --- Invoices ---
export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setInvoices(invoices: Invoice[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function addInvoice(invoice: Invoice): void {
  setInvoices([...getInvoices(), invoice]);
}

export function updateInvoice(id: string, updates: Partial<Invoice>): void {
  setInvoices(
    getInvoices().map((i) => (i.id === id ? { ...i, ...updates } : i))
  );
}

// --- Scheduled payments ---
export function getScheduledPayments(): ScheduledPayment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCHEDULED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setScheduledPayments(list: ScheduledPayment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCHEDULED_KEY, JSON.stringify(list));
}

// --- Collaborations ---
export function getCollaborations(): Collaboration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLLABS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCollaborations(list: Collaboration[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLLABS_KEY, JSON.stringify(list));
}

export function addCollaboration(c: Collaboration): void {
  setCollaborations([...getCollaborations(), c]);
}

// --- Action log (for analysis) ---
export function getActionLog(): ActionLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTION_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendActionLog(entry: ActionLogEntry): void {
  const log = getActionLog();
  const next = [entry, ...log].slice(0, 500);
  localStorage.setItem(ACTION_LOG_KEY, JSON.stringify(next));
}
