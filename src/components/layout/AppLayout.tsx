
import React, { useEffect } from "react";
import { 
  Calendar, 
  ChartPie, 
  DollarSign, 
  Receipt, 
  PiggyBank, 
  Wallet
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { NavItems } from "./types";
import SidebarComponent from "./Sidebar";
import MobileDrawer from "./MobileDrawer";
import Header from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  activeTab,
  setActiveTab 
}) => {
  const sidebar = useSidebar();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  
  // Navigation items
  const navItems: NavItems[] = [
    { id: "dashboard", label: "Dashboard", icon: ChartPie },
    { id: "income", label: "Receitas", icon: DollarSign },
    { id: "expenses", label: "Despesas", icon: Receipt },
    { id: "savings", label: "Poupança", icon: PiggyBank },
    { id: "allowance", label: "Vale-Alimentação", icon: Wallet },
    { id: "annual", label: "Resumo Anual", icon: Calendar }
  ];
  
  // Handle mobile sidebar initialization
  useEffect(() => {
    if (isMobile) {
      sidebar.setOpen(false);
    } else {
      sidebar.setOpen(true);
    }
  }, [isMobile, sidebar]);

  const toggleMobileMenu = () => {
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Regular sidebar for desktop */}
      {!isMobile && (
        <SidebarComponent 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          navItems={navItems} 
        />
      )}

      {/* Mobile sidebar using Drawer component */}
      {isMobile && (
        <MobileDrawer 
          isOpen={isDrawerOpen} 
          setIsOpen={setIsDrawerOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          navItems={navItems} 
        />
      )}
      
      <div className="flex-1 p-3 md:p-6 overflow-x-hidden">
        <Header 
          isMobile={isMobile} 
          activeTab={activeTab} 
          navItems={navItems} 
          toggleMobileMenu={toggleMobileMenu} 
        />
        
        <main className="animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
