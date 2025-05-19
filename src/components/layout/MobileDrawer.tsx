
import React from "react";
import { X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useFinance } from "../../contexts/FinanceContext";
import { getMonthName } from "../../utils/formatters";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger 
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { NavItems } from "./types";

interface MobileDrawerProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: NavItems[];
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ 
  isOpen, 
  setIsOpen,
  activeTab, 
  setActiveTab,
  navItems
}) => {
  const { profile } = useAuth();
  const { currentMonth, currentYear, setCurrentMonth, setCurrentYear } = useFinance();

  // Month selector
  const renderMonthSelector = () => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    
    return (
      <div className="flex items-center justify-between mb-6">
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
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
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
                  setIsOpen(false);
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
  );
};

export default MobileDrawer;
