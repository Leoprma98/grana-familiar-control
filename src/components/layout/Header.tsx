
import React from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getMonthName } from "@/utils/formatters";
import { useFinance } from "@/contexts/FinanceContext";
import { NavItems } from "./types";

interface HeaderProps {
  isMobile: boolean;
  activeTab: string;
  navItems: NavItems[];
  toggleMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isMobile, 
  activeTab, 
  navItems,
  toggleMobileMenu 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentMonth, currentYear } = useFinance();
  
  // Check if we're on a page that should show the back button - todas as páginas mostram o botão
  const showBackButton = true; // Alterado para sempre mostrar a seta de voltar
  
  // Handle navigation back
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="mb-6">
      <div className="flex items-center gap-2">
        {isMobile && (
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoBack}
            className="mr-2"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            {getMonthName(currentMonth)} {currentYear}
          </h1>
          <h2 className="text-md md:text-lg font-medium text-gray-600">
            {navItems.find(item => item.id === activeTab)?.label}
          </h2>
        </div>
      </div>
    </header>
  );
};

export default Header;
