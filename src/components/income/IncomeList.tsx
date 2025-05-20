
import React, { useState, useEffect } from "react";
import { useFinance } from "../../contexts/FinanceContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { IncomeType, Person } from "../../types/finance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const IncomeList: React.FC = () => {
  const { getCurrentMonthData, addIncome, updateIncome, deleteIncome, getMonthSummary, currentMonth, currentYear } = useFinance();
  const { user, profile } = useAuth();
  const monthData = getCurrentMonthData();
  const summary = getMonthSummary(currentMonth, currentYear);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [currentIncome, setCurrentIncome] = useState<any>({
    person: "",
    type: "pagamento",
    amount: 0,
    date: new Date().toISOString().substring(0, 10),
  });

  // State for family members
  const [familyMembers, setFamilyMembers] = useState<{ value: string; label: string }[]>([]);
  
  // Load family members when component mounts
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (profile?.family_id) {
        try {
          // Fetch all profiles in the same family
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('family_id', profile.family_id);
            
          if (error) {
            throw error;
          }
          
          if (data) {
            // Convert to the format expected by our form
            const members = data.map(member => ({
              value: member.name,
              label: member.name
            }));
            
            // Add "Outro" option
            members.push({ value: "Outro", label: "Outro" });
            
            setFamilyMembers(members);
            
            // Set default person to current user's name
            if (members.length > 0 && profile.name) {
              setCurrentIncome(prev => ({
                ...prev,
                person: profile.name
              }));
            }
          }
        } catch (error) {
          console.error("Error loading family members:", error);
        }
      }
    };
    
    loadFamilyMembers();
  }, [profile]);

  // Handle Form Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentIncome({ ...currentIncome, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentIncome({ ...currentIncome, [name]: value });
  };

  const handleSaveIncome = async () => {
    try {
      if (currentIncome.id) {
        await updateIncome({
          id: currentIncome.id,
          person: currentIncome.person,
          type: currentIncome.type as IncomeType,
          amount: parseFloat(currentIncome.amount),
          date: new Date(currentIncome.date),
        });
        toast.success("Receita atualizada com sucesso!");
        setIsEditDialogOpen(false);
      } else {
        await addIncome({
          person: currentIncome.person,
          type: currentIncome.type as IncomeType,
          amount: parseFloat(currentIncome.amount),
          date: new Date(currentIncome.date),
        });
        toast.success("Receita adicionada com sucesso!");
        setIsAddDialogOpen(false);
      }
      
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar a receita. Verifique os campos.");
    }
  };

  const handleDeleteIncome = async () => {
    try {
      await deleteIncome(currentIncome.id);
      toast.success("Receita removida com sucesso!");
      setIsDeleteDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao remover a receita. Tente novamente.");
    }
  };

  const resetForm = () => {
    setCurrentIncome({
      person: profile?.name || "",
      type: "pagamento",
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
    });
  };

  const handleEdit = (income: any) => {
    setCurrentIncome({
      ...income,
      date: new Date(income.date).toISOString().substring(0, 10),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (income: any) => {
    setCurrentIncome(income);
    setIsDeleteDialogOpen(true);
  };

  const incomeTypes = [
    { value: "pagamento", label: "Pagamento" },
    { value: "vale", label: "Vale" },
    { value: "extra", label: "Extra" },
    { value: "outros", label: "Outros" },
  ];

  // Group incomes by person
  const groupedIncomes: Record<string, typeof monthData.incomes> = {};
  
  monthData.incomes.forEach((income) => {
    if (!groupedIncomes[income.person]) {
      groupedIncomes[income.person] = [];
    }
    groupedIncomes[income.person].push(income);
  });

  const renderIncomeForm = () => (
    <>
      <div className="grid grid-cols-1 gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="person" className="text-right">
            Pessoa
          </Label>
          <div className="col-span-3">
            <Select
              value={currentIncome.person}
              onValueChange={(value) => handleSelectChange("person", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a pessoa" />
              </SelectTrigger>
              <SelectContent>
                {familyMembers.map((person) => (
                  <SelectItem key={person.value} value={person.value}>
                    {person.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            Tipo
          </Label>
          <div className="col-span-3">
            <Select
              value={currentIncome.type}
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {incomeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Valor
          </Label>
          <div className="col-span-3">
            <Input
              id="amount"
              name="amount"
              type="number"
              value={currentIncome.amount}
              onChange={handleInputChange}
              className="col-span-3"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Data
          </Label>
          <div className="col-span-3">
            <Input
              id="date"
              name="date"
              type="date"
              value={currentIncome.date}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" onClick={handleSaveIncome}>
          Salvar
        </Button>
      </DialogFooter>
    </>
  );

  // Show loading state while family members are loaded
  if (familyMembers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Receitas</h2>
            <p className="text-muted-foreground">
              Carregando informações da família...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Receitas</h2>
          <p className="text-muted-foreground">
            Total: {formatCurrency(summary.totalIncome)}
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Nova Receita
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Receita</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da nova receita abaixo.
              </DialogDescription>
            </DialogHeader>
            {renderIncomeForm()}
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedIncomes).length > 0 ? (
        Object.entries(groupedIncomes).map(([person, incomes]) => (
          <Card key={person} className="mb-6">
            <CardHeader>
              <CardTitle>{person}</CardTitle>
              <CardDescription>
                Total: {formatCurrency(incomes.reduce((sum, income) => sum + income.amount, 0))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>{incomeTypes.find(t => t.value === income.type)?.label || income.type}</TableCell>
                      <TableCell>{formatCurrency(income.amount)}</TableCell>
                      <TableCell>{formatDate(income.date)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(income)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(income)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Nenhuma receita registrada neste mês
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Receita
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Receita</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da receita abaixo.
            </DialogDescription>
          </DialogHeader>
          {renderIncomeForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Receita</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta receita?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteIncome}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncomeList;
