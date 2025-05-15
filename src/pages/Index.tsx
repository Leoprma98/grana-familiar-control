
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, UserCircle } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { profile, family, signOut } = useAuth();

  // Add some initial data for demo purposes
  const showWelcomeToast = () => {
    toast.success(`Bem-vindo, ${profile?.name || 'Usuário'}!`, {
      description: "Gerencie suas finanças de forma simples e eficiente.",
      duration: 5000,
    });
  };

  // Show welcome toast on initial load
  useEffect(() => {
    if (profile) {
      showWelcomeToast();
    }
  }, [profile]);

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
          <div className="flex justify-end mb-4 gap-2">
            <Link to="/activity">
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <UserCircle className="h-4 w-4 mr-2" />
                Perfil
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
          
          <div className="mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              Família: {family?.code || 'Carregando...'}
            </h2>
          </div>
          
          {renderActiveComponent()}
        </AppLayout>
      </SidebarProvider>
    </FinanceProvider>
  );
};

export default Index;
