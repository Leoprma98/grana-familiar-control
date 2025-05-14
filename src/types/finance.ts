
// Common types for our financial app

export type Person = "Léo" | "Cat" | string;

export type IncomeType = "vale" | "pagamento" | "extra" | "outros";

export type ExpenseCategory = 
  | "fixa" 
  | "variável" 
  | "parcelada" 
  | "lazer" 
  | "saúde" 
  | "transporte" 
  | "outros";

export type PaymentStatus = "paga" | "pendente";

export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface Income {
  id: string;
  person: Person;
  type: IncomeType;
  amount: number;
  date: Date;
}

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  status: PaymentStatus;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetMonth: Month;
  targetYear: number;
}

export interface FoodAllowance {
  id: string;
  person: Person;
  totalAmount: number;
  usedAmount: number;
}

export interface MonthData {
  month: Month;
  year: number;
  incomes: Income[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  foodAllowances: FoodAllowance[];
}

export interface MonthSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSaved: number;
  balance: number;
}

export interface YearSummary {
  year: number;
  monthlyData: {
    month: Month;
    totalIncome: number;
    totalExpenses: number;
    totalSaved: number;
    balance: number;
  }[];
}
