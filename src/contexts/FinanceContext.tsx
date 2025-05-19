import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { MonthData, Income, Expense, SavingsGoal, FoodAllowance, Month, MonthSummary } from "../types/finance";

// Storage key for persisting data in localStorage
const FINANCE_STORAGE_KEY = "finance_data_v1";

// Generate initial empty data for all months of the current year
const generateEmptyYearData = (): MonthData[] => {
  const currentYear = new Date().getFullYear();
  const months: MonthData[] = [];

  for (let i = 0; i < 12; i++) {
    months.push({
      month: i as Month,
      year: currentYear,
      incomes: [],
      expenses: [],
      savingsGoals: [],
      foodAllowances: []
    });
  }

  return months;
};

// Helper function to load data from localStorage
const loadPersistedData = (): MonthData[] => {
  try {
    const savedData = localStorage.getItem(FINANCE_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error("Error loading finance data from localStorage:", error);
  }
  return generateEmptyYearData();
};

// Helper function to save data to localStorage
const persistData = (data: MonthData[]): void => {
  try {
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving finance data to localStorage:", error);
  }
};

interface FinanceContextType {
  currentMonth: number;
  currentYear: number;
  monthsData: MonthData[];
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  getCurrentMonthData: () => MonthData;
  addIncome: (income: Omit<Income, "id">) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  addFoodAllowance: (allowance: Omit<FoodAllowance, "id">) => void;
  updateFoodAllowance: (allowance: FoodAllowance) => void;
  deleteFoodAllowance: (id: string) => void;
  getMonthSummary: (month: number, year: number) => MonthSummary;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [monthsData, setMonthsData] = useState<MonthData[]>(loadPersistedData());

  // Persist data whenever it changes
  useEffect(() => {
    persistData(monthsData);
    console.log("Finance data saved to localStorage", monthsData);
  }, [monthsData]);

  const getCurrentMonthData = (): MonthData => {
    const currentData = monthsData.find(
      (data) => data.month === currentMonth && data.year === currentYear
    );
    
    if (!currentData) {
      // If data doesn't exist for this month/year, create it
      const newMonthData: MonthData = {
        month: currentMonth as Month,
        year: currentYear,
        incomes: [],
        expenses: [],
        savingsGoals: [],
        foodAllowances: []
      };
      
      const updatedData = [...monthsData, newMonthData];
      setMonthsData(updatedData);
      return newMonthData;
    }
    
    return currentData;
  };

  // Income operations
  const addIncome = (income: Omit<Income, "id">) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          incomes: [...monthData.incomes, { ...income, id: uuidv4() }]
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  const updateIncome = (income: Income) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          incomes: monthData.incomes.map((item) =>
            item.id === income.id ? income : item
          )
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  const deleteIncome = (id: string) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          incomes: monthData.incomes.filter((item) => item.id !== id)
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  // Expense operations
  const addExpense = (expense: Omit<Expense, "id">) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          expenses: [...monthData.expenses, { ...expense, id: uuidv4() }]
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
    console.log("Added expense:", expense);
  };

  const updateExpense = (expense: Expense) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          expenses: monthData.expenses.map((item) =>
            item.id === expense.id ? expense : item
          )
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  const deleteExpense = (id: string) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          expenses: monthData.expenses.filter((item) => item.id !== id)
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  // Savings Goal operations
  const addSavingsGoal = (goal: Omit<SavingsGoal, "id">) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          savingsGoals: [...monthData.savingsGoals, { ...goal, id: uuidv4() }]
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
    console.log("Added savings goal:", goal);
  };

  const updateSavingsGoal = (goal: SavingsGoal) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          savingsGoals: monthData.savingsGoals.map((item) =>
            item.id === goal.id ? goal : item
          )
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  const deleteSavingsGoal = (id: string) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          savingsGoals: monthData.savingsGoals.filter((item) => item.id !== id)
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  // Food Allowance operations
  const addFoodAllowance = (allowance: Omit<FoodAllowance, "id">) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          foodAllowances: [...monthData.foodAllowances, { ...allowance, id: uuidv4() }]
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
    console.log("Added food allowance:", allowance);
  };

  const updateFoodAllowance = (allowance: FoodAllowance) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          foodAllowances: monthData.foodAllowances.map((item) =>
            item.id === allowance.id ? allowance : item
          )
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  const deleteFoodAllowance = (id: string) => {
    const updatedMonthsData = monthsData.map((monthData) => {
      if (monthData.month === currentMonth && monthData.year === currentYear) {
        return {
          ...monthData,
          foodAllowances: monthData.foodAllowances.filter((item) => item.id !== id)
        };
      }
      return monthData;
    });
    
    setMonthsData(updatedMonthsData);
  };

  // Get monthly summary - Fixed to exclude savings from balance calculation
  const getMonthSummary = (month: number, year: number): MonthSummary => {
    const monthData = monthsData.find((data) => data.month === month && data.year === year);
    
    if (!monthData) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        totalSaved: 0,
        balance: 0
      };
    }
    
    const totalIncome = monthData.incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = monthData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalSaved = monthData.savingsGoals.reduce((sum, goal) => sum + goal.savedAmount, 0);
    // Calculate balance as income minus expenses, WITHOUT subtracting saved amount
    const balance = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      totalSaved,
      balance
    };
  };

  return (
    <FinanceContext.Provider
      value={{
        currentMonth,
        currentYear,
        monthsData,
        setCurrentMonth,
        setCurrentYear,
        getCurrentMonthData,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addFoodAllowance,
        updateFoodAllowance,
        deleteFoodAllowance,
        getMonthSummary,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
