// Ported from the web app's src/app/utils/types.tsx.
// Keep in sync when the backend schema changes.

export interface Expense {
  id: string;
  location: string;
  envelopeId: string;
  userId: string;
  date: string;
  amount: number;
  comments: string | null;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
  userId: string;
  savings: number | null;
  investments: number | null;
  remainder: number | null;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface Envelope {
  id: string;
  title: string;
  fixed: boolean;
  budget: number;
  expenses?: Expense[];
  icon: string;
  userId: string;
  color: string;
  comments: string | null;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface Note {
  id: string;
  month: number;
  content: string;
  userId: string;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface EditExpense {
  location: string | null;
  envelopeId: string | null;
  date: string | null;
  amount: number | null;
  comments: string | null;
}

export interface EditIncome {
  source: string | null;
  amount: number | null;
  date: string | null;
  savings: number | null;
  investments: number | null;
  remainder: number | null;
}

export interface EditEnvelope {
  title: string | null | undefined;
  fixed: boolean | null | undefined;
  budget: number | null | undefined;
  icon: string | null | undefined;
  color: string | null | undefined;
  addExpense: number | null | undefined;
  removeExpense: number | null | undefined;
  comments: string | null | undefined;
}

export interface EditNote {
  content: string | null;
}

export interface NewExpense {
  id: number;
  location: string;
  envelopeId: string;
  date: string;
  amount: number;
  comments: string | null;
}

export interface NewIncome {
  id: number;
  source: string;
  amount: number;
  date: string;
  savings: number | null;
  investments: number | null;
  remainder: number | null;
}

export interface NewEnvelope {
  title: string;
  fixed: boolean;
  budget: number;
  expenses: number[];
  icon: string;
  color: string;
  comments: string | null;
}

export interface NewNote {
  id: number;
  month: number;
  content: string;
}

export type ViewType = 'expenses' | 'income' | 'both';
