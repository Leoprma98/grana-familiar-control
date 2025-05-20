
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { MonthData, Income, Expense, SavingsGoal, FoodAllowance, Month, MonthSummary } from "../types/finance";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Define interfaces for movement data from Supabase
interface MovementData {
  id: string;
  user_id: string;
  family_id: string;
  type: string;
  amount: number;
  date: string;
  person_name: string;
  category?: string;
  name?: string;
  status?: string;
  target_amount?: number;
  target_month?: number;
  target_year?: number;
  created_at: string;
}

// Helper function to generate initial empty data for all months of the current year
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

interface FinanceContextType {
  currentMonth: number;
  currentYear: number;
  monthsData: MonthData[];
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  getCurrentMonthData: () => MonthData;
  addIncome: (income: Omit<Income, "id">) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => Promise<void>;
  updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addFoodAllowance: (allowance: Omit<FoodAllowance, "id">) => Promise<void>;
  updateFoodAllowance: (allowance: FoodAllowance) => Promise<void>;
  deleteFoodAllowance: (id: string) => Promise<void>;
  getMonthSummary: (month: number, year: number) => MonthSummary;
  isLoading: boolean;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [monthsData, setMonthsData] = useState<MonthData[]>(generateEmptyYearData());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, profile, family } = useAuth();

  // Load data from Supabase when component mounts or when user/family changes
  useEffect(() => {
    if (user && profile && family) {
      loadDataFromSupabase();
    } else {
      setIsLoading(false);
    }
  }, [user, profile, family]);

  // Load data from Supabase
  const loadDataFromSupabase = async () => {
    try {
      setIsLoading(true);
      
      if (!user || !profile || !family) {
        console.error("User, profile or family is missing");
        return;
      }

      // Fetch all movements for the user's family
      const { data: movements, error } = await supabase
        .from('movements')
        .select('*')
        .eq('family_id', profile.family_id);
        
      if (error) {
        throw error;
      }

      // Convert movements to monthsData format
      const data = generateEmptyYearData();
      
      if (movements) {
        movements.forEach((movement: MovementData) => {
          const date = new Date(movement.date);
          const month = date.getMonth() as Month;
          const year = date.getFullYear();
          
          // Find the month data or create it if it doesn't exist
          let monthData = data.find(m => m.month === month && m.year === year);
          if (!monthData) {
            monthData = {
              month,
              year,
              incomes: [],
              expenses: [],
              savingsGoals: [],
              foodAllowances: []
            };
            data.push(monthData);
          }
          
          if (movement.type === 'receita') {
            monthData.incomes.push({
              id: movement.id,
              person: movement.person_name,
              type: movement.category as any,
              amount: Number(movement.amount),
              date: new Date(movement.date)
            });
          } else if (movement.type === 'despesa') {
            monthData.expenses.push({
              id: movement.id,
              name: movement.name || '',
              category: movement.category as any,
              amount: Number(movement.amount),
              date: new Date(movement.date),
              status: movement.status as any || 'pendente'
            });
          } else if (movement.type === 'meta') {
            monthData.savingsGoals.push({
              id: movement.id,
              name: movement.name || '',
              targetAmount: Number(movement.target_amount) || 0,
              savedAmount: Number(movement.amount),
              targetMonth: movement.target_month as Month || month,
              targetYear: movement.target_year || year
            });
          } else if (movement.type === 'vale') {
            monthData.foodAllowances.push({
              id: movement.id,
              person: movement.person_name,
              totalAmount: Number(movement.target_amount) || 0,
              usedAmount: Number(movement.amount) || 0,
            });
          }
        });
      }
      
      setMonthsData(data);
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      toast.error('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
  const addIncome = async (income: Omit<Income, "id">) => {
    try {
      if (!user || !profile) {
        throw new Error("User not authenticated");
      }
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('movements')
        .insert({
          user_id: user.id,
          family_id: profile.family_id,
          type: 'receita',
          amount: income.amount,
          date: income.date.toISOString(),
          person_name: income.person,
          category: income.type
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const updatedMonthsData = monthsData.map((monthData) => {
        if (monthData.month === currentMonth && monthData.year === currentYear) {
          return {
            ...monthData,
            incomes: [...monthData.incomes, { 
              ...income, 
              id: data.id 
            }]
          };
        }
        return monthData;
      });
      
      setMonthsData(updatedMonthsData);
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Erro ao salvar receita. Por favor, tente novamente.");
      throw error;
    }
  };

  const updateIncome = async (income: Income) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('movements')
        .update({
          amount: income.amount,
          date: income.date.toISOString(),
          person_name: income.person,
          category: income.type
        })
        .eq('id', income.id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error("Erro ao atualizar receita. Por favor, tente novamente.");
      throw error;
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('movements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Erro ao remover receita. Por favor, tente novamente.");
      throw error;
    }
  };

  // Expense operations
  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      if (!user || !profile) {
        throw new Error("User not authenticated");
      }
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('movements')
        .insert({
          user_id: user.id,
          family_id: profile.family_id,
          type: 'despesa',
          name: expense.name,
          amount: expense.amount,
          date: expense.date.toISOString(),
          person_name: user.email?.split('@')[0] || 'User', // Default person name
          category: expense.category,
          status: expense.status
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const updatedMonthsData = monthsData.map((monthData) => {
        if (monthData.month === currentMonth && monthData.year === currentYear) {
          return {
            ...monthData,
            expenses: [...monthData.expenses, { 
              ...expense, 
              id: data.id 
            }]
          };
        }
        return monthData;
      });
      
      setMonthsData(updatedMonthsData);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Erro ao salvar despesa. Por favor, tente novamente.");
      throw error;
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('movements')
        .update({
          name: expense.name,
          amount: expense.amount,
          date: expense.date.toISOString(),
          category: expense.category,
          status: expense.status
        })
        .eq('id', expense.id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Erro ao atualizar despesa. Por favor, tente novamente.");
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('movements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Erro ao remover despesa. Por favor, tente novamente.");
      throw error;
    }
  };

  // Savings Goal operations
  const addSavingsGoal = async (goal: Omit<SavingsGoal, "id">) => {
    try {
      if (!user || !profile) {
        throw new Error("User not authenticated");
      }
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('movements')
        .insert({
          user_id: user.id,
          family_id: profile.family_id,
          type: 'meta',
          name: goal.name,
          amount: goal.savedAmount,
          date: new Date().toISOString(),
          person_name: user.email?.split('@')[0] || 'User', // Default person name
          target_amount: goal.targetAmount,
          target_month: goal.targetMonth,
          target_year: goal.targetYear
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const updatedMonthsData = monthsData.map((monthData) => {
        if (monthData.month === currentMonth && monthData.year === currentYear) {
          return {
            ...monthData,
            savingsGoals: [...monthData.savingsGoals, { 
              ...goal, 
              id: data.id 
            }]
          };
        }
        return monthData;
      });
      
      setMonthsData(updatedMonthsData);
    } catch (error) {
      console.error("Error adding savings goal:", error);
      toast.error("Erro ao salvar meta. Por favor, tente novamente.");
      throw error;
    }
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('movements')
        .update({
          name: goal.name,
          amount: goal.savedAmount,
          target_amount: goal.targetAmount,
          target_month: goal.targetMonth,
          target_year: goal.targetYear
        })
        .eq('id', goal.id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error updating savings goal:", error);
      toast.error("Erro ao atualizar meta. Por favor, tente novamente.");
      throw error;
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('movements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error deleting savings goal:", error);
      toast.error("Erro ao remover meta. Por favor, tente novamente.");
      throw error;
    }
  };

  // Food Allowance operations
  const addFoodAllowance = async (allowance: Omit<FoodAllowance, "id">) => {
    try {
      if (!user || !profile) {
        throw new Error("User not authenticated");
      }
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('movements')
        .insert({
          user_id: user.id,
          family_id: profile.family_id,
          type: 'vale',
          amount: allowance.usedAmount,
          date: new Date().toISOString(),
          person_name: allowance.person,
          target_amount: allowance.totalAmount
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const updatedMonthsData = monthsData.map((monthData) => {
        if (monthData.month === currentMonth && monthData.year === currentYear) {
          return {
            ...monthData,
            foodAllowances: [...monthData.foodAllowances, { 
              ...allowance, 
              id: data.id 
            }]
          };
        }
        return monthData;
      });
      
      setMonthsData(updatedMonthsData);
    } catch (error) {
      console.error("Error adding food allowance:", error);
      toast.error("Erro ao salvar vale alimentação. Por favor, tente novamente.");
      throw error;
    }
  };

  const updateFoodAllowance = async (allowance: FoodAllowance) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('movements')
        .update({
          person_name: allowance.person,
          amount: allowance.usedAmount,
          target_amount: allowance.totalAmount
        })
        .eq('id', allowance.id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error updating food allowance:", error);
      toast.error("Erro ao atualizar vale alimentação. Por favor, tente novamente.");
      throw error;
    }
  };

  const deleteFoodAllowance = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('movements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error deleting food allowance:", error);
      toast.error("Erro ao remover vale alimentação. Por favor, tente novamente.");
      throw error;
    }
  };

  // Get monthly summary
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
        isLoading
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
