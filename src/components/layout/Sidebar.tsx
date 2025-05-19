
import React from "react";
import { 
  Calendar, 
  ChartPie, 
  DollarSign, 
  Receipt, 
  PiggyBank, 
  Wallet 
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getMonthName } from "../../utils/formatters";
import {
  Sidebar as SidebarComponent,
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
import { useFinance } from "@/contexts/FinanceContext";
import { NavItems } from "./types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: NavItems[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  navItems 
}) => {
  const sidebar = useSidebar();
  const { profile } = useAuth();
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear } = useFinance();

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
    <SidebarComponent
      className={cn(
        sidebar.state === "collapsed" ? "w-16" : "w-64",
        "transition-width duration-300 ease-in-out"
      )}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />
      
      <div className="flex flex-col items-center py-4">
        <h1 className={cn(
          "font-bold",
          sidebar.state === "collapsed" ? "text-sm" : "text-xl"
        )}>
          {sidebar.state === "collapsed" ? "G$" : "Grana Familiar"}
        </h1>
        {profile && sidebar.state !== "collapsed" && (
          <p className="text-xs text-muted-foreground mt-1">Olá, {profile.name}</p>
        )}
      </div>
      
      <SidebarContent>
        {sidebar.state !== "collapsed" && renderMonthSelector()}
        
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
                    onClick={() => {
                      setActiveTab(item.id);
                    }}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5",
                        sidebar.state === "collapsed" ? "mx-auto" : "mr-2"
                      )} 
                    />
                    {sidebar.state !== "collapsed" && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;
