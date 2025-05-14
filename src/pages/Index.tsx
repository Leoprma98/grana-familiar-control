
import React, { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FinanceProvider } from "@/contexts/FinanceContext";
import AppLayout from "@/components/layout/AppLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import IncomeList from "@/components/income/IncomeList";
import ExpenseList from "@/components/expenses/ExpenseList";
import SavingsGoalsList from "@/components/savings/SavingsGoalsList";
import FoodAllowanceList from "@/components/allowance/FoodAllowanceList";
import AnnualOverview from "@/components/annual/AnnualOverview";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Add some initial data for demo purposes
  const showWelcomeToast = () => {
    toast.success("Bem-vindo ao Controle Financeiro Familiar", {
      description: "Gerencie suas finanças de forma simples e eficiente.",
      duration: 5000,
    });
  };

  // Show welcome toast on initial load
  React.useEffect(() => {
    showWelcomeToast();
  }, []);

  // Render the appropriate component based on the active tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "income":
        return <IncomeList />;
      case "expenses":
        return <ExpenseList />;
      case "savings":
        return <SavingsGoalsList />;
      case "allowance":
        return <FoodAllowanceList />;
      case "annual":
        return <AnnualOverview />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <FinanceProvider>
      <SidebarProvider defaultOpen={true}>
        <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          {renderActiveComponent()}
        </AppLayout>
      </SidebarProvider>
    </FinanceProvider>
  );
};

export default Index;
