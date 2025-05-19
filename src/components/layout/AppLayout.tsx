
import React, { useEffect } from "react";
import { 
  Calendar, 
  ChartPie, 
  DollarSign, 
  Receipt, 
  PiggyBank, 
  Wallet, 
  Menu,
  X 
} from "lucide-react";
import { useFinance } from "../../contexts/FinanceContext";
import { useAuth } from "../../contexts/AuthContext";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger 
} from "@/components/ui/drawer";

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
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear } = useFinance();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  
  // Handle mobile sidebar initialization
  useEffect(() => {
    if (isMobile) {
      // Initially close sidebar on mobile - use setOpen instead of collapse
      sidebar.setOpen(false);
    } else {
      // On desktop, default to open
      sidebar.setOpen(true);
    }
  }, [isMobile, sidebar]);
  
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
      {/* Regular sidebar for desktop */}
      {!isMobile && (
        <Sidebar
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
        </Sidebar>
      )}

      {/* Mobile sidebar using Drawer component for better mobile UX */}
      {isMobile && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger className="sr-only">Open Menu</DrawerTrigger>
          <DrawerContent className="h-[85vh] pt-0">
            <DrawerHeader>
              <DrawerTitle className="text-xl font-bold">
                Grana Familiar
                {profile && (
                  <p className="text-xs text-muted-foreground mt-1">Olá, {profile.name}</p>
                )}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 py-2 flex-1">
              {renderMonthSelector()}
              
              <div className="space-y-1 mt-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full flex items-center p-3 rounded-md",
                      activeTab === item.id && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsDrawerOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose>
                <div className="flex justify-center w-full">
                  <X className="h-6 w-6" />
                </div>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
      
      <div className="flex-1 p-3 md:p-6 overflow-x-hidden">
        <header className="mb-6">
          {isMobile && (
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden mb-4 p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          
          <h1 className="text-xl md:text-2xl font-bold">
            {getMonthName(currentMonth)} {currentYear}
          </h1>
          <h2 className="text-md md:text-lg font-medium text-gray-600">
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
