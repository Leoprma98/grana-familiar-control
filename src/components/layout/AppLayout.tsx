
import React, { useState } from "react";
import { 
  Calendar, 
  ChartPie, 
  DollarSign, 
  Receipt, 
  PiggyBank, 
  Wallet 
} from "lucide-react";
import { useFinance } from "../../contexts/FinanceContext";
import { getMonthName } from "../../utils/formatters";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
  const { collapsed } = useSidebar();
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear } = useFinance();
  
  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ChartPie },
    { id: "income", label: "Receitas", icon: DollarSign },
    { id: "expenses", label: "Despesas", icon: Receipt },
    { id: "savings", label: "Poupança", icon: PiggyBank },
    { id: "allowance", label: "Vale-Alimentação", icon: Wallet },
    { id: "annual", label: "Resumo Anual", icon: Calendar }
  ];

  // Month selector
  const renderMonthSelector = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    
    return (
      <div className="flex items-center justify-between mb-6 px-4">
        <select
          value={currentMonth}
          onChange={(e) => setCurrentMonth(Number(e.target.value))}
          className="p-2 rounded-md border border-gray-300 bg-white"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {getMonthName(month)}
            </option>
          ))}
        </select>
        
        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(Number(e.target.value))}
          className="p-2 rounded-md border border-gray-300 bg-white ml-2"
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        className={cn(
          collapsed ? "w-16" : "w-64",
          "transition-width duration-300 ease-in-out"
        )}
        collapsible
      >
        <SidebarTrigger className="m-2 self-end" />
        
        <div className="flex flex-col items-center py-4">
          <h1 className={cn(
            "font-bold",
            collapsed ? "text-sm" : "text-xl"
          )}>
            {collapsed ? "F$" : "Finanças Familiar"}
          </h1>
        </div>
        
        <SidebarContent>
          {!collapsed && renderMonthSelector()}
          
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      className={cn(
                        "w-full flex items-center p-2 rounded-md",
                        activeTab === item.id && "bg-primary/10 text-primary font-medium"
                      )}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon 
                        className={cn(
                          "h-5 w-5",
                          collapsed ? "mx-auto" : "mr-2"
                        )} 
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      
      <div className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">
            {getMonthName(currentMonth)} {currentYear}
          </h1>
          <h2 className="text-lg font-medium text-gray-600">
            {navItems.find(item => item.id === activeTab)?.label}
          </h2>
        </header>
        
        <main className="animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
